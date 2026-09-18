---
name: project-conventions
description: Insight project stack decisions and gaps that must never be silently assumed. Auto-loaded context for all work in this repo.
user-invocable: false
---

# Insight Project Conventions

Insight is a UK pharmacy management platform being modernized under a tight
(~4 month) SOW between Clarion Technology and Speeds Healthcare Ltd. It serves
care homes, mental health facilities, and specialist clinics. Modules:
Escalations, Ward Actions, Clinical Interventions, Rapid Tranquilisation, HDAT.
These carry regulatory weight — audit logging is a hard requirement, not a
nice-to-have.

Full context lives in `project_overview.md` at the repo root — read it if you
need more detail than this summary.

## Stack decisions — FINAL, do not re-litigate without new input from the user

- Frontend: React 19 + Vite, TypeScript strict mode
- State: Zustand (client UI) + TanStack Query (server state) + React Hook Form (forms)
- UI: shadcn/ui + Radix UI primitives + Tailwind CSS v4
- Offline data: Dexie.js (IndexedDB) with custom sync hooks
- RBAC: CASL (`@casl/ability` + `@casl/react`)
- Real-time: Socket.io-client
- Charts: Recharts
- Testing: Vitest (unit) + Playwright (E2E)
- Validation: Zod schemas, shared with backend

Angular and Next.js were explicitly evaluated and rejected — don't suggest
either as an alternative.

## Do NOT silently assume answers to these open gaps

If work touches any of these, flag it to the user instead of picking a
default:

1. **MVP scope** — undefined.
2. **Commercial terms** — unspecified in SOW.
3. **RBAC roles** — not yet enumerated. CASL implementation is blocked on this
   matrix existing — don't invent roles/permissions to unblock yourself.
4. **Offline sync conflict resolution** — strategy not yet defined. Don't pick
   a conflict-resolution approach (last-write-wins, merge, etc.) unilaterally
   for Dexie.js sync code.
5. **Module boundaries** — ambiguous across Escalations / Ward Actions /
   Clinical Interventions / Rapid Tranquilisation / HDAT. Don't assume which
   module owns a piece of shared logic or data.

## Working principles

- SOW ambiguity is treated as real delivery risk to resolve before coding,
  not during — surface it rather than coding around it.
- Convention beats flexibility here; prefer the established stack/patterns
  over introducing new ones.
- Validate package/dependency choices against current data before treating
  them as settled, especially for fast-moving libraries (CASL, Dexie, React
  Router v8, TanStack Query) — use context7 for current docs rather than
  relying on training data.
