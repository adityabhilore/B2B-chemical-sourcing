-- Keep CUIDs as internal relational keys and add stable sequential numbers for admin display.
ALTER TABLE "categories" ADD COLUMN "categoryNumber" SERIAL NOT NULL;
CREATE UNIQUE INDEX "categories_categoryNumber_key" ON "categories"("categoryNumber");

ALTER TABLE "brands" ADD COLUMN "brandNumber" SERIAL NOT NULL;
CREATE UNIQUE INDEX "brands_brandNumber_key" ON "brands"("brandNumber");
ALTER TABLE "products" ADD COLUMN "productNumber" SERIAL NOT NULL;
CREATE UNIQUE INDEX "products_productNumber_key" ON "products"("productNumber");
