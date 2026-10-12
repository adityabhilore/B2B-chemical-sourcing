// prisma/seed.js
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Seeds ONLY the initial admin user.
// No hardcoded products, categories, or prices â€” business rule #9.
// Run with: npm run seed  (from /server)
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import * as dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

// Load .env from server root
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const prisma = new PrismaClient();

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;
  const fullName = process.env.SEED_ADMIN_NAME ?? "System Admin";

  if (!email || !password) {
    throw new Error(
      "SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD must be set in .env"
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const admin = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, passwordHash, fullName, role: "ADMIN", isActive: true, isApproved: true },
  });

  const defaults = [
    ["site.name", "Chemical Market"],
    ["site.description", "Browse published products, review catalogue details, and contact us with a sourcing enquiry."],
    ["theme.primaryColor", "#1e3a8a"],
    ["theme.secondaryColor", "#14b8a6"],
    ["theme.font", "Inter"],
  ];
  for (const [key, value] of defaults) {
    const setting = await prisma.siteSetting.upsert({ where: { key }, update: {}, create: { key, value } });
    if (key === "site.description" && setting.value === "") {
      await prisma.siteSetting.update({ where: { key }, data: { value } });
    }
  }

  const homepageSections = [
    { type: "HERO_BANNER", title: "Source industrial chemicals", subtitle: "A B2B chemical catalogue", content: { description: "Browse published products and send an enquiry to our team.", ctaLabel: "Search catalogue" }, sortOrder: 0 },
    { type: "FEATURED_PRODUCTS", title: "Featured products", subtitle: "Explore the current catalogue", content: { limit: 8, emptyMessage: "Published products will appear here when they are added to the catalogue." }, sortOrder: 1 },
    { type: "FEATURED_CATEGORIES", title: "Browse categories", subtitle: "Find products by category", content: { emptyMessage: "Published categories will appear here when they are added to the catalogue." }, sortOrder: 2 },
    { type: "FEATURED_BRANDS", title: "Brands", subtitle: "Published catalogue brands", content: {}, sortOrder: 3 },
    { type: "COMPANY_INTRO", title: "About us", subtitle: "Company introduction", content: { text: "Explore published chemicals, review product details, and contact us with a sourcing enquiry." }, sortOrder: 4 },
    { type: "ORDERING_STEPS", title: "How ordering works", subtitle: "The enquiry process", content: { steps: [
      { title: "Browse the catalogue", description: "Search published products or browse by category." },
      { title: "Review product details", description: "Compare available variants, pricing, and product information." },
      { title: "Choose what you need", description: "Select a variant and quantity on the product page." },
      { title: "Sign in to continue", description: "Sign in to submit an order request for your selection." },
    ] }, sortOrder: 5 },
    { type: "BLOG_HIGHLIGHTS", title: "Latest articles", subtitle: "Knowledge base", content: { emptyMessage: "Published articles will appear here when they are added." }, sortOrder: 6 },
    { type: "CONTACT_CTA", title: "Need help sourcing a product?", subtitle: "Send our team an enquiry.", content: { ctaLabel: "Contact us", ctaUrl: "/contact" }, sortOrder: 7 },
    { type: "FOOTER", title: "Footer", subtitle: "Public site footer", content: {}, sortOrder: 8 },
  ];
  for (const section of homepageSections) {
    const exists = await prisma.homepageSection.findFirst({ where: { type: section.type } });
    if (!exists) await prisma.homepageSection.create({ data: section });
    else if (section.type === "COMPANY_INTRO" && exists.content?.text === "Add approved company introduction in Homepage Management.") {
      await prisma.homepageSection.update({ where: { id: exists.id }, data: { content: section.content } });
    } else if (section.type === "ORDERING_STEPS" && (!Array.isArray(exists.content?.steps) || exists.content.steps.length === 0)) {
      await prisma.homepageSection.update({ where: { id: exists.id }, data: { content: section.content } });
    } else if (["FEATURED_PRODUCTS", "FEATURED_CATEGORIES", "BLOG_HIGHLIGHTS"].includes(section.type)) {
      const content = exists.content && typeof exists.content === "object" ? exists.content : {};
      if (!content.emptyMessage) await prisma.homepageSection.update({ where: { id: exists.id }, data: { content: { ...content, emptyMessage: section.content.emptyMessage } } });
    }
  }

  console.log(`Admin is ready: ${admin.email}`);
  console.log("Default site settings are ready. No catalogue records were created.");
  console.log("Default editable homepage sections are ready.");
}

main()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
