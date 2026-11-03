# ⚛️ GenUI Studio - Next.js 16 Frontend & Generative UI Registry

High-performance, modern React frontend built with **Next.js 16 (App Router)**, **React 19**, **CopilotKit V2**, **Tailwind CSS v4**, **Framer Motion**, and **Vercel Streamdown**.

---

## 🌟 Key Features

1. **Dynamic Generative UI Registry**:
   - Bridges agent tool calls directly into rich, interactive React components mounted in-line with the conversational message stream.
2. **Interactive Visual Planning Canvas (Excalidraw MCP Integration)**:
   - Live architectural sprint board with automated fit-to-screen scale calculations, milestone stages, task creation, voting, and `.excalidraw` schema export.
3. **Monaco Code Studio & Sandboxed Artifact Runner**:
   - Multi-tab file viewer with syntax highlighting, token count, copy action, diff comparison, and an isolated sandbox `iframe` executing single-file HTML/CSS/JS artifacts in real time.
4. **OpenStreetMap & Google Maps Route Explorer**:
   - Real OSRM route geometry with Leaflet visual map, turn-by-turn guidance, multi-modal travel times (driving, transit, walking), elevated expressway tolls in BDT (৳), and one-click Google Maps fallback.
5. **Authentic Job Board with Bangladesh Conglomerate Branding**:
   - Openings across Beximco, Square, ACI, Bashundhara, Walton, PRAN-RFL, Akij, BRAC, Grameenphone, and global remote tech firms.
   - Dual platform filter (BDJobs & LinkedIn), authentic local logos, Google S2 128px favicons, and interview preparation tips.
6. **Multi-Currency Flight Search & Booking Matrix**:
   - Flight search supporting BDT (৳), INR (₹), and USD ($) pricing.
   - High-definition official logos for Biman Bangladesh, US-Bangla, NOVOAIR, Air Astra, Air India, SpiceJet, IndiGo, Emirates, Qatar, and Singapore Airlines.
7. **Doctor & Medical Specialist Finder**:
   - Verified specialists across Dhaka & Bangladesh with chamber affiliations, degrees, consultation fees in BDT, and appointment scheduling modal.
8. **Medicine & Generic Alternatives Engine**:
   - Pharmaceutical information, dosage forms, manufacturer branding (Square, Beximco, ACI, Incepta), and generic alternative suggestions (e.g. Napa -> Paracetamol, Xcel by ACI).
9. **ACI AgTech & Agriculture E-Commerce**:
   - Authentic products from ACI Agribusiness (seeds, bio-fertilizers, crop protection, smart sprayers) with price, ratings, stock status, delivery guarantees, and clean e-commerce cards.
10. **Hotel & Accommodations Explorer**:
    - Location-aware search across Dhaka, Cox's Bazar, Sylhet, and worldwide with star ratings, per-night rates in BDT, amenities, and booking actions.
11. **Math Reasoning & LaTeX Rendering**:
    - Streamdown KaTeX and MathGenUI plugin for rendering mathematical derivations, equations, calculus proofs, and formulas.
12. **Speech-to-Text (STT) Voice Input**:
    - Web Speech API integration with duplicate elimination, interim/final transcript separation, and microphone controls.
13. **Human-in-the-Loop (HITL) Gatekeeper**:
    - 60s countdown safety interceptor with Approve/Reject callbacks.
14. **Miro-Style Visual Sticky Board**:
    - Kanban swimlanes, drag-and-drop notes, live voting, and celebration confetti.

---

## 🛠️ Tech Stack & Dependencies

| Layer | Technologies |
| :--- | :--- |
| **Framework** | Next.js 16.4.4 (Turbopack, Partial Prerendering, Standalone Output) |
| **UI Library** | React 19.3.0 (Server Components & Actions) |
| **Styling** | Tailwind CSS v4 (native `@tailwindcss/turbopack`), Lucide React |
| **Generative UI** | `@copilotkit/react-core`, `@copilotkit/react-ui`, `@copilotkit/runtime` |
| **Markdown & Math** | `streamdown` v2.7, `@streamdown/math`, `katex` |
| **Code Editor** | Monaco Editor / Prism.js syntax highlighter |
| **Animation & Charts** | `framer-motion` v14, `recharts` v3, `canvas-confetti` |
| **Icons & Brand Assets** | Vector SVGs & 256px RGBA PNGs (`public/images/airlines/`, `public/images/companies/`) |

---

## 📂 Frontend Directory Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── copilotkit/       # CopilotKit Runtime protocol endpoint
│   │   │   └── route.ts          # Backend proxy handlers
│   │   ├── chat/
│   │   │   ├── ChatContainer.tsx # Core chat UI, voice STT, message list, presets
│   │   │   └── page.tsx          # Chat route entrypoint
│   │   ├── globals.css           # Tailwind CSS v4 directives & custom tokens
│   │   ├── layout.tsx            # Root layout with theme provider & CopilotKit wrapper
│   │   ├── login/                # Instant guest login page
│   │   └── page.tsx              # Landing redirect
│   ├── components/
│   │   ├── gen-ui/               # Interactive Generative UI Registry
│   │   │   ├── AciAgriProductsCard.tsx # ACI AgTech products & eCommerce
│   │   │   ├── CodeStudioCard.tsx      # Monaco editor & sandboxed HTML runner
│   │   │   ├── DoctorFinderCard.tsx    # Specialist doctors in Bangladesh
│   │   │   ├── FlightDetailsCard.tsx   # Multi-currency flight search & booking
│   │   │   ├── HitlDecisionCard.tsx    # Human-in-the-Loop confirmation gate
│   │   │   ├── HotelFinderCard.tsx     # Location-aware hotel recommendations
│   │   │   ├── JobBoardCard.tsx        # BD conglomerates & tech jobs
│   │   │   ├── MathVisualizerCard.tsx  # LaTeX math derivation & formulas
│   │   │   ├── MedicineDetailsCard.tsx # Medicine info & generic alternatives
│   │   │   ├── PlanningBoard.tsx       # Excalidraw MCP architecture canvas
│   │   │   ├── RouteExplorerCard.tsx   # OpenStreetMap & Google Maps navigation
│   │   │   ├── SalesDashboardCard.tsx  # Recharts financial analytics ledger
│   │   │   ├── TechSpecCard.tsx        # Hardware specification comparisons
│   │   │   ├── VisualStickyBoard.tsx   # Miro-style collaborative sticky notes
│   │   │   └── WeatherCard.tsx         # Atmospheric weather & micro-forecast
│   │   ├── ThemeToggle.tsx             # Light / Dark theme switch
│   │   └── UserAvatar.tsx              # User identity badge
├── public/
│   └── images/
│       ├── agri/                 # ACI AgTech product images
│       ├── airlines/             # High-res airline PNG logos
│       ├── companies/            # BD conglomerate & tech company PNG logos
│       └── medicines/            # Pharmaceutical packaging images
├── Dockerfile                    # Default frontend container
├── Dockerfile.dev                # Development container with hot-reload
├── Dockerfile.prod               # Multi-stage standalone production container
├── next.config.ts                # Next.js 16 configuration (standalone output)
├── package.json                  # Dependencies & scripts
└── tsconfig.json                 # TypeScript compiler configuration
```

---

## 🚀 Running the Frontend

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create `.env.local` or rely on root `.env`:
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=development-secret-key-32chars-minimum
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 TypeScript Verification
```bash
npx tsc --noEmit
```
Ensures 100% type safety across all React components, CopilotKit hooks, and Pydantic schema interfaces.
