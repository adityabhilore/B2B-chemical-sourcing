CREATE TABLE "shipping_methods" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "shipping_methods_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "shipping_methods_name_key" ON "shipping_methods"("name");
CREATE INDEX "shipping_methods_isActive_idx" ON "shipping_methods"("isActive");

ALTER TABLE "shipping_rules" ADD COLUMN "originState" TEXT;
ALTER TABLE "shipping_rules" ADD COLUMN "destinationState" TEXT;
ALTER TABLE "shipping_rules" ADD COLUMN "methodId" TEXT;
CREATE INDEX "shipping_rules_methodId_idx" ON "shipping_rules"("methodId");
ALTER TABLE "shipping_rules" ADD CONSTRAINT "shipping_rules_methodId_fkey" FOREIGN KEY ("methodId") REFERENCES "shipping_methods"("id") ON DELETE SET NULL ON UPDATE CASCADE;
