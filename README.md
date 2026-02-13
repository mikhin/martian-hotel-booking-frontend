# Martian Hotel Booking Frontend

A demo project companion to the Evil Martians article [Guide to OpenAPI-Driven React: Generate Your Frontend, Don't Write It](https://evilmartians.com/chronicles/guide-to-openapi-driven-react-generate-your-frontend-don-t-write-it).

[Live demo](https://martian-hotel-booking-frontend.vercel.app/)

## Tech stack

- **React 19**, **TypeScript**, **Vite**
- **[Hey API](https://heyapi.dev/)** — OpenAPI → SDK + Zod schemas
- **[Nanostores](https://github.com/nanostores/nanostores)** + **[@nanostores/query](https://github.com/nanostores/query)** — state management
- **[React Hook Form](https://react-hook-form.com/)** + **[Zod](https://zod.dev/)** — form validation
- **[MSW](https://mswjs.io/)** — API mocking in development
- **[Vitest](https://vitest.dev/)** + **[Testing Library](https://testing-library.com/)** — tests

## Getting started

```bash
pnpm install
cp .env.development.local.example .env.development.local
pnpm dev
```

By default the app runs with MSW mocks enabled (`VITE_API_MOCKS=true`). To connect to a real backend, update `VITE_BACKEND_URL` and set `VITE_API_MOCKS=false` in `.env.development.local`.

## Available scripts

| Script                | Description                             |
| --------------------- | --------------------------------------- |
| `pnpm dev`            | Start the Vite dev server               |
| `pnpm build`          | Type-check and build for production     |
| `pnpm preview`        | Serve the production build locally      |
| `pnpm test`           | Run tests with Vitest                   |
| `pnpm tsc`            | Run TypeScript type checking            |
| `pnpm lint:check`     | Lint with ESLint                        |
| `pnpm lint:fix`       | Lint and auto-fix with ESLint           |
| `pnpm prettier:check` | Check formatting with Prettier          |
| `pnpm prettier:write` | Format files with Prettier              |
| `pnpm openapi-ts`     | Regenerate API client from OpenAPI spec |

## API code generation

Running `pnpm openapi-ts` fetches the OpenAPI spec from `https://martian-hotel-booking-api.vercel.app/output.yml` and regenerates `src/api/` with:

- `sdk.gen.ts` — typed SDK functions for every endpoint
- `types.gen.ts` — TypeScript types derived from the spec
- `zod.gen.ts` — Zod schemas for runtime validation

The configuration lives in `openapi-ts.config.ts`.

## Project structure

```
src/
├── api/          # Generated API client, types, and Zod schemas
├── config/       # App-level configuration
├── lib/          # Shared utilities
├── mocks/        # MSW handlers for local development and tests
├── stores/       # Nanostores — data fetching and app state
├── App.tsx       # Root component
├── HotelForm.tsx # Hotel booking form
└── main.tsx      # Entry point
```
