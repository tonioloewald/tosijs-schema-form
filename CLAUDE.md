# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**tosijs-schema-form** is a web component library that generates HTML forms from JSON Schema definitions. Built on the tosijs reactive component framework with zero runtime dependencies.

## Commands

```bash
bun install          # Install dependencies
bun test             # Run all tests
bun test --watch     # Run tests in watch mode
bun run build        # Build the library to dist/
bun run dev          # Start dev server (serve-static.ts)
bun run demo         # Build demo and start dev server
```

## Architecture

```
src/
├── schema-form.ts      # Public export - wraps blueprint with makeComponent()
├── blueprint.ts        # Core implementation (~1100 lines) - framework-agnostic
├── example-schemas.ts  # Sample schemas for demo (contact, blog, e-commerce, content builder)
├── main.ts             # Demo app entry point
└── schema-form.test.ts # Test suite (40+ tests using happy-dom)
```

**Key design pattern:** The blueprint function accepts a tosijs XinFactory at runtime and returns a component spec. This allows consumers to either:
1. Import the pre-built `schemaForm` component (bundles tosijs)
2. Import `schemaFormBlueprint` and use with their own tosijs instance

**Data flow:**
1. Set `form.schema` (JSON Schema) and optionally `form.data`
2. `renderField()` recursively builds form elements with `data-path` attributes
3. `form.getData()` collects inputs by path and reconstructs nested structure

## Bun Preferences

Use Bun instead of Node.js:
- `bun <file>` instead of `node <file>`
- `bun test` instead of jest/vitest
- `bun build` instead of webpack/esbuild
- `bun install` instead of npm/yarn/pnpm install
- Bun auto-loads .env (no dotenv needed)

For APIs, prefer Bun built-ins:
- `Bun.serve()` with routes (not express)
- `Bun.file()` (not node:fs readFile/writeFile)

## Testing

Tests use `bun:test` with `@happy-dom/global-registrator` for DOM simulation. Test file: `src/schema-form.test.ts`

```ts
import { test, expect, beforeAll, afterEach } from 'bun:test'
```

## JSON Schema Support

Supported: `string`, `number`, `integer`, `boolean`, `object`, `array`, `enum`, `const`, `anyOf`, `oneOf`

Validation constraints: `required`, `minLength`, `maxLength`, `minimum`, `maximum`, `pattern`

Numbers with both `minimum` and `maximum` render as range slider + number input.

## Theming

CSS custom properties with `--sf-*` prefix. Uses tosijs `varDefault()` for fallbacks.
