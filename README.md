## Ramdeo Angh Monorepo (client + server)

Production-grade full-stack monorepo using PNPM workspaces with two top-level apps: `client` (React + Vite) and `server` (Express + TypeScript). Shared packages live in `packages/`.

Docker is intentionally omitted for now per requirements.

### Prerequisites
- Node.js 18+
- PNPM 9+
- MySQL 8+ (for API features beyond the JSON Formatter page)

### Getting Started
1. Install deps
```bash
pnpm i
```

2. Create env files
- Copy `server/.env.example` to `server/.env` and set values
- Copy `client/.env.example` to `client/.env`

3. Prisma (optional for first run)
```bash
cd server
pnpm prisma:generate
pnpm prisma:migrate
pnpm seed
```

4. Run both apps
```bash
pnpm dev
```
- Client: http://localhost:5173
- API:    http://localhost:4000

The Home JSON Formatter works fully client-side even without the API running.

### Scripts
- `pnpm dev` – run client and server concurrently
- `pnpm build` – build all packages
- `pnpm lint` – run ESLint
- `pnpm typecheck` – TypeScript checks
- `pnpm test` – run tests

### Structure
```
client/           # React + Vite app
server/           # Express + TS app (Clean Architecture)
packages/
  config/         # shared tsconfig, eslint, prettier
  types/          # shared DTOs and Zod schemas
  ui/             # shared UI components
```

### First Admin Login
Seed creates an admin user: `admin@example.com` / `Admin@12345` (guarded to not run in production).

### OpenAPI Docs
Served at `/api/docs` when the server is running.

### Notes
- JWT stored in HTTP-only cookies. SameSite `lax` in dev, `strict` and `secure` in production.
- Input validation via Zod on all endpoints.
- Logs are structured (pino). Health check at `/health`.


