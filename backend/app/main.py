from fastapi import FastAPI, HTTPException, Request, UploadFile, File, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse, FileResponse
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import os
import shutil
import logging
import asyncio
import time
import json
import base64
from datetime import datetime
from google import genai
from google.genai import types

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
from app.services.silo_service import upload_to_silo, list_silo_objects, get_silo_stats
from app.services.gemini_service import stream_agent_reasoning
from app.services.db_service import init_db, save_uploaded_file, get_uploaded_file
from app.agent.tools.operations_tool import execute_approved_action

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("genui.api")

app = FastAPI(
    title="Generative UI Agent Engine",
    description="Python FastAPI backend powered by Google Antigravity SDK, Gemini 3.8 Flash, and CopilotKit GenUI integration.",
    version="1.1.0"
)

@app.on_event("startup")
async def startup_event():
    logger.info("Initializing database schemas...")
    await init_db()

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
    attachment: Optional[Dict[str, Any]] = None
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
        "model": settings.GEMINI_MODEL,
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
        "model": settings.GEMINI_MODEL,
        "gemini_api_key_configured": bool(settings.GEMINI_API_KEY and settings.GEMINI_API_KEY != "your_gemini_api_key_here"),
        "available_tools": list(TOOL_REGISTRY.keys()),
        "architecture": "Google Antigravity SDK + CopilotKit GenUI"
    }


@app.get("/api/tools")
def list_tools():
    return {"tools": get_available_tools_schema()}


@app.get("/api/silo/stats")
def silo_stats_endpoint():
    """Returns overview statistics of Silo MinIO object storage."""
    return get_silo_stats()


@app.get("/api/silo/files")
def silo_files_endpoint(prefix: str = ""):
    """Lists files archived in Silo MinIO object storage."""
    return {"files": list_silo_objects(prefix=prefix)}


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
    """Receives uploaded Excel files, PDFs, or images, saves to Silo S3, local storage, and database."""
    filename = file.filename or f"upload_{int(time.time()*1000)}.bin"
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
        minio_url = silo_res.get("minio_url") or f"http://localhost:9000/genui-uploads/{filename}"

        # 3. Categorize file format & parse preview if applicable
        file_ext = os.path.splitext(filename.lower())[1]
        file_type = "file"
        parsed_preview = None

        if file_ext in [".png", ".jpg", ".jpeg", ".webp", ".svg", ".gif"]:
            file_type = "image"
        elif file_ext in [".pdf"]:
            file_type = "pdf"
        elif file_ext in [".xlsx", ".xls", ".csv"]:
            file_type = "spreadsheet"
            try:
                parsed_preview = parse_sales_excel(file_path)
            except Exception as pe:
                logger.warning(f"Could not parse preview: {pe}")
        elif file_ext in [".doc", ".docx", ".txt", ".md"]:
            file_type = "document"

        # 4. Save metadata to PostgreSQL & Redis database
        file_id = f"file_{int(time.time()*1000)}"
        db_record = await save_uploaded_file(
            file_id=file_id,
            filename=filename,
            file_path=file_path,
            file_size=file_size,
            file_type=file_type,
            minio_url=minio_url,
            preview_url=minio_url,
            silo_bucket="genui-uploads",
            silo_etag=silo_res.get("etag")
        )

        return {
            "success": True,
            "id": file_id,
            "filename": filename,
            "file_path": file_path,
            "file_size": file_size,
            "file_type": file_type,
            "is_excel": file_type == "spreadsheet" and bool(parsed_preview),
            "preview_url": minio_url,
            "minio_url": minio_url,
            "parsed_preview": parsed_preview,
            "silo": silo_res,
            "db_record": db_record
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


@app.websocket("/api/ws/transcribe")
@app.websocket("/ws/transcribe")
async def websocket_transcribe(websocket: WebSocket):
    """
    Real-time streaming Speech-to-Text WebSocket endpoint powered by Gemini 3.5 Transcribe Live.
    Takes client 16kHz PCM audio stream, forwards to gemini-3.5-transcribe-live,
    and yields live interim and final transcripts directly back to the chat prompt.
    """
    await websocket.accept()
    logger.info("WebSocket connected to /ws/transcribe STT stream")

    if not settings.GEMINI_API_KEY or settings.GEMINI_API_KEY == "your_gemini_api_key_here":
        await websocket.send_json({"type": "error", "message": "Gemini API key is not configured on server."})
        await websocket.close()
        return

    client = genai.Client(api_key=settings.GEMINI_API_KEY)
    config = types.LiveConnectConfig(
        response_modalities=["TEXT"],
        input_audio_transcription=types.AudioTranscriptionConfig(),
    )

    try:
        async with client.aio.live.connect(model="gemini-3.5-transcribe-live", config=config) as session:
            logger.info("Connected to Gemini 3.5 Transcribe Live session successfully!")
            await websocket.send_json({"type": "ready", "model": "gemini-3.5-transcribe-live"})

            stop_event = asyncio.Event()

            async def client_to_gemini():
                try:
                    while not stop_event.is_set():
                        message = await websocket.receive()
                        if "bytes" in message and message["bytes"]:
                            pcm_data = message["bytes"]
                            await session.send_realtime_input(
                                audio=types.Blob(data=pcm_data, mime_type="audio/pcm;rate=16000")
                            )
                        elif "text" in message and message["text"]:
                            try:
                                data = json.loads(message["text"])
                                msg_type = data.get("type")
                                if msg_type == "audio" and "data" in data:
                                    pcm_bytes = base64.b64decode(data["data"])
                                    await session.send_realtime_input(
                                        audio=types.Blob(data=pcm_bytes, mime_type="audio/pcm;rate=16000")
                                    )
                                elif msg_type == "stop":
                                    await session.send_realtime_input(audio_stream_end=True)
                            except Exception as parse_err:
                                logger.debug(f"JSON parse error on ws: {parse_err}")
                except (WebSocketDisconnect, asyncio.CancelledError):
                    pass
                except Exception as e:
                    logger.warning(f"Error in client_to_gemini: {e}")
                finally:
                    stop_event.set()

            async def gemini_to_client():
                try:
                    async for response in session.receive():
                        if stop_event.is_set():
                            break
                        content = response.server_content
                        if content:
                            if getattr(content, "input_transcription", None):
                                it = content.input_transcription
                                text = getattr(it, "text", "")
                                finished = getattr(it, "finished", False)
                                if text:
                                    await websocket.send_json({
                                        "type": "final" if finished else "interim",
                                        "text": text,
                                        "model": "gemini-3.5-transcribe-live"
                                    })
                            if getattr(content, "model_turn", None):
                                for part in getattr(content.model_turn, "parts", []):
                                    if getattr(part, "text", None):
                                        await websocket.send_json({
                                            "type": "final",
                                            "text": part.text,
                                            "model": "gemini-3.5-transcribe-live"
                                        })
                except (WebSocketDisconnect, asyncio.CancelledError):
                    pass
                except Exception as e:
                    logger.warning(f"Error in gemini_to_client: {e}")
                finally:
                    stop_event.set()

            in_task = asyncio.create_task(client_to_gemini())
            out_task = asyncio.create_task(gemini_to_client())

            done, pending = await asyncio.wait(
                [in_task, out_task],
                return_when=asyncio.FIRST_COMPLETED
            )
            for t in pending:
                t.cancel()

    except WebSocketDisconnect:
        logger.info("Live transcribe client disconnected.")
    except Exception as e:
        logger.error(f"Live transcribe session error: {e}", exc_info=True)
        try:
            await websocket.send_json({"type": "error", "message": str(e)})
        except:
            pass


@app.post("/api/transcribe")
@app.post("/api/copilotkit/transcribe")
async def transcribe_audio_file(audio: UploadFile = File(...)):
    """Transcribes an uploaded audio file using Gemini 3.5."""
    try:
        content_bytes = await audio.read()
        mime_type = audio.content_type or "audio/webm"

        client = genai.Client(api_key=settings.GEMINI_API_KEY)
        response = client.models.generate_content(
            model=settings.GEMINI_MODEL,
            contents=[
                types.Part.from_bytes(data=content_bytes, mime_type=mime_type),
                "Transcribe this speech accurately into text without any conversational additions or commentary. Only return the transcribed words.",
            ]
        )
        transcribed_text = response.text.strip() if response and response.text else ""
        return {"text": transcribed_text, "model": settings.GEMINI_MODEL}
    except Exception as e:
        logger.error(f"Error transcribing audio file: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Audio transcription failed: {e}")


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
        "attachment": payload.attachment,
        "timestamp": now_iso
    })

    # Resolve attachment path for file analysis
    resolved_attachment_path = payload.attachment_path
    if not resolved_attachment_path and payload.attachment:
        resolved_attachment_path = payload.attachment.get("filePath") or payload.attachment.get("filename")
    if resolved_attachment_path and not os.path.isabs(resolved_attachment_path):
        candidate = os.path.join(UPLOAD_DIR, resolved_attachment_path)
        if os.path.exists(candidate):
            resolved_attachment_path = candidate

    async def event_generator():
        async for sse_chunk in stream_agent_reasoning(
            prompt=payload.message,
            attachment_path=resolved_attachment_path,
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


class CreateSessionRequest(BaseModel):
    id: str
    title: str
    user_id: str = "guest_default"
    user_type: Optional[str] = "guest"
    created_at: Optional[str] = None
    updated_at: Optional[str] = None


class UpdateSessionRequest(BaseModel):
    title: Optional[str] = None


@app.post("/api/chat/sessions")
def create_or_sync_session(payload: CreateSessionRequest):
    """Creates or syncs a chat session for this user."""
    user_id = payload.user_id
    if user_id not in USER_SESSIONS:
        USER_SESSIONS[user_id] = {}
    now_iso = datetime.now().isoformat()
    if payload.id not in USER_SESSIONS[user_id]:
        USER_SESSIONS[user_id][payload.id] = {
            "id": payload.id,
            "title": payload.title,
            "user_id": user_id,
            "user_type": payload.user_type or "guest",
            "created_at": payload.created_at or now_iso,
            "updated_at": payload.updated_at or now_iso,
            "turns": []
        }
    return {"status": "ok", "session": USER_SESSIONS[user_id][payload.id]}


@app.patch("/api/chat/sessions/{session_id}")
def update_user_session(session_id: str, payload: UpdateSessionRequest, user_id: str = "guest_default"):
    """Updates session metadata (e.g. title) for this user."""
    if user_id in USER_SESSIONS and session_id in USER_SESSIONS[user_id]:
        if payload.title:
            USER_SESSIONS[user_id][session_id]["title"] = payload.title
            USER_SESSIONS[user_id][session_id]["updated_at"] = datetime.now().isoformat()
        return {"status": "updated", "session": USER_SESSIONS[user_id][session_id]}
    return {"status": "not_found", "session_id": session_id}


@app.get("/api/chat/sessions/{session_id}")
def get_session_history(session_id: str, user_id: str = "guest_default"):
    """Returns conversation history for a specific session of this user."""
    user_data = USER_SESSIONS.get(user_id, {})
    if session_id in user_data:
        return user_data[session_id]
    # Check any other user sessions on backend
    for u_id, sessions in USER_SESSIONS.items():
        if session_id in sessions:
            return sessions[session_id]
    return {"session_id": session_id, "user_id": user_id, "turns": []}


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

        if tool_name == "query_hris_attendance":
            if data.get("mode") == "yoy_comparison":
                emp_obj = data.get("employee", {})
                yoy_metrics = data.get("yoy_metrics", {})
                att_delta = yoy_metrics.get("attendance_rate", {}).get("delta", "+26.6%")
                att_val = yoy_metrics.get("attendance_rate", {}).get("val_2026", "95.0%")
                late_val = yoy_metrics.get("late_days", {}).get("val_2026", "1 day")
                rating_val = yoy_metrics.get("performance_rating", {}).get("val_2026", "4.95 / 5.0")
                assistant_content = (
                    f"Here is the Year-over-Year evaluation for **{emp_obj.get('name')}** ({emp_obj.get('staff_id')}). "
                    f"Attendance reached **{att_val}** ({att_delta} YoY) with late check-ins reduced to **{late_val}** and an executive rating of **{rating_val}**."
                )
            else:
                assistant_content = f"Here is the biometric attendance and performance summary across {len(data.get('employees', []))} employees. Select any employee for a deep Year-over-Year breakdown."
        elif tool_name == "query_inventory_pos":
            pos_mode = data.get("mode", "reorder_plan")
            if pos_mode == "timing_forecast":
                peak_info = data.get("peak_summary", {})
                assistant_content = (
                    f"Here is the POS Demand Timing & Peak Volume Predictor. "
                    f"The daily prime window is **{peak_info.get('daily_prime_window', '17:00 – 21:00')}** "
                    f"({peak_info.get('prime_volume_share', '48% of sales')}) with a **{peak_info.get('weekend_multiplier', '+35% weekend surge')}**. "
                    f"{peak_info.get('best_dispatch_window', 'Transmit POs before 14:00')}."
                )
            elif pos_mode == "top_products":
                top_summary = data.get("summary", {})
                assistant_content = (
                    f"Here is the Top Products & ABC Margin Analysis. "
                    f"Class-A products drive **{top_summary.get('class_a_revenue_share', '74.8% of store revenue')}**, "
                    f"led by **{top_summary.get('top_driver', 'Gaming Monitor')}** generating {top_summary.get('top_monthly_revenue', '$0')}/mo."
                )
            elif pos_mode == "sku_deep_dive":
                sku_item = data.get("item", {})
                assistant_content = (
                    f"Here is the product burn rate and velocity analysis for **{sku_item.get('name')}** ({sku_item.get('sku')}). "
                    f"Current stock of **{sku_item.get('current_stock')} {sku_item.get('unit')}** will deplete in **{sku_item.get('days_left')} days** "
                    f"(estimated stockout on {sku_item.get('stockout_date_str')})."
                )
            else:
                kpis = data.get("kpis", {})
                crit = kpis.get("critical_reorders", 0)
                items = data.get("items", [])
                top_item = items[0]["name"] if items else "key products"
                assistant_content = (
                    f"Here is the Predictive Replenishment & Stockout Runway. "
                    f"**{crit} critical SKUs** require immediate replenishment (led by {top_item}). "
                    f"Pending reorder budget is **{kpis.get('pending_reorder_budget', '$0.00')}** with a daily POS sales runrate of **{kpis.get('daily_sales_runrate', '$0/day')}**."
                )
        elif tool_name == "query_employee_productivity":
            prod_mode = data.get("mode", "department_loss_overview")
            if prod_mode == "employee_deep_dive":
                emp_info = data.get("employee", {})
                fl = data.get("financial_loss", {})
                ws = data.get("workstation", {})
                wiggler = "⚠️ Synthetic Mouse Wiggler Detected" if data.get("wiggler_detected") else "Clean input telemetry"
                assistant_content = (
                    f"Here is the Workstation Background Telemetry for **{emp_info.get('name')}** ({emp_info.get('staff_id')}) "
                    f"on host `{ws.get('hostname')}` ({ws.get('os')}). "
                    f"Productivity Score is **{emp_info.get('productivity_score')}%** with **{emp_info.get('risk_level')} Risk**. "
                    f"{wiggler}. Estimated monthly payroll leakage: **{fl.get('monthly_payroll_loss')}** ({fl.get('wasted_hours_30d')} non-work)."
                )
            elif prod_mode == "loss_prediction":
                kpis = data.get("kpis", {})
                assistant_content = (
                    f"Here is the Workstation Payroll Leakage & Loss Predictor. "
                    f"Across **{kpis.get('monitored_workstations')} monitored endpoints**, direct monthly payroll loss from non-work/slacking is **{kpis.get('total_monthly_payroll_loss')}** "
                    f"(**{kpis.get('total_annual_projected_loss')} annualized**, representing **{kpis.get('payroll_leakage_pct')}** of gross payroll). "
                    f"**{kpis.get('high_risk_headcount')} workstations** exhibit critical avoidance or hardware wiggler activity."
                )
            else:
                kpis = data.get("kpis", {})
                assistant_content = (
                    f"Here is the Workstation Telemetry & Productivity Overview across **{kpis.get('monitored_workstations')} endpoints**. "
                    f"Organization average productivity is **{kpis.get('avg_productivity_score')}**, with **{kpis.get('learning_rate')}** dedicated to upskilling "
                    f"and a **{kpis.get('slacking_rate')}** slacking/fakibaji rate (totaling **{kpis.get('monthly_payroll_loss')}/mo** in wasted payroll)."
                )
        elif tool_name == "solve_math_problem":
            prob_title = data.get("problem_title", "Mathematical Solution")
            inp = data.get("input_expression", "")
            sol_summary = data.get("solution_summary", "")
            assistant_content = (
                f"Here is the step-by-step mathematical derivation for **{prob_title}**.\n\n"
                f"• **Problem:** `{inp}`\n"
                f"• **Solution:** {sol_summary}"
            )
        else:
            assistant_content = f"I have prepared the interactive **{tool_name.replace('_', ' ').title()}** component below."

        return {
            "role": "assistant",
            "content": assistant_content,
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
    return execute_approved_action(action_id=payload.action_id, decision=payload.decision)
