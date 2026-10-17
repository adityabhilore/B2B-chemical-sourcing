# Chemical Market

A B2B chemical marketplace for publishing a product catalogue, receiving quote and order requests, managing shipping estimates, and administering customers and content. This repository is a JavaScript monorepo with a React client and an Express/Prisma API.

## Architecture

- `client/`: React 19, Vite, React Router, Tailwind CSS, Recharts.
- `server/`: Express 4 API, JWT authentication, Zod validation, Prisma ORM, PostgreSQL.
- `server/prisma/`: schema, migrations, and seed script.
- Cloudinary stores uploaded product/content media; Nodemailer sends operational email.

The API returns `{ success, data, message, errors }` envelopes. Customers authenticate with short lived bearer tokens and an HttpOnly, SameSite Strict refresh cookie. Admin and customer resources are separated by role middleware. Order requests snapshot product information and do not collect payments.

## Requirements and setup

Requires Node.js 22+, npm 10+, and PostgreSQL. Copy `server/.env.example` to `server/.env` and `client/.env.example` to `client/.env.local`; fill in database, JWT, Cloudinary, SMTP, and seed-admin settings. Never commit environment files.

```powershell
npm install
npm run generate --prefix server
npm run migrate:deploy --prefix server
npm run seed --prefix server
npm run dev:server
```

In another terminal:

```powershell
npm run dev:client
```

The client runs at `http://localhost:5173`; the API defaults to `http://localhost:5000`. Set `CLIENT_ORIGIN` to the exact client origin. See [API_REFERENCE.md](API_REFERENCE.md) for routes and [SECURITY_REVIEW.md](SECURITY_REVIEW.md) for verification status and remaining review steps.

## Common commands

```powershell
npm run build:client
npm test --prefix server
npm run generate --prefix server
npm run migrate:deploy --prefix server
npm audit
```

CI runs through `.github/workflows/ci.yml`. PostgreSQL-backed integration tests use `TEST_DATABASE_URL`; point it only at a dedicated database whose name contains `test`, apply migrations first, then run `npm run test:integration --prefix server`. See [RELEASE_PROCESS.md](RELEASE_PROCESS.md) for staging promotion, migration/restore limits, and the post-deploy checklist.

## Operational notes

- `GET /api/health` checks the API and its database connection.
- `server/.env` and local docs under `docs/` are intentionally ignored by Git. Share environment variable names through `.env.example`; do not put credentials there.
- Order requests are not confirmed purchases. Estimate totals and shipping charges require confirmation by the marketplace team.
- Before production, apply pending migrations, configure backups, verify SMTP and Cloudinary, run the manual acceptance checks, and review deployment-specific CORS/proxy settings.
