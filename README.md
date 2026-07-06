# Nexus OS — "Your Business. Simulated Before Reality."

An AI-powered business digital twin: a live 3D graph of your business departments, a
real system-dynamics simulation engine, and 10 autonomous AI agents that analyze,
diagnose, and recommend — all running instantly in the browser.

---

## What's actually functional here

Everything below **runs for real** — no fake buttons, no mocked data:

- **Simulation engine** (`src/lib/simulation/engine.ts`) — a deterministic system-dynamics
  model where price, marketing, headcount, inventory, delivery speed, etc. all affect
  each other (price ↑ → demand ↓ → margin ↑ but satisfaction ↓ → future demand ↓).
- **10 AI agents**, each its own file in `src/lib/agents/`, each analyzing the live
  simulation output and returning real findings + recommendations + a confidence score.
- **AI Command Center** — type "increase price by 10%" and it's parsed, applied to the
  simulation, and diffed against the previous state in `src/lib/agents/command-parser.ts`.
- **3D Digital Twin** — a real React Three Fiber scene where node size/color update from
  live department scores.
- **Auth** — Guest and Demo login work instantly (NextAuth Credentials provider). Google
  OAuth is fully wired but needs your own client ID/secret to activate.
- **Reports** — "Download / Print Report" uses the browser's real print-to-PDF, styled
  with dedicated print CSS — genuinely produces a clean PDF, no library needed.

### What's intentionally scoped out (and why)

The original spec asked for a separate Python FastAPI/pandas/scikit-learn ML service and
a fully wired Prisma/SQLite persistence layer. Both are real, multi-day additions on their
own. Instead:

- The Prisma schema (`prisma/schema.prisma`) is ready to go — run `npm run prisma:push`
  and wire it into the store once you want scenarios to persist server-side.
- The simulation/agent logic lives entirely in TypeScript so the app works standalone.
  If you want a Python ML microservice later, the natural seam is replacing
  `SimulationEngine.run()`'s internals with a call to a FastAPI endpoint — the rest of
  the app (UI, store, API routes) doesn't need to change.

---

## Folder Structure

```
nexus-os/
├── prisma/
│   └── schema.prisma              # User / Scenario / AgentRun models (optional persistence)
├── src/
│   ├── app/
│   │   ├── layout.tsx             # Root layout
│   │   ├── globals.css            # Design system: colors, glassmorphism, print styles
│   │   ├── page.tsx               # Landing page
│   │   ├── login/page.tsx         # Auth: Google / Demo / Guest
│   │   ├── middleware.ts          # Protects dashboard routes
│   │   ├── (dashboard)/           # Route group — all authenticated pages
│   │   │   ├── layout.tsx         # Sidebar + Navbar shell
│   │   │   ├── overview/          # Home: health score, live twin, key metrics
│   │   │   ├── simulation/        # Sliders + AI Command Center + live deltas
│   │   │   ├── departments/       # 3D twin + department score cards
│   │   │   ├── agents/            # All 10 agent cards, run individually or all at once
│   │   │   ├── analytics/         # Forecast chart, radar, heatmap
│   │   │   ├── customers/         # Satisfaction/churn deep dive
│   │   │   ├── inventory/         # Stock coverage deep dive
│   │   │   ├── finance/           # P&L breakdown
│   │   │   ├── operations/        # Workforce/delivery capacity
│   │   │   ├── reports/           # Executive summary + scenario comparison + PDF export
│   │   │   └── settings/          # Business profile, notifications, data reset
│   │   └── api/
│   │       ├── simulate/route.ts       # POST: run the simulation engine
│   │       ├── agents/run/route.ts     # POST: run one or all agents
│   │       ├── chat/route.ts           # POST: parse a natural-language command
│   │       └── auth/[...nextauth]/     # NextAuth handler
│   │
│   ├── components/
│   │   ├── ui/                    # Button, Card, Badge, Slider, Input, Tabs, Progress, Skeleton
│   │   ├── landing/                # Hero, Features, LiveDemo, Architecture, Testimonials, Pricing, Footer
│   │   ├── dashboard/              # Sidebar, Navbar, MetricCard, HealthGauge, AnimatedCounter, BackgroundFX, LeverSlider
│   │   ├── twin/digital-twin-3d.tsx# The React Three Fiber 3D graph
│   │   ├── charts/                 # MetricRadar, ForecastChart, ScenarioBarChart, Heatmap
│   │   └── agents/agent-card.tsx   # Individual agent UI card
│   │
│   ├── lib/
│   │   ├── simulation/
│   │   │   ├── engine.ts           # THE core business math model
│   │   │   ├── types.ts            # BusinessInputs / BusinessOutputs / SimulationResult
│   │   │   └── constants.ts        # Baseline values + slider bounds + market constants
│   │   ├── agents/                 # ⭐ EACH AGENT IN ITS OWN FILE
│   │   │   ├── base-agent.ts       # Abstract base class every agent extends
│   │   │   ├── ceo-agent.ts        # Synthesizes all other agents into an executive brief
│   │   │   ├── finance-agent.ts
│   │   │   ├── inventory-agent.ts
│   │   │   ├── customer-agent.ts
│   │   │   ├── sales-agent.ts
│   │   │   ├── operations-agent.ts
│   │   │   ├── analytics-agent.ts
│   │   │   ├── risk-agent.ts
│   │   │   ├── root-cause-agent.ts
│   │   │   ├── strategy-agent.ts   # Tests candidate moves, recommends the best one
│   │   │   ├── orchestrator.ts     # Fans out to all agents, fans in to the CEO agent
│   │   │   └── command-parser.ts   # NL → simulation input patch
│   │   ├── store/business-store.ts # Zustand: single source of truth for inputs/results/chat/scenarios
│   │   └── auth.ts                 # NextAuth config (Google + Guest + Demo)
│   │
│   └── types/                      # Shared ambient types (if you add more)
│
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.mjs
├── .env.example
└── README.md (this file)
```

---

## Setup — run these commands in Cursor's terminal

```bash
# 1. Unzip the project, then open the folder in Cursor
cd nexus-os

# 2. Install dependencies
npm install
# If you hit peer-dependency conflicts (common with React 19 + bleeding-edge libs):
npm install --legacy-peer-deps

# 3. Set up environment variables
cp .env.example .env.local
# Open .env.local and set AUTH_SECRET to any random string, e.g.:
#   AUTH_SECRET=$(openssl rand -base64 32)
# Guest/Demo login work with just AUTH_SECRET set. Google login and the database
# are optional — see comments in .env.example.

# 4. (Optional) Set up the database if you want scenario persistence
npm run prisma:generate
npm run prisma:push

# 5. Run the dev server
npm run dev
```

Then open **http://localhost:3000**.

- Landing page: `/`
- Login: `/login` → click **Try Demo Mode** or **Continue as Guest** (both work instantly)
- Dashboard home: `/overview`

### Build for production

```bash
npm run build
npm run start
```

---

## Where to plug in a real LLM (optional upgrade)

Two integration points are already isolated for this:

1. `src/lib/agents/command-parser.ts` — currently rule-based NLU for the AI Command
   Center. Swap `parseCommand()` for a call to OpenAI/Anthropic that returns the same
   `ParsedCommand` shape, and everything downstream (simulate → diff → chat UI) keeps
   working unchanged.
2. Each agent's `analyze()` method in `src/lib/agents/*.ts` — currently deterministic
   rules over the simulation output (fast, explainable, free). You can have an LLM
   generate the `summary` and `recommendations` strings from the same findings data
   for more natural-language variety, while keeping the underlying numbers trustworthy.

---

## Tech Stack

Next.js 15 · React 19 · TypeScript · Tailwind CSS · Framer Motion · React Three Fiber /
Three.js · Recharts · Zustand · TanStack Query · NextAuth v5 · Prisma + SQLite · Zod ·
Lucide Icons
