# TaskGlass

TaskGlass is a personal productivity app designed to manage multiple work contexts with customizable workspaces and kanban-style boards.

Current status: backend foundation is implemented (NestJS + Supabase Postgres), with Workspace CRUD, standardized API responses, Swagger docs, and traceable structured logging.

## Features (current)
- REST API (NestJS)
- Supabase Postgres connection (pooler/session)
- **Workspaces Module**:
  - `GET /v1/workspaces`
  - `POST /v1/workspaces`
  - `GET /v1/workspaces/:id`
  - `PATCH /v1/workspaces/:id`
  - `DELETE /v1/workspaces/:id` (soft delete)
- **Columns Module**:
  - `GET /v1/workspaces/:workspaceId/columns`
- **Daily Runs Module**:
  - `GET /v1/workspaces/:workspaceId/daily-runs`
  - `GET /v1/workspaces/:workspaceId/daily-runs/:runDate`
  - `PUT /v1/workspaces/:workspaceId/daily-runs/:runDate`
  - `DELETE /v1/workspaces/:workspaceId/daily-runs/:runDate`
- **Tasks Module**:
  - `GET /v1/workspaces/:workspaceId/tasks` (List/Search)
  - `POST /v1/workspaces/:workspaceId/tasks`
  - `GET /v1/tasks/:id`
  - `PATCH /v1/tasks/:id`
  - `PATCH /v1/tasks/:id/status`
  - `DELETE /v1/tasks/:id`
- **Tags Module**:
  - `GET /v1/workspaces/:workspaceId/tags`
  - `POST /v1/workspaces/:workspaceId/tags`
  - `GET /v1/tags/:id`
  - `PATCH /v1/tags/:id`
  - `DELETE /v1/tags/:id`
- **Recurrence Module**:
  - `GET /v1/workspaces/:workspaceId/recurrence-templates`
  - `POST /v1/workspaces/:workspaceId/recurrence-templates`
  - `GET /v1/recurrence-templates/:id`
  - `PATCH /v1/recurrence-templates/:id`
  - `PATCH /v1/recurrence-templates/:id/active`
- **Saved Views Module**:
  - `GET /v1/workspaces/:workspaceId/saved-views`
  - `POST /v1/workspaces/:workspaceId/saved-views`
  - `GET /v1/saved-views/:id`
  - `PATCH /v1/saved-views/:id`
  - `DELETE /v1/saved-views/:id`
- Standard response envelope:
  ```json
  {
    "code": "TG_WS_200",
    "message": "Success",
    "traceId": "abc123...",
    "data": {},
    "metadata": { "page": 0, "size": 0, "elements": 0 }
  }
  ```
- Swagger documentation
- Structured logs with `traceId` (request start/end + exception logs)

## Tech stack
- API: NestJS (TypeScript)
- Database: Supabase Postgres
- DB Access: Prisma (adapter-pg + pg Pool)
- Docs: Swagger (OpenAPI)

## Project structure (high-level)
- `apps/api` - NestJS backend
- `apps/web` - frontend (planned/next)
- `supabase/` - SQL/migrations/seeds (if used in this repo)

## Requirements
- Node.js 18+ (recommended)
- A Supabase project (Postgres)

## Setup (API)
From the repo root:

```bash
cd apps/api
npm install
```

Create `apps/api/.env`:

```env
PORT=3000
CORS_ORIGIN=http://localhost:5173

# Supabase Postgres (use Pooler -> Session mode)
DATABASE_URL="postgresql://USER:PASSWORD@aws-0-<region>.pooler.supabase.com:5432/postgres?sslmode=require"

# Optional (future use)
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_ANON_KEY=<anon-key>
```

Run the API:

```bash
npm run start:dev
```

## API Docs
- Swagger UI: http://localhost:3000/swagger
- API base: http://localhost:3000/v1

## Notes
- Logs are printed as JSON and include `traceId`. Use the `traceId` from the response to locate the request flow in the console.
- Workspace deletion is implemented as soft delete.

## Roadmap (next)
- Frontend UI (Liquid Glass inspired)
- Auth (optional, if needed later)
