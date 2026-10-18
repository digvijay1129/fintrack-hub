# FinTrack Hub — Phase 1 Foundation

This branch adds the verified starting point for the FinTrack Hub monorepo. The project is a work in progress; do not treat the roadmap page as proof that future finance features are implemented.

## Architecture

```text
React 19 + Vite + React Router + Tailwind
            | Axios requests to /api
            v
       Vite dev proxy (:5173)
            |
            v
Express REST API (:5000)
 Helmet | CORS | request logging | rate limiting
            |
       health/readiness routes
            |
            v
       MongoDB Atlas/Local via Mongoose
```

- `client/`: React application, route shell, API client, and responsive styles.
- `server/`: Express application, validated environment configuration, MongoDB connection, middleware, and REST routes.
- `docs/`: architecture, API conventions, and local development guide.
- `.github/workflows/ci.yml`: lint, test, and production-build checks.

## Prerequisites

- Node.js 22 LTS recommended (Node.js 20.19+ supported by this toolchain)
- npm 10+
- Git
- MongoDB Community Server or a MongoDB Atlas database

Verify your versions:

```bash
node --version
npm --version
git --version
```

## Local setup

Clone the repository and enter the root directory:

```bash
git clone https://github.com/digvijay1129/fintrack-hub.git
cd fintrack-hub
```

Create local environment files (PowerShell shown afterwards):

macOS/Linux:
```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

Windows PowerShell:
```powershell
Copy-Item server/.env.example server/.env
Copy-Item client/.env.example client/.env
```

Edit `server/.env`:
- Set `MONGODB_URI` to your local database or Atlas connection string.
- Replace `JWT_ACCESS_SECRET` with a unique, random value of at least 32 characters. This is a development placeholder today; production must never use the default.
- Keep credentials in local `.env` files. Never commit them.

Install workspaces and start the frontend and API from the repository root:

```bash
npm install
npm run dev
```

Open:
- Frontend: http://localhost:5173
- API identity: http://localhost:5000/
- Liveness: http://localhost:5000/api/health
- Readiness: http://localhost:5000/api/health/ready

Liveness can respond while MongoDB is disconnected in development. Readiness returns HTTP 503 until the database is connected.

## Quality checks

Run from the repository root:

```bash
npm test
npm run lint
npm run build
```

The repository CI workflow runs these checks for pushes and pull requests. Run them locally before considering a change complete.

## Current scope

Implemented in this foundation: workspace separation, responsive React shell, React Router, Axios API base client, Express middleware baseline, environment validation, MongoDB connection handling, health/readiness endpoints, consistent API error shape, setup/architecture documentation, and CI checks.

Not implemented yet: registration/login, authorization middleware, personal transactions, budgets, financial dashboards backed by user records, team sharing, settlements, uploads/OCR, notifications, exports, and deployment. Those are subsequent roadmap phases.

## Financial and privacy constraints

- There are exactly two application-wide roles planned: `User` and `Admin`.
- Registration will assign `User` on the server; a client-submitted role must never grant admin privileges.
- Team owner/member permissions are team-level and do not create more global roles.
- Private financial queries must always scope to an authenticated owner or authorized team membership.
- Administrative access to private financial data must be narrow, justified, and audited.
- Financial metrics must be derived from persisted, authorized records—not fake dashboard balances.
- Never add secrets, tokens, personal financial records, or local `.env` files to version control.

## Documentation

- [Architecture](docs/architecture.md)
- [Local development guide](docs/development.md)
- [API conventions](docs/api.md)

There is no license selected yet. Until a license is added, all rights remain with the repository owner.
