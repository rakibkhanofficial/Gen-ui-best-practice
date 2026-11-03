# Generative UI (GenUI) Department Presentation Guide

A structured guide for presenting this application to your team, engineering leadership, and product department.

---

## 1. Presentation Structure (15–20 Minutes)

| Section | Duration | Key Talking Point |
| :--- | :--- | :--- |
| **I. The Problem with 1st-Gen Chatbots** | 3 mins | Text streaming is inadequate for real work (finance, roadmaps, e-commerce, sensitive actions). |
| **II. What is Generative UI?** | 3 mins | Moving from text responses to dynamic, interactive React components composed on the fly. |
| **III. Live Demo Walkthrough (6 Scenarios)** | 8 mins | Triggering each GenUI component using the preset buttons & demonstrating interactivity. |
| **IV. Technical Architecture & Protocols** | 4 mins | Google Antigravity SDK, AG-UI Protocol, CopilotKit Runtime, Next.js 16, and UV terminal runner. |
| **V. Q&A and Engineering Roadmap** | 2 mins | Google OAuth upgrade, custom database models, enterprise agent deployment. |

---

## 2. Live Demo Script (Step-by-Step)

Open your browser to `http://localhost:3000`.

### Scene 1: Guest Authentication & Studio Entry
1. Explain: *"We built a seamless authentication gate with guest login so developers and stakeholders can test immediately without configuring OAuth upfront. NextAuth Google login is plugged in for Phase 2."*
2. Click **"Continue as Guest"**.
3. You are redirected to `http://localhost:3000/chat`.

### Scene 2: Atmospheric Weather Card (Framer Motion & Micro-Forecasts)
1. Click the preset: **"🌤️ Tokyo Weather"** (or type *"What is the weather in Tokyo?"*).
2. Point out:
   - Notice the **inProgress skeleton** as the agent determines the tool.
   - Once loaded, the component renders with ambient glassmorphism and animated atmospheric conditions.
   - Click the **°C / °F toggle** in the card to prove it is a real interactive React component with local state, not a static image or markdown table.
   - Point out the 5-day micro-forecast and Air Quality Index (AQI) gauges.

### Scene 3: Enterprise Sales Analytics & Zen Table
1. Click the preset: **"📊 Q3 Zen Sales & Table"** (or type *"Show sales analytics for Q3"*).
2. Point out:
   - Modern BI dashboard inspired by Zen Journey.
   - Interactive Recharts bar/trend visualization comparing Achieved Revenue vs Target vs OpEx.
   - Hover over the chart bars to reveal the interactive tooltips.
   - Click the **"Ledger"** tab in the card. Show the sortable/filterable transaction table.
   - Filter transactions by **Enterprise**, **Growth**, or **Starter** tiers.
   - Explain: *"The agent selected the chart types, assembled the financial KPIs, and returned structured data that hydrated our design-system components."*

### Scene 4: Miro-Style Visual Sticky Note Planning Board
1. Click the preset: **"📝 Miro Sticky Board"** (or type *"Plan architecture roadmap for our GenUI deployment"*).
2. Point out:
   - Visual Kanban lanes: *Ideation & Backlog*, *In Progress*, *Review & Validation*, and *Shipped & Verified*.
   - Interactive sticky notes with custom colors, tags, and assignees.
   - Click the **Thumbs Up (vote)** button on any note to watch the vote counter increment live.
   - Click the **→ arrow** on a note to move it to the next column. When a card enters the *Shipped* column, notice the **confetti celebration** trigger!
   - Type a new idea in the quick input (e.g., *"Add voice recognition"*) and click **"+ Stick"** to add a live note to the board.

### Scene 5: Tech Spec Comparison Matrix (E-Commerce)
1. Click the preset: **"💻 Tech Specs Matrix"** (or type *"Compare MacBook Pro M4 Max vs ThinkPad P1 AI Studio"*).
2. Point out:
   - Side-by-side spec comparison table for complex purchase decisions.
   - Highlighted technical metrics (Memory Bandwidth, Neural Engine TOPS, GPU cores).
   - Click **"Select Model"** on either card to see real-time selection toggle.

### Scene 6: Route & Distance Explorer (Geo Navigation)
1. Click the preset: **"🗺️ SF to Tahoe Route"** (or type *"What is the driving distance from San Francisco to Lake Tahoe?"*).
2. Point out:
   - Multi-modal comparison (Driving: 3 hr 42 min vs Transit vs Flying).
   - Waypoints along the mountain pass (Bay Bridge, Sacramento Junction, Donner Summit).
   - Click **"Turn-by-turn Navigation Steps"** to expand the step-by-step route directions.

### Scene 7: Human-in-the-Loop (HITL) Action Approval Card ⭐ *Crucial Section*
1. Click the preset: **"🛡️ HITL Refund Approval"** (or type *"Request refund of $1,250 for order ORD-8921"*).
2. Point out to your department:
   - *"In enterprise agents, autonomous actions can be dangerous (financial refunds, deleting database tables, production deployments). Traditional bots either execute blindly or fail."*
   - *"Here, our Google Antigravity SDK safety policy (`policy.ask_user`) halts the agent execution before the action is executed and surfaces a Human-in-the-Loop approval card."*
   - Show the **60-second countdown timer** ticking down.
   - Review the **Mutation Diff** showing the before and after state across systems (Stripe Payment Ledger & Salesforce CRM).
   - Click **"Approve & Execute Action"** (or **"Reject & Abort"**).
   - Notice the instant feedback: state updates to *"Action Authorized & Executed by Human Operator"*, confetti triggers, and the agent audit log on the right sidebar records the decision!

### Scene 8: Uploading Real Excel Sales Data & Streamdown Markdown Streaming ⭐
1. Click the preset: **"📁 Upload Excel Sales Data"** or click the **📎 Paperclip** icon next to the chat input.
2. In the modal, explain:
   - *"We don't need heavyweight MinIO container infrastructure for file ingestion. The backend provides a secure, lightweight upload pipeline (`/api/upload`) powered by `pandas` and `openpyxl`."*
   - If you don't have an Excel spreadsheet handy during the presentation, click **"Download Sample Sales Excel"** inside the modal, then drag & drop the downloaded `sample_enterprise_sales.xlsx` file right into the upload box!
3. Watch the real agent reasoning stages:
   - **Thinking**: *"Analyzing user prompt with Gemini 3.8 Flash..."*
   - **Searching**: *"Inspecting uploaded spreadsheet: sample_enterprise_sales.xlsx..."*
   - **Analysing**: *"Executing pandas aggregate routines (summing revenues, calculating deal sizes, category shares)..."*
4. Notice how the text response streams in fluidly without flickering or broken markdown, powered by **`streamdown` (Vercel)**!
5. Below the streamed explanation, notice the **Zen Sales Dashboard & Transaction Ledger** dynamically mounted with the real data computed from the uploaded spreadsheet!

---

## 3. Explaining the Technical Architecture

```
User Prompt
    │
    ▼
Next.js 16 (App Router + CopilotKit Core)
    │
    ├── (SSE / AG-UI Protocol) ───────────┐
    │                                     ▼
Next.js API Gateway (/api/copilotkit) ──> Python Agent Backend (FastAPI + UV)
                                              │
                                              ├── Google Antigravity SDK
                                              │   ├── LocalAgentConfig
                                              │   ├── Custom Tools Registry
                                              │   └── Safety Policy (ask_user)
                                              │
                                              ▼
                                         Docker Auxiliary Services
                                         ├── PostgreSQL (Chat History)
                                         └── Redis (State & Event Bus)
```

### Highlights for Engineering Leadership:
1. **Developer Experience (DX)**:
   - Frontend runs via `npm run dev` with Next.js 16 Turbopack.
   - Backend runs via `uv run` with instant Python hot-reloading (`--reload`).
   - Docker is used **only** for backing databases (Postgres & Redis) — **no Docker build time** on Python or React code changes!
2. **Deterministic UI Rendering**:
   - The LLM does NOT generate raw unpredictable HTML.
   - It outputs typed, validated JSON schemas conforming to Pydantic models.
   - React components are statically typed, accessible, and theme-consistent.
3. **Safety & Compliance**:
   - Sensitive mutations require explicit Human-in-the-Loop approval before dispatch.

