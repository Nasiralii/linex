import type { ContractorProfile, EngineerProfile, OwnerProfile } from "@prisma/client";

type VerificationStatus = "DRAFT" | "PENDING" | "VERIFIED" | "REJECTED" | "SUSPENDED";

const CONTRACTOR_REQUIRED_DOCUMENTS = ["commercial_reg", "trade_license", "insurance", "tax_file", "bank_doc"];
const ENGINEER_REQUIRED_DOCUMENTS = ["eng_license", "education", "prof_insurance", "certifications", "gov_id"];

function hasText(value: unknown) {
  return typeof value === "string" && value.trim().length > 0;
}

function hasSaudiPhone(value: unknown) {
  return typeof value === "string" && /^05\d{8}$/.test(value.trim());
}

function hasPositiveNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

export function getOwnerApplicationStatus(profile: Partial<OwnerProfile> | null | undefined) {
  const missingFields: string[] = [];
  if (!hasText(profile?.fullName)) missingFields.push("fullName");
  if (!hasText(profile?.legalName)) missingFields.push("legalName");
  if (!hasSaudiPhone(profile?.phone)) missingFields.push("phone");
  if (!hasText(profile?.city)) missingFields.push("city");
  if (!hasText(profile?.companyType)) missingFields.push("companyType");

  // BUG-14: Only set to PENDING on first completion, not on subsequent edits
  // If already PENDING or VERIFIED, keep current status unless fields become incomplete
  return {
    isComplete: missingFields.length === 0,
    missingFields,
    missingDocuments: [] as string[],
    nextVerificationStatus: (missingFields.length === 0 ? "PENDING" : "DRAFT") as VerificationStatus,
  };
}

export function getContractorApplicationStatus(
  profile: Partial<ContractorProfile> | null | undefined,
  documentTypes: string[] = []
) {
  const missingFields: string[] = [];
  if (!hasText(profile?.companyName)) missingFields.push("companyName");
  if (!hasText(profile?.legalName)) missingFields.push("legalName");
  if (!hasText(profile?.companyCr)) missingFields.push("companyCr");
  if (!hasSaudiPhone(profile?.phone)) missingFields.push("phone");
  if (!hasText(profile?.city)) missingFields.push("city");
  if (!hasText(profile?.description)) missingFields.push("description");
  if (!hasPositiveNumber(profile?.yearsInBusiness)) missingFields.push("yearsInBusiness");

  const uploaded = new Set(documentTypes);
  const missingDocuments = CONTRACTOR_REQUIRED_DOCUMENTS.filter((doc) => !uploaded.has(doc));

  return {
    isComplete: missingFields.length === 0 && missingDocuments.length === 0,
    missingFields,
    missingDocuments,
    nextVerificationStatus: (missingFields.length === 0 && missingDocuments.length === 0 ? "PENDING" : "DRAFT") as VerificationStatus,
  };
}

export function getEngineerApplicationStatus(
  profile: Partial<EngineerProfile> | null | undefined,
  documentTypes: string[] = []
) {
  const missingFields: string[] = [];
  if (!hasText(profile?.fullName)) missingFields.push("fullName");
  if (!hasText(profile?.legalName)) missingFields.push("legalName");
  if (!hasSaudiPhone(profile?.phone)) missingFields.push("phone");
  if (!hasText(profile?.city)) missingFields.push("city");
  if (!hasText(profile?.specialization)) missingFields.push("specialization");
  if (!hasText(profile?.discipline)) missingFields.push("discipline");
  if (!hasText(profile?.description)) missingFields.push("description");
  if (!hasPositiveNumber(profile?.yearsExperience)) missingFields.push("yearsExperience");
  if (!hasText(profile?.education)) missingFields.push("education");
  if (!hasText(profile?.certifications)) missingFields.push("certifications");

  const uploaded = new Set(documentTypes);
  const missingDocuments = ENGINEER_REQUIRED_DOCUMENTS.filter((doc) => !uploaded.has(doc));

  return {
    isComplete: missingFields.length === 0 && missingDocuments.length === 0,
    missingFields,
    missingDocuments,
    nextVerificationStatus: (missingFields.length === 0 && missingDocuments.length === 0 ? "PENDING" : "DRAFT") as VerificationStatus,
  };
}
