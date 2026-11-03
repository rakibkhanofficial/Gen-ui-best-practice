<div align="center">

# ⚡ Generative UI Studio (GenUI)
### Enterprise-Grade Agentic AI Platform with Dynamic Interactive React Components

[![Next.js 16](https://img.shields.io/badge/Next.js-16.4.4-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19.3.0-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.162.0-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker)](https://www.docker.com/)
[![uv](https://img.shields.io/badge/uv-Fastest_Python-DE5FE9?style=for-the-badge)](https://github.com/astral-sh/uv)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](./LICENSE.md)

<p align="center">
  A state-of-the-art Generative UI application bridging autonomous AI agents with rich, stateful, interactive web components mounted directly inside real-time conversational streaming sessions.
</p>

[Key Features](#-key-features) • [GenUI Showcase](#-generative-ui-component-showcase) • [Architecture](#-system-architecture) • [Docker Deployment Modes](#-3-docker-deployment-modes) • [Quick Start](#-quick-start-guide) • [License](#-license)

</div>

---

## 📖 Overview

First-generation conversational AI interfaces present a fundamental **"Text-Only Bottleneck"**:
* 40 rows of critical financial data presented as flat markdown tables overload the user's cognitive bandwidth.
* Software roadmaps described as bulleted text lack spatial context and direct manipulation.
* Route directions without interactive turn-by-turn geometry and toll calculations leave commuters confused.
* Irreversible actions (financial disbursements, database drops) executed without physical, timed confirmation risk catastrophic mistakes.

**Generative UI (GenUI)** transforms this paradigm. Instead of static text streaming, the agent dynamically composes and mounts **interactive, verified React components** hydrated with structured data from specialized agent tools in real time.

---

## 🚀 Key Features

* **Real-time Server-Sent Events (SSE)**: Ultra-low latency token-by-token streaming, reasoning stage tracking (`Thinking`, `Searching`, `Analysing`), and structured payload dispatching.
* **CopilotKit V2 Integration**: Declarative agent UI bus supporting AG-UI protocols, generative widgets, and session coordination.
* **Multi-Modal Speech-to-Text (STT)**: Integrated voice dictation with base input preservation and duplicate transcript de-duplication.
* **Streamdown KaTeX Engine**: High-fidelity mathematical formula and scientific derivation rendering.
* **Live Artifact Sandbox**: Monaco Code Studio featuring live `iframe` execution for single-file HTML/CSS/JS web applications.
* **Zero Missing Assets**: 30+ locally stored high-definition airline and corporate PNG logos with automatic Google S2 128px favicon fallback.
* **Multi-Currency Calculation**: Real-time flight search supporting Bangladeshi Taka (৳ BDT), Indian Rupee (₹ INR), and US Dollars ($ USD).
* **Frictionless Developer Experience**:
  * 3 distinct Docker deployment topologies (Local Monorepo with Nginx, Production Multi-stage, Backing Services Only).
  * Rapid Python execution with `uv` (10x faster than legacy pip).

---

## 🎨 Generative UI Component Showcase

| Component | Visual Description | Trigger Prompts |
| :--- | :--- | :--- |
| **Interactive Planning Board** (`PlanningBoard.tsx`) | Excalidraw MCP hand-drawn architecture diagram, progressive SVG rendering, automated fit-to-screen scaling, task creation, voting, and `.excalidraw` schema export. | *"Generate an Excalidraw architecture diagram and sprint plan"* |
| **Monaco Code Studio & Runner** (`CodeStudioCard.tsx`) | Multi-tab code viewer with syntax highlighting, token count, copy action, diff comparison, and isolated sandbox iframe executing live HTML/CSS/JS artifacts. | *"Write a Python script for async SSE and include an HTML tester"* |
| **OpenStreetMap Route Explorer** (`RouteExplorerCard.tsx`) | Real OSRM highway routing, Leaflet map geometry, turn-by-turn steps, multi-modal travel times (Driving, Transit, Walking), elevated expressway tolls in BDT (৳), and Google Maps fallback. | *"Show direction or route from Mohakhali to Dhaka Airport Road"* |
| **Authentic Job Board** (`JobBoardCard.tsx`) | Aggregated openings across Bangladesh conglomerates (Beximco, Square, ACI, Bashundhara, Walton, PRAN, Akij, BRAC, Grameenphone) and global tech firms with verified local PNG logos. | *"Find Senior Full Stack Engineer jobs at Beximco or Square in Dhaka"* |
| **Multi-Currency Flight Matrix** (`FlightDetailsCard.tsx`) | Domestic and international routes, verified airline logos (Biman Bangladesh, US-Bangla, NOVOAIR, Air Astra, Air India, SpiceJet, IndiGo), dual BDT/INR pricing. | *"Search flights from Delhi to Dhaka"* or *"Flights from Dhaka to Cox's Bazar"* |
| **Doctor & Specialist Finder** (`DoctorFinderCard.tsx`) | Verified medical specialists across Dhaka & Bangladesh with degrees, hospital affiliations, consultation fees in BDT, and appointment booking modal. | *"Find the top best cardiologist doctors in Dhaka Bangladesh"* |
| **Medicine & Alternatives Engine** (`MedicineDetailsCard.tsx`) | Pharmaceutical data, dosage forms, manufacturer branding, and generic alternative suggestions (e.g., Napa -> Paracetamol, Xcel by ACI, Fast by Beximco). | *"Find Napa or Napa alternatives"* |
| **ACI AgTech E-Commerce** (`AciAgriProductsCard.tsx`) | Authentic ACI Agribusiness products (hybrid seeds, bio-fertilizers, smart sprayers) with price in BDT, ratings, stock status, and clean shopping cards. | *"Show ACI agriculture products"* |
| **Location-Aware Hotel Finder** (`HotelFinderCard.tsx`) | Curated accommodations across Dhaka, Cox's Bazar, Sylhet, and worldwide with star ratings, per-night rates in BDT, amenity chips, and booking links. | *"Find luxury hotels in Dhaka near Gulshan"* |
| **Math Reasoning & LaTeX** (`MathVisualizerCard.tsx`) | Multi-line mathematical derivations, calculus, linear algebra proofs, rendered via Streamdown KaTeX. | *"Derive the Euler-Lagrange equation"* |
| **Human-in-the-Loop Gatekeeper** (`HitlDecisionCard.tsx`) | 60-second countdown safety interceptor with side-by-side JSON mutation diff and live Approve/Reject callbacks. | *"Request refund of $1,250 for order ORD-8921"* |
| **Miro-Style Sticky Note Board** (`VisualStickyBoard.tsx`) | Visual Kanban swimlanes, interactive sticky notes, live voting, dynamic note addition, and celebration confetti. | *"Plan architecture roadmap on a Miro sticky board"* |
| **Sales Analytics Dashboard** (`SalesDashboardCard.tsx`) | Zen Journey inspired BI dashboard with Recharts visualizations, KPI gauges, and sortable/filterable transaction ledgers. | *"Show sales analytics for Q3"* |
| **Atmospheric Weather Card** (`WeatherCard.tsx`) | Glassmorphic atmospheric card with real-time weather conditions, °C/°F toggle, AQI gauges, and 5-day micro-forecasts. | *"What is the weather in Tokyo?"* |

---

## 🏗️ System Architecture

```mermaid
flowchart TB
    subgraph Client["Next.js 16 Frontend (Port 3000)"]
        UI["ChatContainer UI Shell"]
        STT["Web Speech API Voice STT"]
        Streamdown["Streamdown Math & KaTeX Engine"]
        GenUIRegistry["14+ Generative UI Card Catalog"]
    end

    subgraph RuntimeLayer["Next.js App Router API Routes"]
        SingleRoute["/api/copilotkit (POST single-route)"]
        CatchAllRoute["/api/copilotkit/[...copilotkit]"]
        V2Runtime["CopilotRuntime V2 (AG-UI Protocol)"]
    end

    subgraph BackendAgent["FastAPI Python Backend (Port 8000 via UV)"]
        FastAPIRouter["/api/chat/stream (SSE Gateway)"]
        AntigravityAgent["Google Antigravity Agent Engine"]
        GeminiService["Google GenAI SDK (Gemini 3.8 / 3.5 / 2.5)"]
        ToolsRegistry["12+ Agent Tool Implementations"]
    end

    subgraph DockerServices["Backing Infrastructure Cluster"]
        SiloS3["pgsty/silo (S3 API: 9000, Web UI: 9001)"]
        Postgres["PostgreSQL 16 (Port 5432)"]
        Redis["Redis 7 (Port 6379)"]
        NginxProxy["Local / Prod Nginx Proxy (Port 80)"]
    end

    UI -->|SSE Connection| FastAPIRouter
    UI -->|CopilotKit Protocol| SingleRoute
    SingleRoute --> V2Runtime
    CatchAllRoute --> V2Runtime

    FastAPIRouter --> AntigravityAgent
    AntigravityAgent --> GeminiService
    AntigravityAgent --> ToolsRegistry

    FastAPIRouter -->|Event Stream| Streamdown
    FastAPIRouter -->|Tool Call Payloads| GenUIRegistry
    AntigravityAgent -.-> Postgres
    AntigravityAgent -.-> Redis
    AntigravityAgent -.-> SiloS3
    NginxProxy -->|Port 80 Proxy| UI
    NginxProxy -->|Port 80 Proxy| FastAPIRouter
```

---

## 🛠️ Tech Stack Breakdown

### Frontend Layer
* **Framework**: Next.js 16.4.4 (Turbopack, Partial Prerendering, Standalone Server Output)
* **Runtime**: React 19.3.0
* **Styling**: Tailwind CSS v4, Lucide React Icons
* **Generative UI Bus**: `@copilotkit/react-core`, `@copilotkit/react-ui`, `@copilotkit/runtime`
* **Markdown & LaTeX**: `streamdown` v2.7, `@streamdown/math`, `katex`
* **Animations & Charts**: `framer-motion` v14, `recharts` v3, `canvas-confetti`
* **Static Assets**: 30+ 256px RGBA PNG brand assets stored locally in `public/images/`

### Backend Agent Layer
* **Runtime**: Python 3.12+ managed by **`uv`** (Astral)
* **Framework**: FastAPI 0.162.0 (Asynchronous ASGI)
* **Server**: Uvicorn (standard) with HTTP/2 and WebSockets support
* **AI Model Engine**: Google GenAI SDK (`google-genai`, `google-antigravity`) with Gemini 3.8 Flash, 3.5 Flash Lite, 2.5 Flash
* **Validation**: Pydantic v2 (Strict Schema Contracts)
* **Streaming Protocol**: Server-Sent Events (`sse-starlette`)

### Infrastructure & Persistence
* **Reverse Proxy**: Nginx Alpine with unbuffered SSE streaming (`proxy_buffering off;`)
* **Relational Database**: PostgreSQL 16 Alpine (AsyncPG connection pooling)
* **Event Bus & Cache**: Redis 7 Alpine
* **Object Storage**: Silo / MinIO S3-compatible storage (`pgsty/silo`)

---

## 🐳 3 Docker Deployment Modes

We provide three tailored Docker configurations for different development and operational stages:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                               3 DOCKER DEPLOYMENT MODES                                │
├──────────────────────────┬─────────────────────────────┬───────────────────────────────┤
│ 1. Local Monorepo Stack  │ docker-compose.local.yml    │ Frontend + Backend + Nginx    │
│                          │                             │ with hot-reload volume mounts │
├──────────────────────────┼─────────────────────────────┼───────────────────────────────┤
│ 2. Production Stack      │ docker-compose.prod.yml     │ Multi-stage Next.js standalone│
│                          │                             │ + 4-worker Uvicorn + Nginx    │
├──────────────────────────┼─────────────────────────────┼───────────────────────────────┤
│ 3. Backing Services Only │ docker-compose.deps.yml     │ PostgreSQL 16 + Redis 7 +     │
│    (Terminal Run)        │ (or docker-compose.yml)     │ Silo MinIO S3 for local DX    │
└──────────────────────────┴─────────────────────────────┴───────────────────────────────┘
```

### Mode 1: Local Full-Stack Monorepo with Nginx (Recommended for Full Containerization)
Runs the entire monorepo inside Docker with hot-reload volume mounts and an Nginx reverse proxy on port 80:

```bash
docker compose -f docker-compose.local.yml up --build
```
* **Application URL**: [http://localhost](http://localhost) (Port 80)
* **API Route**: [http://localhost/api](http://localhost/api)
* **S3 Console**: [http://localhost:9001](http://localhost:9001)

---

### Mode 2: Production Multi-Stage Deployment
Runs multi-stage production builds with standalone Next.js 16 output and 4-worker Uvicorn:

```bash
docker compose -f docker-compose.prod.yml up -d --build
```
* **Application URL**: [http://localhost](http://localhost) (Port 80 / 443)
* **Health Check**: `curl -f http://localhost/api/health`

---

### Mode 3: Backing Services Only (Recommended for Fastest Host Development)
Runs only PostgreSQL, Redis, and Silo MinIO in Docker, while running backend and frontend directly in your terminal for sub-second hot reload:

1. **Start Backing Services**:
   ```bash
   docker compose -f docker-compose.deps.yml up -d
   # or simply:
   docker compose up -d
   ```

2. **Run Backend (Terminal 1)**:
   ```bash
   cd backend
   uv run uvicorn app.main:app --reload --port 8000
   ```

3. **Run Frontend (Terminal 2)**:
   ```bash
   cd frontend
   npm run dev
   ```
* **Frontend**: [http://localhost:3000](http://localhost:3000)
* **Backend Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## ⚡ Quick Start Guide

### 1. Prerequisites
* **Node.js**: v20+ or v22+
* **Python**: 3.12+ (managed by [`uv`](https://github.com/astral-sh/uv))
* **Docker Desktop**: Any recent release

### 2. Clone & Setup Environment Variables
```bash
git clone https://github.com/your-username/gen-ui-best-practice.git
cd gen-ui-best-practice

# Copy environment template
cp .env.example .env
```
Edit `.env` and set your Google Gemini API key:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. One-Command Setup with Makefile
```bash
# Display all developer commands
make help

# Install all backend and frontend dependencies
make install

# Start auxiliary backing services
make dev-deps

# In two terminals:
make backend
make frontend
```

---

## ⚙️ Environment Variables Reference

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `GEMINI_API_KEY` | `""` | Google Gemini API key for dynamic tool execution and reasoning. |
| `DATABASE_URL` | `postgresql://postgres:postgrespassword@localhost:5432/genui_db` | Async PostgreSQL connection string. |
| `REDIS_URL` | `redis://localhost:6379/0` | Redis instance for session state and pub/sub. |
| `S3_ENDPOINT_URL` | `http://localhost:9000` | Silo / MinIO S3 object storage endpoint. |
| `S3_ACCESS_KEY_ID` | `siloadmin` | S3 root admin user. |
| `S3_SECRET_ACCESS_KEY` | `silopassword` | S3 root admin password. |
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000/api` | API route consumed by the Next.js client. |
| `NEXTAUTH_SECRET` | `development-secret-key-32chars-minimum` | NextAuth encryption secret. |

---

## 🧪 Testing & Verification

```bash
# Verify Frontend TypeScript compiler
cd frontend && npx tsc --noEmit

# Verify Backend Python syntax and imports
cd backend && uv run python -c "import app.main; print('Backend loaded successfully!')"
```

---

## 📄 License

This project is licensed under the **MIT License**. See the [LICENSE.md](./LICENSE.md) file for details.

```
Copyright (c) 2026 Rakib Khan

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:
...
```
