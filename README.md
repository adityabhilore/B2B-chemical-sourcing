# Chemical Market

B2B chemical marketplace monorepo. The first schema migration and the Phase 2 auth/customer foundation are in place. Phase 3 adds local setup, shared API response handling, safe request logging, and an API/database health check.

## Structure

```text
client/                  Vite, React, Tailwind, React Router
server/                  Express API and Prisma/PostgreSQL
  prisma/                Schema, migrations, admin/settings seed
  src/app.js              Express app and middleware
  src/server.js           HTTP startup and graceful shutdown
  src/modules/            Feature modules
docs/                     Setup, checklist, and API testing notes
```

## Quick start (Windows PowerShell / VS Code)

Requirements: Node.js 22+, npm 10+, and a running PostgreSQL database.

1. From the repository root run `npm install`.
2. Copy `server/.env.example` to `server/.env`; set the PostgreSQL `DATABASE_URL`, strong unique JWT secrets, Cloudinary credentials, SMTP credentials, and seed admin credentials. See [environment variables](docs/ENVIRONMENT.md).
3. Copy `client/.env.example` to `client/.env.local`. The default API URL is `http://localhost:5000`.
4. Run `npm run generate --prefix server` and `npm run migrate:deploy --prefix server`.
5. Run `npm run seed --prefix server`. This creates only the configured first admin and default site settings; it creates no products/categories/brands.
6. In separate VS Code terminals run `npm run dev:server` and `npm run dev:client`.
7. Open `http://localhost:5173/health-check`. The page checks the API and PostgreSQL through `/api/health`. If the API reports that port 5000 was occupied and selected a fallback port, set that port in `client/.env.local` and restart Vite.

The detailed Windows commands and manual verification steps are in [Phase 3 setup](docs/PHASE3_SETUP.md). API requests and the proposed Postman collection are outlined in [API testing](docs/API_TESTING.md).

Authentication and customer account implementation, session design, and Phase 4 manual/Postman checks are documented in [Phase 4 authentication](docs/PHASE4_AUTH.md).

## API response format

Successful responses use `{ "success": true, "data": ..., "message": "...", "errors": null }`. Failures use `{ "success": false, "data": null, "message": "...", "errors": ... }`. The health route is `GET /api/health` (the legacy `GET /health` alias remains available).

## Git

Git is initialized and the project files are staged for review. Suggested first commit message: `chore: initialize chemical marketplace monorepo`. The commit itself is still pending final approval.

See [Phase 3 checklist](docs/PHASE3_CHECKLIST.md) for what is complete and what needs review.
