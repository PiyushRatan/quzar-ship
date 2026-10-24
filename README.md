# Quzar Ship

> **Autonomous AI-Powered MVP Architecture & Product Specification Engine**  
> Engineered by **Piyush Ratan** ([piyushratan.in](https://piyushratan.in) · [Quzar Studio](https://quzar-io.web.app))

[![Next.js](https://img.shields.io/badge/Next.js-16.4-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.3-black?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-black?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-black?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![Directives](https://img.shields.io/badge/Design_Directives-2.0_Strict-cyan?style=flat-square)](https://piyushratan.in)

---

## 1. Overview

**Quzar Ship** is a developer-centric specification platform. It transforms unstructured product ideas or competitor URLs into production-grade engineering artifacts in seconds:
- **Distributed System Topologies** with component-level responsibility mapping and ingress latency telemetry.
- **Syntactically Valid Database Schemas** (`schema.prisma`) tailored to PostgreSQL, MySQL, SQLite, MongoDB, or Firestore.
- **REST / RPC API Contracts** with HTTP methods, payload schemas, idempotency guards, and rate limiting.
- **UI/UX Blueprints** with atomic component trees, 5-tier surface hierarchy tokens, and WCAG 2.2 AAA accessibility guards.
- **Deterministic 14-Day Sprint Roadmaps** with daily execution milestones and velocity tracking.
- **Infrastructure Cost Matrices** projecting starter MVP to enterprise scale runways with edge prompt caching economics.

---

## 2. Aesthetic Directives (PiyushRatan Directives 2.0 Strict)

Quzar Ship adheres strictly to **PiyushRatan Directives 2.0**:
- **True-Black Canvas Void**: Pure `#000000` base powering off OLED pixels (0 cd/m²).
- **5-Tier Surface Hierarchy**:
  - `Surface 0`: `#000000` (Void)
  - `Surface 1`: `#09090b` (Canvas base & headers)
  - `Surface 2`: `#121214` (Bento cards, tables, code blocks)
  - `Surface 3`: `#18181b` (Elevated surfaces & interactive hovers)
  - `Surface 4`: `#27272a` (Active states & dividers)
- **1px Directional Key-Lighting**: Tactile top specular key-lighting (`border-t-white/16`, `border-x-white/10`, `border-b-white/4`).
- **Monospace Uppercase Kickers**: `font-mono text-xs uppercase tracking-widest text-cyan-400 font-semibold`.
- **Anti-Slop Hardening**:
  - Zero emojis (monochromatic Lucide SVG icons only).
  - Strict anti-pill architecture (`rounded-none` and `rounded-xs` everywhere; `rounded-full` exclusively reserved for 1:1 circular status dots).
  - Width-locked unbracketed uppercase buttons (`min-w-[...]`) guaranteeing CLS = 0.
  - Tabular numerals (`font-mono tabular-nums`) across all telemetry and metric viewports.

---

## 3. Modular Architecture & Subsystems

The codebase is built with strict modularization and single-responsibility boundaries:

```
src/
├── app/
│   ├── api/
│   │   ├── generate/route.ts        # POST: AI spec generation with Zod intake validation
│   │   ├── research/route.ts        # POST: Competitor crawling & tech signal intelligence
│   │   └── export/route.ts          # POST: Multi-format downloadable attachment streaming
│   ├── globals.css                  # Directives 2.0 design tokens & procedural grid
│   ├── layout.tsx                   # Root HTML shell with Geist fonts
│   └── page.tsx                     # Main interactive workbench shell
├── components/
│   ├── Header.tsx                   # Brand mark, live status dot, and creator anchors
│   ├── TelemetryBar.tsx             # Real-time jitter, compiler version, and model telemetry
│   ├── IntakeWizard.tsx             # System primitive intake form & 1-click presets
│   ├── CodeBlock.tsx                # Monospace syntax block with 1-click clipboard copy
│   ├── SpecViewer.tsx               # 6-viewport master inspector shell
│   └── spec-tabs/
│       ├── ArchitectureTab.tsx      # System topology, ingress cards, latency telemetry
│       ├── DatabaseTab.tsx          # schema.prisma syntax viewer with model counters
│       ├── ApiContractTab.tsx       # REST/RPC routes table with security guards
│       ├── UiBlueprintTab.tsx       # Atomic component tree, surface tokens, WCAG AAA
│       ├── RoadmapTab.tsx           # Interactive 14-day execution checklist
│       └── CostMatrixTab.tsx        # Multi-tier cost projection & caching economics
├── lib/
│   ├── export/
│   │   ├── types.ts                 # Export interfaces and payload schemas
│   │   ├── markdownFormatter.ts     # Generates ARCHITECTURE.md
│   │   ├── prismaExtractor.ts       # Extracts schema.prisma
│   │   ├── prdGenerator.ts          # Generates PRD.md
│   │   ├── jsonFormatter.ts         # Generates spec.json
│   │   ├── bundleFormatter.ts       # Packages all artifacts into master bundle
│   │   └── index.ts                 # Facade export router
│   ├── generator/
│   │   ├── types.ts                 # Zod schemas & TypeScript types for full spec
│   │   ├── prompt.ts                # Gemini 2.5 Flash / Pro prompt engineering
│   │   ├── mockSpec.ts              # Deterministic zero-friction offline fallback engine
│   │   ├── engine.ts                # Primary generator orchestrator
│   │   └── index.ts                 # Barrel exports
│   └── research/
│       ├── types.ts                 # CrawlResult & CompetitorIntelligence types
│       ├── ssrfGuard.ts             # 26-vector SSRF security filter (IPv4/IPv6/RFC1918)
│       ├── domParser.ts             # Cheerio DOM parser, tech stack signals, JSON-LD
│       ├── markdownChunker.ts       # Clean context budgeting (20k budget)
│       ├── webCrawler.ts            # Jina Reader & Cheerio multi-page crawler
│       └── index.ts                 # Unified crawler facade
└── data/
    └── presets.ts                   # 4 pre-compiled architecture presets (AI SaaS, B2B, etc.)
```

---

## 4. Getting Started

### Prerequisites
- Node.js `>= 18.18.0` (Node 26+ fully supported)
- npm `>= 10`

### Installation
```bash
git clone https://github.com/quzar-io/quzar-ship.git
cd quzar-ship
npm install
```

### Environment Variables (Optional)
Quzar Ship includes a high-fidelity local synthesis engine that operates **100% offline without any API keys**. To enable live cloud inference with Google Gemini:
```bash
cp .env.example .env.local
```
Add your Gemini API key:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build
```bash
npm run build
npm start
```

---

## 5. One-Click Artifact Exports

Quzar Ship supports instant multi-format downloads:
- **`ARCHITECTURE.md`**: Complete executive summary, component topologies, and API contracts.
- **`schema.prisma`**: Production-ready, validated Prisma database schema.
- **`PRD.md`**: Full product requirements document with UI wireframe blueprints and cost projections.
- **`spec.json`**: Machine-readable JSON dictionary for CI/CD or agent ingestion.

---

## 6. Credits & License

Architected and developed by **Piyush Ratan** for **Quzar Studio**.  
- Portfolio: [piyushratan.in](https://piyushratan.in)  
- Studio: [quzar-io.web.app](https://quzar-io.web.app)  
- GitHub: [@PiyushRatan](https://github.com/PiyushRatan)
