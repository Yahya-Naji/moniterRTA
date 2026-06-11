# RTA Dubai · Safety Sentinel

**AI for Safety Governance, Certification and Autonomous Mobility Regulation.**

A demo safety-governance / regulatory-intelligence / assurance-enablement platform for RTA Dubai’s
Guided Transport Systems (Metro, Tram, Automated People Movers) and Autonomous Mobility programmes.

## Pages

- **`/`** — Landing page: positioning, pillars, platform capabilities (Q-Conform, Q-Risk, Knowledge
  Intelligence, AI Document Intelligence, Executive Dashboards) and the safety standards covered.
- **`/console`** — Live console:
  - **Dashboard** — certification readiness by safety standard, readiness trend, evidence-coverage,
    safety findings by severity, readiness by transport system, autonomous-mobility operator readiness,
    international collaboration (UK ORR, STRMTG), attention-required and live monitoring feed.
  - **Evidence Intake** — submit certification evidence per requirement and re-index.
  - **Notifications** — bell with unread badge, dropdown history, and live toasts.

## Safety standards covered

EN 50126 (RAMS) · EN 50128 (Software) · EN 50129 (Safety Case) · ISO 26262 (AV Functional Safety) ·
ISO 21448 SOTIF · UL 4600 · ISO 21434 (Cyber) · ISO 45001 (Operational Safety).

## Run locally

```bash
npm install
npm run dev        # → http://localhost:3100
```

## Deploy on Vercel

This is a standard Next.js 15 app — Vercel auto-detects it.

1. Push to GitHub (this repo).
2. In Vercel: **New Project → Import** this repository → **Deploy** (no settings needed).
3. Build: `next build`, output handled automatically.

The data is fully self-contained (illustrative figures), and uploads are optimistic on the client,
so it works on Vercel’s serverless runtime without any backend.

## Stack

Next.js 15 · React 18 · TypeScript · Tailwind CSS v3 · lucide-react.
