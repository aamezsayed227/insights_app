# Insight — Admin App

Base scaffold for the Insight modernization project (see `project_overview.md`). React 19 + Vite (rolldown) + TypeScript, with only the tooling needed to start development — feature code, RBAC, offline sync, and real-time layers are added incrementally as those pieces are specced.

## Stack

- **Build**: Vite (rolldown-vite) + `@vitejs/plugin-react`, React Compiler via `babel-plugin-react-compiler`
- **UI**: Tailwind CSS v4 + shadcn/ui (`components.json` configured, no components generated yet — run `npx shadcn@latest add <component>` as needed)
- **Routing**: `react-router` (declarative mode)
- **State**: Zustand (client UI state) + TanStack Query (server state)
- **Forms/validation**: React Hook Form + Zod
- **Testing**: Vitest + React Testing Library (unit), Playwright (E2E)
- **Linting/formatting**: Oxlint + Prettier (with `prettier-plugin-tailwindcss`)
- **Git hooks**: Husky + lint-staged

## Getting started

```bash
pnpm install
pnpm dev
```

## Scripts

| Script                              | Purpose                         |
| ----------------------------------- | ------------------------------- |
| `pnpm dev`                          | Start the Vite dev server       |
| `pnpm build`                        | Typecheck (`tsc -b`) then build |
| `pnpm preview`                      | Preview the production build    |
| `pnpm lint`                         | Oxlint                          |
| `pnpm typecheck`                    | `tsc -b --noEmit`               |
| `pnpm format` / `pnpm format:check` | Prettier write / check          |
| `pnpm test`                         | Run unit tests once (Vitest)    |
| `pnpm test:watch`                   | Vitest in watch mode            |
| `pnpm test:ui`                      | Vitest UI                       |
| `pnpm test:coverage`                | Unit tests with coverage (v8)   |
| `pnpm e2e`                          | Run Playwright E2E tests        |
| `pnpm e2e:ui`                       | Playwright UI mode              |

A pre-commit hook runs `lint-staged` (Oxlint + Prettier on staged files); a pre-push hook runs `typecheck`.

## Not yet wired

These are part of the final stack (`project_overview.md`) but have nothing to configure against yet — add them when the corresponding feature work starts:

- **Dexie.js** (offline IndexedDB) — needs the sync/conflict-resolution strategy defined first.
- **CASL** (RBAC) — blocked on the RBAC role matrix.
- **Socket.io-client** (real-time escalations) — add when the first real-time feature lands.
- **Recharts** — add with the first chart.
- **shadcn/ui components** — add per-component with `npx shadcn@latest add <name>` as screens are built.
- **CI (GitHub Actions)** — add once there's a deploy target to run against; local Husky hooks cover lint/format/typecheck for now.
