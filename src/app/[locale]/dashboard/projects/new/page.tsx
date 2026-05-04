"use client";

import { useLocale } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { useState, useEffect, useRef, useCallback } from "react";
import { createProjectAction, aiTranslateTitleAction, getFormData, getOwnerDraftProjectAction, getOwnerProjectAction, getOwnerProjectAttachmentsAction } from "../actions";
import type { ProjectContact } from "@/lib/project-meta";
import {
  Sparkles, Loader2, AlertCircle, Save, Send, Upload, X, FileText, Image as ImageIcon,
  HardHat, Compass, Building2, CheckCircle, Search, MapPin, ChevronDown, ChevronRight,
  Phone, Mail, User, Plus, Trash2, Camera, FileSpreadsheet, Ruler,
} from "lucide-react";

// ============================================================================
// DATA: Category trees per project type
// ============================================================================
const CATEGORY_TREES: Record<string, { name: string; nameAr: string; children: { name: string; nameAr: string }[] }[]> = {
  CONSTRUCTION_ONLY: [
    { name: "Building Construction", nameAr: "أعمال البناء", children: [
      { name: "Renovations", nameAr: "تجديدات" },
      { name: "Interior Finishing", nameAr: "تشطيبات داخلية" },
      { name: "Installation Work", nameAr: "أعمال تركيب" },
      { name: "Repairs & Maintenance", nameAr: "صيانة وإصلاحات" },
      { name: "Painting & Decoration", nameAr: "دهان وديكور" },
    ]},
  ],
  DESIGN_ONLY: [
    { name: "Architectural Design", nameAr: "تصميم معماري", children: [
      { name: "Engineering Calculations & Drawings", nameAr: "حسابات ورسومات هندسية" },
      { name: "Interior Design Planning", nameAr: "تخطيط تصميم داخلي" },
      { name: "3D Rendering", nameAr: "تصميم ثلاثي الأبعاد" },
      { name: "Structural Analysis", nameAr: "تحليل إنشائي" },
      { name: "MEP Design", nameAr: "تصميم ميكانيكي وكهربائي وسباكة" },
    ]},
  ],
  DESIGN_AND_CONSTRUCTION: [
    { name: "Building Construction", nameAr: "أعمال البناء", children: [
      { name: "Renovations", nameAr: "تجديدات" },
      { name: "Interior Finishing", nameAr: "تشطيبات داخلية" },
      { name: "Installation Work", nameAr: "أعمال تركيب" },
      { name: "Repairs & Maintenance", nameAr: "صيانة وإصلاحات" },
      { name: "Painting & Decoration", nameAr: "دهان وديكور" },
    ]},
    { name: "Architectural Design", nameAr: "تصميم معماري", children: [
      { name: "Engineering Calculations & Drawings", nameAr: "حسابات ورسومات هندسية" },
      { name: "Interior Design Planning", nameAr: "تخطيط تصميم داخلي" },
      { name: "3D Rendering", nameAr: "تصميم ثلاثي الأبعاد" },
      { name: "Structural Analysis", nameAr: "تحليل إنشائي" },
      { name: "MEP Design", nameAr: "تصميم ميكانيكي وكهربائي وسباكة" },
    ]},
    { name: "Full Project", nameAr: "مشروع متكامل", children: [
      { name: "New Building Project", nameAr: "مشروع بناء جديد" },
      { name: "Complex Renovation", nameAr: "تجديد شامل" },
      { name: "Custom Construction", nameAr: "بناء مخصص" },
    ]},
  ],
};

// ============================================================================
// DATA: Riyadh neighborhoods
// ============================================================================
const NEIGHBORHOODS = [
  { ar: "حي النسيم", en: "Al Naseem" }, { ar: "حي قرطبة", en: "Qurtubah" },
  { ar: "حي أشبيلية", en: "Ishbiliya" }, { ar: "حي الرمال", en: "Al Rimal" },
  { ar: "حي اليرموك", en: "Al Yarmouk" }, { ar: "حي المونسية", en: "Al Munsiyah" },
  { ar: "حي الروضة", en: "Al Rawdah" }, { ar: "حي النظيم", en: "Al Nazeem" },
  { ar: "حي الملك فيصل", en: "King Faisal" }, { ar: "حي الخليج", en: "Al Khaleej" },
  { ar: "حي غرناطة", en: "Gharnatah" }, { ar: "حي الروابي", en: "Al Rawabi" },
  { ar: "حي الاندلس", en: "Al Andalus" }, { ar: "حي الحمراء", en: "Al Hamra" },
  { ar: "حي طويق", en: "Tuwaiq" }, { ar: "حي عرقة", en: "Irqah" },
  { ar: "حي السويدي", en: "Al Suwaidi" }, { ar: "حي ظهرة نمار", en: "Dhahrat Namar" },
  { ar: "حي العريجاء", en: "Al Uraija" }, { ar: "حي البديعة", en: "Al Badiah" },
  { ar: "حي لبن", en: "Laban" }, { ar: "حي ظهرة لبن", en: "Dhahrat Laban" },
  { ar: "حي نمار", en: "Namar" }, { ar: "حي الحزم", en: "Al Hazm" },
  { ar: "حي ديراب", en: "Dirab" }, { ar: "حي شبرا", en: "Shubra" },
  { ar: "حي العزيزية", en: "Al Aziziyah" }, { ar: "حي الدار البيضاء", en: "Dar Al Baida" },
  { ar: "حي بدر", en: "Badr" }, { ar: "حي الشفا", en: "Al Shifa" },
  { ar: "حي أحد", en: "Uhud" }, { ar: "حي الحائر", en: "Al Ha'ir" },
  { ar: "حي طيبة", en: "Taybah" }, { ar: "حي المناخ", en: "Al Manakh" },
  { ar: "حي عكاظ", en: "Uqaz" }, { ar: "حي المروة", en: "Al Marwah" },
  { ar: "حي العليا", en: "Al Olaya" }, { ar: "حي المعذر", en: "Al Ma'ather" },
  { ar: "حي الملز", en: "Al Malaz" }, { ar: "حي المربع", en: "Al Murabba" },
  { ar: "حي البطحاء", en: "Al Batha" }, { ar: "حي الديرة", en: "Al Deera" },
  { ar: "حي منفوحة", en: "Manfuhah" }, { ar: "حي الوزارات", en: "Al Wazarat" },
  { ar: "حي الربوة", en: "Al Rabwah" }, { ar: "حي جرير", en: "Jarir" },
  { ar: "حي الفوطة", en: "Al Fouta" }, { ar: "حي السفارات", en: "Diplomatic Quarter" },
];

const createEmptyContact = (): ProjectContact => ({ name: "", phone: "", email: "" });

const FIELD_IDS = {
  titleAr: "project-title-ar",
  title: "project-title-en",
  neighborhoodSearch: "project-neighborhood-search",
  addressName: "project-address-name",
  city: "project-city",
  detailedAddress: "project-detailed-address",
  description: "project-description",
  estimatedBudget: "project-estimated-budget",
  startDate: "project-start-date",
  deadline: "project-deadline",
};

// ============================================================================
// COMPONENT
// ============================================================================
export default function NewProjectPage() {
  const locale = useLocale();
  const router = useRouter();
  const isRtl = locale === "ar";
  const step5Ref = useRef<HTMLDivElement>(null);

  const [loading, setLoading] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [error, setError] = useState("");
  const [neighborhoodSearch, setNeighborhoodSearch] = useState("");
  const [showNeighborhoods, setShowNeighborhoods] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  // Form state
  const [title, setTitle] = useState("");
  const [titleAr, setTitleAr] = useState("");
  const [projectType, setProjectType] = useState("");
  const [selectedTrades, setSelectedTrades] = useState<string[]>([]);
  const [neighborhood, setNeighborhood] = useState("");
  const [addressName, setAddressName] = useState("");
  const [city, setCity] = useState(isRtl ? "الرياض" : "Riyadh");
  const [detailedAddress, setDetailedAddress] = useState("");
  const [description, setDescription] = useState("");
  const [specifications, setSpecifications] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [estimatedBudget, setEstimatedBudget] = useState("");
  const [startDate, setStartDate] = useState("");
  const [deadline, setDeadline] = useState("");
  const [draftProjectId, setDraftProjectId] = useState("");
  const [contacts, setContacts] = useState<ProjectContact[]>([createEmptyContact()]);
  const [showDraftPrompt, setShowDraftPrompt] = useState(false);
  const [draftPreview, setDraftPreview] = useState<any>(null);
  const [existingAttachments, setExistingAttachments] = useState<any[]>([]);
  const [removedAttachmentIds, setRemovedAttachmentIds] = useState<string[]>([]);
  const lastAutoSavedSnapshot = useRef("");

  // File upload state (4 categories)
  const [projectImages, setProjectImages] = useState<File[]>([]);
  const [drawings, setDrawings] = useState<File[]>([]);
  const [boqFiles, setBoqFiles] = useState<File[]>([]);
  const [sitePhotos, setSitePhotos] = useState<File[]>([]);
  const imgRef = useRef<HTMLInputElement>(null);
  const drawRef = useRef<HTMLInputElement>(null);
  const boqRef = useRef<HTMLInputElement>(null);
  const siteRef = useRef<HTMLInputElement>(null);

  const hasManualAddress = Boolean(addressName.trim() || detailedAddress.trim());
  const hasLocationStepCompleted = Boolean(neighborhood || hasManualAddress);

  // Step calculation
  const currentStep = (() => {
    if (!title && !titleAr) return 1;
    if (!projectType) return 2;
    if (selectedTrades.length === 0) return 3;
    if (!hasLocationStepCompleted) return 4;
    return 5;
  })();

  // AI translate on blur
  const handleTitleBlur = async () => {
    if (title && !titleAr) {
      setTranslating(true);
      try {
        const r = await aiTranslateTitleAction(title, "en");
        if (r.success && r.translated) setTitleAr(r.translated);
      } catch {}
      setTranslating(false);
    } else if (titleAr && !title) {
      setTranslating(true);
      try {
        const r = await aiTranslateTitleAction(titleAr, "ar");
        if (r.success && r.translated) setTitle(r.translated);
      } catch {}
      setTranslating(false);
    }
  };

  // Toggle category tree expand
  const toggleExpand = (name: string) => {
    setExpandedCategories(prev => prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]);
  };

  // BUG-13: Phone sanitization for contact form
  const sanitizePhoneInput = (value: string) => {
    const arabicIndic = "٠١٢٣٤٥٦٧٨٩";
    const easternIndic = "۰۱۲۳۴۵۶۷۸۹";
    return value
      .split("")
      .map((char) => {
        const arabicIndex = arabicIndic.indexOf(char);
        if (arabicIndex >= 0) return String(arabicIndex);
        const easternIndex = easternIndic.indexOf(char);
        if (easternIndex >= 0) return String(easternIndex);
        return char;
      })
      .join("")
      .replace(/[^0-9+]/g, "");
  };

  // BUG-V01: Validate Saudi phone format
  const validateSaudiPhone = (phone: string): boolean => {
    const normalized = sanitizePhoneInput(phone);
    // Accepts: 05XXXXXXXX (10 digits) or +9665XXXXXXXX (13 chars)
    return /^05\d{8}$/.test(normalized) || /^\+9665\d{8}$/.test(normalized);
  };

  const getExistingAttachmentsByFolder = (folder: string) =>
    existingAttachments.filter((file: any) => String(file?.fileUrl || "").includes(`/${folder}/`));

  // Toggle trade selection
  const toggleTrade = (trade: string) => {
    setSelectedTrades(prev => prev.includes(trade) ? prev.filter(t => t !== trade) : [...prev, trade]);
  };

  // Filtered neighborhoods
  const filteredNeighborhoods = NEIGHBORHOODS.filter(n => {
    if (!neighborhoodSearch) return true;
    return n.ar.includes(neighborhoodSearch) || n.en.toLowerCase().includes(neighborhoodSearch.toLowerCase());
  });

  // BUG-12: Removed auto-scroll on location selection — user should control scroll

  // BUG-V02: Load specific project by ID if passed via URL
  const applyDraftToForm = async (projectData: any) => {
    if (!projectData) return;
    setDraftProjectId(projectData.id);
    setTitle(projectData.title || "");
    setTitleAr(projectData.titleAr || "");
    setProjectType(projectData.projectType || "");
    setSelectedTrades((projectData.requiredTrades || []).map((trade: any) => (isRtl ? trade.tradeNameAr || trade.tradeName : trade.tradeName)));
    setNeighborhood(projectData.meta?.neighborhood || "");
    setAddressName(projectData.meta?.addressName || "");
    setCity(projectData.meta?.city || (isRtl ? "الرياض" : "Riyadh"));
    setDetailedAddress(projectData.meta?.detailedAddress || "");
    setDescription(projectData.description || "");
    setSpecifications(projectData.meta?.specifications || "");
    setPropertyType(projectData.propertyType || "");
    setEstimatedBudget(projectData.meta?.estimatedBudget ? String(projectData.meta.estimatedBudget) : projectData.budgetMax ? String(projectData.budgetMax) : "");
    setStartDate(
      projectData.requiredStartDate
        ? new Date(projectData.requiredStartDate).toISOString().slice(0, 10)
        : ""
    );
    setDeadline(
      projectData.deadline
        ? new Date(projectData.deadline).toISOString().slice(0, 10)
        : ""
    );
    setContacts(projectData.meta?.contacts?.length ? projectData.meta.contacts : [createEmptyContact()]);
    const attachmentsResult = await getOwnerProjectAttachmentsAction(projectData.id);
    setExistingAttachments(attachmentsResult?.success ? (attachmentsResult.attachments || []) : (projectData.attachments || []));
    setRemovedAttachmentIds([]);
    setShowDraftPrompt(false);
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const projectId = urlParams.get("draft");
    
    if (projectId) {
      // Load specific project by ID (for Edit & Resubmit)
      getOwnerProjectAction(projectId).then((result) => {
        if (result.success && result.project) {
          applyDraftToForm(result.project);
        }
      }).catch(() => {});
    } else {
      // Load latest draft
      getOwnerDraftProjectAction().then((result) => {
        if (result.success && result.draft) {
          setDraftPreview(result.draft);
          setShowDraftPrompt(true);
        }
      }).catch(() => {});
    }
  }, []);

  const loadDraft = async () => {
    if (!draftPreview) return;
    let projectData: any = draftPreview;
    try {
      const fresh = await getOwnerProjectAction(draftPreview.id);
      if (fresh?.success && fresh.project) projectData = fresh.project;
    } catch {}
    await applyDraftToForm(projectData);
  };

  const startFresh = () => {
    setDraftProjectId("");
    setContacts([createEmptyContact()]);
    setExistingAttachments([]);
    setRemovedAttachmentIds([]);
    setShowDraftPrompt(false);
  };

  useEffect(() => {
    if (showDraftPrompt) return;
    const snapshot = JSON.stringify({
      draftProjectId,
      title,
      titleAr,
      projectType,
      selectedTrades,
      neighborhood,
      addressName,
      city,
      detailedAddress,
      description,
      specifications,
      propertyType,
      estimatedBudget,
      startDate,
      deadline,
      contacts,
    });

    if (snapshot === lastAutoSavedSnapshot.current) return;
    if (!title && !titleAr && !description && !projectType && selectedTrades.length === 0) return;

    const timeoutId = window.setTimeout(async () => {
      const formData = new FormData();
      if (draftProjectId) formData.set("projectId", draftProjectId);
      formData.set("title", title);
      formData.set("titleAr", titleAr);
      formData.set("projectType", projectType);
      formData.set("description", description);
      formData.set("specifications", specifications);
      formData.set("propertyType", propertyType);
      formData.set("budgetMin", estimatedBudget);
      formData.set("budgetMax", estimatedBudget);
      formData.set("estimatedBudget", estimatedBudget);
      formData.set("requiredStartDate", startDate);
      formData.set("deadline", deadline);
      formData.set("locationId", "");
      formData.set("categoryId", "");
      formData.set("selectedCategories", JSON.stringify([]));
      formData.set("selectedTrades", JSON.stringify(selectedTrades));
      formData.set("neighborhood", neighborhood);
      formData.set("addressName", addressName);
      formData.set("city", city);
      formData.set("detailedAddress", detailedAddress);
      formData.set("contacts", JSON.stringify(contacts));
      formData.set("action", "draft");
      formData.set("removedAttachmentIds", JSON.stringify(removedAttachmentIds));
      formData.set("fileCount", "0");

      const result = await createProjectAction(formData);
      if (result?.success) {
        if (result.projectId) setDraftProjectId(result.projectId);
        lastAutoSavedSnapshot.current = snapshot;
      }
    }, 2000);

    return () => window.clearTimeout(timeoutId);
  }, [showDraftPrompt, draftProjectId, title, titleAr, projectType, selectedTrades, neighborhood, addressName, city, detailedAddress, description, specifications, propertyType, estimatedBudget, startDate, deadline, contacts]);

  const addContactRow = () => {
    if (contacts.length >= 3) return;
    setContacts((prev) => [...prev, createEmptyContact()]);
    setError("");
  };

  const updateContact = (index: number, field: keyof ProjectContact, value: string) => {
    setContacts((prev) => prev.map((contact, idx) => idx === index ? { ...contact, [field]: value } : contact));
  };

  const removeContact = (index: number) => {
    setContacts((prev) => {
      const next = prev.filter((_, idx) => idx !== index);
      return next.length > 0 ? next : [createEmptyContact()];
    });
  };

  // Submit
  const handleSubmit = async (action: "draft" | "submit") => {
    setLoading(true); setError("");
    const normalizedContacts = contacts
      .map((contact) => ({
        name: contact.name.trim(),
        phone: contact.phone.trim(),
        email: contact.email?.trim() || "",
      }));

    const hasPartialContact = normalizedContacts.some((contact) => (contact.name || contact.phone || contact.email) && (!contact.name || !contact.phone));
    if (hasPartialContact) {
      setError(isRtl ? "أكمل الاسم ورقم الجوال لكل جهة اتصال قمت بإضافتها" : "Complete the name and phone for every contact you add");
      setLoading(false);
      return;
    }

    const contactsToSave = normalizedContacts.filter((contact) => contact.name || contact.phone);

    const formData = new FormData();
    if (draftProjectId) formData.set("projectId", draftProjectId);
    formData.set("title", title);
    formData.set("titleAr", titleAr);
    formData.set("projectType", projectType);
    formData.set("description", description);
    formData.set("specifications", specifications);
    formData.set("propertyType", propertyType);
    formData.set("budgetMin", estimatedBudget);
    formData.set("budgetMax", estimatedBudget);
    formData.set("estimatedBudget", estimatedBudget);
    formData.set("requiredStartDate", startDate);
    formData.set("deadline", deadline);
    formData.set("locationId", "");
    formData.set("categoryId", "");
    formData.set("selectedCategories", JSON.stringify([]));
    formData.set("selectedTrades", JSON.stringify(selectedTrades));
    formData.set("neighborhood", neighborhood);
    formData.set("addressName", addressName);
    formData.set("city", city);
    formData.set("detailedAddress", detailedAddress);
    formData.set("contacts", JSON.stringify(contactsToSave));
    formData.set("action", action);
    formData.set("removedAttachmentIds", JSON.stringify(removedAttachmentIds));
    // Files
    projectImages.forEach((f, i) => formData.append(`img_${i}`, f));
    drawings.forEach((f, i) => formData.append(`draw_${i}`, f));
    boqFiles.forEach((f, i) => formData.append(`boq_${i}`, f));
    sitePhotos.forEach((f, i) => formData.append(`site_${i}`, f));
    formData.set("fileCount", (existingAttachments.length + projectImages.length + drawings.length + boqFiles.length + sitePhotos.length).toString());

    const result = await createProjectAction(formData);
    if (result.success) router.push(result.redirectTo || "/dashboard/projects");
    else { setError(result.error || "Error"); setLoading(false); }
  };

  // Property types
  const propTypes = [
    { id: "residential", label: isRtl ? "سكني" : "Residential", icon: "🏠" },
    { id: "commercial", label: isRtl ? "تجاري" : "Commercial", icon: "🏢" },
    { id: "industrial", label: isRtl ? "صناعي" : "Industrial", icon: "🏭" },
    { id: "government", label: isRtl ? "حكومي" : "Government", icon: "🏛️" },
  ];

  // Chip style helper
  const chip = (selected: boolean) => ({
    display: "inline-flex" as const, alignItems: "center" as const, gap: "0.25rem",
    padding: "0.5rem 0.875rem", borderRadius: "var(--radius-full)",
    border: selected ? "2px solid var(--primary)" : "1px solid var(--border)",
    background: selected ? "var(--primary)" : "var(--surface)",
    color: selected ? "white" : "var(--text)",
    fontSize: "0.8125rem", fontWeight: 500, cursor: "pointer",
    fontFamily: "inherit", transition: "all 150ms ease",
  });

  // BUG-PO07: File upload button component with validation
  const FileUploadBtn = ({ label, labelAr, files: fileList, setFiles, inputRef, accept, max }: {
    label: string; labelAr: string; files: File[]; setFiles: (f: File[]) => void; inputRef: React.RefObject<HTMLInputElement | null>; accept: string; max: number;
  }) => {
    const [uploadError, setUploadError] = useState("");

    const validateFiles = (newFiles: File[], existingFiles: File[]) => {
      const errors: string[] = [];
      const acceptTypes = accept.split(",").map(t => t.trim().toLowerCase());
      
      for (const file of newFiles) {
        const ext = "." + (file.name.split(".").pop()?.toLowerCase() || "");
        const mimeType = file.type.toLowerCase();
        const isValidType = acceptTypes.some(t => t === ext || t === mimeType || (t.endsWith("/*") && mimeType.startsWith(t.replace("/*", ""))));
        
        if (!isValidType) {
          errors.push(isRtl ? `${file.name}: نوع الملف غير مسموح` : `${file.name}: Invalid file type`);
        }
      }

      const totalFiles = existingFiles.length + newFiles.length;
      if (totalFiles > max) {
        errors.push(isRtl ? `لا يمكن إضافة أكثر من ${max} ملفات` : `Cannot add more than ${max} files`);
      }

      return errors;
    };

    const handleFiles = (selectedFiles: File[]) => {
      setUploadError("");
      const errors = validateFiles(selectedFiles, fileList);
      
      if (errors.length > 0) {
        setUploadError(errors[0]);
        return;
      }

      setFiles([...fileList, ...selectedFiles].slice(0, max));
    };

    return (
    <div
      style={{ marginBottom: "0.75rem" }}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        const dropped = Array.from(e.dataTransfer.files || []);
        if (dropped.length > 0) {
          handleFiles(dropped);
        }
      }}
    >
      <button type="button" onClick={() => inputRef.current?.click()} style={{
        display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem", width: "100%",
        padding: "1rem", borderRadius: "var(--radius-lg)",
        border: "1px dashed var(--border)", background: "var(--surface-2)",
        cursor: "pointer", fontFamily: "inherit", fontSize: "0.875rem", fontWeight: 600,
        color: "var(--text)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", width: "100%", justifyContent: "center" }}>
          <Upload style={{ width: "16px", height: "16px", color: "var(--primary)" }} />
          {isRtl ? labelAr : label}
          {fileList.length > 0 && <span style={{ marginInlineStart: "auto", fontSize: "0.75rem", color: "var(--primary)" }}>({fileList.length}/{max})</span>}
        </div>
        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 500 }}>
          {isRtl ? "اسحب الملفات هنا أو اضغط للاختيار" : "Drag & drop files here or click to browse"}
        </span>
      </button>
      <input id={`${label.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-input`} name={`${label.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-input`} ref={inputRef} type="file" multiple accept={accept} onChange={(e) => {
        if (e.target.files) handleFiles(Array.from(e.target.files));
      }} style={{ display: "none" }} />
      
      {uploadError && (
        <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", marginTop: "0.375rem", padding: "0.375rem 0.75rem", borderRadius: "var(--radius-md)", background: "var(--error-light)", color: "var(--error)", fontSize: "0.75rem" }}>
          <AlertCircle style={{ width: "14px", height: "14px", flexShrink: 0 }} />
          <span>{uploadError}</span>
        </div>
      )}

      {fileList.length > 0 && (
        <div style={{ marginTop: "0.375rem", display: "flex", flexDirection: "column", gap: "0.25rem", paddingInlineStart: "1rem" }}>
          {fileList.map((f, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.375rem", fontSize: "0.75rem", color: "var(--text-muted)" }}>
              <FileText style={{ width: "12px", height: "12px", color: "var(--primary)" }} />
              <span style={{ flex: 1 }}>{f.name}</span>
              <button type="button" onClick={() => setFiles(fileList.filter((_, idx) => idx !== i))} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--error)", padding: 0, display: "flex" }}>
                <X style={{ width: "12px", height: "12px" }} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
    );
  };

  return (
    <div style={{ background: "var(--bg)", minHeight: "calc(100vh - 64px)" }}>
      {/* Progress */}
      <div style={{ background: "var(--surface)", borderBottom: "1px solid var(--border-light)", padding: "0.75rem 0" }}>
        <div className="container-app" style={{ maxWidth: "900px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
            <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--primary)" }}>{currentStep}/5</span>
            <span style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>{isRtl ? "إنشاء مشروع" : "Create Project"}</span>
          </div>
          <div style={{ height: "4px", borderRadius: "2px", background: "var(--border-light)" }}>
            <div style={{ height: "100%", borderRadius: "2px", background: "var(--primary)", width: `${(currentStep / 5) * 100}%`, transition: "width 400ms ease" }} />
          </div>
        </div>
      </div>

      <div className="container-app" style={{ padding: "2rem 1.5rem", maxWidth: "900px" }}>
        {showDraftPrompt && draftPreview && (
          <div className="card" style={{ padding: "1.25rem", marginBottom: "1.5rem", border: "2px solid var(--accent)" }}>
            <div style={{ fontSize: "1rem", fontWeight: 800, color: "var(--text)", marginBottom: "0.375rem" }}>
              {isRtl ? "لديك مسودة محفوظة" : "You have a saved draft"}
            </div>
            <div style={{ fontSize: "0.8125rem", color: "var(--text-muted)", marginBottom: "0.75rem" }}>
              {isRtl ? `هل تريد متابعة تعديل: ${draftPreview.titleAr || draftPreview.title}؟` : `Would you like to continue editing: ${draftPreview.title}?`}
            </div>
            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
              <button onClick={loadDraft} className="btn-primary" style={{ padding: "0.75rem 1.25rem" }}>
                {draftPreview.status === "CHANGES_REQUESTED"
                  ? (isRtl ? "تعديل المشروع" : "Edit Project")
                  : (isRtl ? "متابعة المسودة" : "Continue Draft")}
              </button>
              <button onClick={startFresh} className="btn-secondary" style={{ padding: "0.75rem 1.25rem" }}>
                {isRtl ? "بدء مشروع جديد" : "Start New Project"}
              </button>
            </div>
          </div>
        )}

        {error && (
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.75rem 1rem", borderRadius: "var(--radius-lg)", marginBottom: "1.5rem", background: "var(--error-light)", color: "var(--error)", fontSize: "0.875rem" }}>
            <AlertCircle style={{ width: "16px", height: "16px" }} /> {error}
          </div>
        )}

        {/* ================================================================ */}
        {/* STEP 1: Project Title (fixed Arabic input bug) */}
        {/* ================================================================ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-12 mb-12">
          <div>
            <div style={{ fontSize: "0.8125rem", color: "var(--text-muted)", marginBottom: "0.5rem" }}>{isRtl ? "الخطوة 1" : "Step 1"}</div>
            <h2 className="md:!text-2xl !text-xl mb-2" style={{ fontWeight: 800, color: "var(--text)" }}>
              {isRtl ? "لنبدأ بعنوان قوي." : "Let's start with a strong title."}
            </h2>
            <p style={{ fontSize: "0.9375rem", color: "var(--text-muted)", lineHeight: 1.6 }}>
              {isRtl ? "اكتب عنوان مشروعك وسيقوم الذكاء الاصطناعي بترجمته تلقائياً." : "Write your project title and AI will auto-translate it."}
            </p>
          </div>
          <div>
            {/* Arabic title */}
            <label htmlFor={FIELD_IDS.titleAr} style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text)", display: "block", marginBottom: "0.375rem" }}>
              {isRtl ? "عنوان المشروع (عربي)" : "Project Title (Arabic)"} <span style={{ color: "var(--error)" }}>*</span>
            </label>
            <input id={FIELD_IDS.titleAr} name="titleAr" type="text" value={titleAr} onChange={(e) => setTitleAr(e.target.value)} onBlur={handleTitleBlur}
              dir="rtl" placeholder="مثال: تجديد فيلا في الرياض شاملة الكهرباء والسباكة"
              style={{ fontSize: "1rem", padding: "0.875rem 1rem", marginBottom: "0.75rem" }} />

            {/* English title */}
            <label htmlFor={FIELD_IDS.title} style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text)", display: "block", marginBottom: "0.375rem" }}>
              {isRtl ? "عنوان المشروع (إنجليزي)" : "Project Title (English)"} <span style={{ color: "var(--error)" }}>*</span>
            </label>
            <input id={FIELD_IDS.title} name="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} onBlur={handleTitleBlur}
              dir="ltr" placeholder="e.g. Villa renovation in Riyadh including electrical and plumbing"
              style={{ fontSize: "1rem", padding: "0.875rem 1rem" }} />

            {translating && (
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.5rem", fontSize: "0.8125rem", color: "var(--accent)" }}>
                <Loader2 className="animate-spin" style={{ width: "14px", height: "14px" }} />
                {isRtl ? "جاري الترجمة بالذكاء الاصطناعي..." : "AI translating..."}
              </div>
            )}
          </div>
        </div>

        {/* ================================================================ */}
        {/* STEP 2: Project Type (3 cards, bilingual) */}
        {/* ================================================================ */}
        {currentStep >= 2 && (
          <div className="md:!my-8 !mb-3" style={{animation: "fadeIn 400ms ease" }}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
              <div>
                <div style={{ fontSize: "0.8125rem", color: "var(--text-muted)", marginBottom: "0.5rem" }}>{isRtl ? "الخطوة 2" : "Step 2"}</div>
                <h2 className="md:!text-2xl !text-xl" style={{ fontWeight: 800, color: "var(--text)"}}>
                  {isRtl ? "ما نوع مشروعك؟" : "What is your project?"}
                </h2>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {[
                  { id: "CONSTRUCTION_ONLY", icon: HardHat, label: "Construction Only", labelAr: "مقاولات فقط", desc: "Building and execution works", descAr: "أعمال بناء وتنفيذ" },
                  { id: "DESIGN_ONLY", icon: Compass, label: "Design Only", labelAr: "تصميم فقط", desc: "Architectural & engineering design", descAr: "تصميم معماري وهندسي" },
                  { id: "DESIGN_AND_CONSTRUCTION", icon: Building2, label: "Design & Construction", labelAr: "تصميم ومقاولات", desc: "Complete project from design to delivery", descAr: "مشروع متكامل من التصميم حتى التسليم" },
                ].map(pt => {
                  const sel = projectType === pt.id;
                  return (
                    <button type="button" key={pt.id} onClick={() => { setProjectType(pt.id); setSelectedTrades([]); setExpandedCategories([]); }} style={{
                      display: "flex", alignItems: "center", gap: "1rem", padding: "1.25rem 1.5rem", borderRadius: "var(--radius-xl)",
                      border: sel ? "2px solid var(--primary)" : "2px solid var(--border-light)", background: sel ? "var(--primary-light)" : "var(--surface)",
                      cursor: "pointer", textAlign: isRtl ? "right" : "left", fontFamily: "inherit", transition: "all 200ms ease",
                    }}>
                      <div style={{ width: "44px", height: "44px", borderRadius: "var(--radius-lg)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: sel ? "var(--primary)" : "var(--surface-2)" }}>
                        <pt.icon style={{ width: "22px", height: "22px", color: sel ? "white" : "var(--text-muted)" }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: "1rem", fontWeight: 700, color: sel ? "var(--primary)" : "var(--text)" }}>{isRtl ? pt.labelAr : pt.label}</div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{isRtl ? pt.descAr : pt.desc}</div>
                      </div>
                      <div style={{ width: "22px", height: "22px", borderRadius: "50%", flexShrink: 0, border: sel ? "2px solid var(--primary)" : "2px solid var(--border)", background: sel ? "var(--primary)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {sel && <CheckCircle style={{ width: "14px", height: "14px", color: "white" }} />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* STEP 3: Category Tree (hierarchical, multi-select) */}
        {/* ================================================================ */}
        {currentStep >= 3 && projectType && (
          <div className=" md:!my-8 !mb-3" style={{ animation: "fadeIn 400ms ease" }}>
            <div className="grid md:grid-cols-2 md:gap-3 gap-1">
              <div>
                <div style={{ fontSize: "0.8125rem", color: "var(--text-muted)", marginBottom: "0.5rem" }}>{isRtl ? "الخطوة 3" : "Step 3"}</div>
                <h2 className="md:!text-2xl !text-xl mb-2" style={{fontWeight: 800, color: "var(--text)"}}>
                  {isRtl ? "ما تصنيف مشروعك؟" : "What's your project category?"}
                </h2>
                <p style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>{isRtl ? "اختر التصنيفات الفرعية المطلوبة" : "Select the required sub-categories"}</p>
              </div>
              <div>
                {/* Selected trades */}
                {selectedTrades.length > 0 && (
                  <div style={{ marginBottom: "1rem" }}>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.375rem" }}>
                      {isRtl ? `المختار (${selectedTrades.length}):` : `Selected (${selectedTrades.length}):`}
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem" }}>
                      {selectedTrades.map(t => (
                        <span key={t} style={{ ...chip(true), padding: "0.375rem 0.75rem", fontSize: "0.75rem" }}>
                          {t}
                          <button type="button" onClick={() => toggleTrade(t)} style={{ background: "none", border: "none", cursor: "pointer", color: "white", display: "flex", padding: 0 }}>
                            <X style={{ width: "12px", height: "12px" }} />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Category tree */}
                {(CATEGORY_TREES[projectType] || []).map(parent => (
                  <div key={parent.name} style={{ marginBottom: "0.75rem" }}>
                    <button type="button" onClick={() => toggleExpand(parent.name)} style={{
                      display: "flex", alignItems: "center", gap: "0.5rem", width: "100%",
                      padding: "0.75rem 1rem", borderRadius: "var(--radius-lg)",
                      border: "1px solid var(--border-light)", background: "var(--surface)",
                      cursor: "pointer", fontFamily: "inherit", fontSize: "0.9375rem", fontWeight: 700, color: "var(--text)",
                    }}>
                      {expandedCategories.includes(parent.name) ?
                        <ChevronDown style={{ width: "16px", height: "16px", color: "var(--primary)" }} /> :
                        <ChevronRight style={{ width: "16px", height: "16px", color: "var(--text-muted)" }} />
                      }
                      {isRtl ? parent.nameAr : parent.name}
                    </button>
                    {expandedCategories.includes(parent.name) && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", padding: "0.75rem 0 0 1.5rem" }}>
                        {parent.children.map(child => {
                          const tradeKey = isRtl ? child.nameAr : child.name;
                          const sel = selectedTrades.includes(tradeKey);
                          return (
                            <button type="button" key={child.name} onClick={() => toggleTrade(tradeKey)} style={chip(sel)}>
                              {isRtl ? child.nameAr : child.name}
                              {sel ? <X style={{ width: "12px", height: "12px" }} /> : <span style={{ color: "var(--text-muted)" }}>+</span>}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* STEP 4: Location — Riyadh + Neighborhoods + Map placeholder */}
        {/* ================================================================ */}
        {currentStep >= 4 && (
          <div className="md:!my-8 !mb-3" style={{animation: "fadeIn 400ms ease" }}>
            <div className="grid md:grid-cols-2 md:gap-0 gap-4">
              <div>
                <div style={{ fontSize: "0.8125rem", color: "var(--text-muted)", marginBottom: "0.5rem" }}>{isRtl ? "الخطوة 4" : "Step 4"}</div>
                <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text)", lineHeight: 1.3, marginBottom: "0.75rem" }}>
                  {isRtl ? "أين يقع مشروعك؟" : "Where is your project?"}
                </h2>
                <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", lineHeight: 1.7 }}>
                  {isRtl
                    ? "يمكنك المتابعة إمّا باختيار الحي أو بإدخال العنوان يدوياً. يكفي أحد الخيارين لإظهار الخطوة 5 وزر إرسال المشروع."
                    : "You can continue either by selecting a neighborhood or by entering the address manually. Only one of these is required to reveal step 5 and the submit button."}
                </p>
              </div>
              <div className="card" style={{ padding: "1rem", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)" }}>
                <label htmlFor={FIELD_IDS.neighborhoodSearch} style={{ fontSize: "0.875rem", fontWeight: 700, marginBottom: "0.5rem" }}>
                  {isRtl ? "الحي (اختياري إذا أدخلت العنوان يدوياً)" : "Neighborhood (optional if manual address is entered)"}
                </label>
                {/* City button */}
                <button type="button" onClick={() => setShowNeighborhoods(!showNeighborhoods)} style={{
                  display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.625rem 1.25rem",
                  borderRadius: "var(--radius-full)", border: showNeighborhoods ? "2px solid var(--primary)" : "1px solid var(--border)",
                  background: showNeighborhoods ? "var(--primary-light)" : "var(--surface)", color: "var(--text)",
                  fontSize: "0.9375rem", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", marginBottom: "1rem",
                }}>
                  <MapPin style={{ width: "16px", height: "16px", color: "var(--primary)" }} />
                  {isRtl ? "الرياض" : "Riyadh"}
                  <ChevronDown style={{ width: "14px", height: "14px" }} />
                </button>
                <p style={{ fontSize: "0.75rem", color: hasLocationStepCompleted ? "var(--success)" : "var(--warning)", marginTop: "0.5rem", marginBottom: "1rem" }}>
                  {hasLocationStepCompleted
                    ? (isRtl ? "تم استكمال بيانات الموقع. سيتم نقلك تلقائياً إلى الخطوة التالية." : "Location information is complete. You will be moved to the next step automatically.")
                    : (isRtl ? "اختر الحي أو أدخل اسم العنوان / العنوان التفصيلي للمتابعة إلى تفاصيل المشروع والإرسال." : "Select a neighborhood or enter the address name / detailed address to continue to project details and submission.")}
                </p>

                {/* Selected neighborhood */}
                {neighborhood && (
                  <div style={{ marginBottom: "0.75rem" }}>
                    <span style={{ ...chip(true), padding: "0.5rem 0.875rem" }}>
                      <MapPin style={{ width: "14px", height: "14px" }} />
                      {neighborhood}
                      <button onClick={() => setNeighborhood("")} style={{ background: "none", border: "none", cursor: "pointer", color: "white", display: "flex", padding: 0 }}>
                        <X style={{ width: "14px", height: "14px" }} />
                      </button>
                    </span>
                  </div>
                )}

                {/* Neighborhoods dropdown */}
                {showNeighborhoods && (
                  <div style={{ border: "1px solid var(--border-light)", borderRadius: "var(--radius-lg)", background: "var(--surface)", padding: "0.75rem", marginBottom: "1rem", maxHeight: "280px", overflowY: "auto" }}>
                    <div style={{ position: "relative", marginBottom: "0.5rem" }}>
                      <Search style={{ position: "absolute", top: "50%", transform: "translateY(-50%)", [isRtl ? "right" : "left"]: "0.75rem", width: "16px", height: "16px", color: "var(--text-muted)" }} />
                      <input id={FIELD_IDS.neighborhoodSearch} name="neighborhoodSearch" type="text" value={neighborhoodSearch} onChange={(e) => setNeighborhoodSearch(e.target.value)}
                        placeholder={isRtl ? "ابحث عن حي..." : "Search neighborhood..."} style={{ paddingInlineStart: "2.25rem", fontSize: "0.8125rem" }} />
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem" }}>
                      {filteredNeighborhoods.map(n => {
                        const label = isRtl ? n.ar : n.en;
                        const sel = neighborhood === label;
                        return (
                          <button type="button" key={n.en} onClick={() => { setNeighborhood(label); setShowNeighborhoods(false); setNeighborhoodSearch(""); }}
                            style={{ ...chip(sel), padding: "0.375rem 0.625rem", fontSize: "0.75rem" }}>
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Location Description: Map + Address fields */}
                <div style={{ fontSize: "0.9375rem", fontWeight: 700, color: "var(--text)", marginBottom: "0.75rem" }}>
                  {isRtl ? "وصف الموقع" : "Location Description"}
                </div>
                <div className="grid md:grid-cols-2 gap-2">
                  {/* Google Maps placeholder */}
                  <div style={{ background: "var(--surface-2)", border: "2px dashed var(--border)", borderRadius: "var(--radius-lg)", minHeight: "220px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>
                    <MapPin style={{ width: "32px", height: "32px", marginBottom: "0.5rem" }} />
                    <span style={{ fontSize: "0.8125rem", fontWeight: 600 }}>{isRtl ? "خريطة جوجل" : "Google Maps"}</span>
                    <span style={{ fontSize: "0.6875rem" }}>{isRtl ? "سيتم التفعيل قريباً" : "Coming soon"}</span>
                  </div>
                  {/* Address text boxes */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    <div>
                      <label htmlFor={FIELD_IDS.addressName} style={{ fontSize: "0.8125rem", fontWeight: 600 }}>{isRtl ? "اسم العنوان" : "Address Name"}</label>
                      <input id={FIELD_IDS.addressName} name="addressName" type="text" value={addressName} onChange={(e) => setAddressName(e.target.value)} placeholder={isRtl ? "مثال: مبنى رقم 5" : "e.g. Building #5"} />
                    </div>
                    <div>
                      <label htmlFor={FIELD_IDS.city} style={{ fontSize: "0.8125rem", fontWeight: 600 }}>{isRtl ? "المدينة" : "City"}</label>
                      <input id={FIELD_IDS.city} name="city" type="text" value={city} onChange={(e) => setCity(e.target.value)} />
                    </div>
                    <div>
                      <label htmlFor={FIELD_IDS.detailedAddress} style={{ fontSize: "0.8125rem", fontWeight: 600 }}>{isRtl ? "العنوان التفصيلي" : "Detailed Address"}</label>
                      <input id={FIELD_IDS.detailedAddress} name="detailedAddress" type="text" value={detailedAddress} onChange={(e) => setDetailedAddress(e.target.value)} placeholder={isRtl ? "الشارع، البناية..." : "Street, building..."} />
                    </div>
                  </div>
                </div>
                <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.75rem" }}>
                  {isRtl
                    ? "ملاحظة: لا يلزم اختيار الحي إذا قمت بإدخال العنوان يدوياً. يكفي أحد الخيارين."
                    : "Note: Choosing a neighborhood is not required if you enter the address manually. Either option is enough."}
                </p>

                <div style={{ marginTop: "1rem", display: "flex", justifyContent: isRtl ? "flex-start" : "flex-end" }}>
                  <button
                    type="button"
                    onClick={() => step5Ref.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
                    disabled={!hasLocationStepCompleted}
                    className="btn-primary"
                    style={{ padding: "0.75rem 1.25rem", fontSize: "0.875rem" }}
                  >
                    {isRtl ? "متابعة إلى الخطوة 5" : "Continue to Step 5"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* STEP 5: Details, Contact, Attachments */}
        {/* ================================================================ */}
        {currentStep >= 5 && (
          <div ref={step5Ref} style={{ animation: "fadeIn 400ms ease" }}>
            <div className="md:grid md:grid-cols-2 md:gap-0 gap-4" style={{ marginBottom: "2rem" }}>
              <div>
                <div style={{ fontSize: "0.8125rem", color: "var(--text-muted)", marginBottom: "0.5rem" }}>{isRtl ? "الخطوة 5" : "Step 5"}</div>
                <h2 className="md:!text-2xl !text-xl" style={{fontWeight: 800, color: "var(--text)", lineHeight: 1.3, marginBottom: "0.75rem" }}>
                  {isRtl ? "أضف تفاصيل مشروعك" : "Add your project details"}
                </h2>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                {/* Description */}
                <div>
                  <label htmlFor={FIELD_IDS.description}>{isRtl ? "وصف المشروع" : "Project Description"} <span style={{ color: "var(--error)" }}>*</span></label>
                  <textarea id={FIELD_IDS.description} name="description" value={description} onChange={(e) => setDescription(e.target.value)}
                    placeholder={isRtl ? "اشرح بالتفصيل متطلبات مشروعك..." : "Describe your project requirements..."} style={{ minHeight: "120px", resize: "vertical" }} />
                </div>

                {/* BUG-PO06: Specifications */}
                <div>
                  <label htmlFor="project-specifications">{isRtl ? "المواصفات الفنية" : "Specifications"}</label>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>
                    {isRtl ? "أضف المواصفات الفنية التفصيلية للمشروع ( المواد، الأبعاد، المعايير، إلخ)" : "Add detailed technical specifications for the project (materials, dimensions, standards, etc.)"}
                  </div>
                  <textarea id="project-specifications" name="specifications" value={specifications || ""} onChange={(e) => setSpecifications(e.target.value)}
                    placeholder={isRtl ? "مثال: مواد البناء: طوب أحمر مقاس 20×10×5 سم، أسمنت بورتلاندي نوع أ، حديد تسليح قطر 12 مم..." : "e.g. Building materials: red brick 20×10×5 cm, Portland cement type A, reinforcement steel 12mm diameter..."} style={{ minHeight: "100px", resize: "vertical" }} />
                </div>

                {/* Project Type (renamed from Property Type) */}
                <div>
                  <label>{isRtl ? "نوع المشروع" : "Project Type"}</label>
                  <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                    {propTypes.map(pt => (
                      <button type="button" key={pt.id} onClick={() => setPropertyType(pt.id)} style={chip(propertyType === pt.id)}>
                        {pt.icon} {pt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Estimated Budget (single field) */}
                <div>
                  <label htmlFor={FIELD_IDS.estimatedBudget}>{isRtl ? "الميزانية التقديرية" : "Estimated Budget"} ({isRtl ? "ر.س" : "SAR"})</label>
                  <input id={FIELD_IDS.estimatedBudget} name="estimatedBudget" type="number" value={estimatedBudget} onChange={(e) => setEstimatedBudget(e.target.value)} dir="ltr" placeholder="100,000" />
                  <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                    {isRtl ? "هذا الحقل لمساعدتك و لن يتم عرض تقديرك للمستخدمين الاخرين" : "This field is for your reference and won't be shown to other users"}
                  </p>
                </div>

                {/* Dates */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                  <div>
                    <label className="md:!text-sm !text-xs" htmlFor={FIELD_IDS.startDate}>{isRtl ? "تاريخ البدء المتوقع" : "Expected Start Date"}</label>
                    {/* BUG-03: Start date must be today or future */}
                    <input id={FIELD_IDS.startDate} name="requiredStartDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} dir="ltr" min={new Date().toISOString().slice(0, 10)} />
                    <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                      {isRtl ? "متى تتوقع بدء العمل على المشروع؟" : "When do you expect the project work to start?"}
                    </p>
                  </div>
                  <div>
                    <label className="md:!text-sm !text-xs" htmlFor={FIELD_IDS.deadline}>{isRtl ? "آخر موعد لاستقبال العروض" : "Last Date to Accept Offers"}</label>
                    {/* BUG-03: Deadline must be >= start date */}
                    <input id={FIELD_IDS.deadline} name="deadline" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} dir="ltr" min={startDate || new Date().toISOString().slice(0, 10)} />
                    <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                      {isRtl ? "حتى أي تاريخ تريد الاستمرار في استقبال عروض التنفيذ؟" : "Until what date do you want to keep receiving contractor offers?"}
                    </p>
                  </div>
                </div>

                {/* ===== SECTION 6: Contact Persons ===== */}
                <div style={{ borderTop: "1px solid var(--border-light)", paddingTop: "1.25rem" }}>
                  <div className="grid grid-cols-2" style={{ alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                    <div>
                      <label style={{ fontSize: "0.9375rem", fontWeight: 700, marginBottom: 0 }}>{isRtl ? "إضافة جهة اتصال" : "Add Contact"}</label>
                      <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", margin: 0 }}>{isRtl ? "الشخص المسئول للتواصل معه" : "Person responsible for communication"}</p>
                    </div>
                    {contacts.length < 3 && (
                      <button type="button" onClick={addContactRow} style={{ ...chip(false), padding: "0.375rem 0.75rem", fontSize: "0.75rem" }}>
                        <Plus style={{ width: "12px", height: "12px" }} /> {isRtl ? "إضافة جهة الاتصال" : "Add Contact Person"}
                      </button>
                    )}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "0.5rem" }}>
                    {contacts.map((contact, i) => (
                      <div key={`contact-${i}`} style={{ padding: "0.875rem", borderRadius: "var(--radius-lg)", background: "var(--surface-2)", border: "1px solid var(--border-light)" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.75rem", marginBottom: "0.75rem" }}>
                          <div style={{ fontSize: "0.8125rem", fontWeight: 700, color: "var(--text)" }}>
                            {isRtl ? `جهة الاتصال ${i + 1}` : `Contact ${i + 1}`}
                          </div>
                          {contacts.length > 1 && (
                            <button type="button" onClick={() => removeContact(i)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--error)", padding: 0, display: "flex" }}>
                              <Trash2 style={{ width: "16px", height: "16px" }} />
                            </button>
                          )}
                        </div>
                        <div className="grid md:grid-cols-3 gap-2 mb-2">
                          <div>
                            <label htmlFor={`contact-${i}-name`} style={{ fontSize: "0.75rem" }}>{isRtl ? "الاسم" : "Name"} *</label>
                            <input id={`contact-${i}-name`} name={`contacts.${i}.name`} type="text" value={contact.name} onChange={(e) => updateContact(i, "name", e.target.value)} placeholder={isRtl ? "الاسم" : "Name"} required />
                          </div>
                          <div>
                            <label htmlFor={`contact-${i}-phone`} style={{ fontSize: "0.75rem" }}>{isRtl ? "الجوال" : "Phone"} *</label>
                            <input id={`contact-${i}-phone`} maxLength={10} name={`contacts.${i}.phone`} type="tel" value={contact.phone} onChange={(e) => updateContact(i, "phone", sanitizePhoneInput(e.target.value))} dir="ltr" placeholder="05XXXXXXXX" required />
                            {contact.phone && !validateSaudiPhone(contact.phone) && (
                              <div style={{ fontSize: "0.625rem", color: "var(--error)", marginTop: "0.125rem" }}>
                                {isRtl ? "رقم غير صحيح. يجب أن يبدأ بـ 05 ويتكون من 10 أرقام" : "Invalid number. Must start with 05 and be 10 digits"}
                              </div>
                            )}
                          </div>
                          <div>
                            <label htmlFor={`contact-${i}-email`} style={{ fontSize: "0.75rem" }}>{isRtl ? "البريد" : "Email"}</label>
                            <input id={`contact-${i}-email`} name={`contacts.${i}.email`} type="email" value={contact.email || ""} onChange={(e) => updateContact(i, "email", e.target.value)} dir="ltr" placeholder="email@example.com" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                    {isRtl ? "أضف جهة اتصال واحدة على الأقل، ويمكنك إضافة حتى 3 جهات." : "Add at least one contact person, up to 3 contacts."}
                  </div>
                </div>

                {/* ===== Attachments (4 separate upload buttons) ===== */}
                <div style={{ borderTop: "1px solid var(--border-light)", paddingTop: "1.25rem" }}>
                  <label style={{ fontSize: "0.9375rem", fontWeight: 700, marginBottom: "0.75rem", display: "block" }}>
                    {isRtl ? "المرفقات" : "Attachments"}
                  </label>
                  <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "-0.25rem", marginBottom: "0.75rem" }}>
                    {isRtl ? "يجب إضافة ملف واحد على الأقل ضمن المرفقات قبل الإرسال للمراجعة." : "At least one attachment is required before submitting for review."}
                  </p>
                  <FileUploadBtn label="Project Images (up to 10)" labelAr="صور المشروع (حتى 10)" files={projectImages} setFiles={setProjectImages} inputRef={imgRef} accept="image/*" max={10} />
                  {getExistingAttachmentsByFolder("project-images").length > 0 && (
                    <div style={{ marginTop: "-0.375rem", marginBottom: "0.625rem", paddingInlineStart: "1rem", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                      {getExistingAttachmentsByFolder("project-images").map((file: any) => (
                        <div key={file.id} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.75rem" }}>
                          <a href={file.fileUrl} target="_blank" rel="noreferrer" style={{ color: "var(--primary)", textDecoration: "none", flex: 1 }}>
                            {file.fileName}
                          </a>
                          <button
                            type="button"
                            onClick={() => {
                              if (file.id) setRemovedAttachmentIds((prev) => [...prev, file.id]);
                              setExistingAttachments((prev) => prev.filter((item) => item.id !== file.id));
                            }}
                            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--error)", padding: 0, display: "flex" }}
                            aria-label={isRtl ? "حذف المرفق" : "Remove attachment"}
                          >
                            <X style={{ width: "14px", height: "14px" }} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <FileUploadBtn label="Drawings / Designs" labelAr="مخططات وتصاميم" files={drawings} setFiles={setDrawings} inputRef={drawRef} accept="image/*,.pdf,.dwg" max={10} />
                  {getExistingAttachmentsByFolder("drawings").length > 0 && (
                    <div style={{ marginTop: "-0.375rem", marginBottom: "0.625rem", paddingInlineStart: "1rem", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                      {getExistingAttachmentsByFolder("drawings").map((file: any) => (
                        <div key={file.id} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.75rem" }}>
                          <a href={file.fileUrl} target="_blank" rel="noreferrer" style={{ color: "var(--primary)", textDecoration: "none", flex: 1 }}>
                            {file.fileName}
                          </a>
                          <button
                            type="button"
                            onClick={() => {
                              if (file.id) setRemovedAttachmentIds((prev) => [...prev, file.id]);
                              setExistingAttachments((prev) => prev.filter((item) => item.id !== file.id));
                            }}
                            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--error)", padding: 0, display: "flex" }}
                            aria-label={isRtl ? "حذف المرفق" : "Remove attachment"}
                          >
                            <X style={{ width: "14px", height: "14px" }} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <FileUploadBtn label="BOQ (Bill of Quantities)" labelAr="جدول الكميات BOQ" files={boqFiles} setFiles={setBoqFiles} inputRef={boqRef} accept=".pdf,.xls,.xlsx,.doc,.docx" max={5} />
                  {getExistingAttachmentsByFolder("boq").length > 0 && (
                    <div style={{ marginTop: "-0.375rem", marginBottom: "0.625rem", paddingInlineStart: "1rem", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                      {getExistingAttachmentsByFolder("boq").map((file: any) => (
                        <div key={file.id} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.75rem" }}>
                          <a href={file.fileUrl} target="_blank" rel="noreferrer" style={{ color: "var(--primary)", textDecoration: "none", flex: 1 }}>
                            {file.fileName}
                          </a>
                          <button
                            type="button"
                            onClick={() => {
                              if (file.id) setRemovedAttachmentIds((prev) => [...prev, file.id]);
                              setExistingAttachments((prev) => prev.filter((item) => item.id !== file.id));
                            }}
                            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--error)", padding: 0, display: "flex" }}
                            aria-label={isRtl ? "حذف المرفق" : "Remove attachment"}
                          >
                            <X style={{ width: "14px", height: "14px" }} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <FileUploadBtn label="Site Photos" labelAr="صور الموقع" files={sitePhotos} setFiles={setSitePhotos} inputRef={siteRef} accept="image/*" max={10} />
                  {getExistingAttachmentsByFolder("site-photos").length > 0 && (
                    <div style={{ marginTop: "-0.375rem", marginBottom: "0.25rem", paddingInlineStart: "1rem", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                      {getExistingAttachmentsByFolder("site-photos").map((file: any) => (
                        <div key={file.id} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.75rem" }}>
                          <a href={file.fileUrl} target="_blank" rel="noreferrer" style={{ color: "var(--primary)", textDecoration: "none", flex: 1 }}>
                            {file.fileName}
                          </a>
                          <button
                            type="button"
                            onClick={() => {
                              if (file.id) setRemovedAttachmentIds((prev) => [...prev, file.id]);
                              setExistingAttachments((prev) => prev.filter((item) => item.id !== file.id));
                            }}
                            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--error)", padding: 0, display: "flex" }}
                            aria-label={isRtl ? "حذف المرفق" : "Remove attachment"}
                          >
                            <X style={{ width: "14px", height: "14px" }} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="grid md:grid-cols-4 items-baseline w-full" style={{  gap: "0.75rem", paddingTop: "1rem", borderTop: "1px solid var(--border-light)" }}>
             <div className="md:flex hidden"></div><div className="md:flex hidden"></div>
             <div className="w-full">
               <button onClick={() => handleSubmit("draft")} disabled={loading} className="btn-secondary w-full !text-sm" style={{ padding: "0.675rem 1rem", fontSize: "0.9375rem" }}>
                <Save style={{ width: "16px", height: "16px" }} /> {isRtl ? "حفظ كمسودة" : "Save Draft"}
              </button>
              <div style={{ alignSelf: "center", fontSize: "0.75rem", color: "var(--text-muted)" }}>
                {isRtl ? "ستجد المسودات لاحقاً في صفحة: مشاريعي" : "Drafts will appear in your My Projects page."}
              </div>
             </div>
              <button  onClick={() => handleSubmit("submit")} disabled={loading || (!title && !titleAr) || !description || (existingAttachments.length + projectImages.length + drawings.length + boqFiles.length + sitePhotos.length) < 1} className="btn-primary !text-sm border" style={{ padding: "0.875rem 2rem", fontSize: "0.9375rem" }}>
                {loading ? <Loader2 className="animate-spin" style={{ width: "16px", height: "16px" }} /> : <Send style={{ width: "16px", height: "16px" }} />}
                {isRtl ? "إرسال للمراجعة" : "Submit for Review"}
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
}