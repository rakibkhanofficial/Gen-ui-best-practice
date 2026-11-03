# Generative UI (GenUI) Architecture & Flow Guide

An enterprise-grade, full-stack architectural specification and operational flow guide for the **Generative UI Studio** demonstration platform.

---

## 1. Executive Summary & Philosophy

Traditional conversational AI platforms suffer from the **"Text-Only Bottleneck"**:
- Presenting 40 rows of financial ledger data as markdown tables causes cognitive fatigue.
- Sprint roadmaps described in bullet points lack spatial reasoning and collaboration.
- High-risk operations (e.g., executing a \$10,000 refund or dropping a production database) are vulnerable to accidental AI hallucination if not gated by a physical, timed Human-in-the-Loop (HITL) confirmation surface.

**Generative UI (GenUI)** solves this by elevating AI responses from static text streaming to **dynamically mounted, interactive UI components** rendered in real time from structured agent state.

```
┌───────────────────────────────────────────────────────────────────────────────┐
│                          EVOLUTION OF CHAT INTERFACES                         │
├───────────────────┬───────────────────────────────┬───────────────────────────┤
│ Gen 1 (2022-2023) │ Pure Text & Markdown          │ ChatGPT 3.5, Claude 1     │
│ Gen 2 (2024-2025) │ Artifacts / Static Previews   │ Claude Artifacts, v0      │
│ Gen 3 (2026+)     │ Interactive Generative UI     │ CopilotKit V2, A2UI,      │
│                   │ & Declarative Multi-Agent Bus │ Google Antigravity SDK    │
└───────────────────┴───────────────────────────────┴───────────────────────────┘
```

---

## 2. End-to-End System Topology

The platform is architected as a **single Git Monorepo** containing two hot-reloading development surfaces and a localized Docker container cluster:

```mermaid
flowchart TB
    subgraph Client["Next.js 16 Frontend (Port 3000)"]
        UI["Clean Gemini / ChatGPT Interface"]
        Sidebar["Chat History Sidebar (localStorage)"]
        Theme["Theme Engine (Light / Dark with mounted guard)"]
        Streamdown["Vercel Streamdown Renderer"]
        GenUIRegistry["8 GenUI Showcase Components"]
    end

    subgraph RuntimeLayer["Next.js App Router API Routes"]
        SingleRoute["/api/copilotkit (POST single-route)"]
        CatchAllRoute["/api/copilotkit/[...copilotkit] (GET/POST/OPTIONS)"]
        V2Runtime["CopilotRuntime V2 (AG-UI Protocol)"]
        V2Agent["BuiltInAgent (google/gemini-3.8-flash)"]
    end

    subgraph BackendAgent["FastAPI Python Backend (Port 8000 via UV)"]
        FastAPIRouter["/api/chat/stream (SSE Gateway)"]
        AntigravityAgent["Google Antigravity Agent Engine"]
        Gemini38Service["Gemini 3.8 Flash SDK (google-genai)"]
        PandasEngine["pandas & openpyxl Ingestion Engine"]
        ToolsRegistry["9 Agent Tool Implementations"]
    end

    subgraph DockerServices["Local Docker Auxiliary Cluster"]
        SiloS3["pgsty/silo (S3 API: 9000, Web UI: 9001)"]
        Postgres["PostgreSQL 16 (Port 5432)"]
        Redis["Redis 7 (Port 6379)"]
    end

    UI -->|SSE Connection| FastAPIRouter
    UI -->|CopilotKit Protocol| SingleRoute
    SingleRoute --> V2Runtime
    CatchAllRoute --> V2Runtime
    V2Runtime --> V2Agent

    FastAPIRouter --> AntigravityAgent
    AntigravityAgent --> Gemini38Service
    AntigravityAgent --> ToolsRegistry
    ToolsRegistry --> PandasEngine
    PandasEngine --> SiloS3
    FastAPIRouter -->|Event Stream| Streamdown
    FastAPIRouter -->|Tool Call Payloads| GenUIRegistry
    AntigravityAgent -.-> Postgres
    AntigravityAgent -.-> Redis
```

---

## 3. Communication Protocols & Contracts

### 3.1. Server-Sent Events (SSE) Protocol (`/api/chat/stream`)
The chat stream operates over HTTP/1.1 or HTTP/2 chunked transfer encoding (`text/event-stream`). Four distinct event frames are emitted:

| Event Type | Payload Schema | Description |
| :--- | :--- | :--- |
| `event: stage` | `{"stage": "Thinking"\|"Searching"\|"Analysing"\|"Completed", "detail": string}` | Emits agent reasoning milestones to update the visual stage pill in real time. |
| `event: text_delta` | `{"delta": string}` | Streams incremental markdown tokens rendered by Vercel `Streamdown`. |
| `event: tool_call` | `{"tool": string, "data": object}` | Dispatches structured Pydantic model payloads that mount interactive GenUI widgets. |
| `event: complete` | `{"status": "success", "session_id": string}` | Signals the terminal boundary of the stream. |

### 3.2. CopilotKit V2 Runtime Protocol (`/api/copilotkit` & `[...copilotkit]`)
Provides standard AG-UI negotiation endpoints:
- `POST /api/copilotkit {"method": "info"}`: Capability discovery, reporting `a2uiEnabled`, `openGenerativeUIEnabled`, and `threads`.
- `GET /api/copilotkit/threads`: Lists active conversation threads.
- `GET /api/copilotkit/threads/:id/messages`: Replays thread history.

---

## 4. Operational Flows & Sequence Diagrams

### 4.1. Real-Time Reasoning & SSE Streaming Flow

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Frontend as Next.js 16 Chat Viewport
    participant FastAPIRoute as FastAPI /api/chat/stream
    participant Antigravity as Google Antigravity Agent
    participant Gemini as Gemini 3.8 Flash LLM
    participant Streamdown as Streamdown Markdown Engine

    User->>Frontend: Types prompt or clicks suggestion card
    Frontend->>FastAPIRoute: POST /api/chat/stream {message, session_id}
    FastAPIRoute->>Antigravity: Initialize Turn Context
    Antigravity->>FastAPIRoute: event: stage {"stage": "Thinking"}
    FastAPIRoute-->>Frontend: SSE frame: stage (Thinking)
    Frontend->>Frontend: Mounts AgentReasoningStage (amber pulse)

    Antigravity->>Gemini: Stream query with function declarations
    Gemini-->>Antigravity: Function call detected: get_weather_data(city="Tokyo")
    Antigravity->>FastAPIRoute: event: stage {"stage": "Searching"}
    FastAPIRoute-->>Frontend: SSE frame: stage (Searching)
    Frontend->>Frontend: Updates stage badge (sky pulse)

    Antigravity->>FastAPIRoute: event: stage {"stage": "Analysing"}
    FastAPIRoute-->>Frontend: SSE frame: stage (Analysing)
    Frontend->>Frontend: Updates stage badge (indigo pulse)

    Antigravity->>FastAPIRoute: event: tool_call {"tool": "get_weather_data", "data": {...}}
    FastAPIRoute-->>Frontend: SSE frame: tool_call
    Frontend->>Frontend: Dynamically instantiates <WeatherCard data={...} />

    loop Token Streaming
        Gemini-->>Antigravity: Text chunk
        Antigravity->>FastAPIRoute: event: text_delta {"delta": "..."}
        FastAPIRoute-->>Frontend: SSE frame: text_delta
        Frontend->>Streamdown: Append chunk & render markdown prose
    end

    Antigravity->>FastAPIRoute: event: stage {"stage": "Completed"}
    FastAPIRoute-->>Frontend: SSE frame: stage (Completed)
    Frontend->>Frontend: Badge turns emerald (Ready)
```

---

### 4.2. Generative UI Component Mounting Lifecycle

```mermaid
flowchart TD
    A[Agent Backend Dispatches Tool Call] --> B{Match Tool Name}
    B -->|get_weather_data| C[<WeatherCard />]
    B -->|get_sales_analytics| D[<SalesDashboard />]
    B -->|generate_planning_board| E[<PlanningBoard />]
    B -->|search_product_catalog| F[<ProductCatalogCard />]
    B -->|calculate_route_distance| G[<RouteDistanceCard />]
    B -->|generate_code_snippet| H[<CodeStudioCard />]
    B -->|search_jobs| I[<JobBoardCard />]
    B -->|request_sensitive_action| J[<HITLApprovalCard />]

    subgraph ClientMounting["Client-Side Mounting & Interactivity"]
        C --> C1[°C / °F unit toggle & 5-day radar forecast]
        D --> D1[Recharts revenue vs target & sortable transaction ledger]
        E --> E1[Miro Kanban swimlanes, voting & confetti celebration]
        F --> F1[Technical spec matrix & model selection]
        G --> G1[Driving vs Transit vs Flight routing & waypoints]
        H --> H1[Multi-file workspace tabs & simulated execution terminal]
        I --> I1[BDJobs/LinkedIn filters & salary benchmarks]
        J --> J1[60-second safety countdown & Approve/Reject mutation]
    end
```

---

### 4.3. Spreadsheet Ingestion & Data Analytics Pipeline

```mermaid
flowchart LR
    A[User Drags & Drops .xlsx / .csv] --> B[FileUploadZone Component]
    B -->|multipart/form-data| C[FastAPI /api/upload]
    C --> D[pgsty/silo S3 Storage: genui-uploads bucket]
    C --> E[pandas & openpyxl Extraction Engine]
    E --> F[Infer Columns, Revenue, Expenses & Transactions]
    F --> G[Pydantic SalesAnalyticsData Model]
    G --> H[Return JSON Preview & S3 File Path]
    H --> I[User Sends: 'Analyze this sales data']
    I --> J[Agent Ingests S3 Sheet]
    J --> K[Mounts <SalesDashboard /> with Reactive Recharts]
```

---

### 4.4. Human-in-the-Loop (HITL) Safety Gate & Two-Phase Mutation

```mermaid
sequenceDiagram
    autonumber
    actor User as Human Operator
    participant UI as <HITLApprovalCard />
    participant FastAPIRoute as FastAPI /api/actions/approve
    participant Antigravity as Agent Execution Core

    Note over User,Antigravity: Phase 1: Preparation & Gating
    Antigravity->>UI: request_sensitive_action({action_id: "act_9918", amount: "$10,000", timeout: 60})
    UI->>UI: Mounts Safety Card with amber glowing border
    UI->>UI: Starts 60-Second Real-Time Countdown Timer

    alt Case A: Operator Approves
        User->>UI: Clicks "Approve & Execute"
        UI->>FastAPIRoute: POST /api/actions/approve {action_id, decision: "approve"}
        FastAPIRoute->>Antigravity: Commit mutation to backend database
        Antigravity-->>FastAPIRoute: Mutation Confirmed
        FastAPIRoute-->>UI: {status: "executed", message: "Transaction completed"}
        UI->>UI: Transitions to Emerald Green "Approved & Executed" State
    else Case B: Operator Rejects
        User->>UI: Clicks "Reject"
        UI->>FastAPIRoute: POST /api/actions/approve {action_id, decision: "reject"}
        FastAPIRoute->>Antigravity: Abort transaction and log security audit
        UI->>UI: Transitions to Rose Red "Action Rejected" State
    else Case C: Timeout (60 Seconds Elapsed)
        UI->>UI: Timer reaches 00:00
        UI->>UI: Automatically disables buttons, marks "Expired"
    end
```

---

### 4.5. Theme Engine & Hydration Guarantee Architecture

To eliminate React hydration attribute mismatches between SSR and client renders:

```mermaid
flowchart TD
    SSR[Server-Side Render SSR] -->|Default theme: dark| HTML["<html class='dark'><body>"]
    HTML --> HydrationStart[Client Browser Hydration Begins]
    
    subgraph HydrationGuard["Mounted Guard in ThemeProvider"]
        MountedFalse["mounted === false"] --> RenderNeutral["Render Neutral Skeleton/Placeholder"]
        RenderNeutral --> DOMMatch["Client DOM Matches Server DOM (No Hydration Error)"]
        DOMMatch --> UseEffect["useEffect() triggers on mount"]
        UseEffect --> ReadStorage["Read localStorage('genui_theme')"]
        ReadStorage --> SetMounted["setMounted(true)"]
        SetMounted --> RenderActive["Render Active Icon (Sun or Moon)"]
    end
```

---

## 5. Generative UI Component Registry

| Component | Business Scenario | Key Interactivity | Technologies |
| :--- | :--- | :--- | :--- |
| **`WeatherCard`** | Live weather inquiries, travel planning | °C/°F conversion toggle, 5-day forecast cards, air quality index | Framer Motion, Tailwind v4 |
| **`SalesDashboard`** | Financial analysis, spreadsheet breakdown | Recharts bar charts, tab switching (Trends vs Ledger), tier filtering | Recharts, Lucide |
| **`PlanningBoard`** | Sprint roadmaps, project ideation | Miro-style sticky notes, live voting, card movement between columns, confetti | Canvas Confetti, Framer Motion |
| **`ProductCatalogCard`** | E-commerce comparison, procurement | Hardware spec comparison matrix, model selection pills | Tailwind v4, Lucide |
| **`RouteDistanceCard`** | Logistics, navigation, dispatch | Multi-modal travel calculation (Driving, Transit, Flying), waypoint steps | SVG routing, Lucide |
| **`HITLApprovalCard`** | High-risk refunds, database changes, permissions | 60-second real-time countdown, risk level badges, Approve/Reject callbacks | React hooks, Framer Motion |
| **`CodeStudioCard`** | Code generation, architectural review | Multi-file tab switcher (Python/TypeScript), copy code, simulated execution console | Monospace fonts, Lucide |
| **`JobBoardCard`** | Talent search, career recommendations | Dual-source tabs (BDJobs & LinkedIn), salary filters, Gemini interview tips | Tailwind v4, Lucide |

---

## 6. Security Architecture & Secret Isolation

1. **Strict Environment Segregation**:
   - Secrets are loaded exclusively from `.env.local` (frontend) and `.env` (backend).
   - Zero hardcoded API keys exist in source code or Git history.
2. **Comprehensive `.gitignore` Defense**:
   - Blocks `.env`, `.env*`, `*.env`, `*.env.*`, `frontend/.env*`, `backend/.env*`, and `**/.env*`.
3. **Audited Git Commit History**:
   - Every commit on `main` is verified via `git log -S` to contain zero secret occurrences.
4. **Human-in-the-Loop Safeguards**:
   - Sensitive mutations cannot execute without explicit operator cryptographic approval or verified session identity.

---

## 7. Department Presentation Strategy (Talking Points)

When presenting this application to your team:
1. **Show the Problem First**: Demonstrate a plain markdown text response from a standard chatbot, highlighting how difficult it is to review a 50-row sales report or sprint board.
2. **Demonstrate Interactivity**: Click the **°C/°F toggle**, move sticky notes in the **Miro Board** to trigger confetti, and filter the **Sales Ledger**. Emphasize that these are native, responsive React components with local state.
3. **Show the Safety Barrier**: Trigger the **HITL Refund Gate** to demonstrate the 60-second countdown and explain how enterprise agents enforce safety boundaries before touching production databases.
4. **Highlight the Architecture**: Explain how the **Google Antigravity SDK**, **Gemini 3.8 Flash**, and **CopilotKit V2** work in harmony across a single monorepo.
