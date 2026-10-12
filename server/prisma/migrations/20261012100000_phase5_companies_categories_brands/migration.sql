-- Phase 5: multi-role companies. Existing Company data is retained.
ALTER TABLE "company" RENAME TO "companies";
ALTER TABLE "companies" ALTER COLUMN "isSingleton" SET DEFAULT false;
ALTER TABLE "companies" ADD COLUMN "type" TEXT,
  ADD COLUMN "isManufacturer" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "isSupplier" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "isSeller" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "contactName" TEXT,
  ADD COLUMN "notes" TEXT,
  ADD COLUMN "status" TEXT NOT NULL DEFAULT 'ACTIVE';

CREATE INDEX "companies_status_idx" ON "companies"("status");
