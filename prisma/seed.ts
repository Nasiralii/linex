import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { MANAGED_CONTENT_PAGES } from "../src/lib/content-pages";

// Prisma 7: Use pg adapter for direct database connection
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
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
    { name: "General Construction", nameAr: "مقاولات عامة", slug: "general-construction", icon: "🏗️" },
    { name: "Renovation", nameAr: "تجديد وترميم", slug: "renovation", icon: "🔨" },
    { name: "Electrical", nameAr: "أعمال كهربائية", slug: "electrical", icon: "⚡" },
    { name: "Plumbing", nameAr: "أعمال سباكة", slug: "plumbing", icon: "🔧" },
    { name: "HVAC", nameAr: "تكييف وتبريد", slug: "hvac", icon: "❄️" },
    { name: "Painting & Finishing", nameAr: "دهان وتشطيبات", slug: "painting-finishing", icon: "🎨" },
    { name: "Flooring & Tiling", nameAr: "أرضيات وبلاط", slug: "flooring-tiling", icon: "🧱" },
    { name: "Steel & Metal Works", nameAr: "أعمال حديد ومعادن", slug: "steel-metal", icon: "🔩" },
    { name: "Concrete Works", nameAr: "أعمال خرسانة", slug: "concrete", icon: "🏢" },
    { name: "Landscaping", nameAr: "تنسيق حدائق", slug: "landscaping", icon: "🌿" },
    { name: "Interior Design", nameAr: "تصميم داخلي", slug: "interior-design", icon: "🏠" },
    { name: "Waterproofing", nameAr: "عزل مائي", slug: "waterproofing", icon: "💧" },
    { name: "Demolition", nameAr: "هدم وإزالة", slug: "demolition", icon: "🏚️" },
    { name: "Road & Infrastructure", nameAr: "طرق وبنية تحتية", slug: "road-infrastructure", icon: "🛣️" },
    { name: "Fire Safety", nameAr: "أنظمة إطفاء وسلامة", slug: "fire-safety", icon: "🔥" },
    { name: "Elevator & Escalator", nameAr: "مصاعد وسلالم كهربائية", slug: "elevator", icon: "🛗" },
    { name: "Glass & Aluminum", nameAr: "زجاج وألمنيوم", slug: "glass-aluminum", icon: "🪟" },
    { name: "Maintenance", nameAr: "صيانة عامة", slug: "maintenance", icon: "🛠️" },
  ];

  for (let i = 0; i < categories.length; i++) {
    await prisma.category.upsert({
      where: { slug: categories[i].slug },
      update: {},
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
    { name: "Riyadh Region", nameAr: "منطقة الرياض", slug: "riyadh-region", cities: [
      { name: "Riyadh", nameAr: "الرياض", slug: "riyadh" },
      { name: "Diriyah", nameAr: "الدرعية", slug: "diriyah" },
      { name: "Kharj", nameAr: "الخرج", slug: "kharj" },
    ]},
    { name: "Makkah Region", nameAr: "منطقة مكة المكرمة", slug: "makkah-region", cities: [
      { name: "Makkah", nameAr: "مكة المكرمة", slug: "makkah" },
      { name: "Jeddah", nameAr: "جدة", slug: "jeddah" },
      { name: "Taif", nameAr: "الطائف", slug: "taif" },
    ]},
    { name: "Eastern Region", nameAr: "المنطقة الشرقية", slug: "eastern-region", cities: [
      { name: "Dammam", nameAr: "الدمام", slug: "dammam" },
      { name: "Khobar", nameAr: "الخبر", slug: "khobar" },
      { name: "Dhahran", nameAr: "الظهران", slug: "dhahran" },
      { name: "Jubail", nameAr: "الجبيل", slug: "jubail" },
    ]},
    { name: "Madinah Region", nameAr: "منطقة المدينة المنورة", slug: "madinah-region", cities: [
      { name: "Madinah", nameAr: "المدينة المنورة", slug: "madinah" },
      { name: "Yanbu", nameAr: "ينبع", slug: "yanbu" },
    ]},
    { name: "Asir Region", nameAr: "منطقة عسير", slug: "asir-region", cities: [
      { name: "Abha", nameAr: "أبها", slug: "abha" },
      { name: "Khamis Mushait", nameAr: "خميس مشيط", slug: "khamis-mushait" },
    ]},
    { name: "Qassim Region", nameAr: "منطقة القصيم", slug: "qassim-region", cities: [
      { name: "Buraidah", nameAr: "بريدة", slug: "buraidah" },
      { name: "Unaizah", nameAr: "عنيزة", slug: "unaizah" },
    ]},
    { name: "Tabuk Region", nameAr: "منطقة تبوك", slug: "tabuk-region", cities: [
      { name: "Tabuk", nameAr: "تبوك", slug: "tabuk" },
      { name: "NEOM", nameAr: "نيوم", slug: "neom" },
    ]},
    { name: "Hail Region", nameAr: "منطقة حائل", slug: "hail-region", cities: [
      { name: "Hail", nameAr: "حائل", slug: "hail" },
    ]},
    { name: "Jazan Region", nameAr: "منطقة جازان", slug: "jazan-region", cities: [
      { name: "Jazan", nameAr: "جازان", slug: "jazan" },
    ]},
  ];

  let locationCount = 0;
  for (const r of regions) {
    const region = await prisma.location.upsert({
      where: { slug: r.slug },
      update: {},
      create: { name: r.name, nameAr: r.nameAr, slug: r.slug, type: "region", parentId: saudi.id, sortOrder: locationCount },
    });
    locationCount++;
    for (let j = 0; j < r.cities.length; j++) {
      await prisma.location.upsert({
        where: { slug: r.cities[j].slug },
        update: {},
        create: { ...r.cities[j], type: "city", parentId: region.id, sortOrder: j },
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
  console.log(`✅ ${MANAGED_CONTENT_PAGES.length} managed content pages created`);

  console.log("\n🎉 Database seeded successfully!");
  console.log("📧 Admin login: admin@linexforsa.com / Admin@123456");
}

main()
  .catch((e) => { console.error("❌ Seed failed:", e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); await pool.end(); });
