// Run: npx tsx prisma/seed-test-data.ts
// Adds 5 test projects with different types + test users + bids + messages

import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
const adapter = new PrismaPg(pool);
const db = new PrismaClient({ adapter } as any);

async function main() {
  console.log("🌱 Seeding test data...");

  // Create test owner
  const ownerHash = await bcrypt.hash("Test@123456", 12);
  const owner = await db.user.upsert({
    where: { email: "owner@test.com" },
    update: {},
    create: { email: "owner@test.com", passwordHash: ownerHash, role: "OWNER", status: "ACTIVE" },
  });
  await db.ownerProfile.upsert({
    where: { userId: owner.id },
    update: {},
    create: {
      userId: owner.id,
      fullName: "Ahmed Al-Fahad",
      fullNameAr: "أحمد الفهد",
      legalName: "Ahmed Al-Fahad",
      legalNameAr: "أحمد الفهد",
      phone: "+966501234567",
      city: "Riyadh",
      companyType: "individual",
    },
  });

  // Create test contractor
  const contractor = await db.user.upsert({
    where: { email: "contractor@test.com" },
    update: {},
    create: { email: "contractor@test.com", passwordHash: ownerHash, role: "CONTRACTOR", status: "ACTIVE" },
  });
  const contProfile = await db.contractorProfile.upsert({
    where: { userId: contractor.id },
    update: {},
    create: {
      userId: contractor.id,
      companyName: "Saudi Build Co",
      companyNameAr: "شركة البناء السعودية",
      legalName: "Saudi Build Co",
      legalNameAr: "شركة البناء السعودية",
      companyCr: "CR-TEST-0001",
      phone: "+966509876543",
      city: "Jeddah",
      verificationStatus: "VERIFIED",
      yearsInBusiness: 8,
      teamSize: 25,
    },
  });

  // Create test engineer
  const engineer = await db.user.upsert({
    where: { email: "engineer@test.com" },
    update: {},
    create: { email: "engineer@test.com", passwordHash: ownerHash, role: "ENGINEER", status: "ACTIVE" },
  });
  const engProfile = await db.engineerProfile.upsert({
    where: { userId: engineer.id },
    update: {},
    create: {
      userId: engineer.id,
      fullName: "Sara Al-Otaibi",
      fullNameAr: "سارة العتيبي",
      legalName: "Sara Al-Otaibi",
      legalNameAr: "سارة العتيبي",
      phone: "+966551112233",
      specialization: "DESIGNER",
      yearsExperience: 6,
    },
  });

  // Get first category and location
  const category = await db.category.findFirst();
  const location = await db.location.findFirst();

  // 5 Test Projects
  const projects = [
    { title: "Villa Construction in Riyadh", titleAr: "بناء فيلا في الرياض", type: "CONSTRUCTION_ONLY", status: "PUBLISHED", desc: "Complete villa construction project in Al-Nakheel district, Riyadh. 3 floors, modern design, swimming pool.", descAr: "مشروع بناء فيلا كاملة في حي النخيل بالرياض. 3 طوابق، تصميم حديث، مسبح.", budget: 850000 },
    { title: "Interior Design for Office", titleAr: "تصميم داخلي لمكتب", type: "DESIGN_ONLY", status: "PUBLISHED", desc: "Modern interior design for a 500 sqm office space in Jeddah. Open plan layout with meeting rooms.", descAr: "تصميم داخلي حديث لمساحة مكتب 500 م² في جدة. تصميم مفتوح مع غرف اجتماعات.", budget: 150000 },
    { title: "Warehouse Renovation", titleAr: "تجديد مستودع", type: "CONSTRUCTION_ONLY", status: "BIDDING", desc: "Renovation of existing 2000 sqm warehouse. New flooring, electrical systems, loading docks.", descAr: "تجديد مستودع قائم بمساحة 2000 م². أرضيات جديدة، أنظمة كهربائية، منصات تحميل.", budget: 320000 },
    { title: "Residential Complex Design & Build", titleAr: "تصميم وبناء مجمع سكني", type: "DESIGN_AND_CONSTRUCTION", status: "PUBLISHED", desc: "Full design and construction of a 12-unit residential complex in Dammam. Modern architecture with landscaping.", descAr: "تصميم وبناء مجمع سكني من 12 وحدة في الدمام. عمارة حديثة مع تنسيق حدائق.", budget: 4500000 },
    { title: "Restaurant Kitchen Setup", titleAr: "تجهيز مطبخ مطعم", type: "CONSTRUCTION_ONLY", status: "PENDING_REVIEW", desc: "Complete kitchen setup for a new restaurant in Taif. Ventilation, plumbing, electrical, and equipment installation.", descAr: "تجهيز مطبخ كامل لمطعم جديد في الطائف. تهوية، سباكة، كهرباء، وتركيب معدات.", budget: 280000 },
  ];

  for (const p of projects) {
    const project = await db.project.create({
      data: {
        title: p.title, titleAr: p.titleAr, slug: p.title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") + "-" + Date.now(),
        description: p.desc, descriptionAr: p.descAr,
        projectType: p.type as any, status: p.status as any,
        budgetMin: p.budget * 0.8, budgetMax: p.budget * 1.2,
        ownerId: (await db.ownerProfile.findUnique({ where: { userId: owner.id } }))!.id,
        categoryId: category?.id, locationId: location?.id,
        publishedAt: p.status !== "PENDING_REVIEW" ? new Date() : null,
      },
    });

    // Add bids to published/bidding projects
    if (["PUBLISHED", "BIDDING"].includes(p.status) && p.type !== "DESIGN_ONLY") {
      await db.bid.create({
        data: {
          projectId: project.id, contractorId: contProfile.id,
          amount: p.budget * 0.95, proposalText: `We can complete ${p.title} within budget and on time. Our team of ${contProfile.teamSize} experts is ready.`,
          status: "SUBMITTED", submittedAt: new Date(),
        },
      });
    }

    // Note: Engineers bid via engineer_profiles FK — skipped in seed for simplicity

    // Add test messages
    if (p.status === "PUBLISHED") {
      await db.message.create({ data: { senderId: contractor.id, receiverId: owner.id, projectId: project.id, content: `Hello, I am interested in ${p.title}. Can you share more details about the timeline?` } });
      await db.message.create({ data: { senderId: owner.id, receiverId: contractor.id, projectId: project.id, content: `Thank you for your interest! The expected timeline is 6-8 months. Please submit your bid.` } });
      await db.message.create({ data: { senderId: contractor.id, receiverId: owner.id, projectId: project.id, content: `Great, I will prepare a detailed proposal and submit it shortly. Do you have any specific material preferences?` } });
    }

    console.log(`  ✅ Project: ${p.title} (${p.type} / ${p.status})`);
  }

  // Notify admin
  const admin = await db.user.findFirst({ where: { role: "ADMIN" } });
  if (admin) {
    await db.notification.create({
      data: { userId: admin.id, type: "GENERAL", title: "Test data seeded", titleAr: "تم إضافة بيانات اختبارية", message: "5 test projects with bids and messages have been added.", messageAr: "تم إضافة 5 مشاريع اختبارية مع عروض ورسائل." },
    });
  }

  console.log("\n✅ Test data seeded successfully!");
  console.log("  - 3 test users (owner@test.com, contractor@test.com, engineer@test.com)");
  console.log("  - 5 projects (3 PUBLISHED, 1 BIDDING, 1 PENDING_REVIEW)");
  console.log("  - Multiple bids and chat messages");
  console.log("  - Password for all: Test@123456");
}

main().catch(console.error).finally(() => db.$disconnect());
