# Generative UI (GenUI) Department Presentation Guide

A comprehensive, scenario-by-scenario presentation guide for showcasing **Generative UI Studio** to your team, engineering leadership, and product department.

---

## 1. Presentation Structure (20–25 Minutes)

| Section | Duration | Key Talking Point |
| :--- | :--- | :--- |
| **I. The Problem with 1st-Gen Chatbots** | 3 mins | Text streaming is inadequate for real-world tasks (engineering planning, finance, routing, medical decisions). |
| **II. What is Generative UI?** | 3 mins | Moving from plain markdown to stateful, interactive React components composed dynamically on the fly. |
| **III. Live Demo Walkthrough (12+ Scenarios)** | 12 mins | Triggering each GenUI component using natural prompts & demonstrating rich interactivity. |
| **IV. Technical Architecture & Protocols** | 4 mins | SSE streaming, CopilotKit runtime, Google GenAI SDK (Gemini 3.8), and Docker multi-mode deployment. |
| **V. Q&A and Enterprise Roadmap** | 3 mins | Multi-agent coordination, database integrations, and on-premise container deployment. |

---

## 2. Live Demo Script (Step-by-Step Walkthrough)

Open your browser to `http://localhost:3000` (or `http://localhost:80` if running via Nginx).

### Scene 1: Guest Authentication & Studio Entry
1. Explain: *"We built a frictionless authentication gate with guest login so developers and stakeholders can test immediately without configuring OAuth upfront. NextAuth session handling is ready for production."*
2. Click **"Continue as Guest"** to enter `http://localhost:3000/chat`.

---

### Scene 2: Interactive Visual Planning Board (Excalidraw MCP) ⭐ *High Impact*
1. **Prompt**: *"Generate an Excalidraw architecture diagram and sprint plan for our GenUI release"*
2. **Key Talking Points**:
   - Point out the **progressive SVG rendering** creating hand-drawn visual diagrams in real time.
   - Show the **automatic fit-to-screen scale calculation**: All phases (Discovery, Active Development, Review) fit perfectly without manual zoom adjustments.
   - Click the **[Fit]** button in the zoom pill to demonstrate auto-centering.
   - Click **Export .excalidraw** to download the schema for import into excalidraw.com.

---

### Scene 3: Monaco Code Studio & Sandboxed Artifact Runner ⭐
1. **Prompt**: *"Write a high-performance Python script for async SSE streaming with FastAPI, and include an interactive HTML tester"*
2. **Key Talking Points**:
   - Multi-file tab architecture with language indicators.
   - Monaco code viewing with syntax highlighting, token count, and 1-click clipboard copy.
   - For single-file HTML/CSS/JS artifacts, click the **"Live Preview" / "Run Artifact"** tab to execute the application inside a secure, sandboxed `iframe`.

---

### Scene 4: OpenStreetMap OSRM Direction & Route Explorer ⭐
1. **Prompt**: *"Show the direction or route from Mohakhali to Dhaka Airport Road"*
2. **Key Talking Points**:
   - Clean, organized routing header displaying source, destination, and OSRM status badge.
   - Interactive Leaflet/OpenStreetMap visual geometry showing the exact highway path.
   - Multi-modal comparisons (Driving 18-25 min, Transit 35-45 min, Walking 1 hr 55 min).
   - Elevated Expressway toll estimations in BDT (৳150 - ৳220).
   - One-click Google Maps fallback button.

---

### Scene 5: Authentic Job Board with Bangladesh Conglomerate Branding ⭐
1. **Prompt**: *"Find Senior Software Engineer jobs at Beximco Group or Square Group in Dhaka"*
2. **Key Talking Points**:
   - Real, authentic job cards across leading Bangladesh conglomerates (Beximco, Square, ACI, Bashundhara, Walton, PRAN-RFL, Grameenphone, BRAC).
   - Crisp, high-definition company PNG logos loaded locally (zero missing images or generic stock photos).
   - Transparent salary ranges in BDT (e.g. ৳180,000 - ৳260,000 / month).
   - Expandable **Interview Prep & Role Guidance** tips tailored to each position.

---

### Scene 6: Multi-Currency Flight Search & Booking Matrix ⭐
1. **Prompt**: *"Search flights from Delhi to Dhaka"* or *"Find flights from Dhaka to Cox's Bazar"*
2. **Key Talking Points**:
   - Real airline fleet routing across India-Bangladesh and domestic Bangladesh corridors.
   - Verified official logos for **Air India**, **SpiceJet**, **Biman Bangladesh**, **US-Bangla**, **NOVOAIR**, and **Air Astra**.
   - Dual currency support: automatic price display in **BDT (৳)** and **INR (₹)** with exchange rate breakdown.
   - Baggage allowance and non-stop / 1-stop indicators.

---

### Scene 7: Doctor Finder & Medical Specialist Card
1. **Prompt**: *"Find the top best cardiologist doctors in Dhaka Bangladesh"*
2. **Key Talking Points**:
   - Specialist medical profiles with degrees, hospital affiliations, consultation fees in BDT, and chamber addresses.
   - Interactive **"Book Appointment"** modal with day and time slot pickers.
   - Verified avatar badges with reliable fallback monograms.

---

### Scene 8: Medicine Information & Generic Alternatives
1. **Prompt**: *"Tell me about Napa and suggest alternatives"*
2. **Key Talking Points**:
   - Identifies generic name (Paracetamol), therapeutic class, dosage forms, and indications.
   - Lists alternatives from leading Bangladesh pharmaceutical manufacturers: **Xcel by ACI**, **Ace by Square**, **Fast by Beximco**.
   - Includes precautions, pregnancy safety, and side effects.

---

### Scene 9: ACI AgTech & Agriculture E-Commerce
1. **Prompt**: *"Show ACI agriculture products"*
2. **Key Talking Points**:
   - Authentic products sourced from ACI Agribusiness (hybrid seeds, bio-fertilizers, smart sprayers).
   - Clean, modern e-commerce product cards showing prices in BDT, user ratings, in-stock badges, and delivery guarantees.

---

### Scene 10: Location-Aware Hotel Finder
1. **Prompt**: *"Find luxury hotels in Dhaka near Gulshan or airport road"*
2. **Key Talking Points**:
   - Curated accommodations with star ratings, per-night prices in BDT, amenity chips, and booking links.

---

### Scene 11: Mathematical Derivations & LaTeX Formulas
1. **Prompt**: *"Derive the Euler-Lagrange equation and solve the brachistochrone problem"*
2. **Key Talking Points**:
   - Streamdown KaTeX rendering multi-line mathematical proofs and differential equations with crystal-clear typography.

---

### Scene 12: Human-in-the-Loop (HITL) Safety Gatekeeper
1. **Prompt**: *"Request refund of $1,250 for order ORD-8921"*
2. **Key Talking Points**:
   - Safety policy halts execution before executing destructive or high-value mutations.
   - 60-second ticking countdown timer.
   - Side-by-side JSON mutation diff.
   - Live **Approve** and **Reject** buttons that resume agent state and trigger celebration confetti upon completion.

---

## 3. Architecture Deep-Dive for Technical Leaders

1. **Protocol Decoupling**:
   - SSE streaming for token-by-token low-latency rendering.
   - CopilotKit V2 runtime for declarative agent UI coordination.
2. **Zero Docker Rebuild Friction in Development**:
   - Run backing services in Docker (`docker compose -f docker-compose.deps.yml up -d`).
   - Run `uv run uvicorn` and `npm run dev` in your terminal for sub-second hot reload.
3. **Enterprise Production Ready**:
   - Full monorepo production stack via `docker-compose.prod.yml` with multi-stage standalone Next.js and Uvicorn workers behind an unbuffered Nginx reverse proxy.
