<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Docs first

Before writing or generating any code, always check the relevant doc file(s) in `/docs` first. Follow the conventions and guidance documented there.

- /docs/ui.md
- /docs/data-fetching.md

## Commands

- `npm run dev` — start the dev server (http://localhost:3000)
- `npm run build` — production build
- `npm run start` — serve the production build
- `npm run lint` — ESLint (flat config via `eslint-config-next`, `core-web-vitals` + TypeScript rules)

There is no test setup yet — no test runner is configured.

## Architecture

This is a Next.js App Router project (`src/app/`) using TypeScript, Tailwind CSS v4, and the React Compiler (enabled via `reactCompiler: true` in `next.config.ts`). It was scaffolded with `create-next-app` and has not yet been built out beyond the default template — there is no routing structure, data layer, or component library established yet.

- Path alias `@/*` maps to `src/*` (see `tsconfig.json`).
- Tailwind theme tokens (`--color-background`, `--color-foreground`, fonts) are defined in `src/app/globals.css` via `@theme inline`, with dark mode handled through `prefers-color-scheme`.
- Since this Next.js version deviates from training data, consult `node_modules/next/dist/docs/01-app/` (App Router) before introducing new conventions (routing, data fetching, layouts, etc.).
