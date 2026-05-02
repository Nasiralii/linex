import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { MANAGED_CONTENT_PAGES } from "../src/lib/content-pages";

/** Same TLS handling as `src/lib/db.ts` — RDS + pg adapter. */
function databaseUrlForPg(connectionString: string): string {
  try {
    const u = new URL(connectionString);
    u.searchParams.delete("sslmode");
    u.searchParams.delete("sslrootcert");
    u.searchParams.delete("sslcert");
    u.searchParams.delete("sslkey");
    return u.toString();
  } catch {
    return connectionString;
  }
}

const rawUrl = process.env.DATABASE_URL;
if (!rawUrl) {
  throw new Error("DATABASE_URL is required for seed (load ~/linex/.env or export it).");
}

// Prisma 7: Use pg adapter for direct database connection
// Original (local/dev): simple pool — keep for reference; RDS often needs TLS below.
// const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const pool = new Pool({
  connectionString: databaseUrlForPg(rawUrl),
  ssl: { rejectUnauthorized: false },
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  // ========================================================================
  // Create Admin User
  // ========================================================================
  const adminPassword = await bcrypt.hash("Admin@123456", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@linexforsa.com" },
    update: {},
    create: {
      email: "admin@linexforsa.com",
      passwordHash: adminPassword,
      role: "ADMIN",
      emailVerified: true,
      status: "ACTIVE",
    },
  });
  console.log("✅ Admin user created:", admin.email);

  // ========================================================================
  // Create Categories (Construction trades)
  // ========================================================================
  const categories = [
    { name: "Renovations", nameAr: "تجديدات", slug: "renovations", icon: "🔨" },
    {
      name: "Interior Finishing",
      nameAr: "تشطيبات داخلية",
      slug: "interior-finishing",
      icon: "✨",
    },
    {
      name: "Installation Work",
      nameAr: "أعمال تركيب",
      slug: "installation-work",
      icon: "🔧",
    },
    {
      name: "Repairs & Maintenance",
      nameAr: "إصلاحات وصيانة",
      slug: "repairs-maintenance",
      icon: "🛠️",
    },
    {
      name: "Painting & Decoration",
      nameAr: "دهان وديكور",
      slug: "painting-decoration",
      icon: "🎨",
    },
    {
      name: "Engineering Calculations & Drawings",
      nameAr: "حسابات ورسومات هندسية",
      slug: "engineering-calculations-drawings",
      icon: "📐",
    },
    {
      name: "Interior Design Planning",
      nameAr: "تخطيط التصميم الداخلي",
      slug: "interior-design-planning",
      icon: "📏",
    },
    {
      name: "3D Rendering",
      nameAr: "تصميم ثلاثي الأبعاد",
      slug: "3d-rendering",
      icon: "🖥️",
    },
    {
      name: "Structural Analysis",
      nameAr: "تحليل إنشائي",
      slug: "structural-analysis",
      icon: "🏗️",
    },
    {
      name: "MEP Design",
      nameAr: "تصميم ميكانيكي وكهربائي وسباكة",
      slug: "mep-design",
      icon: "⚙️",
    },
    {
      name: "New Building Project",
      nameAr: "مشروع بناء جديد",
      slug: "new-building-project",
      icon: "🏢",
    },
    {
      name: "Complex Renovation",
      nameAr: "تجديدات معقدة",
      slug: "complex-renovation",
      icon: "🏚️",
    },
    {
      name: "Custom Construction",
      nameAr: "بناء مخصص",
      slug: "custom-construction",
      icon: "🛖",
    },
  ];
  await prisma.category.deleteMany({
    where: { slug: { notIn: categories.map((c) => c.slug) } },
  });

  for (let i = 0; i < categories.length; i++) {
    await prisma.category.upsert({
      where: { slug: categories[i].slug },
      update: { ...categories[i], sortOrder: i },
      create: { ...categories[i], sortOrder: i },
    });
  }
  console.log(`✅ ${categories.length} categories created`);

  // ========================================================================
  // Create Locations (Saudi Arabia regions & cities)
  // ========================================================================
  const saudi = await prisma.location.upsert({
    where: { slug: "saudi-arabia" },
    update: {},
    create: {
      name: "Saudi Arabia",
      nameAr: "المملكة العربية السعودية",
      slug: "saudi-arabia",
      type: "country",
      sortOrder: 0,
    },
  });

  const regions = [
    {
      name: "Riyadh Region",
      nameAr: "منطقة الرياض",
      slug: "riyadh-region",
      cities: [
        { name: "Riyadh", nameAr: "الرياض", slug: "riyadh" },
        { name: "Diriyah", nameAr: "الدرعية", slug: "diriyah" },
        { name: "Kharj", nameAr: "الخرج", slug: "kharj" },
      ],
    },
    {
      name: "Makkah Region",
      nameAr: "منطقة مكة المكرمة",
      slug: "makkah-region",
      cities: [
        { name: "Makkah", nameAr: "مكة المكرمة", slug: "makkah" },
        { name: "Jeddah", nameAr: "جدة", slug: "jeddah" },
        { name: "Taif", nameAr: "الطائف", slug: "taif" },
      ],
    },
    {
      name: "Eastern Region",
      nameAr: "المنطقة الشرقية",
      slug: "eastern-region",
      cities: [
        { name: "Dammam", nameAr: "الدمام", slug: "dammam" },
        { name: "Khobar", nameAr: "الخبر", slug: "khobar" },
        { name: "Dhahran", nameAr: "الظهران", slug: "dhahran" },
        { name: "Jubail", nameAr: "الجبيل", slug: "jubail" },
      ],
    },
    {
      name: "Madinah Region",
      nameAr: "منطقة المدينة المنورة",
      slug: "madinah-region",
      cities: [
        { name: "Madinah", nameAr: "المدينة المنورة", slug: "madinah" },
        { name: "Yanbu", nameAr: "ينبع", slug: "yanbu" },
      ],
    },
    {
      name: "Asir Region",
      nameAr: "منطقة عسير",
      slug: "asir-region",
      cities: [
        { name: "Abha", nameAr: "أبها", slug: "abha" },
        { name: "Khamis Mushait", nameAr: "خميس مشيط", slug: "khamis-mushait" },
      ],
    },
    {
      name: "Qassim Region",
      nameAr: "منطقة القصيم",
      slug: "qassim-region",
      cities: [
        { name: "Buraidah", nameAr: "بريدة", slug: "buraidah" },
        { name: "Unaizah", nameAr: "عنيزة", slug: "unaizah" },
      ],
    },
    {
      name: "Tabuk Region",
      nameAr: "منطقة تبوك",
      slug: "tabuk-region",
      cities: [
        { name: "Tabuk", nameAr: "تبوك", slug: "tabuk" },
        { name: "NEOM", nameAr: "نيوم", slug: "neom" },
      ],
    },
    {
      name: "Hail Region",
      nameAr: "منطقة حائل",
      slug: "hail-region",
      cities: [{ name: "Hail", nameAr: "حائل", slug: "hail" }],
    },
    {
      name: "Jazan Region",
      nameAr: "منطقة جازان",
      slug: "jazan-region",
      cities: [{ name: "Jazan", nameAr: "جازان", slug: "jazan" }],
    },
  ];

  let locationCount = 0;
  for (const r of regions) {
    const region = await prisma.location.upsert({
      where: { slug: r.slug },
      update: {},
      create: {
        name: r.name,
        nameAr: r.nameAr,
        slug: r.slug,
        type: "region",
        parentId: saudi.id,
        sortOrder: locationCount,
      },
    });
    locationCount++;
    for (let j = 0; j < r.cities.length; j++) {
      await prisma.location.upsert({
        where: { slug: r.cities[j].slug },
        update: {},
        create: {
          ...r.cities[j],
          type: "city",
          parentId: region.id,
          sortOrder: j,
        },
      });
      locationCount++;
    }
  }
  console.log(`✅ ${locationCount} locations created`);

  // ========================================================================
  // Create Default Fee Rule
  // ========================================================================
  await prisma.feeRule.upsert({
    where: { id: "default-fee-rule" },
    update: {},
    create: {
      id: "default-fee-rule",
      name: "Default Platform Fee",
      nameAr: "رسوم المنصة الافتراضية",
      feeType: "PERCENTAGE",
      payer: "OWNER",
      percentage: 5.0,
      minAmount: 500,
      maxAmount: 50000,
      currency: "SAR",
      isActive: true,
      isDefault: true,
    },
  });
  console.log("✅ Default fee rule created (5% on owner)");

  // ========================================================================
  // Create Managed Content Pages
  // ========================================================================
  for (const page of MANAGED_CONTENT_PAGES) {
    await prisma.contentPage.upsert({
      where: { key: page.key },
      update: {
        slug: page.slug,
        title: page.title,
        titleAr: page.titleAr,
        excerpt: page.excerpt,
        excerptAr: page.excerptAr,
        content: page.content,
        contentAr: page.contentAr,
        isPublished: true,
      },
      create: {
        key: page.key,
        slug: page.slug,
        title: page.title,
        titleAr: page.titleAr,
        excerpt: page.excerpt,
        excerptAr: page.excerptAr,
        content: page.content,
        contentAr: page.contentAr,
        isPublished: true,
      },
    });
  }
  console.log(
    `✅ ${MANAGED_CONTENT_PAGES.length} managed content pages created`,
  );

  console.log("\n🎉 Database seeded successfully!");
  console.log("📧 Admin login: admin@linexforsa.com / Admin@123456");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
