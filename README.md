# FinTrack Hub

FinTrack Hub is a full-stack personal finance management and team expense-sharing SaaS built with React, Vite, Tailwind CSS, Node.js, Express, and MongoDB/Mongoose.

> Project status: Phase 1 foundation is being implemented. See the roadmap and setup instructions as the application grows; features are only marked complete after they are implemented and tested.

## Planned workspace

- `client/` — React + Vite frontend
- `server/` — Express REST API
- `docs/` — architecture and API notes

## Requirements

- Node.js 22 LTS (Node 20.19+ also supported by the selected Vite toolchain)
- npm 10+
- MongoDB locally or a MongoDB Atlas database for API persistence

## Getting started

1. Copy `server/.env.example` to `server/.env` and set `MONGODB_URI` and `JWT_ACCESS_SECRET`.
2. Copy `client/.env.example` to `client/.env` if you need a non-default API URL.
3. Install dependencies from the repository root with `npm install`.
4. Run `npm run dev` to start both client and server.
5. Visit the Vite URL printed in the terminal. The API health endpoint is available at `http://localhost:5000/api/health` by default.

See `docs/architecture.md` for the Phase 1 architecture and `docs/development.md` for local setup, scripts, and troubleshooting.

## Security notes

- Never commit `.env` files or real credentials.
- Newly registered accounts will default to the `User` application role. Admin assignment must be performed through a controlled server-side process in the authentication phase.
- A visible frontend route is not an authorization boundary; protected resources must be checked by the API.

## License

No license has been selected yet. Until one is added, all rights remain with the repository owner.