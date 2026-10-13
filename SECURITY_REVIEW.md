# Phase 10: Testing and Security Review

## Automated API tests

Run with `npm test --prefix server`. These Supertest tests exercise Express routes with Prisma and SMTP mocked, so they test request validation, authorization, response behavior, and failure handling without requiring a development database or sending email. They do not prove database migrations or SQL behavior against PostgreSQL.

| # | Acceptance criterion from the available phase briefs | Result | Evidence |
|---:|---|---|---|
| 1 | Invalid auth input is rejected | PASS | Automated: 422 and field details |
| 2 | Customer cannot call an admin endpoint | PASS | Automated: 403 |
| 3 | Category with assigned products cannot be deleted | PASS | Automated: 409; delete not called |
| 4 | Public product list filters to published, non-deleted products | PASS | Automated: Prisma query conditions asserted |
| 5 | Public product DTO hides supplier/procurement/internal fields | PASS | Automated DTO allowlist assertions |
| 6 | Blog HTML removes scripts, event handlers, and unsafe links | PASS | Automated sanitizer test |
| 7 | Customer order request persists through the API layer | PASS* | Automated: mocked Prisma transaction returned success |
| 8 | Frontend/tampered totals do not control order estimate | PASS* | Automated: server price 75 × 2 produced 150 despite supplied zero |
| 9 | Quantity below MOQ is rejected before transaction | PASS | Automated: 400; transaction not called |
| 10 | Customer cannot fetch another owner’s order | PASS | Automated: owner-scoped query and 404 |
| 11 | Accepted status transition writes history and note | PASS* | Automated: transaction history create asserted |
| 12 | SMTP failure does not undo order and notification is FAILED | PASS* | Automated: email error logged after mocked order save |
| 13 | Repeating an idempotency key creates only one row | NOT RUN | Requires database-backed duplicate submission check |
| 14 | Product/variant publication and availability are enforced against a real catalogue | NOT RUN | Requires PostgreSQL fixture walkthrough |
| 15 | Product edits after submission do not change persisted snapshots | NOT RUN | Requires migration and live database check |
| 16 | Valid shipping estimate and no-match estimate are correct | NOT RUN | Requires shipping rules and customer walkthrough |
| 17 | Overlapping shipping rules are rejected, including wildcard cases | NOT RUN | Requires database-backed admin workflow |
| 18 | Dashboard values and graphs match live records | NOT RUN | Requires representative PostgreSQL data |
| 19 | Suspend/reactivate blocks/restores customer sessions | NOT RUN | Requires live auth/session walkthrough |
| 20 | Mobile/tablet/desktop layout and accessibility are usable | NOT RUN | Requires browser/device and assistive-technology review |

\* PASS refers to the mocked API behavior described above, not a live PostgreSQL or SMTP integration run. The user's original brief did not include a single numbered list of 20 acceptance criteria, so this table enumerates 20 criteria from the available phase requirements and labels the evidence honestly.

## Security review

| Area | Review |
|---|---|
| Helmet | Enabled globally with Helmet defaults; `X-Powered-By` disabled. |
| CORS | Credentials are enabled for the single exact `CLIENT_ORIGIN`; configure that value to the production frontend origin. No wildcard is configured. |
| CSRF | Refresh token is an HttpOnly, SameSite Strict cookie scoped to `/api/auth`, Secure in production. Application API authorization uses bearer access tokens. There is no separate synchronizer CSRF token; reassess if cookie-authenticated state-changing routes are added. |
| Rate limits | Global 500 requests/15 minutes, auth 20/15 minutes, contact form 5/15 minutes. Ensure deployment proxy/IP configuration is reviewed so limits use the intended client IP. |
| Validation | Zod validates auth, customer profile/address, catalogue writes, product writes, order submission/status, shipping writes, blog/settings, and contact payloads. Shipping estimate inputs are explicitly checked. Some list filters and resource IDs are normalized and passed to Prisma without dedicated Zod schemas; add schemas if those endpoints gain more complex query behavior. |
| SQL injection | Prisma query builder is used for user-supplied filters and identifiers. The health query is a static parameter-free `SELECT 1`; no user-built raw SQL was found in the reviewed routes. |
| XSS | Blog HTML passes an allowlist sanitizer on save and public read. Public product fields use an explicit DTO allowlist. Continue escaping text in any new raw HTML sinks. |
| Uploads | Images are restricted to JPEG/PNG/WebP with size caps and signature checks before Cloudinary. Documents are PDF-only with a signature check and size cap. Uploaded images use Cloudinary automatic format/quality and a 1600px limit. |
| Secrets | `.env` and nested `.env.*` are ignored; example files remain allowed. `server/.env` is ignored and not tracked. A pattern scan of tracked files found no common API token, private key, or high-entropy credential patterns. This heuristic scan cannot prove no secret exists. |
| Logs | Morgan records method, status, latency, and response length only; it intentionally omits URLs, headers, and bodies to avoid tokens/passwords/PII. Notification error text is retained in an admin-only log. |
| Dependencies | `npm audit --omit=dev`: 0 vulnerabilities. Full `npm audit`: 7 development dependency vulnerabilities (5 high, 2 moderate) in the Tailwind CSS 3 toolchain (`braces` and `postcss-selector-parser` transitive dependencies). Runtime `bcrypt` and Nodemailer are on audited versions. Resolve the remaining findings through dependency updates; a major Tailwind migration may be needed. |

`npm run build --prefix client` succeeds; route and chart code splitting keeps the initial JS bundle at about 279 kB (88 kB gzip), with charts loaded separately. `npx prisma validate` succeeds. Prisma Client generation previously failed on Windows with `EPERM` while replacing its query engine DLL, so database-backed tests and migrations have not been run. The Phase 10 index migration is present but unapplied.

## UX, accessibility, and performance review

- The production client build is the responsive/layout smoke check available here. Components use responsive grid breakpoints, but no browser viewport, keyboard, screen-reader, or Lighthouse run was available; those remain manual.
- Product, category, and article card images use native lazy loading and async decoding. Product/content uploads request Cloudinary `q_auto`, `f_auto`, and a 1600px maximum width. No claim is made that pre-existing Cloudinary assets were reprocessed.
- Main catalogue, blog, customer, order, company, enquiry, and shipping admin lists use pagination. Reference lists (Indian states and active shipping methods) are intentionally finite/small. Dashboard chart series reads the last 30 days of order rows; consider a database-side daily aggregate if order volume grows materially.
- Database indexes cover user role/registration date, order date/status, shipping rule matching, and existing order/product lookup fields. Apply the pending Phase 10 index migration before relying on them.
- Empty, loading, and error states exist on the principal customer/admin screens. Manual keyboard/focus contrast and small-screen table review remain outstanding.

## PostgreSQL backup and recovery

1. Enable automated encrypted daily `pg_dump` backups and retain at least 14 daily and 8 weekly copies in storage separate from the database host. Keep encryption keys outside the repository.
2. Before production migrations, take an on-demand backup and record the migration version. Run `npm run migrate:deploy --prefix server` only after the backup succeeds.
3. Example logical backup: `pg_dump --format=custom --no-owner --file=chemical-market-YYYYMMDD.dump "$DATABASE_URL"`.
4. Restore into a fresh database first: `createdb chemical_market_restore`, then `pg_restore --no-owner --dbname="$RESTORE_DATABASE_URL" chemical-market-YYYYMMDD.dump`. Validate row counts, login, product visibility, and order snapshots before switching traffic.
5. Define production RPO/RTO with the database operator; test restore at least quarterly. For low RPO requirements, use managed point-in-time recovery/WAL archiving in addition to dumps.
6. Store backup artifacts and restore credentials outside this project. Never place database URLs, dumps, or encryption keys in Git.

## Senior explanation

Chemical Market is a B2B procurement app. React/Vite renders public catalogue, customer ordering, and protected admin workflows. Express exposes role-protected JSON APIs; Prisma maps those APIs to PostgreSQL. Products are public only when active and published, while supplier/procurement information is private. An order request stores an immutable product/variant snapshot and uses a server-computed estimate; it is not a payment or confirmed purchase. Email/WhatsApp notification is downstream of persistence so delivery failure cannot lose an order. Shipping rules provide estimates only because hazardous/packaged chemical freight needs manual confirmation.
