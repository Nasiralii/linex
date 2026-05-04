import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { uploadFile } from "@/lib/storage";
import { getContractorApplicationStatus, getEngineerApplicationStatus, getOwnerApplicationStatus } from "@/lib/application-status";

function normalizePhoneInput(value: string) {
  const arabicIndic = "٠١٢٣٤٥٦٧٨٩";
  const easternIndic = "۰۱۲۳۴۵۶۷۸۹";
  let normalized = (value || "")
    .split("")
    .map((char) => {
      const arabicIndex = arabicIndic.indexOf(char);
      if (arabicIndex >= 0) return String(arabicIndex);
      const easternIndex = easternIndic.indexOf(char);
      if (easternIndex >= 0) return String(easternIndex);
      return char;
    })
    .join("")
    .replace(/\s+/g, "")
    .replace(/[^0-9+]/g, "");

  if (normalized.startsWith("+966")) normalized = `0${normalized.slice(4)}`;
  if (normalized.startsWith("966")) normalized = `0${normalized.slice(3)}`;
  if (normalized.startsWith("5")) normalized = `0${normalized}`;

  return normalized.slice(0, 10);
}

async function notifyAdminsAboutReadyApplication(userId: string, title: string, titleAr: string, message: string, messageAr: string) {
  const admins = await db.user.findMany({ where: { role: "ADMIN" }, select: { id: true } });
  if (admins.length === 0) return;

  await db.notification.createMany({
    data: admins.map((admin) => ({
      userId: admin.id,
      type: "GENERAL",
      title,
      titleAr,
      message,
      messageAr,
      link: "/admin/users",
    })),
  });
}

function getSubmissionPayload(status: { isComplete: boolean; nextVerificationStatus: string }) {
  return {
    profileComplete: status.isComplete,
    verificationStatus: status.nextVerificationStatus,
    submitted: status.isComplete && status.nextVerificationStatus === "PENDING",
  };
}

function formatUploadErrorLabel(documentType: string) {
  return documentType.replace(/_/g, " ");
}

const MAX_DOCS_PER_TYPE = 5;

function normalizeWebsiteInput(value: unknown) {
  const raw = String(value || "").trim();
  if (!raw) return undefined;
  if (/^https?:\/\//i.test(raw)) return raw;
  if (/^www\./i.test(raw)) return `https://${raw}`;
  if (/^[\w.-]+\.[a-z]{2,}(\/.*)?$/i.test(raw)) return `https://${raw}`;
  return raw;
}

// Gap 7: Profile update API
export async function PUT(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const contentType = request.headers.get("content-type") || "";
    const isMultipart = contentType.includes("multipart/form-data");
    const formData = isMultipart ? await request.formData() : null;
    const rawData = formData
      ? Object.fromEntries(formData.entries())
      : await request.json();

    const data: Record<string, any> = { ...rawData };
    data.phone = normalizePhoneInput(String(data.phone || ""));
    data.website = normalizeWebsiteInput(data.website);

    if (!data.legalName || !String(data.legalName).trim()) {
      return NextResponse.json({ success: false, error: "Legal name in English is required" }, { status: 400 });
    }
    if (!data.legalNameAr || !String(data.legalNameAr).trim()) {
      return NextResponse.json({ success: false, error: "Legal name in Arabic is required" }, { status: 400 });
    }
    if (!data.phone) {
      return NextResponse.json({ success: false, error: "Phone number is required" }, { status: 400 });
    }
    if (!/^05\d{8}$/.test(data.phone)) {
      return NextResponse.json({ success: false, error: "Please enter a valid Saudi phone number" }, { status: 400 });
    }
    if (!data.city || !String(data.city).trim()) {
      return NextResponse.json({ success: false, error: "City is required" }, { status: 400 });
    }

    const avatarFile = formData?.get("avatar") as File | null;
    if (avatarFile && avatarFile.size > 0) {
      const uploadedAvatar = await uploadFile(avatarFile, "avatars", user.id);
      if (!uploadedAvatar.error && uploadedAvatar.url) {
        await db.user.update({ where: { id: user.id }, data: { avatarUrl: uploadedAvatar.url } });
      }
    }

    if (user.role === "OWNER") {
      const currentProfile = await db.ownerProfile.findUnique({ where: { userId: user.id } });
      const updatedProfile = await db.ownerProfile.update({
        where: { userId: user.id },
        data: {
          fullName: data.legalName || data.fullName || undefined,
          fullNameAr: data.legalNameAr || data.fullNameAr || undefined,
          legalName: data.legalName || undefined,
          legalNameAr: data.legalNameAr || undefined,
          companyCr: data.companyCr || undefined,
          phone: data.phone || undefined,
          city: data.city || undefined,
          region: data.region || undefined,
          bio: data.bio || undefined,
          bioAr: data.bioAr || undefined,
          projectPreferences: data.projectPreferences || undefined,
          companyName: data.companyName || undefined,
          companyNameAr: data.companyNameAr || undefined,
        },
      });
      const status = getOwnerApplicationStatus(updatedProfile);
      // BUG-14: Preserve current status if already PENDING or VERIFIED — don't trigger re-approval on minor edits
      const shouldPreserveStatus = currentProfile?.verificationStatus === "PENDING" || currentProfile?.verificationStatus === "VERIFIED";
      const newVerificationStatus = shouldPreserveStatus && status.isComplete ? currentProfile.verificationStatus : status.nextVerificationStatus;
      await db.ownerProfile.update({
        where: { userId: user.id },
        data: {
          profileComplete: status.isComplete,
          verificationStatus: newVerificationStatus,
        },
      });

      if (status.isComplete && (!currentProfile?.profileComplete || currentProfile?.verificationStatus !== "PENDING" || !!currentProfile?.rejectionReason)) {
        await notifyAdminsAboutReadyApplication(
          user.id,
          "New user registration",
          "تسجيل مستخدم جديد",
          `${updatedProfile.fullName} (OWNER) completed profile and needs review.`,
          `${updatedProfile.fullNameAr || updatedProfile.fullName} (مالك) أكمل الملف ويحتاج مراجعة.`
        );
      }

      return NextResponse.json({ success: true, ...getSubmissionPayload(status), missingFields: status.missingFields, missingDocuments: status.missingDocuments });
    } else if (user.role === "CONTRACTOR") {
      const currentProfile = await db.contractorProfile.findUnique({ where: { userId: user.id }, include: { documents: true } });
      const uploadErrors: string[] = [];
      const contractorProfile = await db.contractorProfile.update({
        where: { userId: user.id },
        data: {
          companyName: data.companyName || data.legalName || data.fullName || undefined,
          companyNameAr: data.companyNameAr || data.legalNameAr || data.fullNameAr || undefined,
          legalName: data.legalName || undefined,
          legalNameAr: data.legalNameAr || undefined,
          companyCr: data.companyCr || undefined,
          discipline: data.discipline || undefined,
          education: data.education || undefined,
          certifications: data.certifications || undefined,
          description: data.bio || undefined,
          descriptionAr: data.bioAr || undefined,
          phone: data.phone || undefined,
          city: data.city || undefined,
          region: data.region || undefined,
          serviceArea: data.serviceArea || undefined,
          website: data.website || undefined,
          yearsInBusiness: data.yearsInBusiness ? parseInt(data.yearsInBusiness) : undefined,
          teamSize: data.teamSize ? parseInt(data.teamSize) : undefined,
        },
      });

      if (formData) {
        const documentEntries = Array.from(formData.entries()).filter(([key, value]) => key.startsWith("doc_") && value instanceof File && value.size > 0) as [string, File][];
        const documentsByType = documentEntries.reduce<Record<string, File[]>>((acc, [key, file]) => {
          const documentType = key.replace("doc_", "");
          acc[documentType] = acc[documentType] || [];
          acc[documentType].push(file);
          return acc;
        }, {});

        for (const [documentType, files] of Object.entries(documentsByType)) {
          const uploadedFiles: Array<{ file: File; url: string }> = [];
          for (const file of files) {
            const uploaded = await uploadFile(file, `profile-documents/contractor/${contractorProfile.id}/${documentType}`, user.id);
            if (uploaded.error || !uploaded.url) {
              uploadErrors.push(`${formatUploadErrorLabel(documentType)}: ${uploaded.error || "Upload failed"}`);
              continue;
            }
            uploadedFiles.push({ file, url: uploaded.url });
          }

          if (uploadedFiles.length === 0) continue;

          const existingCount = (currentProfile?.documents || []).filter((doc: any) => doc.documentType === documentType).length;
          const remainingSlots = Math.max(0, MAX_DOCS_PER_TYPE - existingCount);
          const filesToPersist = uploadedFiles.slice(0, remainingSlots);
          if (filesToPersist.length === 0) {
            uploadErrors.push(`${formatUploadErrorLabel(documentType)}: Maximum ${MAX_DOCS_PER_TYPE} files allowed`);
            continue;
          }
          if (uploadedFiles.length > filesToPersist.length) {
            uploadErrors.push(`${formatUploadErrorLabel(documentType)}: Only ${MAX_DOCS_PER_TYPE} files are allowed`);
          }
          await db.contractorDocument.createMany({
            data: filesToPersist.map(({ file, url }) => ({
              contractorId: contractorProfile.id,
              documentType,
              fileName: file.name,
              fileUrl: url,
              fileSize: file.size,
              mimeType: file.type || null,
              uploadedAt: new Date(),
            })),
          });
        }

        const portfolioEntries = Array.from(formData.entries()).filter(([key, value]) => key === "portfolio" && value instanceof File && value.size > 0) as [string, File][];
        let sortOrder = 0;
        for (const [, file] of portfolioEntries) {
          const uploaded = await uploadFile(file, `portfolio/contractor/${contractorProfile.id}`, user.id);
          if (uploaded.error || !uploaded.url) {
            uploadErrors.push(`portfolio: ${uploaded.error || "Upload failed"}`);
            continue;
          }

          await db.portfolioItem.create({
            data: {
              contractorId: contractorProfile.id,
              fileName: file.name,
              fileUrl: uploaded.url,
              fileSize: file.size,
              mimeType: file.type || null,
              sortOrder: sortOrder++,
            },
          });
        }
      }

      // BUG-C02: Save selected trades
      const selectedTrades = data.selectedTrades ? JSON.parse(data.selectedTrades) : [];
      if (selectedTrades.length > 0) {
        await db.contractorCategory.deleteMany({ where: { contractorId: contractorProfile.id } });
        await db.contractorCategory.createMany({
          data: selectedTrades.map((catId: string) => ({
            contractorId: contractorProfile.id,
            categoryId: catId,
          })),
          skipDuplicates: true,
        });
      }

      const refreshedProfile = await db.contractorProfile.findUnique({ where: { userId: user.id }, include: { documents: true, portfolioItems: true, categories: true } });
      const status = getContractorApplicationStatus(refreshedProfile, refreshedProfile?.documents?.map((doc) => doc.documentType) || []);
      await db.contractorProfile.update({
        where: { userId: user.id },
        data: {
          profileComplete: status.isComplete,
          verificationStatus: status.nextVerificationStatus,
        },
      });

      if (status.isComplete && refreshedProfile && (!currentProfile?.profileComplete || currentProfile?.verificationStatus !== "PENDING" || !!currentProfile?.rejectionReason)) {
        await notifyAdminsAboutReadyApplication(
          user.id,
          "New user registration",
          "تسجيل مستخدم جديد",
          `${refreshedProfile.companyName} (CONTRACTOR) completed profile and needs review.`,
          `${refreshedProfile.companyNameAr || refreshedProfile.companyName} (مقاول) أكمل الملف ويحتاج مراجعة.`
        );
      }

      return NextResponse.json({ success: true, ...getSubmissionPayload(status), missingFields: status.missingFields, missingDocuments: status.missingDocuments, uploadErrors });
    } else if (user.role === "ENGINEER") {
      const currentProfile = await db.engineerProfile.findUnique({ where: { userId: user.id }, include: { documents: true } });
      const uploadErrors: string[] = [];
      const engineerProfile = await db.engineerProfile.update({
        where: { userId: user.id },
        data: {
          fullName: data.legalName || data.fullName || undefined,
          fullNameAr: data.legalNameAr || data.fullNameAr || undefined,
          legalName: data.legalName || undefined,
          legalNameAr: data.legalNameAr || undefined,
          companyCr: data.companyCr || undefined,
          description: data.bio || undefined,
          descriptionAr: data.bioAr || undefined,
          phone: data.phone || undefined,
          city: data.city || undefined,
          region: data.region || undefined,
          website: data.website || undefined,
          serviceArea: data.serviceArea || undefined,
          specialization: data.specialization || undefined,
          discipline: data.discipline || undefined,
          education: data.education || undefined,
          certifications: data.certifications || undefined,
          yearsExperience: data.yearsInBusiness ? parseInt(data.yearsInBusiness) : undefined,
        },
      });

      if (formData) {
        const documentEntries = Array.from(formData.entries()).filter(([key, value]) => key.startsWith("doc_") && value instanceof File && value.size > 0) as [string, File][];
        const documentsByType = documentEntries.reduce<Record<string, File[]>>((acc, [key, file]) => {
          const documentType = key.replace("doc_", "");
          acc[documentType] = acc[documentType] || [];
          acc[documentType].push(file);
          return acc;
        }, {});

        for (const [documentType, files] of Object.entries(documentsByType)) {
          const uploadedFiles: Array<{ file: File; url: string }> = [];
          for (const file of files) {
            const uploaded = await uploadFile(file, `profile-documents/engineer/${engineerProfile.id}/${documentType}`, user.id);
            if (uploaded.error || !uploaded.url) {
              uploadErrors.push(`${formatUploadErrorLabel(documentType)}: ${uploaded.error || "Upload failed"}`);
              continue;
            }
            uploadedFiles.push({ file, url: uploaded.url });
          }

          if (uploadedFiles.length === 0) continue;

          const existingCount = (currentProfile?.documents || []).filter((doc: any) => doc.documentType === documentType).length;
          const remainingSlots = Math.max(0, MAX_DOCS_PER_TYPE - existingCount);
          const filesToPersist = uploadedFiles.slice(0, remainingSlots);
          if (filesToPersist.length === 0) {
            uploadErrors.push(`${formatUploadErrorLabel(documentType)}: Maximum ${MAX_DOCS_PER_TYPE} files allowed`);
            continue;
          }
          if (uploadedFiles.length > filesToPersist.length) {
            uploadErrors.push(`${formatUploadErrorLabel(documentType)}: Only ${MAX_DOCS_PER_TYPE} files are allowed`);
          }

          await db.engineerDocument.createMany({
            data: filesToPersist.map(({ file, url }) => ({
              engineerId: engineerProfile.id,
              documentType,
              fileName: file.name,
              fileUrl: url,
              fileSize: file.size,
              mimeType: file.type || null,
              uploadedAt: new Date(),
            })),
          });
        }

        const portfolioEntries = Array.from(formData.entries()).filter(([key, value]) => key === "portfolio" && value instanceof File && value.size > 0) as [string, File][];
        let sortOrder = 0;
        for (const [, file] of portfolioEntries) {
          const uploaded = await uploadFile(file, `portfolio/engineer/${engineerProfile.id}`, user.id);
          if (uploaded.error || !uploaded.url) {
            uploadErrors.push(`portfolio: ${uploaded.error || "Upload failed"}`);
            continue;
          }

          await db.portfolioItem.create({
            data: {
              engineerId: engineerProfile.id,
              fileName: file.name,
              fileUrl: uploaded.url,
              fileSize: file.size,
              mimeType: file.type || null,
              sortOrder: sortOrder++,
            },
          });
        }
      }

      const refreshedProfile = await db.engineerProfile.findUnique({ where: { userId: user.id }, include: { documents: true } });
      const status = getEngineerApplicationStatus(refreshedProfile, refreshedProfile?.documents.map((doc) => doc.documentType) || []);
      const shouldPreserveStatus = currentProfile?.verificationStatus === "PENDING" || currentProfile?.verificationStatus === "VERIFIED";
      const newVerificationStatus = shouldPreserveStatus && status.isComplete ? currentProfile.verificationStatus : status.nextVerificationStatus;
      await db.engineerProfile.update({
        where: { userId: user.id },
        data: {
          profileComplete: status.isComplete,
          verificationStatus: newVerificationStatus,
        },
      });

      if (status.isComplete && refreshedProfile && (!currentProfile?.profileComplete || currentProfile?.verificationStatus !== "PENDING" || !!currentProfile?.rejectionReason)) {
        await notifyAdminsAboutReadyApplication(
          user.id,
          "New user registration",
          "تسجيل مستخدم جديد",
          `${refreshedProfile.fullName} (ENGINEER) completed profile and needs review.`,
          `${refreshedProfile.fullNameAr || refreshedProfile.fullName} (مهندس) أكمل الملف ويحتاج مراجعة.`
        );
      }

      return NextResponse.json({ success: true, ...getSubmissionPayload(status), missingFields: status.missingFields, missingDocuments: status.missingDocuments, uploadErrors });
    }

    return NextResponse.json({ success: true, profileComplete: false, verificationStatus: null, submitted: false, missingFields: [], missingDocuments: [], uploadErrors: [] });
  } catch (error: any) {
    console.error("Profile update error:", error);
    return NextResponse.json({ success: false, error: "Profile update failed" }, { status: 500 });
  }
}
