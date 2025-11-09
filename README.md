<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1abLkqZPgcgLI1qOIJZiidQsCr_lTGIEx

## Run Locally

Prerequisites:
- Node.js 18+

### 1) Install dependencies
`npm install`

### 2) Configure environment
- Frontend: set `GEMINI_API_KEY` and `VITE_API_KEY` in `.env.local`.
- Backend: copy `.env.example` to `.env` and set `DATABASE_URL` and `API_KEY`.

Example `.env`:
```
NODE_ENV=development
PORT=4000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/loanshark?schema=public
API_KEY=change-me
```

### 3) Generate Prisma client
`npm run prisma:generate`

### 4) Run backend and frontend
- Backend: `npm run server:dev`
- Frontend: `npm run dev`

During development, the frontend proxies `/graphql`, `/health`, and `/render-test` to the backend at `http://localhost:4000`.

### API and Docs
- GraphQL endpoint: `POST /graphql` (GraphiQL enabled in dev)
- Swagger UI: `GET /docs`
- Health: `GET /health`
- Metrics (Prometheus): `GET /metrics`

Authorization:
- The backend expects `x-api-key` header matching `API_KEY` from `.env`.
- The frontend attaches `VITE_API_KEY` to all GraphQL requests.

### Testing and Benchmarking
- Tests: `npm run test` (Vitest)
- Benchmark: `npm run bench` (autocannon on `/graphql`)

### Build and CI
- Backend build: `npm run server:build`
- CI: see `.github/workflows/ci.yml`

Notes:
- The backend uses SQLite by default (`DATABASE_URL=file:./dev.db`), so no Docker or external DB is required.
