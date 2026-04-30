# ✈️ RunwayBriefing — Flight Information Display System

> Real-time FIDS (Flight Information Display System) built with Next.js 16, React 19, Zustand & Tailwind CSS 4.

![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript)
![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss)

---

## Features

- **Live Flight Board** — Real-time flight status updates via Server-Sent Events (SSE)
- **Admin Panel** — Full CRUD operations for flight management
- **Smart Status Engine** — Automatic status computation based on current time vs departure
- **Filters & Search** — Filter by terminal, airline, status; full-text search endpoint
- **Bulk Operations** — Mass status updates for multiple flights
- **Type-safe API** — Zod validation on all mutation endpoints with structured error responses
- **Zero polling** — SSE push architecture eliminates inefficient polling

---

## Tech Stack

| Layer      | Technology                             |
| ---------- | -------------------------------------- |
| Framework  | Next.js 16 (App Router)                |
| UI         | React 19, Tailwind CSS 4, CVA          |
| State      | Zustand 5                              |
| Validation | Zod 4                                  |
| Language   | TypeScript 5.9 (strict mode)           |
| Quality    | ESLint 9, Prettier, Husky, lint-staged |

---

## Quick Start

```bash
# Clone and install
git clone <repo-url>
cd ed-starter
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the flight board, or [http://localhost:3000/admin](http://localhost:3000/admin) for the admin panel.

---

## Scripts

| Command                | Description                                |
| ---------------------- | ------------------------------------------ |
| `npm run dev`          | Start development server (with hot reload) |
| `npm run build`        | Production build                           |
| `npm run start`        | Start production server                    |
| `npm run lint`         | Run ESLint                                 |
| `npm run lint:fix`     | Run ESLint with auto-fix                   |
| `npm run typecheck`    | TypeScript type checking (no emit)         |
| `npm run format`       | Format all files with Prettier             |
| `npm run format:check` | Check formatting without writing           |
| `npm run validate`     | Full CI check: typecheck → lint → build    |

---

## Project Structure

```
├── app/                    # Next.js App Router
│   ├── api/flights/        # REST API endpoints
│   │   ├── route.ts        # GET/POST/PATCH/DELETE /api/flights
│   │   ├── [id]/           # Single flight by ID
│   │   ├── search/         # Full-text search + filters
│   │   ├── stats/          # Aggregated statistics
│   │   ├── stream/         # SSE live feed
│   │   ├── delay/          # Delay management
│   │   ├── bulk-status/    # Bulk status updates
│   │   └── reset/          # Reset to seed data
│   ├── admin/              # Admin panel page
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home (Flight Board)
│   ├── loading.tsx         # Loading skeleton
│   ├── not-found.tsx       # 404 page
│   └── global-error.tsx    # Error boundary (root)
├── components/
│   ├── fids/               # Flight board components
│   ├── admin/              # Admin panel components
│   └── ErrorBoundary.tsx   # Client error boundary
├── hooks/                  # Custom React hooks
├── lib/                    # Business logic & utilities
│   ├── flights.ts          # Flight data operations
│   ├── validations.ts      # Zod schemas
│   ├── apiResponse.ts      # Standardized API responses
│   └── utils.ts            # cn() helper
├── store/                  # Zustand state management
├── types/                  # Shared TypeScript types
└── data/                   # JSON data (runtime-mutable)
```

---

## API Reference

### Flights CRUD

| Method   | Endpoint           | Description                          |
| -------- | ------------------ | ------------------------------------ |
| `GET`    | `/api/flights`     | List all flights (computed statuses) |
| `POST`   | `/api/flights`     | Create new flight                    |
| `PATCH`  | `/api/flights`     | Update flight by ID in body          |
| `DELETE` | `/api/flights`     | Delete flight by ID in body          |
| `GET`    | `/api/flights/:id` | Get single flight                    |
| `DELETE` | `/api/flights/:id` | Delete flight by ID param            |

### Specialized Endpoints

| Method  | Endpoint                                            | Description                 |
| ------- | --------------------------------------------------- | --------------------------- |
| `GET`   | `/api/flights/search?q=&terminal=&status=&airline=` | Search & filter flights     |
| `GET`   | `/api/flights/stats`                                | Aggregated statistics       |
| `PATCH` | `/api/flights/bulk-status`                          | Bulk status update          |
| `POST`  | `/api/flights/delay`                                | Set/clear delay             |
| `POST`  | `/api/flights/reset`                                | Reset to seed data          |
| `GET`   | `/api/flights/stream`                               | SSE live feed (5s interval) |

### Error Response Format

All validation errors return a consistent structure:

```json
{
  "error": "Validation failed",
  "details": {
    "flightNumber": ["Invalid flight number format"],
    "departureTime": ["Must be HH:MM format"]
  }
}
```

---

## Architecture Decisions

| Decision                 | Rationale                                                            |
| ------------------------ | -------------------------------------------------------------------- |
| **JSON file storage**    | Zero-config, no DB setup required; ideal for workshops               |
| **SSE over WebSocket**   | Simpler protocol, HTTP/2 compatible, unidirectional is sufficient    |
| **Zustand over Context** | Better performance, no provider nesting, built-in selectors          |
| **Zod validation**       | Runtime type safety at API boundaries, auto-generates error messages |
| **App Router only**      | Future-proof, leverages React Server Components                      |

---

## Pre-commit Hooks

This project uses **Husky** + **lint-staged** to enforce quality on every commit:

- TypeScript/TSX files: ESLint fix + Prettier format
- JSON/MD/CSS files: Prettier format

To skip hooks in emergency: `git commit --no-verify` (not recommended).

---

## License

Private project — not for redistribution.
