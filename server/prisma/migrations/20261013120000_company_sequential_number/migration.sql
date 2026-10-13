-- Add a stable, human-readable sequential number while keeping the CUID as the relational key.
ALTER TABLE "companies" ADD COLUMN "companyNumber" SERIAL NOT NULL;
CREATE UNIQUE INDEX "companies_companyNumber_key" ON "companies"("companyNumber");
