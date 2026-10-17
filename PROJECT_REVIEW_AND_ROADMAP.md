<!--  --># Chemical Market: Project Review and Roadmap

**Review date:** 13 October 2026  
**Scope:** Repository review of the React website, admin, Express API, Prisma schema, migrations, and existing project/security notes. This is a code and documentation review, not a full browser, accessibility, penetration, or production infrastructure audit.

## Current state

The project is a working B2B chemical catalogue with a public product catalogue and product details, customer registration/login, quote/order requests, customer order history, admin catalogue/content/order/customer/shipping management, and database-backed dashboard reporting. The API includes role checks, input validation, product response allowlists, sanitized blog content, upload checks, rate limits, and operational email logging.

Verification update (17 October 2026): Prisma Client generation and schema validation succeeded; PostgreSQL reports all 10 migrations applied. Rollback-only writes verified sequential numbers for companies, categories, brands, and products. The server suite passes (15 tests), including mocked serialization retry, approval enforcement, and catalogue search checks. The production client build passes; lint exits successfully with existing warnings. A read-only PostgreSQL query validated the expanded catalogue search filter. Remaining browser and business-acceptance checks have not been completed. See `SECURITY_REVIEW.md` and `PHASE9_CHECKLIST.md` for the P0 verification record.

## Remaining work and improvements

### P0 — Finish and verify before production

1. **Completed: generate Prisma Client and check schema/database alignment.** Client generation and schema validation pass; PostgreSQL reports all 10 migrations applied. Rollback-only writes verified all four sequential-number fields. Admin browser screens have not been manually exercised.
2. **Still required: complete the manual acceptance walkthrough.** Live idempotency under concurrent retry, product/variant availability, order snapshot stability, shipping rule matching/overlap, dashboard values, customer suspend/reactivate, and responsive/keyboard accessibility remain unverified.
3. **Implemented, race verification pending: order-number conflict retries.** Order creation uses a serializable transaction and retries Prisma serialization (`P2034`) and unique constraint (`P2002`) conflicts up to three attempts. A mocked `P2034` retry test passes; the live concurrent-order acceptance case remains outstanding.
4. **Partially completed: reconcile documentation and production operations.** Migration, generation, and current server-test results are recorded in `SECURITY_REVIEW.md` and `PHASE9_CHECKLIST.md`. Production backup/restore, CORS/proxy, SMTP, Cloudinary, and secret configuration still need deployment-environment verification.

### P1 — Complete user-facing flows

1. **Complete: About page.** `/about` now presents buyer capabilities, sourcing/manufacturing and documentation guidance, and contact/catalogue calls to action. Admins can edit the About copy in Site Settings; neutral fallback copy avoids unsupported company claims.
2. **Complete: password recovery pages.** Forgot-password and reset forms use the existing endpoints, validate password strength and confirmation, show generic request confirmation and API errors, and remove reset tokens from browser history. Reset links use URL fragments and the site sends a no-referrer policy.
3. **Complete: approval clarity and enforcement.** Pending customers see a review notice and profile link; the order page explains the restriction, and the API blocks pending-account order requests. Profile completion and delivery details remain customer-entered flows.
4. **Complete: catalogue search coverage.** Public search now includes product name/description/CAS, brand, manufacturer, SKU, and package details. A PostgreSQL read-only query confirmed the generated filter runs; interactive browser behavior remains to be checked.
5. **Improved: empty and error feedback.** Home page, article list/detail, contact details, customer order history, public catalogue filters, and admin reference-data failures now display distinct feedback. Continue reviewing other routes during browser acceptance.

### P2 — Admin efficiency and business operations

1. **Order operations — partially implemented:** Saved filters persist in this browser, failed notifications have an order-list retry queue, and list/detail labels distinguish quote-needed requests from estimates awaiting availability confirmation. Remaining: safe bulk actions and pagination/search for the failed-notification queue. All requests remain distinct from confirmed orders.
2. **Catalogue operations — partially implemented:** Admin CSV export excludes supplier/procurement columns; duplicate and archive/restore flows exist, with restore returning a product as a draft. Remaining: validated import with preview/transaction rollback, and document expiry reminders. `ProductDocument` currently has no expiry date, so reminders need a nullable expiry field and migration before UI work.
3. **Content operations — remaining:** Blog/homepage draft preview, shareable preview links, scheduled publishing, and an asset library are not implemented. Existing image upload remains available through current editors.
4. **Shipping operations — partially implemented:** Admin now has a route/weight/value simulator using the same estimate endpoint; it warns when no active rule matches. Remaining: audit entries for shipping rule/method changes and a warning in the shipping rule editor itself.
5. **Reporting — implemented:** Admin-only date-range CSV exports are available for order requests and customers. Export columns explicitly say estimate and confirmed total; estimates are not named revenue or sales.
6. **Auditability — partially implemented:** Protected audit viewer and 90–3650 day retention cleanup are available. Order status, product create/update/publication/restore/duplicate, and site setting changes are logged with limited fields. Remaining: shipping-rule/method, content, customer status, and archive actions need audit coverage; define backups/retention policy before using purge in production.

### P2 — Public website quality and growth

1. **Search visibility — partially implemented:** Client-side route canonicals, product/article JSON-LD, robots rules, and a post-build sitemap generator are in place. Production build must set `VITE_SITE_URL`; dynamic product/article URLs are included only when `VITE_API_URL` is reachable at build time. Remaining: verify rendered production pages and submit/check the sitemap with search engine tools; consider pre-rendering public product/article routes because the app is an SPA.
2. **Trust and compliance — partially implemented:** Footer contact details reuse published site settings; Terms, Privacy, and Chemical Safety & Shipping pages are published with product/order and handling disclaimers. The text is generic and explicitly requires business/legal and safety review against actual practices before production publication.
3. **Performance — partially implemented:** Public GET APIs for products, catalogue reference data, and content now use short-lived cache headers. Remaining: measure production Core Web Vitals, image performance, and API latency; aggregate dashboard queries only if observed volume justifies it.
4. **Accessibility and responsive polish — partially implemented:** Added a keyboard-visible skip link; global focus-visible styling already exists. Remaining: keyboard-only, screen-reader, contrast, zoom, and mobile/tablet acceptance checks. Build and lint do not establish accessibility conformance.

### P3 — Engineering quality and release safety

1. **CI checks — implemented:** `.github/workflows/ci.yml` runs client lint/build, Prisma validation/generation, clean PostgreSQL migration deploy/status, mocked API tests, PostgreSQL integration tests, and the production dependency audit on pull requests and pushes to main/master.
2. **PostgreSQL integration coverage — initial suite implemented:** `server/tests/postgres.integration.test.js` checks applied migration history, unique slug constraints, customer/admin role isolation, active shipping-rule overlap, concurrent idempotency, and distinct order numbers under concurrent requests. Broader snapshot/product availability/dashboard/migration-upgrade scenarios remain for follow-up; CI uses a fresh database, not the local application database.
3. **Dependency maintenance — audited:** On 17 October 2026, `npm audit --omit=dev` reports 0 vulnerabilities. Full `npm audit` reports 7 development dependency findings (5 high, 2 moderate) in the Tailwind 3 toolchain (`braces` and `postcss-selector-parser`); npm reports no fix for the parser advisory. Re-run before release and resolve through safe upstream updates or a planned Tailwind toolchain upgrade.
4. **Observability — implemented baseline:** Requests receive validated correlation IDs in response headers and method/status/latency logs. Server errors emit sanitized JSON events; database health, SMTP, email send, and Cloudinary upload failures can post a sanitized alert to optional `OPS_ALERT_WEBHOOK`. Provider dashboards and on-call delivery still need deployment configuration/verification.
5. **Release process — implemented:** [RELEASE_PROCESS.md](RELEASE_PROCESS.md) documents staging promotion, backup/restore, rollback limits, and smoke checks.

## Visible placeholders and behavior to review

- `/about`, `/auth/forgot-password`, and `/auth/reset-password` are implemented; verify the authored About copy and email flow with the business owner and configured SMTP.
- The catch-all route also renders the generic placeholder instead of a dedicated 404 page.
- Public product filter-option loading and blog list failures now show distinct notices/errors.
- `SECURITY_REVIEW.md` records the 17 October 2026 dependency audit and P3 implementation/verification status.

## Suggested delivery order

1. Complete the database-backed and browser acceptance checklist, including concurrent order submissions.
2. Add a dedicated 404 page and continue refining approved About/password-recovery content with the business owner.
3. Confirm the new CI workflow and PostgreSQL integration suite pass in GitHub Actions; complete accessibility/performance/security release checks.
4. Verify production backup/restore, CORS/proxy, SMTP, Cloudinary, and secret configuration before deployment.
5. Prioritize admin efficiency and public growth work based on actual operator/customer feedback.

## Review limits

This report includes local PostgreSQL migration/schema checks, rollback-only sequential-number writes, a client production build, lint, and the mocked server test suite. It does not certify production deployment, live SMTP/Cloudinary delivery, legal compliance, security, search indexing, or accessibility. The documented browser and database acceptance walkthrough remains incomplete.
