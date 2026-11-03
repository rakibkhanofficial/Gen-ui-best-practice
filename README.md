# Generative UI Studio (GenUI Practice & Presentation)

A full-stack, enterprise-grade **Generative UI** demonstration platform built with **Next.js 16**, **CopilotKit**, **Google Antigravity SDK**, **FastAPI (via UV)**, and **Docker**.

---

## 🚀 Key Features

- **Dynamic Generative UI**: Bridges agent tool calling with dynamic, interactive React components mounted inside the message stream.
- **6 Showcase GenUI Components**:
  1. 🌤️ **Atmospheric Weather Card**: Real-time atmospheric conditions, °C/°F toggle, and 5-day micro-forecasts.
  2. 📊 **Enterprise Sales Dashboard**: Zen Journey inspired analytics with Recharts visualizations and sortable/filterable transaction ledgers.
  3. 📝 **Miro-Style Visual Sticky Board**: Kanban swimlanes, interactive sticky notes, live voting, dynamic note creation, and celebratory completion confetti.
  4. 💻 **Tech Spec Comparison Matrix**: E-commerce comparison table with hardware specs, review ratings, and dynamic model selection.
  5. 🗺️ **Route & Distance Explorer**: Multi-modal travel comparisons (Driving, Transit, Flying), waypoints, and turn-by-turn directions.
  6. 🛡️ **Human-in-the-Loop (HITL) Gatekeeper**: 60s countdown timer, system mutation diff, and live Approve/Reject callbacks resuming agent execution.
- **Guest Authentication**: Instant guest login on `/login` redirecting to `/chat` with cookie-backed session tokens and NextAuth readiness.
- **Lightning-Fast DX**:
  - Python agent runs hot via `uv run` on port 8000.
  - Next.js 16 frontend runs hot via `npm run dev` on port 3000.
  - PostgreSQL & Redis run in Docker — **zero Docker rebuilding required** when modifying code.

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | Next.js 16.4.4, React 19, TypeScript, Tailwind CSS v4, Framer Motion, Recharts, Lucide React, Canvas Confetti |
| **Agent / GenUI** | `@copilotkit/react-core`, `@copilotkit/react-ui`, `@copilotkit/runtime` |
| **Backend Agent** | Python 3.12, FastAPI, `google-antigravity` SDK, `google-genai`, Pydantic v2, Uvicorn |
| **Environment Runner** | `uv` (Fastest Python package manager & runner) |
| **Databases** | PostgreSQL 16 (Chat history & sessions) & Redis 7 (Event bus) via Docker Compose |

---

## 📦 Getting Started

### 1. Prerequisites
- Node.js 18+ (tested on Node v22)
- Python 3.12+ (managed by `uv`)
- Docker Desktop (for Postgres & Redis)

### 2. Start Auxiliary Docker Services
```bash
docker compose up -d
```

### 3. Run the Backend Agent (Port 8000)
```bash
cd backend
uv run uvicorn app.main:app --reload --port 8000
```

### 4. Run the Next.js Frontend (Port 3000)
```bash
cd frontend
npm run dev
```

### 5. Open the Application
Navigate to [http://localhost:3000](http://localhost:3000).
- Click **"Continue as Guest"**
- Click any of the **Demo Presets** at the top or type custom requests!

---

## 📖 Presentation Guide
See [PRESENTATION_GUIDE.md](./PRESENTATION_GUIDE.md) for a complete scene-by-scene script to present this project to your engineering and product department!

