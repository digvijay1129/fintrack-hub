# FinTrack Hub architecture

## Phase 1 system shape

```text
Browser
  |
  | React + Vite (client :5173)
  | Axios requests under /api
  v
Vite development proxy
  |
  v
Express REST API (server :5000)
  |-- Helmet, CORS, JSON limits, request logging, rate limiting
  |-- Health / readiness routes
  |-- Central 404 and error responses
  v
MongoDB via Mongoose
```

The Vite proxy forwards local `/api` requests to Express. This avoids hardcoding the local API origin into browser code. Production deployment will configure the frontend API base URL and the API's allowed frontend origin explicitly.

## Workspace boundaries

- `client/`: browser-only React application, navigation, view components, API client, and design styles. No server credentials belong here.
- `server/`: HTTP API, environment validation, persistence connection, request middleware, and future domain modules.
- `docs/`: setup and architecture notes.

Planned server domain structure as modules are implemented:

```text
server/src/
  config/        environment and external service setup
  middleware/    authentication, authorization, validation, error handling
  models/        Mongoose schemas and indexes
  routes/        REST route registration
  controllers/   request/response orchestration
  services/      business rules and financial calculations
  validators/    request schemas
  utils/         shared server helpers
```

Planned client structure:

```text
client/src/
  api/           Axios instance and API modules
  components/    reusable accessible UI
  features/      domain-focused UI and state
  layouts/       authenticated/admin shells when introduced
  pages/         route-level views
  hooks/         reusable React hooks
  context/       application providers
  styles/        design system
```

## Security principles

1. The API is the authorization boundary; hiding a link is not access control.
2. Registration must assign application role `User` on the server. Users cannot submit an Admin role.
3. Only two application-wide roles are allowed: `User` and `Admin`. Team ownership and membership are separate team-level permissions.
4. Private financial data must be scoped to the authenticated owner or an explicitly authorized team membership.
5. Keep secrets in server environment variables and never use a `VITE_*` variable for secrets.
6. Production startup must fail if the access-token secret is not explicitly configured.
7. Monetary values will be validated and calculated in domain services using a consistent precision policy; display formatting must not silently convert currencies.

## Current implementation boundary

Phase 1 contains a React shell, a reusable Axios client, Express middleware, MongoDB connection setup, and liveness/readiness endpoints. The finance navigation is roadmap scaffolding only. Authentication and finance workflows are not claimed as complete yet.
