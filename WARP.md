# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Development commands

### Local development
- Run the Next.js dev server with Turbopack:
  - `npm run dev`

The app uses the App Router and serves the root route at `app/page.tsx` on `http://localhost:3000/`.

### Build and production
- Create a production build (Turbopack):
  - `npm run build`
- Start the production server (after `npm run build`):
  - `npm run start`

### Linting
- Run ESLint with the Next.js + TypeScript flat config:
  - `npm run lint`

ESLint is configured in `eslint.config.mjs` using `next/core-web-vitals` and `next/typescript`, with common build artifacts ignored.

### Testing
- There is currently **no test runner or `test` script** defined in `package.json`. If you introduce tests (e.g., with Jest, Vitest, or Playwright), add the appropriate scripts here so future agents know how to run the full test suite and individual tests.

## High-level architecture

### Framework and tooling
- **Framework**: Next.js 15 (App Router) with React 19 and TypeScript.
- **Build/dev**: Next.js `dev`/`build` using **Turbopack** (see `package.json` scripts).
- **TypeScript config**: `tsconfig.json` is strict, uses `moduleResolution: "bundler"`, and defines a key path alias:
  - `@/*` → `./*` (root-relative imports from the project root).
- **Styling**:
  - Tailwind CSS v4 via PostCSS plugin in `postcss.config.mjs` (`@tailwindcss/postcss`).
  - Global styles are imported in `app/layout.tsx` via `./globals.css`.

### App Router structure
- Entry points live under the `app/` directory:
  - `app/layout.tsx`
    - Defines the **`RootLayout`** component used by all routes.
    - Applies the `Geist` and `Geist_Mono` fonts (via `next/font`) and sets CSS custom properties `--font-geist-sans` and `--font-geist-mono`.
    - Forces a dark theme by setting `<html lang="en" className="dark">` and applies typography classes on `<body>`.
    - Exposes `metadata` (title and description) for the app: currently branded as **"Signalist"**, a stock-tracking application.
  - `app/page.tsx`
    - Implements the root page (`/`).
    - Renders a simple layout that centers a `Button` from `@/components/ui/button`.

Agents making UI changes should treat `app/layout.tsx` as the place to modify global layout, fonts, and theme, and `app/page.tsx` as the current entry for the home experience.

### UI components
- Reusable UI components live under `components/`:
  - `components/ui/button.tsx`
    - A design-system-style `Button` built with:
      - `@radix-ui/react-slot` for the `asChild` pattern (allowing the button to render as another component while preserving props and behavior).
      - `class-variance-authority` (`cva`) to define `variant` and `size` options.
      - A `cn` utility imported from `@/lib/utils` for class name merging.
    - Exposes:
      - `Button` component supporting `variant`, `size`, and `asChild` props.
      - `buttonVariants` for composing button styles in other components.

If you add more UI primitives, follow the same pattern: colocate them under `components/ui/`, use `cva` for variants, and reuse `cn` for class merging.

### Configuration files
- `next.config.ts`
  - Currently contains the default exported `nextConfig` placeholder object. Extend this when you need custom Next.js configuration (e.g., images, redirects, experimental flags).
- `tsconfig.json`
  - Central place for TypeScript compiler behavior and the `@/*` path alias. Any new root-level folders (e.g., `lib/`, `hooks/`) can be referenced via this alias.
- `eslint.config.mjs`
  - Flat config bridging to the legacy `next` ESLint presets via `FlatCompat`.
  - Ignores typical build directories (`node_modules`, `.next`, `out`, `build`) and `next-env.d.ts`.
- `postcss.config.mjs`
  - Minimal config that wires in Tailwind CSS v4 via `@tailwindcss/postcss`.

These configs are the primary levers for changing project-wide behavior (framework, type checking, linting, and styling). When making architectural changes, adjust them here so the rest of the codebase and tooling stay in sync.