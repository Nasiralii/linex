"use client";

import { useLocale } from "next-intl";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "@/i18n/routing";
import { aiTranslateProfileTextAction } from "../../auth/actions";
import {
  User, Building2, Save, Loader2, AlertCircle, CheckCircle, Phone, MapPin, Award,
  Upload, FileText, X, Camera, Briefcase, Shield, Clock, Image as ImageIcon,
} from "lucide-react";
import { calculateProfileScore } from "@/lib/ai";

// G6-G10: Full profile page rebuild with document uploads, avatar, portfolio

async function loadProfile() {
  const res = await fetch("/api/auth/me");
  if (!res.ok) return null;
  return res.json();
}

async function loadCategories() {
  const res = await fetch("/api/categories");
  if (!res.ok) return [];
  const data = await res.json();
  return data.categories || [];
}

async function updateProfile(data: any) {
  const res = await fetch("/api/profile", {
    method: "PUT",
    body: data,
  });
  const raw = await res.text();
  try {
    return JSON.parse(raw || "{}");
  } catch {
    const payloadTooLarge = res.status === 413 || raw.includes("Request Entity Too Large") || raw.includes("FUNCTION_PAYLOAD_TOO_LARGE");
    return {
      success: false,
      error: payloadTooLarge
        ? "Upload payload too large. Please save engineer documents in smaller batches (one file at a time if needed)."
        : "Unexpected server response. Please try again.",
    };
  }
}

const MAX_UPLOAD_SIZE_MB = 10;
const ALLOWED_DOC_EXTENSIONS = ["pdf", "jpg", "jpeg", "png", "doc", "docx"];
const ALLOWED_DOC_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

function getFileExtension(fileName: string) {
  return fileName.split(".").pop()?.toLowerCase() || "";
}

function formatDocumentLabel(documentType: string, isRtl: boolean) {
  const labels: Record<string, { ar: string; en: string }> = {
    commercial_reg: { ar: "السجل التجاري", en: "Commercial Registration" },
    company_profile: { ar: "ملف تعريف الشركة", en: "Company Profile" },
    trade_license: { ar: "الرخصة التجارية", en: "Business License" },
    insurance: { ar: "شهادة التأمين", en: "Insurance Certificate" },
    tax_file: { ar: "الملف الضريبي", en: "Tax File" },
    bank_doc: { ar: "الوثيقة البنكية", en: "Bank Document" },
    eng_license: { ar: "الرخصة الهندسية", en: "Engineering License" },
    education: { ar: "المؤهلات التعليمية", en: "Educational Credentials" },
    prof_insurance: { ar: "التأمين المهني", en: "Professional Insurance" },
    certifications: { ar: "الشهادات", en: "Certifications" },
    gov_id: { ar: "الهوية الحكومية", en: "Government ID" },
  };
  const label = labels[documentType];
  return label ? (isRtl ? label.ar : label.en) : documentType.replace(/_/g, " ");
}

function validateSelectedFile(file: File, isRtl: boolean) {
  const ext = getFileExtension(file.name);
  const typeAllowed = !file.type || ALLOWED_DOC_MIME_TYPES.includes(file.type) || ALLOWED_DOC_EXTENSIONS.includes(ext);
  if (!typeAllowed) {
    return isRtl
      ? `الملف ${file.name} غير مقبول. الصيغ المسموحة: PDF, JPG, PNG, DOC, DOCX`
      : `File ${file.name} is not allowed. Allowed formats: PDF, JPG, PNG, DOC, DOCX`;
  }
  if (file.size > MAX_UPLOAD_SIZE_MB * 1024 * 1024) {
    return isRtl
      ? `الملف ${file.name} أكبر من ${MAX_UPLOAD_SIZE_MB}MB`
      : `File ${file.name} is larger than ${MAX_UPLOAD_SIZE_MB}MB`;
  }
  return "";
}

function normalizeWebsiteInput(value: string) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (/^https?:\/\//i.test(raw)) return raw;
  if (/^www\./i.test(raw)) return `https://${raw}`;
  if (/^[\w.-]+\.[a-z]{2,}(\/.*)?$/i.test(raw)) return `https://${raw}`;
  return raw;
}

function normalizePhoneInput(value: string) {
  const arabicIndic = "٠١٢٣٤٥٦٧٨٩";
  const easternIndic = "۰۱۲۳۴۵۶۷۸۹";
  let normalized = value
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
  if (normalized && !normalized.startsWith("05")) normalized = normalized.replace(/^0*/, "").slice(0, 9).padStart(Math.min(normalized.length, 10), "0");

  return normalized.slice(0, 10);
}

export default function ProfilePage() {
  const locale = useLocale();
  const router = useRouter();
  const isRtl = locale === "ar";
  const localizedMarketplacePath = `/${locale}/marketplace`;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [profile, setProfile] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("info");
  const [form, setForm] = useState<any>({});

  // Document upload refs
  const avatarRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [documents, setDocuments] = useState<Record<string, File[]>>({});
  const [existingDocuments, setExistingDocuments] = useState<any[]>([]); // BUG-C04: Existing docs from DB
  const [portfolioImages, setPortfolioImages] = useState<File[]>([]);
  const [existingPortfolioItems, setExistingPortfolioItems] = useState<any[]>([]);
  const portfolioRef = useRef<HTMLInputElement>(null);
  const [translatingBio, setTranslatingBio] = useState(false);
  // BUG-C02: Trade/specialties multi-select
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedTrades, setSelectedTrades] = useState<string[]>([]);

  // Calculate profile score using AI utility
  const getProfileScore = () => {
    if (!profile) return { score: 0, badges: [] as string[], tips: [] as string[] };
    if (profile?.role === "ENGINEER" && profile?.profile?.profileComplete) {
      return { score: 100, badges: ["VERIFIED"], tips: [] as string[] };
    }
    const p = profile.profile || {};
    const result = calculateProfileScore(p);
    // Translate tips to Arabic if needed
    const translatedTips = isRtl
      ? result.tips.map(tip => {
          if (tip.includes("name")) return "أضف اسمك";
          if (tip.includes("phone")) return "أضف رقم الجوال";
          if (tip.includes("city")) return "اختر المدينة";
          if (tip.includes("bio")) return "أضف نبذة عنك";
          if (tip.includes("experience")) return "أضف سنوات الخبرة";
          if (tip.includes("verification")) return "أكمل التحقق";
          if (tip.includes("website")) return "أضف موقعك";
          if (tip.includes("longer bio")) return "اكتب نبذة أطول (100+ حرف)";
          return tip;
        })
      : result.tips;
    return { score: result.score, badges: result.badges, tips: translatedTips.slice(0, 4) };
  };

  const syncUploadedAssetsFromServer = async () => {
    const freshProfile = await loadProfile();
    if (!freshProfile) return;
    setProfile(freshProfile);
    if (freshProfile.avatarUrl || freshProfile.profile?.avatarUrl) {
      setAvatarPreview(freshProfile.avatarUrl || freshProfile.profile?.avatarUrl);
    }
    setExistingDocuments(freshProfile.profile?.documents || []);
    setExistingPortfolioItems(freshProfile.profile?.portfolioItems || []);
  };

  useEffect(() => {
    Promise.all([loadProfile(), loadCategories()]).then(([data, cats]) => {
      if (!data) {
        router.replace("/");
        return;
      }

      setProfile(data);
      setCategories(cats);
      setForm({
        fullName: data.profile?.fullName || data.profile?.legalName || data.profile?.companyName || "",
        fullNameAr: data.profile?.fullNameAr || data.profile?.legalNameAr || data.profile?.companyNameAr || "",
        legalName: data.profile?.legalName || "",
        legalNameAr: data.profile?.legalNameAr || "",
        companyCr: data.profile?.companyCr || "",
        phone: data.profile?.phone || "",
        city: data.profile?.city || "",
        region: data.profile?.region || "",
        bio: data.profile?.description || data.profile?.bio || data.profile?.descriptionAr || data.profile?.bioAr || "",
        bioAr: data.profile?.descriptionAr || data.profile?.bioAr || data.profile?.description || data.profile?.bio || "",
        companyName: data.profile?.companyName || "",
        companyNameAr: data.profile?.companyNameAr || "",
        yearsInBusiness: data.profile?.yearsInBusiness || data.profile?.yearsExperience || "",
        teamSize: data.profile?.teamSize || "",
        serviceArea: data.profile?.serviceArea || "",
        website: data.profile?.website || "",
        specialization: data.profile?.specialization || "DESIGNER",
        discipline: data.profile?.discipline || "",
        education: data.profile?.education || "",
        certifications: data.profile?.certifications || "",
        companyType: data.profile?.companyType || "individual",
        projectPreferences: data.profile?.projectPreferences || "",
      });
      // BUG-C02: Load existing trades from contractor categories
      if (data.profile?.categories) {
        setSelectedTrades(data.profile.categories.map((c: any) => c.categoryId));
      }
      if (data.avatarUrl || data.profile?.avatarUrl) setAvatarPreview(data.avatarUrl || data.profile?.avatarUrl);
      // BUG-C04: Load existing documents from DB
      if (data.profile?.documents) setExistingDocuments(data.profile.documents);
      if (data.profile?.portfolioItems) setExistingPortfolioItems(data.profile.portfolioItems);
      setLoading(false);
    });
  }, [router]);

  const handleBioBlur = async () => {
    const source = (form.bio || "").trim();
    if (!source) return;
    setTranslatingBio(true);
    const result = await aiTranslateProfileTextAction(source, isRtl ? "ar" : "en");
    if (result.success && result.translated) {
      setForm((prev: any) => ({
        ...prev,
        bio: source,
        bioAr: isRtl ? source : result.translated,
        descriptionMirror: isRtl ? result.translated : source,
      }));
    }
    setTranslatingBio(false);
  };

  const redirectToMarketplace = () => {
    router.replace("/marketplace");
    router.refresh();

    if (typeof window !== "undefined") {
      window.setTimeout(() => {
        if (window.location.pathname.includes("/dashboard/profile")) {
          window.location.assign(localizedMarketplacePath);
        }
      }, 250);
    }
  };

  const validateRequiredFields = () => {
    if (!String(form.legalName || "").trim()) return isRtl ? "الاسم القانوني باللغة الإنجليزية مطلوب" : "Legal name in English is required";
    if (!String(form.legalNameAr || "").trim()) return isRtl ? "الاسم القانوني باللغة العربية مطلوب" : "Legal name in Arabic is required";
    if (!String(form.phone || "").trim()) return isRtl ? "رقم الجوال مطلوب" : "Phone number is required";
    if (!/^05\d{8}$/.test(normalizePhoneInput(String(form.phone || "")))) return isRtl ? "يرجى إدخال رقم سعودي صحيح يبدأ بـ 05 ويتكون من 10 أرقام" : "Please enter a valid Saudi phone number starting with 05 and 10 digits long";
    if (!String(form.city || "").trim()) return isRtl ? "المدينة مطلوبة" : "City is required";
    return "";
  };

  const getMissingFieldLabel = (field: string) => {
    const labels: Record<string, { ar: string; en: string }> = {
      fullName: { ar: "الاسم", en: "Name" },
      legalName: { ar: "الاسم القانوني بالإنجليزية", en: "Legal name in English" },
      phone: { ar: "رقم الجوال", en: "Phone number" },
      city: { ar: "المدينة", en: "City" },
      companyType: { ar: "نوع الحساب", en: "Account type" },
      companyName: { ar: "اسم الشركة", en: "Company name" },
      companyCr: { ar: "رقم السجل التجاري", en: "Commercial registration number" },
      description: { ar: "النبذة / الوصف", en: "Bio / description" },
      projectPreferences: { ar: "تفضيلات المشاريع", en: "Project preferences" },
      yearsInBusiness: { ar: "سنوات الخبرة", en: "Years in business" },
      specialization: { ar: "التخصص", en: "Specialization" },
      discipline: { ar: "التخصص الهندسي", en: "Discipline" },
      yearsExperience: { ar: "سنوات الخبرة", en: "Years of experience" },
      education: { ar: "التعليم", en: "Education" },
      certifications: { ar: "الشهادات", en: "Certifications" },
    };
    return isRtl ? (labels[field]?.ar || field) : (labels[field]?.en || field);
  };

  const getMissingDocumentLabel = (doc: string) => {
    const match = docCategories.find((item) => item.key === doc);
    return match ? (isRtl ? match.label : match.labelEn) : doc;
  };

  const buildIncompleteMessage = (missingFields: string[] = [], missingDocuments: string[] = []) => {
    const parts: string[] = [];
    if (missingFields.length > 0) {
      parts.push(
        `${isRtl ? "البيانات الناقصة" : "Missing fields"}: ${missingFields.map(getMissingFieldLabel).join(isRtl ? "، " : ", ")}`
      );
    }
    if (missingDocuments.length > 0) {
      parts.push(
        `${isRtl ? "الوثائق الناقصة" : "Missing documents"}: ${missingDocuments.map(getMissingDocumentLabel).join(isRtl ? "، " : ", ")}`
      );
    }
    return parts.join(isRtl ? " — " : " — ");
  };

  const getStepBlockingMessage = (result: any) => {
    if (result.uploadErrors?.length) {
      return result.uploadErrors.join(isRtl ? "، " : "; ");
    }

    if (activeTab === "docs" && result.missingDocuments?.length) {
      return `${isRtl ? "لم يتم اعتماد رفع الوثائق المطلوبة بعد" : "The required documents were not accepted yet"}: ${result.missingDocuments.map(getMissingDocumentLabel).join(isRtl ? "، " : ", ")}`;
    }

    if (activeTab === "info" && result.missingFields?.length) {
      return `${isRtl ? "ما زالت هناك بيانات ناقصة أو غير صالحة" : "Some required fields are still missing or invalid"}: ${result.missingFields.map(getMissingFieldLabel).join(isRtl ? "، " : ", ")}`;
    }

    return "";
  };

  const validateCurrentStep = () => {
    if (activeTab === "info") {
      const baseError = validateRequiredFields();
      if (baseError) return baseError;

      if (form.website && !/^https?:\/\//i.test(normalizeWebsiteInput(String(form.website)))) {
        return isRtl ? "اكتب رابط الموقع بشكل صحيح مثل https://example.com أو www.example.com" : "Enter a valid website like https://example.com or www.example.com";
      }

      if (isOwner && !String(form.companyType || "").trim()) {
        return isRtl ? "اختر نوع الحساب" : "Please choose account type";
      }

      if (isContractor) {
        if (!String(form.companyName || "").trim()) return isRtl ? "اسم الشركة مطلوب" : "Company name is required";
        if (!String(form.companyCr || "").trim()) return isRtl ? "رقم السجل التجاري مطلوب" : "Commercial registration number is required";
        if (!String(form.bio || form.bioAr || "").trim()) return isRtl ? "النبذة مطلوبة" : "Bio / description is required";
        if (!(Number(form.yearsInBusiness) > 0)) return isRtl ? "سنوات الخبرة يجب أن تكون أكبر من صفر" : "Years in business must be greater than zero";
      }

      if (isEngineer) {
        if (!String(form.specialization || "").trim()) return isRtl ? "التخصص مطلوب" : "Specialization is required";
        if (!String(form.discipline || "").trim()) return isRtl ? "التخصص الهندسي مطلوب" : "Discipline is required";
        if (!String(form.bio || form.bioAr || "").trim()) return isRtl ? "النبذة مطلوبة" : "Bio / description is required";
        if (!(Number(form.yearsInBusiness) > 0)) return isRtl ? "سنوات الخبرة يجب أن تكون أكبر من صفر" : "Years of experience must be greater than zero";
        if (!String(form.education || "").trim()) return isRtl ? "التعليم مطلوب" : "Education is required";
        if (!String(form.certifications || "").trim()) return isRtl ? "الشهادات مطلوبة" : "Certifications are required";
      }
    }

    if (activeTab === "docs" && docCategories.length > 0) {
      const missingDocs = docCategories.filter((cat) => !(documents[cat.key] || []).length);
      if (missingDocs.length > 0) {
        return `${isRtl ? "ارفع الوثائق المطلوبة قبل المتابعة" : "Upload the required documents before continuing"}: ${missingDocs.map((doc) => isRtl ? doc.label : doc.labelEn).join(isRtl ? "، " : ", ")}`;
      }
    }

    return "";
  };

  const handleSave = async (continueToNext = false) => {
    setSaving(true); setError(""); setSuccess("");
    try {
      const stepError = validateCurrentStep();
      if (stepError) {
        setError(stepError);
        setSaving(false);
        return;
      }

      const buildPayload = () => {
        const payload = new FormData();
        const normalizedPhone = normalizePhoneInput(String(form.phone || ""));
        Object.entries(form).forEach(([key, value]) => {
          if (value !== undefined && value !== null) payload.append(key, String(value));
        });
        payload.set("phone", normalizedPhone);
        payload.set("fullName", String(form.legalName || "").trim());
        payload.set("fullNameAr", String(form.legalNameAr || "").trim());
        payload.set("legalName", String(form.legalName || "").trim());
        payload.set("legalNameAr", String(form.legalNameAr || "").trim());
        payload.set("website", normalizeWebsiteInput(String(form.website || "")));
        payload.set("bio", isRtl ? String(form.bioAr || form.bio || "") : String(form.bio || ""));
        payload.set("bioAr", isRtl ? String(form.bio || "") : String(form.bioAr || form.bio || ""));
        if (selectedTrades.length > 0) {
          payload.set("selectedTrades", JSON.stringify(selectedTrades));
        }
        return payload;
      };

      const engineerFileBatches: Array<{ key: string; file: File }> = [];
      if (isEngineer) {
        Object.entries(documents).forEach(([category, files]) => {
          files.forEach((file) => engineerFileBatches.push({ key: `doc_${category}`, file }));
        });
        portfolioImages.slice(0, 5).forEach((file) => engineerFileBatches.push({ key: "portfolio", file }));
      }

      let result: any;
      if (isEngineer && engineerFileBatches.length > 0) {
        let aggregatedUploadErrors: string[] = [];
        for (let i = 0; i < engineerFileBatches.length; i++) {
          const payload = buildPayload();
          const batch = engineerFileBatches[i];
          if (i === 0 && avatarFile) payload.append("avatar", avatarFile);
          payload.append(batch.key, batch.file);
          const batchResult = await updateProfile(payload);
          if (!batchResult?.success) {
            result = batchResult;
            break;
          }
          if (batchResult?.uploadErrors?.length) aggregatedUploadErrors = aggregatedUploadErrors.concat(batchResult.uploadErrors);
          result = { ...batchResult, uploadErrors: aggregatedUploadErrors };
        }
      } else {
        const payload = buildPayload();
        if (avatarFile) payload.append("avatar", avatarFile);
        Object.entries(documents).forEach(([category, files]) => {
          files.forEach((file) => payload.append(`doc_${category}`, file));
        });
        portfolioImages.slice(0, 5).forEach((file) => payload.append("portfolio", file));
        result = await updateProfile(payload);
      }

      if (result.success) {
        const stepBlockingMessage = getStepBlockingMessage(result);
        if (stepBlockingMessage) {
          setError(stepBlockingMessage);
          setSaving(false);
          return;
        }

        const nextTab = continueToNext ? nextTabId(activeTab) : null;
        const isFinalSubmit = continueToNext && !nextTab;

        if (isFinalSubmit) {
          if (result.submitted) {
            await syncUploadedAssetsFromServer();
            setDocuments({});
            setPortfolioImages([]);
            setAvatarFile(null);
            setSuccess(isRtl ? "تم إرسال طلبك بنجاح، وسيتم تحويلك إلى السوق" : "Your application has been submitted successfully. Redirecting to marketplace...");
            setTimeout(() => {
              redirectToMarketplace();
            }, 900);
          } else {
            setError(buildIncompleteMessage(result.missingFields, result.missingDocuments) || (isRtl ? "تم حفظ البيانات لكن الطلب لم يُرسل بعد. أكمل جميع الحقول والوثائق المطلوبة." : "Your data was saved, but the application was not submitted yet. Please complete all required fields and documents."));
          }
        } else {
          await syncUploadedAssetsFromServer();
          setDocuments({});
          setPortfolioImages([]);
          setAvatarFile(null);
          setSuccess(continueToNext ? (isRtl ? "تم الحفظ والانتقال للخطوة التالية" : "Saved successfully. Moving to the next step") : (isRtl ? "تم حفظ الملف الشخصي بنجاح" : "Profile saved successfully"));
          if (nextTab) setActiveTab(nextTab);
        }
      }
      else setError(result.error || "Failed to save");
    } catch (e: any) { setError(e?.message || "Error"); }
    setSaving(false);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const addDocument = (category: string, files: FileList | null) => {
    if (!files) return;
    const selected = Array.from(files);
    const invalidMessage = selected.map((file) => validateSelectedFile(file, isRtl)).find(Boolean);
    if (invalidMessage) {
      setError(invalidMessage);
      return;
    }
    setError("");
    setDocuments(prev => ({
      ...prev,
      [category]: [...(prev[category] || []), ...selected].slice(0, 5),
    }));
  };

  const removeDocument = (category: string, index: number) => {
    setDocuments(prev => ({
      ...prev,
      [category]: (prev[category] || []).filter((_, i) => i !== index),
    }));
  };

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", padding: "4rem" }}>
      <Loader2 className="animate-spin" style={{ width: "32px", height: "32px", color: "var(--primary)" }} />
    </div>
  );

  const role = profile?.role;
  const isContractor = role === "CONTRACTOR";
  const isEngineer = role === "ENGINEER";
  const isOwner = role === "OWNER";
  const verificationStatus = profile?.profile?.verificationStatus;
  const profileComplete = profile?.profile?.profileComplete;

  // Document categories per role
  const docCategories = isContractor ? [
    { key: "commercial_reg", label: "سجل تجاري", labelEn: "Commercial Registration" },
    { key: "company_profile", label: "ملف تعريف الشركة", labelEn: "Company Profile" },
    { key: "trade_license", label: "الرخصة التجارية", labelEn: "Business License" },
    { key: "insurance", label: "شهادة تأمين", labelEn: "Insurance Certificate" },
    { key: "tax_file", label: "ملف ضريبي", labelEn: "Tax File" },
    { key: "bank_doc", label: "وثيقة بنكية", labelEn: "Bank Account Document" },
  ] : isEngineer ? [
    { key: "eng_license", label: "رخصة هندسية", labelEn: "Engineering License" },
    { key: "education", label: "شهادات أكاديمية", labelEn: "Educational Credentials" },
    { key: "prof_insurance", label: "تأمين مهني", labelEn: "Professional Insurance" },
    { key: "certifications", label: "شهادات مهنية", labelEn: "Certifications" },
    { key: "gov_id", label: "هوية حكومية", labelEn: "Government ID" },
  ] : [];

  const tabs = [
    { id: "info", label: isRtl ? "المعلومات الأساسية" : "Basic Info", icon: User },
    ...(docCategories.length > 0 ? [{ id: "docs", label: isRtl ? "الوثائق" : "Documents", icon: FileText }] : []),
    ...(!isOwner ? [{ id: "portfolio", label: isRtl ? "أعمال سابقة" : "Portfolio", icon: Briefcase }] : []),
  ];

  const activeStepIndex = tabs.findIndex((tab) => tab.id === activeTab);
  const isLastStep = activeStepIndex === tabs.length - 1;

  const nextTabId = (tabId: string) => {
    const currentIndex = tabs.findIndex((tab) => tab.id === tabId);
    return currentIndex >= 0 && currentIndex < tabs.length - 1 ? tabs[currentIndex + 1].id : null;
  };

  return (
    <div style={{ background: "var(--bg)", minHeight: "calc(100vh - 64px)" }}>
      <div style={{ background: "linear-gradient(135deg, #0a4e41, #0f6b57)", padding: "2rem 0" }}>
        <div className="container-app" style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
          {/* G8: Avatar upload */}
          <div style={{ position: "relative" }}>
            <div onClick={() => avatarRef.current?.click()} style={{
              width: "80px", height: "80px", borderRadius: "50%", overflow: "hidden", cursor: "pointer",
              background: avatarPreview ? `url(${avatarPreview}) center/cover` : "rgba(255,255,255,0.15)",
              display: "flex", alignItems: "center", justifyContent: "center",
              border: "3px solid rgba(255,255,255,0.3)",
            }}>
              {!avatarPreview && <Camera style={{ width: "28px", height: "28px", color: "rgba(255,255,255,0.6)" }} />}
            </div>
            <input ref={avatarRef} type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: "none" }} />
            <div style={{
              position: "absolute", bottom: "0", right: "0", width: "24px", height: "24px", borderRadius: "50%",
              background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center",
              border: "2px solid white",
            }}>
              <Camera style={{ width: "12px", height: "12px", color: "white" }} />
            </div>
          </div>
          <div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "white" }}>
              {isRtl ? "الملف الشخصي" : "My Profile"}
            </h1>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.25rem",flexWrap: "wrap" }}>
              <span style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.7)" }}>{profile?.email}</span>
              <span style={{ padding: "0.125rem 0.5rem", borderRadius: "var(--radius-full)", background: "rgba(255,255,255,0.15)", fontSize: "0.6875rem", color: "white" }}>
                {isOwner ? (isRtl ? "مالك مشروع" : "Owner") : isContractor ? (isRtl ? "مقاول" : "Contractor") : (isRtl ? "مهندس" : "Engineer")}
              </span>
              {verificationStatus && (
                <span style={{
                  padding: "0.125rem 0.5rem", borderRadius: "var(--radius-full)", fontSize: "0.6875rem",
                  background: verificationStatus === "VERIFIED" ? "rgba(16,185,129,0.2)" : verificationStatus === "PENDING" ? "rgba(245,158,11,0.2)" : "rgba(59,130,246,0.15)",
                  color: verificationStatus === "VERIFIED" ? "#10b981" : verificationStatus === "PENDING" ? "#f59e0b" : "#2563eb",
                }}>
                  {verificationStatus === "VERIFIED"
                    ? (isRtl ? "✓ موثّق" : "✓ Verified")
                    : verificationStatus === "PENDING"
                      ? (isRtl ? "⏳ بانتظار التحقق" : "⏳ Pending")
                      : (isRtl ? "📝 مسودة - أكمل الطلب" : "📝 Draft - complete application")}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* AI Profile Score Card */}
      {!isOwner && profile && (() => {
        const { score, badges, tips } = getProfileScore();
        const scoreColor = score >= 70 ? "var(--primary)" : score >= 40 ? "var(--accent)" : "var(--error)";
        return (
          <div style={{ background: "var(--surface)", borderBottom: "1px solid var(--border-light)", padding: "1rem 0" }}>
            <div className="container-app flex items-center gap-3 flex-wrap">
              {/* Score circle */}
              <div style={{ position: "relative", width: "60px", height: "60px", flexShrink: 0 }}>
                <svg width="60" height="60" viewBox="0 0 60 60">
                  <circle cx="30" cy="30" r="26" fill="none" stroke="var(--border-light)" strokeWidth="4" />
                  <circle cx="30" cy="30" r="26" fill="none" stroke={scoreColor} strokeWidth="4"
                    strokeDasharray={`${score * 1.63} 163`} strokeLinecap="round"
                    transform="rotate(-90 30 30)" />
                </svg>
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", fontWeight: 800, color: scoreColor }}>
                  {score}
                </div>
              </div>
              {/* Score info */}
              <div style={{ flex: 1}}>
                <div style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--text)", marginBottom: "0.25rem" }}>
                  {isRtl ? "تصنيف الملف الشخصي" : "Profile Quality Score"}
                </div>
                {/* Badges */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.25rem", marginBottom: "0.25rem" }}>
                  {badges.map(b => {
                    const badgeStyles: Record<string, { bg: string; color: string; label: string; labelAr: string }> = {
                      VERIFIED: { bg: "var(--primary-light)", color: "var(--primary)", label: "✓ Verified", labelAr: "✓ موثّق" },
                      EXPERIENCED: { bg: "var(--info-light)", color: "var(--info)", label: "⭐ Experienced", labelAr: "⭐ خبير" },
                      HIGHLY_RATED: { bg: "var(--accent-light)", color: "var(--accent)", label: "🌟 Highly Rated", labelAr: "🌟 تقييم عالي" },
                      TRUSTED: { bg: "var(--info-light)", color: "var(--info)", label: "🤝 Trusted", labelAr: "🤝 موثوق" },
                      FAST_RESPONSE: { bg: "#fff3e0", color: "#e65100", label: "⚡ Fast Response", labelAr: "⚡ استجابة سريعة" },
                      PREMIUM: { bg: "#f3e5f5", color: "#7b1fa2", label: "💎 Premium", labelAr: "💎 مميز" },
                      NEW: { bg: "#e3f2fd", color: "#1565c0", label: "🆕 New", labelAr: "🆕 جديد" },
                    };
                    const s = badgeStyles[b] || { bg: "var(--info-light)", color: "var(--info)", label: b, labelAr: b };
                    return (
                      <span key={b} style={{
                        padding: "0.125rem 0.5rem", borderRadius: "var(--radius-full)", fontSize: "0.625rem", fontWeight: 700,
                        background: s.bg, color: s.color,
                      }}>
                        {isRtl ? s.labelAr : s.label}
                      </span>
                    );
                  })}
                </div>
              </div>
              {/* Tips */}
              {tips.length > 0 && (
                <div style={{ fontSize: "0.6875rem", color: "var(--text-muted)", maxWidth: "250px" }}>
                  <div style={{ fontWeight: 600, marginBottom: "0.125rem" }}>{isRtl ? "💡 لتحسين تصنيفك:" : "💡 To improve:"}</div>
                  {tips.map((t, i) => <div key={i}>• {t}</div>)}
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* Wizard Steps */}
      <div style={{ background: "var(--surface)", borderBottom: "1px solid var(--border-light)" }}>
        <div className="container-app md:!p-6 !p-2 flex gap-4 flex-wrap">
          {tabs.map((tab, index) => {
            const isActive = activeTab === tab.id;
            const isCompleted = index < activeStepIndex;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.75rem 1rem",
                fontSize: "0.875rem", fontWeight: 700, fontFamily: "inherit", cursor: "pointer",
                border: isActive ? "2px solid var(--primary)" : "1px solid var(--border-light)",
                borderRadius: "var(--radius-lg)",
                background: isActive ? "var(--primary-light)" : isCompleted ? "#f0fdf4" : "var(--surface)",
                color: isActive ? "var(--primary)" : isCompleted ? "#15803d" : "var(--text-muted)",
              }}>
                <span style={{
                  width: "24px", height: "24px", borderRadius: "50%", display: "inline-flex", alignItems: "center", justifyContent: "center",
                  background: isActive ? "var(--primary)" : isCompleted ? "#16a34a" : "var(--surface-2)",
                  color: isActive || isCompleted ? "white" : "var(--text-muted)", fontSize: "0.75rem", fontWeight: 800,
                }}>
                  {isCompleted ? "✓" : index + 1}
                </span>
                <tab.icon style={{ width: "16px", height: "16px" }} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="container-app md:p-4 !pt-8 p-2" style={{maxWidth:"800px"}} >
        <div className="flex" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem", gap: "1rem", flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: "0.8125rem", color: "var(--text-muted)", fontWeight: 700 }}>
              {isRtl ? `الخطوة ${activeStepIndex + 1} من ${tabs.length}` : `Step ${activeStepIndex + 1} of ${tabs.length}`}
            </div>
            <div style={{ fontSize: "1rem", color: "var(--text)", fontWeight: 800, marginTop: "0.25rem" }}>
              {tabs[activeStepIndex]?.label}
            </div>
          </div>
          {/* <div className="" style={{ minWidth: "180px", flex: 1, maxWidth: "280px" }}>
            <div style={{ width: "100%", height: "8px", background: "var(--surface-2)", borderRadius: "999px", overflow: "hidden" }}>
              <div style={{ width: `${((activeStepIndex + 1) / tabs.length) * 100}%`, height: "100%", background: "linear-gradient(90deg, #0a4e41, #0f6b57)", borderRadius: "999px", transition: "width 0.25s ease" }} />
            </div>
          </div> */}
          <div className="min-w-[180px] flex-1 max-w-[280px]">
  <div className="flex w-full h-2 rounded-full overflow-hidden">
    {/* Completed - Green */}
    <div 
      className="h-full bg-[#0f6b57] transition-all duration-300"
      style={{ width: `${((activeStepIndex + 1) / tabs.length) * 100}%` }}
    />
    <div 
      className="h-full bg-gray-200"
      style={{ width: `${100 - ((activeStepIndex + 1) / tabs.length) * 100}%` }}
    />
  </div>
</div>
        </div>

        {!profileComplete && (
          <div style={{ padding: "1rem 1.25rem", borderRadius: "var(--radius-lg)", marginBottom: "1rem", background: "#fff7ed", color: "#9a3412", fontSize: "0.875rem", border: "1px solid #fdba74" }}>
            {isRtl
              ? "لن يتم إرسال طلبك إلى الإدارة إلا بعد إكمال جميع البيانات المطلوبة ورفع الوثائق الإلزامية."
              : "Your application will not be sent to admin until all required profile details and mandatory documents are completed."}
          </div>
        )}
        {error && (
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.75rem 1rem", borderRadius: "var(--radius-lg)", marginBottom: "1rem", background: "var(--error-light)", color: "var(--error)", fontSize: "0.875rem" }}>
            <AlertCircle style={{ width: "16px", height: "16px" }} /> {error}
          </div>
        )}
        {success && (
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.75rem 1rem", borderRadius: "var(--radius-lg)", marginBottom: "1rem", background: "var(--primary-light)", color: "var(--primary)", fontSize: "0.875rem" }}>
            <CheckCircle style={{ width: "16px", height: "16px" }} /> {success}
          </div>
        )}

        {/* TAB: Basic Info */}
        {activeTab === "info" && (
          <div className="card" style={{ padding: "1rem" }}>
            <div style={{ display: "grid", gap: "1.25rem" }}>
              {/* Owner type */}
              {isOwner && (
                <div>
                  <label>{isRtl ? "نوع الحساب" : "Account Type"}</label>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    {[{ id: "individual", label: isRtl ? "👤 فرد" : "👤 Individual" }, { id: "company", label: isRtl ? "🏢 شركة" : "🏢 Company" }].map(t => (
                      <button key={t.id} onClick={() => setForm((p: any) => ({ ...p, companyType: t.id }))} style={{
                        padding: "0.5rem 1rem", borderRadius: "var(--radius-full)", fontFamily: "inherit",
                        border: form.companyType === t.id ? "2px solid var(--primary)" : "1px solid var(--border)",
                        background: form.companyType === t.id ? "var(--primary)" : "var(--surface)",
                        color: form.companyType === t.id ? "white" : "var(--text)",
                        fontSize: "0.8125rem", fontWeight: 600, cursor: "pointer",
                      }}>{t.label}</button>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-2">
                <div>
                  <label>
                    {isOwner
                      ? (form.companyType === "company"
                        ? (isRtl ? "الاسم كما في السجل التجاري (English)" : "Name as in Commercial Registration (English)")
                        : (isRtl ? "اسمك كما في الهوية/جواز/الإقامة (English)" : "Your name as in ID/Passport/Iqama (English)"))
                      : (isRtl ? "الاسم كما في السجل التجاري (English)" : "Name as in Commercial Registration (English)")}
                    <span style={{ color: "var(--error)" }}>*</span>
                  </label>
                  <input type="text" value={form.legalName} onChange={(e) => setForm((p: any) => ({ ...p, legalName: e.target.value, fullName: e.target.value }))} dir="ltr" />
               <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>
                    {isRtl ? "اكتب الاسم بالإنجليزية كما هو رسميًا، بدون ترجمة آلية" : "Type the official legal name in English manually"}
                  </div>
                </div>
                <div>
                  <label>
                    {isOwner
                      ? (form.companyType === "company"
                        ? (isRtl ? "الاسم كما في السجل التجاري (Arabic)" : "Name as in Commercial Registration (Arabic)")
                        : (isRtl ? "اسمك كما في الهوية/جواز/الإقامة (Arabic)" : "Your name as in ID/Passport/Iqama (Arabic)"))
                      : (isRtl ? "الاسم كما في السجل التجاري (Arabic)" : "Name as in Commercial Registration (Arabic)")}
                    <span style={{ color: "var(--error)" }}>*</span>
                  </label>
                  <input type="text" value={form.legalNameAr} onChange={(e) => setForm((p: any) => ({ ...p, legalNameAr: e.target.value, fullNameAr: e.target.value }))} dir="rtl" />
                 <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>
                    {isRtl ? "اكتب الاسم بالعربية كما هو رسميًا، بدون ترجمة آلية" : "Type the official legal name in Arabic manually"}
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-2">
                <div>
                  <label><Phone style={{ width: "14px", height: "14px", display: "inline" }} /> {isRtl ? "رقم الجوال" : "Phone"} <span style={{ color: "var(--error)" }}>*</span></label>
                  
                  <input 
                    type="tel" 
                    value={form.phone} 
                    onChange={(e) => {
                      const value = normalizePhoneInput(e.target.value);
                      setForm((p: any) => ({ ...p, phone: value }));
                    }} 
                    onBlur={(e) => {
                      const value = normalizePhoneInput(e.target.value);
                      setForm((p: any) => ({ ...p, phone: value }));
                      if (value && !/^05\d{8}$/.test(value)) {
                        setError(isRtl ? "يرجى إدخال رقم سعودي صحيح يبدأ بـ 05 ويتكون من 10 أرقام" : "Please enter a valid Saudi number starting with 05 and 10 digits long");
                      } else {
                        setError("");
                      }
                    }}
                    dir="ltr" 
                    placeholder="05XXXXXXXX" 
                    maxLength={10}
                  />
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>
                    {isRtl ? "أرقام سعودية فقط (مثال: 05xxxxxxxx)" : "Saudi numbers only (example: 05xxxxxxxx)"}
                  </div>
                </div>
                <div>
                  <label><MapPin style={{ width: "14px", height: "14px", display: "inline" }} /> {isRtl ? "المدينة" : "City"} <span style={{ color: "var(--error)" }}>*</span></label>
                  <select
                    value={form.city}
                    onChange={(e) => setForm((p: any) => ({ ...p, city: e.target.value }))}
                    dir={isRtl ? "rtl" : "ltr"}
                    style={{
                      textAlign: isRtl ? "right" : "left",
                      textAlignLast: isRtl ? "right" : "left",
                      direction: isRtl ? "rtl" : "ltr",
                    }}
                  >
                    <option value="">{isRtl ? "اختر المدينة" : "Select City"}</option>
                    {[
                      { en: "Riyadh", ar: "الرياض" },
                      { en: "Jeddah", ar: "جدة" },
                      { en: "Mecca", ar: "مكة المكرمة" },
                      { en: "Medina", ar: "المدينة المنورة" },
                      { en: "Dammam", ar: "الدمام" },
                      { en: "Khobar", ar: "الخبر" },
                      { en: "Dhahran", ar: "الظهران" },
                      { en: "Jubail", ar: "الجبيل" },
                      { en: "Tabuk", ar: "تبوك" },
                      { en: "Abha", ar: "أبها" },
                      { en: "Khamis Mushait", ar: "خميس مشيط" },
                      { en: "Taif", ar: "الطائف" },
                      { en: "Hail", ar: "حائل" },
                      { en: "Najran", ar: "نجران" },
                      { en: "Jazan", ar: "جازان" },
                      { en: "Yanbu", ar: "ينبع" },
                      { en: "Al Ahsa", ar: "الأحساء" },
                      { en: "Al Qatif", ar: "القطيف" },
                      { en: "Buraydah", ar: "بريدة" },
                      { en: "Unaizah", ar: "عنيزة" },
                      { en: "Al Kharj", ar: "الخرج" },
                      { en: "Sakaka", ar: "سكاكا" },
                      { en: "Arar", ar: "عرعر" },
                      { en: "Al Baha", ar: "الباحة" },
                      { en: "Bisha", ar: "بيشة" },
                      { en: "Al Majmaah", ar: "المجمعة" },
                      { en: "Hafar Al-Batin", ar: "حفر الباطن" },
                      { en: "Rabigh", ar: "رابغ" },
                      { en: "Al Qunfudhah", ar: "القنفذة" },
                    ].map(c => (
                      <option key={c.en} value={c.en}>{isRtl ? c.ar : c.en}</option>
                    ))}
                  </select>
                </div>
              </div>



              {/* Contractor-specific */}
              {isContractor && (
                <>
                  <div style={{ borderTop: "1px solid var(--border-light)", paddingTop: "1rem" }}>
                    <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text)", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <Building2 style={{ width: "18px", height: "18px" }} /> {isRtl ? "معلومات الشركة" : "Company Info"}
                    </h3>
                  </div>
                               <div className="grid md:grid-cols-2 gap-2">

                    <div><label>{isRtl ? "اسم الشركة" : "Company Name"}</label><input type="text" value={form.companyName} onChange={(e) => setForm((p: any) => ({ ...p, companyName: e.target.value }))} /></div>
                    <div><label>{isRtl ? "اسم الشركة (عربي)" : "Company (Arabic)"}</label><input type="text" value={form.companyNameAr} onChange={(e) => setForm((p: any) => ({ ...p, companyNameAr: e.target.value }))} dir="rtl" /></div>
                  </div>
                  <div>
                    <label>{isRtl ? "رقم السجل التجاري" : "Commercial Registration Number"}</label>
                    <input type="text" value={form.companyCr} onChange={(e) => setForm((p: any) => ({ ...p, companyCr: e.target.value }))} dir="ltr" />
                  </div>
                  {/* BUG-C02: Trade/specialties multi-select */}
                  {categories.length > 0 && (
                    <div>
                      <label>{isRtl ? "التخصصات / الأنشطة" : "Trades / Specialties"}</label>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.5rem" }}>
                        {isRtl ? "اختر التخصصات التي تقدمها شركتك" : "Select the trades your company offers"}
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                        {categories.filter((c: any) => !c.parentId).map((cat: any) => {
                          const isSelected = selectedTrades.includes(cat.id);
                          return (
                            <button key={cat.id} type="button" onClick={() => {
                              setSelectedTrades(prev => isSelected ? prev.filter(t => t !== cat.id) : [...prev, cat.id]);
                            }} style={{
                              padding: "0.375rem 0.75rem", borderRadius: "var(--radius-full)", fontFamily: "inherit",
                              border: isSelected ? "2px solid var(--primary)" : "1px solid var(--border)",
                              background: isSelected ? "var(--primary)" : "var(--surface)",
                              color: isSelected ? "white" : "var(--text)",
                              fontSize: "0.8125rem", fontWeight: 600, cursor: "pointer",
                            }}>
                              {isRtl ? cat.nameAr : cat.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                                <div className="grid md:grid-cols-2 gap-2">

                    <div><label>{isRtl ? "سنوات الخبرة" : "Years in Business"}</label><input type="number" value={form.yearsInBusiness} onChange={(e) => setForm((p: any) => ({ ...p, yearsInBusiness: e.target.value }))} dir="ltr" /></div>
                    <div><label>{isRtl ? "حجم الفريق" : "Team Size"}</label><input type="number" value={form.teamSize} onChange={(e) => setForm((p: any) => ({ ...p, teamSize: e.target.value }))} dir="ltr" /></div>
                  </div>
                  {/* BUG-C05: Add discipline, education, certifications to contractor */}
                                <div className="grid md:grid-cols-2 gap-2">

                    <div>
                      <label>{isRtl ? "التخصص الهندسي" : "Discipline"}</label>
                      <select value={form.discipline} onChange={(e) => setForm((p: any) => ({ ...p, discipline: e.target.value }))}>
                        <option value="">{isRtl ? "اختر" : "Select"}</option>
                        <option value="Civil">{isRtl ? "مدني" : "Civil"}</option>
                        <option value="Architectural">{isRtl ? "معماري" : "Architectural"}</option>
                        <option value="Electrical">{isRtl ? "كهربائي" : "Electrical"}</option>
                        <option value="Mechanical">{isRtl ? "ميكانيكي" : "Mechanical"}</option>
                        <option value="General">{isRtl ? "عام" : "General"}</option>
                      </select>
                    </div>
                    <div>
                      <label>{isRtl ? "التعليم" : "Education"}</label>
                      <input type="text" value={form.education} onChange={(e) => setForm((p: any) => ({ ...p, education: e.target.value }))} />
                    </div>
                  </div>
                  <div>
                    <label>{isRtl ? "الشهادات" : "Certifications"}</label>
                    <textarea value={form.certifications} onChange={(e) => setForm((p: any) => ({ ...p, certifications: e.target.value }))} style={{ minHeight: "60px", resize: "vertical" }} />
                  </div>
                  <div>
                    <label>{isRtl ? "الموقع الإلكتروني" : "Website"}</label>
                    <input type="url" value={form.website} onChange={(e) => setForm((p: any) => ({ ...p, website: e.target.value }))} onBlur={(e) => setForm((p: any) => ({ ...p, website: normalizeWebsiteInput(e.target.value) }))} dir="ltr" />
                   <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>
                      {isRtl ? "يمكنك كتابة www.test.com وسنحوّله تلقائيًا إلى رابط صالح" : "You can enter www.test.com and it will be converted automatically into a valid URL"}
                    </div>
                  </div>
                </>
              )}

              {/* Engineer-specific */}
              {isEngineer && (
                <>
                  <div style={{ borderTop: "1px solid var(--border-light)", paddingTop: "1rem" }}>
                    <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text)", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <Award style={{ width: "18px", height: "18px" }} /> {isRtl ? "معلومات المهندس" : "Engineer Info"}
                    </h3>
                  </div>
                                <div className="grid md:grid-cols-2 gap-2">

                    <div>
                      <label>{isRtl ? "التخصص" : "Specialization"}</label>
                      <select value={form.specialization} onChange={(e) => setForm((p: any) => ({ ...p, specialization: e.target.value }))}>
                        <option value="DESIGNER">{isRtl ? "مصمم" : "Designer"}</option>
                        <option value="SUPERVISOR">{isRtl ? "مشرف" : "Supervisor"}</option>
                        <option value="BOTH">{isRtl ? "كلاهما" : "Both"}</option>
                      </select>
                    </div>
                    <div>
                      <label>{isRtl ? "التخصص الهندسي" : "Discipline"}</label>
                      <select value={form.discipline} onChange={(e) => setForm((p: any) => ({ ...p, discipline: e.target.value }))}>
                        <option value="">{isRtl ? "اختر" : "Select"}</option>
                        <option value="Civil">{isRtl ? "مدني" : "Civil"}</option>
                        <option value="Architectural">{isRtl ? "معماري" : "Architectural"}</option>
                        <option value="Electrical">{isRtl ? "كهربائي" : "Electrical"}</option>
                        <option value="Mechanical">{isRtl ? "ميكانيكي" : "Mechanical"}</option>
                      </select>
                    </div>
                  </div>
                  <div><label>{isRtl ? "سنوات الخبرة" : "Years of Experience"}</label><input type="number" value={form.yearsInBusiness} onChange={(e) => setForm((p: any) => ({ ...p, yearsInBusiness: e.target.value }))} dir="ltr" /></div>
                  <div>
                    <label>{isRtl ? "منطقة الخدمة" : "Service Area"}</label>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>
                      {isRtl ? "المدن أو المناطق التي تقدم فيها خدماتك" : "Cities or regions where you provide your services"}
                    </div>
                    <input type="text" value={form.serviceArea || ""} onChange={(e) => setForm((p: any) => ({ ...p, serviceArea: e.target.value }))} placeholder={isRtl ? "مثال: الرياض، جدة، الدمام" : "e.g. Riyadh, Jeddah, Dammam"} />
                  </div>
                  <div><label>{isRtl ? "التعليم" : "Education"}</label><input type="text" value={form.education} onChange={(e) => setForm((p: any) => ({ ...p, education: e.target.value }))} /></div>
                  <div><label>{isRtl ? "الشهادات" : "Certifications"}</label><textarea value={form.certifications} onChange={(e) => setForm((p: any) => ({ ...p, certifications: e.target.value }))} style={{ minHeight: "60px", resize: "vertical" }} /></div>
                </>
              )}

              {/* Bio */}
              <div>
                <label>{isRtl ? "نبذة" : "Bio / Description"}</label>
               
                <textarea value={isRtl ? form.bioAr : form.bio} onChange={(e) => setForm((p: any) => isRtl ? ({ ...p, bioAr: e.target.value, bio: e.target.value }) : ({ ...p, bio: e.target.value }))} onBlur={handleBioBlur} style={{ minHeight: "80px", resize: "vertical" }} dir={isRtl ? "rtl" : "ltr"} />
                {translatingBio && <div style={{ fontSize: "0.75rem", color: "var(--accent)", marginTop: "0.25rem" }}>{isRtl ? "جاري إنشاء الترجمة..." : "Generating translation..."}</div>}
             <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>
                  {isRtl ? "أعطنا تفاصيل أكثر عن طبيعة عملك وخبراتك والمشاريع التي تميزك" : "Give us more details about your work, experience, and the projects that make you stand out"}
                </div>
              </div>

              {isOwner && (
                <div>
                  <label>{isRtl ? "تفضيلات المشاريع" : "Project Preferences"}</label>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>
                    {isRtl ? "نوع المشاريع أو المواقع أو الميزانيات التي تفضل العمل عليها" : "What project types, locations, or budget ranges you prefer to work on"}
                  </div>
                  <textarea value={form.projectPreferences || ""} onChange={(e) => setForm((p: any) => ({ ...p, projectPreferences: e.target.value }))} style={{ minHeight: "80px", resize: "vertical" }} dir={isRtl ? "rtl" : "ltr"} />
                </div>
              )}

              <button onClick={() => handleSave(true)} disabled={saving} className="btn-primary" style={{ width: "100%", padding: "0.875rem", fontSize: "0.9375rem" }}>
                {saving ? <Loader2 className="animate-spin" style={{ width: "18px", height: "18px" }} /> : <Save style={{ width: "18px", height: "18px" }} />}
                {isLastStep
                  ? (isRtl ? "حفظ وإرسال" : "Save and Submit")
                  : (isRtl ? "حفظ ومتابعة" : "Save and Continue")}
              </button>
            </div>
          </div>
        )}

        {/* TAB: Documents (G6 + G7) */}
        {activeTab === "docs" && (
          <div>
            <div className="card" style={{ padding: "1.5rem", marginBottom: "1rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                <Shield style={{ width: "18px", height: "18px", color: "var(--accent)" }} />
                <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text)" }}>
                  {isRtl ? "وثائق التحقق" : "Verification Documents"}
                </h3>
              </div>
              <p style={{ fontSize: "0.8125rem", color: "var(--text-muted)", marginBottom: "0" }}>
                {isRtl ? "ارفع الوثائق المطلوبة للتحقق من حسابك. سيتم مراجعتها من قبل الإدارة." : "Upload required documents for account verification. They will be reviewed by admin."}
              </p>
              <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.5rem", marginBottom: 0 }}>
                {isRtl ? "الصيغ المسموحة: PDF, JPG, PNG, DOC, DOCX — الحد الأقصى 10MB لكل ملف" : "Allowed formats: PDF, JPG, PNG, DOC, DOCX — max 10MB per file"}
              </p>
              {isContractor && (
                <p style={{ fontSize: "0.75rem", color: "var(--accent)", marginTop: "0.5rem", marginBottom: 0 }}>
                  {isRtl ? "الحد الأدنى المطلوب: السجل التجاري + ملف تعريف الشركة + شهادة VAT + شهادة IBAN البنكية." : "Minimum required: Commercial Registration + Company Profile + VAT Certificate + Company IBAN document."}
                </p>
              )}
            </div>

            {/* BUG-C04: Show existing documents from DB */}
            {existingDocuments.length > 0 && (
              <div className="card" style={{ padding: "1.25rem", marginBottom: "0.75rem", border: "1px solid var(--success)" }}>
                <div style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--success)", marginBottom: "0.5rem" }}>
                  {isRtl ? "✓ الوثائق المرفوعة سابقاً" : "✓ Previously Uploaded Documents"}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                  {existingDocuments.map((doc: any, i: number) => (
                    <a key={i} href={doc.fileUrl} target="_blank" rel="noopener" style={{
                      display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8125rem",
                      padding: "0.5rem 0.75rem", borderRadius: "var(--radius-md)", background: "var(--surface-2)",
                      color: "var(--primary)", textDecoration: "none",
                    }}>
                      <FileText style={{ width: "14px", height: "14px" }} />
                      <span style={{ flex: 1 }}>{formatDocumentLabel(doc.documentType, isRtl)}</span>
                      <span style={{ fontSize: "0.6875rem", color: "var(--text-muted)" }}>
                        {new Date(doc.uploadedAt).toLocaleDateString(isRtl ? "ar-SA" : "en-SA")}
                      </span>
                      <span className={`chip chip-${doc.status === "pending" ? "warning" : doc.status === "approved" ? "success" : "default"}`} style={{ fontSize: "0.625rem" }}>
                        {doc.status}
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {docCategories.map(cat => (
              <div key={cat.key} className="card" style={{ padding: "1.25rem", marginBottom: "0.75rem" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                  <div>
                    <div style={{ fontSize: "0.9375rem", fontWeight: 700, color: "var(--text)" }}>
                      {isRtl ? cat.label : cat.labelEn}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                      {isRtl ? cat.labelEn : cat.label}
                    </div>
                  </div>
                  <label style={{
                    display: "inline-flex", alignItems: "center", gap: "0.375rem",
                    padding: "0.5rem 1rem", borderRadius: "var(--radius-lg)",
                    border: "1px dashed var(--border)", background: "var(--surface-2)",
                    cursor: "pointer", fontSize: "0.8125rem", fontWeight: 600, color: "var(--primary)",
                  }}>
                    <Upload style={{ width: "14px", height: "14px" }} />
                    {isRtl ? "رفع ملف" : "Upload"}
                    <input type="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" multiple
                      onChange={(e) => addDocument(cat.key, e.target.files)} style={{ display: "none" }} />
                  </label>
                </div>

                {/* Uploaded files list */}
                {(documents[cat.key] || []).length > 0 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem", marginTop: "0.25rem" }}>
                    {(documents[cat.key] || []).map((file, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.375rem", fontSize: "0.75rem", color: "var(--text-muted)", padding: "0.25rem 0.5rem", background: "var(--surface-2)", borderRadius: "var(--radius-md)" }}>
                        <FileText style={{ width: "12px", height: "12px", color: "var(--primary)" }} />
                        <span style={{ flex: 1 }}>{file.name}</span>
                        <span style={{ color: "var(--text-muted)" }}>({(file.size / 1024).toFixed(0)} KB)</span>
                        <button onClick={() => removeDocument(cat.key, i)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--error)", display: "flex", padding: 0 }}>
                          <X style={{ width: "12px", height: "12px" }} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {(documents[cat.key] || []).length === 0 && (
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontStyle: "italic" }}>
                    {isRtl ? "لم يتم رفع ملفات بعد" : "No files uploaded yet"}
                  </div>
                )}
              </div>
            ))}

            {/* Submit documents button */}
            <button onClick={() => handleSave(true)} disabled={saving} className="btn-primary !mb-4" style={{ width: "100%", padding: "0.875rem", fontSize: "0.9375rem", marginTop: "0.5rem" }}>
              <Upload style={{ width: "18px", height: "18px" }} />
              {saving ? (isRtl ? "جارٍ الحفظ..." : "Saving...") : (isRtl ? "حفظ ومتابعة" : "Save and Continue")}
            </button>
          </div>
        )}

        {/* TAB: Portfolio (G9) */}
        {activeTab === "portfolio" && (
          <div>
            <div className="card" style={{ padding: "1.5rem", marginBottom: "1rem" }}>
              <div style={{ display: "flex",flexWrap:"wrap", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                <div>
                  <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <Briefcase style={{ width: "18px", height: "18px", color: "var(--accent)" }} />
                    {isRtl ? "أعمال سابقة" : "Portfolio / Past Projects"}
                  </h3>
                  <p style={{ fontSize: "0.8125rem", color: "var(--text-muted)", margin: "0.25rem 0 0" }}>
                    {isRtl ? "أضف صور وتفاصيل مشاريعك السابقة لجذب المزيد من العملاء" : "Add photos and details of past projects to attract more clients"}
                  </p>
                </div>
                <label style={{
                  display: "inline-flex", alignItems: "center", gap: "0.375rem",
                  padding: "0.5rem 1rem", borderRadius: "var(--radius-lg)",
                  border: "1px dashed var(--border)", background: "var(--surface-2)",
                  cursor: "pointer", fontSize: "0.8125rem", fontWeight: 600, color: "var(--primary)",
                }}>
                  <ImageIcon style={{ width: "14px", height: "14px" }} />
                  {isRtl ? "إضافة صور" : "Add Photos"}
                  <input ref={portfolioRef} type="file" accept="image/*" multiple
                    onChange={(e) => { if (e.target.files) setPortfolioImages(prev => [...prev, ...Array.from(e.target.files!)].slice(0, 5)); }}
                    style={{ display: "none" }} />
                </label>
              </div>
              <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", margin: 0 }}>
                {isRtl ? `يمكنك إضافة حتى 5 صور فقط (${portfolioImages.length}/5)` : `You can add up to 5 images only (${portfolioImages.length}/5)`}
              </p>
            </div>

            {existingPortfolioItems.length === 0 && portfolioImages.length === 0 ? (
              <div className="card" style={{ padding: "3rem", textAlign: "center" }}>
                <Briefcase style={{ width: "40px", height: "40px", color: "var(--text-muted)", margin: "0 auto 0.75rem" }} />
                <p style={{ fontSize: "0.9375rem", color: "var(--text-muted)" }}>
                  {isRtl ? "لا توجد أعمال سابقة بعد. أضف صور مشاريعك!" : "No portfolio projects yet. Add your project photos!"}
                </p>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "0.75rem" }}>
                {existingPortfolioItems.map((item: any, i: number) => (
                  <a key={`existing-${item.id || i}`} href={item.fileUrl} target="_blank" rel="noreferrer" style={{ position: "relative", borderRadius: "var(--radius-lg)", overflow: "hidden", aspectRatio: "4/3", background: "var(--surface-2)", textDecoration: "none" }}>
                    <img src={item.fileUrl} alt={item.fileName || `Portfolio ${i + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "0.25rem 0.5rem", background: "rgba(0,0,0,0.5)", fontSize: "0.6875rem", color: "white" }}>
                      {(item.fileName || `Portfolio ${i + 1}`).substring(0, 25)}
                    </div>
                  </a>
                ))}
                {portfolioImages.map((file, i) => (
                  <div key={i} style={{ position: "relative", borderRadius: "var(--radius-lg)", overflow: "hidden", aspectRatio: "4/3", background: "var(--surface-2)" }}>
                    <img src={URL.createObjectURL(file)} alt={`Portfolio ${i}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    <button onClick={() => setPortfolioImages(prev => prev.filter((_, idx) => idx !== i))} style={{
                      position: "absolute", top: "0.25rem", right: "0.25rem", width: "24px", height: "24px", borderRadius: "50%",
                      background: "rgba(0,0,0,0.6)", color: "white", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <X style={{ width: "14px", height: "14px" }} />
                    </button>
                    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "0.25rem 0.5rem", background: "rgba(0,0,0,0.5)", fontSize: "0.6875rem", color: "white" }}>
                      {file.name.substring(0, 25)}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1rem" }}>
              <button onClick={() => handleSave(true)} disabled={saving} className="btn-primary !mb-4" style={{ padding: "0.875rem 1.5rem", fontSize: "0.9375rem" }}>
                {saving ? <Loader2 className="animate-spin" style={{ width: "16px", height: "16px" }} /> : <Save style={{ width: "16px", height: "16px" }} />}
                {isRtl ? "حفظ وإرسال" : "Save and Submit"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}