ALTER TYPE "SectionType" ADD VALUE IF NOT EXISTS 'FEATURED_BRANDS';
ALTER TYPE "SectionType" ADD VALUE IF NOT EXISTS 'COMPANY_INTRO';
ALTER TYPE "SectionType" ADD VALUE IF NOT EXISTS 'ORDERING_STEPS';
ALTER TYPE "SectionType" ADD VALUE IF NOT EXISTS 'BLOG_HIGHLIGHTS';
ALTER TYPE "SectionType" ADD VALUE IF NOT EXISTS 'CONTACT_CTA';
ALTER TYPE "SectionType" ADD VALUE IF NOT EXISTS 'FOOTER';

CREATE TABLE "contact_enquiries" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "company" TEXT,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "subject" TEXT,
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "contact_enquiries_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "contact_enquiries_status_createdAt_idx" ON "contact_enquiries"("status", "createdAt");
ALTER TABLE "blog_posts" ADD COLUMN "category" TEXT;
