from fastapi import FastAPI, HTTPException, Request, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse, FileResponse
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import os
import shutil
import logging
import asyncio
import time
from datetime import datetime

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
    user_id: Optional[str] = None
    user_type: Optional[str] = None
    history: Optional[List[Dict[str, str]]] = []


# In-memory user-wise isolated chat session store
# Structure: USER_SESSIONS[user_id][session_id] = { id, title, user_id, user_type, created_at, updated_at, turns: [...] }
USER_SESSIONS: Dict[str, Dict[str, Dict[str, Any]]] = {}


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

        # 3. Categorize file format & parse preview if applicable
        file_ext = os.path.splitext(filename.lower())[1]
        file_type = "file"
        parsed_preview = None

        if file_ext in [".png", ".jpg", ".jpeg", ".webp", ".svg", ".gif"]:
            file_type = "image"
        elif file_ext in [".xlsx", ".xls", ".csv"]:
            file_type = "spreadsheet"
            try:
                parsed_preview = parse_sales_excel(file_path)
            except Exception as pe:
                logger.warning(f"Could not parse preview: {pe}")
        elif file_ext in [".pdf", ".doc", ".docx", ".txt", ".md"]:
            file_type = "document"

        return {
            "success": True,
            "filename": filename,
            "file_path": file_path,
            "file_size": file_size,
            "file_type": file_type,
            "is_excel": file_type == "spreadsheet" and bool(parsed_preview),
            "preview_url": f"/api/files/{filename}",
            "parsed_preview": parsed_preview,
            "silo": silo_res
        }
    except Exception as e:
        logger.error(f"Failed to process upload: {e}")
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")


@app.get("/api/files/{filename}")
def serve_uploaded_file(filename: str):
    """Serves uploaded images, documents, and spreadsheets for live preview & download."""
    file_path = os.path.join(UPLOAD_DIR, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found on server")
    return FileResponse(file_path)


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
    user_id = payload.user_id or "guest_default"
    session_id = payload.session_id or f"session_{int(time.time())}"
    conv_id = payload.conversation_id or f"conv_user_{int(time.time() * 1000)}"

    logger.info(f"SSE Chat Request [User: {user_id}, Session: {session_id}, Conv: {conv_id}]: '{payload.message}'")

    # Optimistically record session and user turn in backend store
    if user_id not in USER_SESSIONS:
        USER_SESSIONS[user_id] = {}

    title = payload.message.strip()
    if len(title) > 36:
        title = title[:34] + "..."

    now_iso = datetime.now().isoformat()
    if session_id not in USER_SESSIONS[user_id]:
        USER_SESSIONS[user_id][session_id] = {
            "id": session_id,
            "title": title or "New Conversation",
            "user_id": user_id,
            "user_type": payload.user_type or ("google" if "google" in user_id else "guest"),
            "created_at": now_iso,
            "updated_at": now_iso,
            "turns": []
        }
    else:
        USER_SESSIONS[user_id][session_id]["updated_at"] = now_iso

    USER_SESSIONS[user_id][session_id]["turns"].append({
        "id": conv_id,
        "role": "user",
        "content": payload.message,
        "attachment_path": payload.attachment_path,
        "timestamp": now_iso
    })

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


@app.get("/api/chat/sessions")
def get_user_sessions(user_id: str = "guest_default"):
    """Returns chat sessions belonging exclusively to this user."""
    sessions = USER_SESSIONS.get(user_id, {})
    sorted_sessions = sorted(
        sessions.values(),
        key=lambda s: s.get("updated_at", ""),
        reverse=True
    )
    return {
        "user_id": user_id,
        "sessions": sorted_sessions
    }


@app.get("/api/chat/sessions/{session_id}")
def get_session_history(session_id: str, user_id: str = "guest_default"):
    """Returns conversation history for a specific session of this user."""
    user_data = USER_SESSIONS.get(user_id, {})
    if session_id not in user_data:
        return {"session_id": session_id, "user_id": user_id, "turns": []}
    return user_data[session_id]


@app.delete("/api/chat/sessions/{session_id}")
def delete_user_session(session_id: str, user_id: str = "guest_default"):
    """Deletes a session for this user."""
    if user_id in USER_SESSIONS and session_id in USER_SESSIONS[user_id]:
        del USER_SESSIONS[user_id][session_id]
        return {"status": "deleted", "session_id": session_id}
    return {"status": "not_found", "session_id": session_id}


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
