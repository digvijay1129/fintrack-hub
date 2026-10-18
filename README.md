# FinTrack Hub

FinTrack Hub is a full-stack personal finance management and team expense-sharing SaaS built with React, Vite, Tailwind CSS, Node.js, Express, and MongoDB/Mongoose.

> **Status: Phase 1 foundation in progress.** This branch establishes the monorepo, frontend shell, API conventions, database connection configuration, CI checks, and starter tests. Authentication and finance features are not yet implemented.

## Architecture

- **Frontend:** React + Vite, React Router, Axios, Tailwind CSS, Recharts, React Icons.
- **Backend:** Node.js, Express REST API, Zod environment validation, Helmet, CORS, request logging, and API rate limiting.
- **Database:** MongoDB through Mongoose.
- **Workspace layout:** `client/`, `server/`, and `docs/`.

Read [the architecture notes](docs/architecture.md), [local development guide](docs/development.md), and [REST API conventions](docs/api.md).

## Prerequisites

- Node.js 22 LTS recommended (Node 20.19+ supported)
- npm 10+
- MongoDB Community Server locally or a MongoDB Atlas database

## Get started

macOS/Linux:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
npm install
npm run dev
```

PowerShell:

```powershell
Copy-Item server/.env.example server/.env
Copy-Item client/.env.example client/.env
npm install
npm run dev
```

Review `server/.env` and replace the development JWT secret with a unique random value. Configure `MONGODB_URI` for your database. The web app runs at `http://localhost:5173` and the API listens on `http://localhost:5000` by default.

## Health endpoints

| Method | Endpoint | Meaning |
| --- | --- | --- |
| GET | `/` | API identity |
| GET | `/api/health` | API liveness and database connection state |
| GET | `/api/health/ready` | Readiness; responds with HTTP 503 if MongoDB is not connected |

The development API can remain live while the database is disconnected, but database-backed features are not ready until the connection is established.

## Quality checks

```bash
npm test
npm run lint
npm run build
```

A GitHub Actions workflow runs lint, tests, and the frontend production build for repository changes.

## Security commitments

- Never commit `.env` files, tokens, credentials, or private financial data.
- New account registration must assign the application-wide `User` role on the server. Users must never self-assign `Admin`.
- The application has exactly two global roles: `User` and `Admin`. Team ownership/membership will be handled as team-level permissions, not extra global roles.
- Authorization belongs in the API, not only in frontend route visibility.
- Private financial records and receipt documents must be scoped to an authenticated owner or explicitly authorized team member.
- Admin access to private financial data must be narrowly authorized and auditable.

## Roadmap

Development will proceed phase by phase, in dependency order. Financial values will be based on authorized persisted records—not hardcoded dashboard demo numbers—and a feature will only be described as complete after implementation and tests provide evidence.

## License

No license has been selected yet. Until one is added, all rights remain with the repository owner.
