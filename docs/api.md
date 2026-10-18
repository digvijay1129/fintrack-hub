# REST API conventions

## Base path

Application API routes are mounted under `/api`. The development frontend calls relative `/api` URLs through the Vite proxy.

## Response envelope

Successful endpoints use:

```json
{
  "success": true,
  "data": {}
}
```

Errors use:

```json
{
  "success": false,
  "error": {
    "code": "ROUTE_NOT_FOUND",
    "message": "Readable error message"
  }
}
```

Never return stack traces, database credentials, token values, or secret configuration in API responses.

## Current endpoints

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/` | API identity and health endpoint pointers |
| GET | `/api/health` | Liveness and MongoDB connection state |
| GET | `/api/health/ready` | Readiness; HTTP 503 when database is not connected |

## Conventions for future domain endpoints

- Validate request bodies, query parameters, and path identifiers on the server.
- Require authentication by default for private finance resources.
- Scope queries to the authenticated owner or authorized team membership.
- Use consistent pagination metadata for collection endpoints.
- Return appropriate 4xx errors for invalid requests and 404 where resource visibility rules require it.
- Use idempotency protection for operations where duplicate financial writes would be harmful.
- Document ownership and role requirements alongside each endpoint.
