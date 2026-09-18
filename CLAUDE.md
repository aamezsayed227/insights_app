# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `pnpm dev` — start the Vite dev server
- `pnpm build` — type-check (`tsc -b`) then production build (`vite build`)
- `pnpm lint` — run Oxlint
- `pnpm preview` — preview the production build locally

This repo uses `pnpm` (see `pnpm-lock.yaml`). There is no test runner configured yet.

## Architecture

This is a fresh `create-vite` React + TypeScript scaffold — currently just the template starter, not yet built out into the actual Insights app.

- Entry point: `src/main.tsx` mounts `<App />` from `src/App.tsx` into `#root` (see `index.html`).
- `src/App.tsx` is still the unmodified Vite/React template content (counter button, Vite/React links) — treat it as a placeholder to be replaced, not an established pattern to follow.
- **React Compiler** is enabled via `babel-plugin-react-compiler`, wired into `vite.config.ts` through `@rolldown/plugin-babel` with the `reactCompilerPreset()`. This means manual memoization (`useMemo`/`useCallback`/`React.memo`) is generally unnecessary — the compiler auto-memoizes.
- Vite is on the `rolldown-vite` variant (note the `@rolldown/plugin-babel` dependency and `vite@^8`), not stock Vite.
- TypeScript project uses composite `tsconfig.json` referencing `tsconfig.app.json` (src, bundler resolution, `noEmit`, strict unused-locals/params) and `tsconfig.node.json` (build tooling config, e.g. `vite.config.ts`).
- Linting is via **Oxlint** (`.oxlintrc.json`), not ESLint. Type-aware lint rules are not yet enabled (see README for how to add `oxlint-tsgolint` if needed).
- Static assets referenced with root-absolute paths (e.g. `/icons.svg#documentation-icon`) live in `public/`; imported assets (e.g. `hero.png`) live in `src/assets/`.
