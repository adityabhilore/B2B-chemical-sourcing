ALTER TABLE "order_requests" ADD COLUMN "orderNumber" TEXT;
ALTER TABLE "order_requests" ADD COLUMN "deliveryState" TEXT;

WITH numbered AS (
  SELECT "id", "createdAt", ROW_NUMBER() OVER (PARTITION BY EXTRACT(YEAR FROM "createdAt") ORDER BY "createdAt", "id") AS seq
  FROM "order_requests"
)
UPDATE "order_requests" AS o
SET "orderNumber" = 'CHM-' || EXTRACT(YEAR FROM n."createdAt")::int::text || '-' || LPAD(n.seq::text, 6, '0')
FROM numbered AS n
WHERE o."id" = n."id";

ALTER TABLE "order_requests" ALTER COLUMN "orderNumber" SET NOT NULL;
CREATE UNIQUE INDEX "order_requests_orderNumber_key" ON "order_requests"("orderNumber");

ALTER TABLE "order_items" ADD COLUMN "snapshotPackaging" TEXT;
ALTER TABLE "order_items" ADD COLUMN "snapshotBrand" TEXT;
ALTER TABLE "order_items" ADD COLUMN "snapshotManufacturer" TEXT;
ALTER TABLE "order_items" ADD COLUMN "snapshotSeller" TEXT;
ALTER TABLE "order_items" ADD COLUMN "snapshotSource" JSONB;

ALTER TABLE "notification_logs" ADD COLUMN "orderRequestId" TEXT;
CREATE INDEX "notification_logs_orderRequestId_idx" ON "notification_logs"("orderRequestId");
ALTER TABLE "notification_logs" ADD CONSTRAINT "notification_logs_orderRequestId_fkey" FOREIGN KEY ("orderRequestId") REFERENCES "order_requests"("id") ON DELETE SET NULL ON UPDATE CASCADE;
