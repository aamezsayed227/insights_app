# Insight Modernization — Project Context for Claude Code

## What this project is

Modernizing **Insight**, a UK pharmacy management platform, under a Statement of Work (SOW) between **Clarion Technology** and **Speeds Healthcare Ltd**. Insight serves care homes, mental health facilities, and specialist clinics. Timeline is tight — roughly 4 months.

## Domain context (non-negotiable for correctness)

- Core domain areas: pharmacy management, offline sync, RBAC, real-time escalation workflows, healthcare compliance/audit logging.
- Relevant Insight modules: **Escalations, Ward Actions, Clinical Interventions, Rapid Tranquilisation, HDAT**.
- Compliance surfaces: STOMP audits, HDAT, Rapid Tranquilisation protocols — these carry regulatory weight, not just business logic. Audit logging is a hard requirement, not a nice-to-have.
- Target infra: **Azure**.

## Stack decision (FINAL — do not re-litigate without new input)

- **Frontend**: React 19 + Vite, TypeScript (strict mode)
- **State**: Zustand (client UI state) + TanStack Query (server state/caching) + React Hook Form (form state)
- **UI**: shadcn/ui + Radix UI primitives + Tailwind CSS v4
- **Offline data**: Dexie.js (IndexedDB wrapper) with custom sync hooks — chosen over WatermelonDB as simpler for audit-data-capture use case
- **RBAC**: CASL (`@casl/ability` + `@casl/react`) — requires an RBAC matrix defined before real development starts (see Open Gaps)
- **Real-time**: Socket.io-client (escalation updates, priority queue pushes)
- **Charts**: Recharts
- **Testing**: Vitest (unit) + Playwright (E2E)
- **Validation**: Zod schemas, shared with backend

### Explicitly rejected

- **Angular 21+**: safer/more opinionated for compliance work and the tight timeline, but React+Vite won on team familiarity/flexibility. Trade-off accepted: loses Angular's built-in RBAC guards and enforced structure — CASL and explicit state-separation discipline have to compensate.
- **Next.js**: rejected outright. SSR overhead is irrelevant for what is effectively a SPA; API routes conflict with centralized audit logging; adds unnecessary Azure deployment complexity.

## Working principles behind the decisions

- SOW ambiguity in healthcare software (module boundaries, offline conflict resolution) is treated as real delivery risk to resolve _before_ coding, not during.
- In a compliance-sensitive, time-constrained project, convention beats flexibility — reducing decision overhead is treated as a feature.
- Package/dependency choices should be validated against current data (not just training-era assumptions) before being treated as settled.

## Current state

- SOW gap analysis complete: ~20 critical gaps/gray areas identified.
- Framework and package-level comparisons complete (state mgmt, offline sync, auth, real-time layers) — see stack decision above.

## Open gaps Claude Code should NOT silently assume answers to

1. **MVP scope** — undefined.
2. **Commercial terms** — unspecified in SOW.
3. **RBAC roles** — not yet enumerated; CASL implementation is blocked on this matrix existing.
4. **Offline sync conflict resolution** — strategy not yet defined (matters a lot given Dexie.js + healthcare data).
5. **Module boundaries** — ambiguous across Escalations / Ward Actions / Clinical Interventions / Rapid Tranquilisation / HDAT.

If Claude Code hits a decision point touching any of the five above, it should flag it rather than pick a default silently — these are exactly the kind of gaps that turn into compliance or rework problems in this domain.
