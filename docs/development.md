# Local development

## Prerequisites

- Node.js 22 LTS recommended (Node.js 20.19+ supported by the selected Vite toolchain)
- npm 10+
- MongoDB Community Server running locally, or a MongoDB Atlas database and connection string
- Git

Check versions:

```bash
node --version
npm --version
```

## Environment setup

1. Copy `server/.env.example` to `server/.env`.
2. Change `MONGODB_URI` to the local or Atlas connection string you control.
3. Generate a unique development secret of at least 32 characters for `JWT_ACCESS_SECRET`.
4. Copy `client/.env.example` to `client/.env` if you want to override the default `/api` base path.
5. Never commit either `.env` file.

Example on macOS/Linux:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

PowerShell:

```powershell
Copy-Item server/.env.example server/.env
Copy-Item client/.env.example client/.env
```

## Install and run

Install all workspace dependencies from the repository root:

```bash
npm install
npm run dev
```

By default, the web app runs at `http://localhost:5173` and the API listens at `http://localhost:5000`.

Useful endpoints:

- `GET /` — API identity and endpoint hints
- `GET /api/health` — API liveness plus current database connection state
- `GET /api/health/ready` — readiness check; returns HTTP 503 until MongoDB is connected

The API process can report liveness while MongoDB is unavailable in development, but database-dependent capabilities will not be ready. Production configuration exits if the database connection cannot be established.

## Quality checks

```bash
npm test
npm run lint
npm run build
```

## Troubleshooting

- **Port 5000 or 5173 is in use:** stop the other process or change server `PORT`; Vite's development port is intentionally strict.
- **Health shows database disconnected:** start MongoDB or confirm `MONGODB_URI`, credentials, and Atlas network access.
- **Browser says API unreachable:** start both workspaces with root `npm run dev`; inspect the API terminal for errors.
- **CORS error:** the browser origin must match server `CLIENT_ORIGIN`. In local development use `http://localhost:5173`.
- **Environment validation fails:** compare local values with `server/.env.example`; production requires a custom JWT access secret.
