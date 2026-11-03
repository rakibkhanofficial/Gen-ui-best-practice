# 🐍 GenUI Studio - FastAPI Backend & AI Agent Engine

High-performance, asynchronous Python backend powering **Generative UI Studio**, built with **FastAPI**, **`uv`**, **Server-Sent Events (SSE)**, **Google GenAI SDK (Gemini 2.5 / 3.5 / 3.8)**, and the **Google Antigravity Agent Framework**.

---

## 🌟 Key Responsibilities

1. **Server-Sent Events (SSE) Streaming Gateway**:
   - Low-latency streaming of agent reasoning milestones (`stage`), incremental markdown tokens (`text_delta`), and structured UI component payloads (`tool_call`).
2. **Dynamic Tool Calling & Generative UI Synthesis**:
   - 12+ specialized agent tools emitting strictly validated Pydantic schemas consumed by frontend React components.
3. **Authentic Data Aggregation & Dynamic Fallbacks**:
   - Real Bangladesh conglomerate metadata (Beximco, Square, ACI, Bashundhara, Walton, PRAN-RFL, Grameenphone, BRAC).
   - High-precision airline routes and multi-currency calculation (BDT ৳, INR ₹, USD $).
   - OpenStreetMap OSRM routing geometry and turn-by-turn navigation.
   - Pharmaceutical lookup and generic alternatives (e.g. Napa -> Paracetamol, Xcel by ACI).
   - ACI AgTech catalog integration.
4. **Excalidraw MCP Protocol Gateway**:
   - Synthesizes and translates system architecture into Excalidraw-compliant JSON schemas and progressive SVG canvas models.

---

## 🛠️ Tech Stack & Requirements

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Language** | Python 3.12+ | Asynchronous execution with modern type annotations |
| **Package Manager** | `uv` | 10x-100x faster than traditional pip / virtualenv |
| **Web Framework** | FastAPI 0.162+ | High-throughput asynchronous REST & SSE streaming |
| **ASGI Server** | Uvicorn (standard) | HTTP/1.1 and WebSockets runner |
| **AI SDK** | `google-genai` / `google-antigravity` | Gemini 3.8 Flash, 3.5 Flash Lite, 2.5 Flash |
| **Validation** | Pydantic v2 | Strict schema contracts and JSON serialization |
| **Event Bus / Cache** | Redis 7 | Pub/Sub messaging and session state cache |
| **Database** | PostgreSQL 16 (asyncpg) | Session persistence and conversation histories |
| **Object Storage** | MinIO / Silo (S3-compatible) | Artifact storage, exports, and file uploads |

---

## 📂 Project Structure

```
backend/
├── app/
│   ├── agent/
│   │   ├── runner.py             # Core agent execution loop & SSE event generator
│   │   └── tools/                # Specialized GenUI Agent Tools
│   │       ├── agri_tool.py          # ACI AgTech product catalog & eCommerce
│   │       ├── code_studio_tool.py   # Monaco editor & sandboxed artifact runner
│   │       ├── doctor_tool.py        # Specialist doctor finder & appointments
│   │       ├── excalidraw_tool.py    # Excalidraw MCP diagram & sprint board
│   │       ├── flight_tool.py        # Flight search with BDT/INR & airline logos
│   │       ├── hitl_tool.py          # Human-in-the-Loop timed approval gate
│   │       ├── hotel_tool.py         # Hotel & accommodation finder
│   │       ├── job_tool.py           # BD conglomerates & tech jobs aggregator
│   │       ├── kanban_tool.py        # Miro-style sticky note board
│   │       ├── medicine_tool.py      # Medicine info & generic alternatives
│   │       ├── route_tool.py         # OpenStreetMap OSRM direction & navigation
│   │       ├── sales_tool.py         # Recharts sales analytics & ledgers
│   │       ├── tech_tool.py          # Hardware comparison matrix
│   │       └── weather_tool.py       # Atmospheric weather & forecasts
│   ├── config.py                 # Pydantic Settings & environment variables
│   ├── main.py                   # FastAPI application entrypoint & CORS config
│   ├── models/
│   │   └── schemas.py            # Pydantic data models for all GenUI cards
│   └── services/
│       ├── gemini_service.py     # Gemini client initialization & retries
│       ├── postgres_service.py   # Async database connection pool
│       ├── redis_service.py      # Redis cache & PubSub client
│       └── s3_service.py         # MinIO / S3 artifact storage integration
├── Dockerfile                    # Default container image
├── Dockerfile.dev                # Development container with hot reload
├── Dockerfile.prod               # Multi-stage production container
├── pyproject.toml                # uv project configuration & dependencies
└── uv.lock                       # Deterministic dependency lockfile
```

---

## 🚀 Running the Backend

### Option A: Local Terminal with `uv` (Recommended for Development)

1. **Install `uv`** (if not already installed):
   ```bash
   curl -LsSf https://astral.sh/uv/install.sh | sh
   ```

2. **Sync Dependencies**:
   ```bash
   cd backend
   uv sync
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` in the project root to `.env` and set your `GEMINI_API_KEY`:
   ```bash
   GEMINI_API_KEY=AIzaSy...
   ```

4. **Start Backing Services (PostgreSQL, Redis, Silo)**:
   ```bash
   # From root directory
   docker compose -f docker-compose.deps.yml up -d
   ```

5. **Run FastAPI Server with Hot Reload**:
   ```bash
   uv run uvicorn app.main:app --reload --port 8000
   ```
   Backend will be live at `http://localhost:8000`. Interactive OpenAPI documentation available at `http://localhost:8000/docs`.

---

## 🔌 API & SSE Streaming Contract

### `POST /api/chat/stream`
Streams Server-Sent Events (SSE) representing agent execution turns.

**Request Payload:**
```json
{
  "message": "Find Senior Software Engineer jobs at Beximco or Square Group in Dhaka",
  "session_id": "session-123",
  "history": []
}
```

**SSE Stream Output:**
```
event: stage
data: {"stage": "Searching", "detail": "Scanning Bangladesh enterprise job boards..."}

event: tool_call
data: {"tool": "search_jobs", "data": {"query": "Beximco or Square Group", "jobs": [...]}}

event: text_delta
data: {"delta": "Here are the top openings at leading Bangladesh conglomerates:"}

event: complete
data: {"status": "success", "session_id": "session-123"}
```

