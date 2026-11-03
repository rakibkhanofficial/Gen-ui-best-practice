from fastapi import FastAPI, HTTPException, Request, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse, FileResponse
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import os
import shutil
import logging
import asyncio

from app.config import settings
from app.agent.antigravity_agent import (
    TOOL_REGISTRY,
    get_available_tools_schema,
    route_intent_heuristically
)
from app.services.excel_service import (
    UPLOAD_DIR,
    create_sample_sales_excel,
    parse_sales_excel
)
from app.services.silo_service import upload_to_silo
from app.services.gemini_service import stream_agent_reasoning

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("genui.api")

app = FastAPI(
    title="Generative UI Agent Engine",
    description="Python FastAPI backend powered by Google Antigravity SDK, Gemini 3.8 Flash, and CopilotKit GenUI integration.",
    version="1.1.0"
)

# CORS middleware for Next.js frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ToolExecutionRequest(BaseModel):
    tool_name: str
    arguments: Dict[str, Any] = {}


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    user_id: Optional[str] = "guest-user"


class StreamChatRequest(BaseModel):
    message: str
    attachment_path: Optional[str] = None
    session_id: Optional[str] = None
    conversation_id: Optional[str] = None
    history: Optional[List[Dict[str, str]]] = []


class HITLDecisionRequest(BaseModel):
    action_id: str
    decision: str  # 'approve' | 'reject'


@app.get("/")
def root():
    return {
        "status": "online",
        "service": "Generative UI Agent Engine",
        "model": "gemini-3.8-flash",
        "frameworks": ["Google Antigravity SDK", "FastAPI", "CopilotKit Runtime", "UV"],
        "endpoints": [
            "/api/health",
            "/api/tools",
            "/api/tools/execute",
            "/api/chat",
            "/api/chat/stream",
            "/api/upload",
            "/api/download-sample-excel",
            "/api/actions/approve"
        ]
    }


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "model": "gemini-3.8-flash",
        "gemini_api_key_configured": bool(settings.GEMINI_API_KEY and settings.GEMINI_API_KEY != "your_gemini_api_key_here"),
        "available_tools": list(TOOL_REGISTRY.keys()),
        "architecture": "Google Antigravity SDK + CopilotKit GenUI"
    }


@app.get("/api/tools")
def list_tools():
    return {"tools": get_available_tools_schema()}


@app.post("/api/tools/execute")
def execute_tool(payload: ToolExecutionRequest):
    tool_name = payload.tool_name
    if tool_name not in TOOL_REGISTRY:
        raise HTTPException(status_code=404, detail=f"Tool '{tool_name}' not found.")

    tool_fn = TOOL_REGISTRY[tool_name]
    try:
        result = tool_fn(**payload.arguments)
        return {
            "success": True,
            "tool_name": tool_name,
            "data": result
        }
    except Exception as e:
        logger.error(f"Error executing tool {tool_name}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...)):
    """Receives uploaded Excel files or images, saves to Silo S3 and local storage, and parses Excel."""
    filename = file.filename or "upload.bin"
    file_path = os.path.join(UPLOAD_DIR, filename)

    try:
        content = await file.read()
        
        # 1. Save to local disk for rapid pandas processing
        with open(file_path, "wb") as buffer:
            buffer.write(content)
        
        file_size = len(content)
        logger.info(f"Saved uploaded file '{filename}' ({file_size} bytes)")

        # 2. Upload to Silo S3 object storage
        silo_res = upload_to_silo(
            filename=filename,
            file_bytes=content,
            content_type=file.content_type or "application/octet-stream"
        )

        # 3. If it's an Excel or CSV file, check parseability
        parsed_preview = None
        if filename.endswith(".xlsx") or filename.endswith(".xls") or filename.endswith(".csv"):
            try:
                parsed_preview = parse_sales_excel(file_path)
            except Exception as pe:
                logger.warning(f"Could not parse preview: {pe}")

        return {
            "success": True,
            "filename": filename,
            "file_path": file_path,
            "file_size": file_size,
            "is_excel": bool(parsed_preview),
            "parsed_preview": parsed_preview,
            "silo": silo_res
        }
    except Exception as e:
        logger.error(f"Failed to process upload: {e}")
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")


@app.get("/api/download-sample-excel")
def download_sample_excel():
    """Generates and serves a realistic demo Enterprise Sales Excel sheet."""
    sample_path = create_sample_sales_excel()
    return FileResponse(
        sample_path,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        filename="sample_enterprise_sales.xlsx"
    )


@app.post("/api/chat/stream")
async def chat_stream_endpoint(payload: StreamChatRequest):
    """Server-Sent Events (SSE) streaming endpoint returning real agent stages, text deltas, and GenUI events."""
    logger.info(f"SSE Chat Request [Session: {payload.session_id}, Conv: {payload.conversation_id}]: '{payload.message}' (Attachment: {payload.attachment_path})")

    async def event_generator():
        async for sse_chunk in stream_agent_reasoning(
            prompt=payload.message,
            attachment_path=payload.attachment_path,
            history=payload.history
        ):
            yield sse_chunk

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )


@app.post("/api/chat")
async def chat_handler(payload: ChatRequest):
    """Standard non-streaming chat endpoint for CopilotKit compatibility."""
    if not payload.messages:
        raise HTTPException(status_code=400, detail="Messages list cannot be empty.")

    latest_message = payload.messages[-1].content
    matched_intent = route_intent_heuristically(latest_message)

    if matched_intent:
        tool_name = matched_intent["tool"]
        tool_args = matched_intent["args"]
        tool_fn = TOOL_REGISTRY[tool_name]
        data = tool_fn(**tool_args)

        return {
            "role": "assistant",
            "content": f"I have prepared the interactive **{tool_name.replace('_', ' ').title()}** component below.",
            "tool_calls": [
                {
                    "id": f"call_{tool_name}",
                    "type": "function",
                    "function": {
                        "name": tool_name,
                        "arguments": tool_args
                    },
                    "result": data
                }
            ]
        }
    else:
        return {
            "role": "assistant",
            "content": (
                "Hello! I am your **Generative UI Agent** powered by **CopilotKit & Google Antigravity SDK**.\n"
                "You can upload your own Excel sales data or test any of our interactive GenUI components!"
            ),
            "tool_calls": []
        }


@app.post("/api/actions/approve")
def approve_action(payload: HITLDecisionRequest):
    execute_fn = TOOL_REGISTRY["execute_approved_action"]
    result = execute_fn(action_id=payload.action_id, decision=payload.decision)
    return result
