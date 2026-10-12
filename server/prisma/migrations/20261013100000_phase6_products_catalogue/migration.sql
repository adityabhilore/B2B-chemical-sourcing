CREATE TYPE "PricingMode" AS ENUM ('FIXED', 'REQUEST_QUOTE');

ALTER TABLE "products"
  ADD COLUMN "pricingMode" "PricingMode" NOT NULL DEFAULT 'REQUEST_QUOTE',
  ADD COLUMN "basePrice" DECIMAL(12,4),
  ADD COLUMN "taxPercent" DECIMAL(5,2),
  ADD COLUMN "trackStock" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "stockQuantity" INTEGER,
  ADD COLUMN "minOrderQuantity" INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN "safetyHandling" TEXT,
  ADD COLUMN "internalNotes" TEXT,
  ADD COLUMN "deletedAt" TIMESTAMP(3),
  ADD COLUMN "sellerCompanyId" TEXT,
  ADD COLUMN "manufacturerCompanyId" TEXT,
  ADD COLUMN "supplierCompanyId" TEXT;

ALTER TABLE "product_variants"
  ADD COLUMN "name" TEXT,
  ADD COLUMN "packageSize" TEXT,
  ADD COLUMN "packageUnit" TEXT,
  ADD COLUMN "weightVolume" DECIMAL(12,4),
  ADD COLUMN "weightVolumeUnit" TEXT,
  ADD COLUMN "pricingMode" "PricingMode" NOT NULL DEFAULT 'FIXED',
  ADD COLUMN "stockQuantity" INTEGER;
ALTER TABLE "product_variants" ADD COLUMN "imageUrl" TEXT;

ALTER TABLE "product_documents"
  ADD COLUMN "fileType" TEXT NOT NULL DEFAULT 'application/pdf';

CREATE INDEX "products_deletedAt_idx" ON "products"("deletedAt");
CREATE INDEX "products_pricingMode_idx" ON "products"("pricingMode");
ALTER TABLE "products" ADD CONSTRAINT "products_sellerCompanyId_fkey"
  FOREIGN KEY ("sellerCompanyId") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "products" ADD CONSTRAINT "products_manufacturerCompanyId_fkey"
  FOREIGN KEY ("manufacturerCompanyId") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "products" ADD CONSTRAINT "products_supplierCompanyId_fkey"
  FOREIGN KEY ("supplierCompanyId") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;
