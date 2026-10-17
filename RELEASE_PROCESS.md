# Release process

## Pull request checks

The GitHub Actions workflow runs client lint/build, Prisma schema validation and generation, migration deployment/status against a new PostgreSQL 16 database, mocked API tests, PostgreSQL integration tests, and a production dependency audit. A green check validates the source and clean-database migration path; it does not replace staging acceptance or a production restore test.

## Promote a release

1. Merge only after CI passes. Deploy the same commit to staging and apply its migrations using `npm run migrate:deploy --prefix server`.
2. Run the staging smoke checklist below and check application logs/alerts. Verify SMTP, Cloudinary, CORS, proxy/IP handling, `VITE_SITE_URL`, and secrets using deployment settings; never put secrets in GitHub workflow files or build artifacts.
3. Take and verify a database backup immediately before production migration. Confirm the restore procedure and the production operator's recovery point and recovery time targets.
4. Deploy the application version and apply additive migrations. Run the smoke checklist and monitor health, API errors, database connection failures, uploads, and email delivery before completing promotion.

## Backup, restore, and rollback limits

Use the database provider's tested backup/PITR process or the documented `pg_dump` and restore procedure in `SECURITY_REVIEW.md`. Restore into a separate database and validate it before switching traffic. Do not test restores against the live production database.

Application rollback does not automatically roll back database migrations. Prefer forward-compatible additive migrations. If a migration is destructive or incompatible, stop promotion and use the reviewed database restore/forward-fix plan; do not run `prisma migrate reset` in a production environment. A point-in-time restore can discard writes made after the restore point, so coordinate the decision with the business and database operator.

## Post-deploy smoke checklist

- `/api/health` reports API and database healthy.
- Public homepage, catalogue filters, representative product page, blog article, contact details, Terms, Privacy, and Safety pages load on the production origin.
- `robots.txt` references the generated `sitemap.xml`; the sitemap uses the production origin and includes current public product/article URLs.
- Customer login, approval gating, and a non-production order request work; the request is stored once and appears in the admin.
- Admin login, order status update, catalogue edit, shipping estimate, and audit viewer work with correct role restrictions.
- A controlled email and upload succeed; failures are visible in operational/admin logs without exposing secrets or reset tokens.
- Review request IDs and error rates in the logs, and confirm an alert reaches the configured operations channel.
- Confirm the previous database backup remains available and rollback/restore contacts are reachable.
