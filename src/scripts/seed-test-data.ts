// Seed script for testing bid/award workflow end-to-end
// Run: npx tsx src/scripts/seed-test-data.ts

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
  console.log("🌱 Seeding bid/award workflow test data...\n");
  const hash = await bcrypt.hash("Test@123456", 12);

  // 1. Test contractor
  const contractor = await db.user.upsert({
    where: { email: "test-contractor@test.com" },
    update: {},
    create: { email: "test-contractor@test.com", passwordHash: hash, role: "CONTRACTOR", status: "ACTIVE" },
  });
  const contProfile = await db.contractorProfile.upsert({
    where: { userId: contractor.id },
    update: {},
    create: {
      userId: contractor.id,
      companyName: "Test Build LLC",
      companyNameAr: "شركة البناء التجريبية",
      legalName: "Test Build LLC",
      legalNameAr: "شركة البناء التجريبية",
      companyCr: "CR-TEST-0002",
      phone: "+966500000001",
      city: "Riyadh",
      verificationStatus: "VERIFIED",
      yearsInBusiness: 5,
      teamSize: 15,
    },
  });
  console.log("✅ Contractor: test-contractor@test.com / Test@123456");

  // 2. Ensure owner exists (reuse existing or create)
  const owner = await db.user.upsert({
    where: { email: "owner@test.com" },
    update: {},
    create: { email: "owner@test.com", passwordHash: hash, role: "OWNER", status: "ACTIVE" },
  });
  const ownerProfile = await db.ownerProfile.upsert({
    where: { userId: owner.id },
    update: {},
    create: {
      userId: owner.id,
      fullName: "Test Owner",
      fullNameAr: "مالك تجريبي",
      legalName: "Test Owner",
      legalNameAr: "مالك تجريبي",
      phone: "+966500000002",
      city: "Riyadh",
      companyType: "individual",
    },
  });
  console.log("✅ Owner: owner@test.com / Test@123456");

  // 3. Test project (published, bidding status)
  const category = await db.category.findFirst();
  const location = await db.location.findFirst();
  const slug = "test-bid-workflow-" + Date.now();

  const project = await db.project.create({
    data: {
      title: "Test Bid/Award Workflow Project", titleAr: "مشروع اختبار سير العمل",
      slug, description: "Project for testing the full bid → award → execution workflow.",
      descriptionAr: "مشروع لاختبار سير العمل الكامل: تقديم عرض ← ترسية ← تنفيذ.",
      projectType: "CONSTRUCTION_ONLY", status: "BIDDING",
      budgetMin: 200000, budgetMax: 350000,
      ownerId: ownerProfile.id,
      categoryId: category?.id || undefined,
      locationId: location?.id || undefined,
      publishedAt: new Date(),
    },
  });
  console.log(`✅ Project: "${project.title}" (status: BIDDING)`);

  // 4. Test bid from contractor
  const bid = await db.bid.upsert({
    where: { projectId_contractorId: { projectId: project.id, contractorId: contProfile.id } },
    update: {},
    create: {
      projectId: project.id, contractorId: contProfile.id,
      amount: 280000, proposalText: "We can deliver this project in 4 months with premium materials and experienced team.",
      status: "SUBMITTED", submittedAt: new Date(),
    },
  });
  console.log(`✅ Bid: ${bid.amount.toLocaleString()} SAR from Test Build LLC`);

  // 5. Test message thread
  await db.message.create({
    data: { senderId: contractor.id, receiverId: owner.id, projectId: project.id, content: "Hello, I submitted my bid. Looking forward to discussing details." },
  });
  await db.message.create({
    data: { senderId: owner.id, receiverId: contractor.id, projectId: project.id, content: "Thank you! I will review your proposal and get back to you." },
  });
  console.log("✅ Sample messages created");

  console.log("\n🎉 Bid/Award workflow test data ready!");
  console.log("   Login as owner@test.com to review/award");
  console.log("   Login as test-contractor@test.com to see bid status");
  console.log("   Password for all: Test@123456");
  console.log(`   Project ID: ${project.id}`);
}

main()
  .catch((e) => { console.error("❌ Seed failed:", e); process.exit(1); })
  .finally(() => db.$disconnect());
