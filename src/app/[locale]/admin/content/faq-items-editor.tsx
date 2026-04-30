"use client";

import { useMemo, useState } from "react";
import { useEffect, useRef } from "react";
import { BLOG_CATEGORIES, type BlogCategory } from "@/lib/blog-types";
type FaqItem = {
  question: string;
  answer: string;
  category?: BlogCategory;
  image?: string;
  publishedAt?: string;
};

function updateItemAt<T>(list: T[], index: number, factory: () => T, updater: (current: T) => T): T[] {
  const next = [...list];
  while (next.length <= index) {
    next.push(factory());
  }
  next[index] = updater(next[index]);
  return next;
}

interface FaqItemsEditorProps {
  initialContent: string;
  initialContentAr: string;
  isRtl: boolean;
  locale: string;
  closeEditorOnLoad?: boolean;
}

function parseFaqContent(content: string): FaqItem[] {
  const lines = content.split("\n").map((line) => line.trim());
  const items: FaqItem[] = [];
  let currentQuestion = "";
  let currentAnswer = "";
  let currentCategory: BlogCategory | undefined = undefined;
  let currentImage = "";
  let currentPublishedAt = "";

  for (const line of lines) {
    if (!line) continue;
    if (line.startsWith("Q:")) {
      if (currentQuestion || currentAnswer) {
        items.push({
          question: currentQuestion.trim(),
          answer: currentAnswer.trim(),
          category: currentCategory,
          image: currentImage,
          publishedAt: currentPublishedAt,
        });
      }
      currentQuestion = line.slice(2).trim();
      currentAnswer = "";
      currentCategory = undefined;
      currentImage = "";
      currentPublishedAt = "";
      continue;
    }

    if (line.startsWith("A:")) {
      currentAnswer = line.slice(2).trim();
      continue;
    }
    if (line.startsWith("C:")) {
      currentCategory = line.slice(2).trim() as BlogCategory;
      continue;
    }
    if (line.startsWith("I:")) {
      currentImage = line.slice(2).trim();
      continue;
    }
    if (line.startsWith("D:")) {
      currentPublishedAt = line.slice(2).trim();
      continue;
    }

    if (!currentQuestion && !currentAnswer) continue;
    currentAnswer = `${currentAnswer}\n${line}`.trim();
  }

  if (currentQuestion || currentAnswer) {
    items.push({
      question: currentQuestion.trim(),
      answer: currentAnswer.trim(),
      category: currentCategory,
      image: currentImage,
      publishedAt: currentPublishedAt,
    });
  }

  return items;
}

function toFaqContent(items: FaqItem[]) {
  return items
    .map((item) => {
      const question = item.question.trim();
      const answer = item.answer.trim();
      if (!question && !answer) return "";
      const categoryLine = item.category ? `\nC: ${item.category}` : "";
      const imageLine = item.image ? `\nI: ${item.image}` : "";
      const dateLine = item.publishedAt ? `\nD: ${item.publishedAt}` : "";
      return `Q: ${question}\nA: ${answer}${categoryLine}${imageLine}${dateLine}`;
    })
    .filter(Boolean)
    .join("\n\n");
}

function slugifyTitle(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function getImageNameFromUrl(url: string) {
  if (!url) return "";
  try {
    const cleaned = decodeURIComponent(url.split("?")[0] || "");
    const parts = cleaned.split("/");
    return parts[parts.length - 1] || "";
  } catch {
    return "";
  }
}

export default function FaqItemsEditor({ initialContent, initialContentAr, isRtl, locale, closeEditorOnLoad = false }: FaqItemsEditorProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const initialParsedEn = parseFaqContent(initialContent);
  const [faqEn, setFaqEn] = useState<FaqItem[]>(() => {
    return initialParsedEn.length > 0
      ? initialParsedEn
      : [{ question: "", answer: "", category: "Project Management" as BlogCategory, image: "", publishedAt: new Date().toISOString() }];
  });

  const [faqAr, setFaqAr] = useState<FaqItem[]>(() => {
    const parsed = parseFaqContent(initialContentAr);
    return parsed.length > 0 ? parsed : [{ question: "", answer: "" }];
  });
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [shouldAutoSave, setShouldAutoSave] = useState(false);

  const syncedLength = Math.max(faqEn.length, faqAr.length, 1);
  const normalizedEn = useMemo(
    () =>
      Array.from(
        { length: syncedLength },
        (_, i) =>
          faqEn[i] || {
            question: "",
            answer: "",
            category: "Project Management" as BlogCategory,
            image: "",
            publishedAt: new Date().toISOString(),
          },
      ),
    [faqEn, syncedLength],
  );
  const normalizedAr = useMemo(
    () => Array.from({ length: syncedLength }, (_, i) => faqAr[i] || { question: "", answer: "" }),
    [faqAr, syncedLength],
  );

  const contentEn = useMemo(() => toFaqContent(normalizedEn), [normalizedEn]);
  const contentAr = useMemo(() => toFaqContent(normalizedAr), [normalizedAr]);
  const activeImageName = useMemo(() => {
    if (activeIndex === null || activeIndex < 0 || activeIndex >= normalizedEn.length) return "";
    return getImageNameFromUrl(normalizedEn[activeIndex]?.image || "");
  }, [activeIndex, normalizedEn]);
  const blogList = useMemo(() => {
    return normalizedEn
      .map((item, index) => {
        const fallback = isRtl ? `سؤال ${index + 1}` : `Question ${index + 1}`;
        const title = (normalizedAr[index]?.question || item.question || fallback).trim();
        const slug = `faq-${slugifyTitle(item.question || `item-${index + 1}`) || `item-${index + 1}`}`;
        const dateValue = item.publishedAt || new Date().toISOString();
        const date = new Date(dateValue).toLocaleDateString(locale);
        const category = item.category || "Project Management";
        return { title, slug, index, date, category, dateValue };
      })
      .filter((item) => item.title.length > 0)
      .sort((a, b) => +new Date(b.dateValue) - +new Date(a.dateValue));
  }, [isRtl, locale, normalizedAr, normalizedEn]);

  useEffect(() => {
    if (!shouldAutoSave) return;
    const form = rootRef.current?.closest("form");
    if (form && form instanceof HTMLFormElement) {
      form.requestSubmit();
    }
    setShouldAutoSave(false);
  }, [shouldAutoSave, contentEn, contentAr]);

  const handleSaveClick = () => {
    const hasInvalidHeading = normalizedEn.some((enItem, index) => {
      const arItem = normalizedAr[index] || { question: "", answer: "" };
      const hasAnyContent = Boolean(
        enItem.question.trim() ||
          enItem.answer.trim() ||
          arItem.question.trim() ||
          arItem.answer.trim() ||
          (enItem.image || "").trim(),
      );
      return hasAnyContent && !enItem.question.trim();
    });

    if (hasInvalidHeading) {
      setToastMessage(isRtl ? "لا يمكن الحفظ: عنوان المدونة (English) مطلوب." : "Cannot save: blog heading (English) is required.");
      setTimeout(() => setToastMessage(""), 5000);
      return;
    }

    const hasAtLeastOneHeading = normalizedEn.some((item) => item.question.trim().length > 0);
    if (!hasAtLeastOneHeading) {
      setToastMessage(isRtl ? "أضف عنوان مدونة واحد على الأقل قبل الحفظ." : "Add at least one blog heading before saving.");
      setTimeout(() => setToastMessage(""), 5000);
      return;
    }

    setIsSaving(true);
    setToastMessage(isRtl ? "تم حفظ المدونة بنجاح" : "Blog saved successfully");
    setTimeout(() => setToastMessage(""), 5000);
    const form = rootRef.current?.closest("form");
    if (form && form instanceof HTMLFormElement) {
      form.requestSubmit();
    }
  };

  return (
    <div ref={rootRef} style={{ display: "grid", gap: "1rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: "0.9rem", color: "var(--text-muted)", fontWeight: 600 }}>
          {isRtl ? "إدارة عناصر المدونة" : "Manage blog items"}
        </div>
        <button
          type="button"
          className="btn-secondary"
          onClick={() => {
            setFaqEn((prev) => {
              const next = [...prev, { question: "", answer: "", category: "Project Management" as BlogCategory }];
              next[next.length - 1].image = "";
              next[next.length - 1].publishedAt = new Date().toISOString();
              setActiveIndex(next.length - 1);
              return next;
            });
            setFaqAr((prev) => [...prev, { question: "", answer: "" }]);
          }}
        >
          {isRtl ? "+ إضافة مدونة جديدة" : "+ Add New Blog"}
        </button>
      </div>

      <input type="hidden" name="content" value={contentEn} />
      <input type="hidden" name="contentAr" value={contentAr} />

      {activeIndex !== null && activeIndex >= 0 && activeIndex < syncedLength ? (
        <div className="crd" style={{ padding: "1rem"}}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
            <strong style={{ fontSize: "0.9rem" }}>{isRtl ? `تحرير العنصر #${activeIndex + 1}` : `Editing item #${activeIndex + 1}`}</strong>
            <button
              type="button"
              style={{ background: "transparent", border: "none", color: "var(--danger)", cursor: "pointer", fontWeight: 700 }}
              onClick={() => {
                const confirmed = window.confirm(
                  isRtl ? "هل تريد حذف هذه المدونة؟" : "Are you sure you want to remove this blog?",
                );
                if (!confirmed) return;
                setFaqEn((prev) => prev.filter((_, i) => i !== activeIndex));
                setFaqAr((prev) => prev.filter((_, i) => i !== activeIndex));
                setActiveIndex((prev) => {
                  if (prev === null) return null;
                  const nextLength = syncedLength - 1;
                  if (nextLength <= 0) return null;
                  return Math.max(0, Math.min(prev - 1, nextLength - 1));
                });
                setShouldAutoSave(true);
              }}
            >
              {isRtl ? "حذف" : "Delete"}
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div style={{ display: "grid", gap: "0.5rem" }}>
              <label>{isRtl ? "السؤال (إنجليزي)" : "Question (English)"}</label>
              <input
                type="text"
                dir="ltr"
                autoComplete="off"
                value={normalizedEn[activeIndex].question}
                onChange={(e) =>
                  setFaqEn((prev) =>
                    updateItemAt(
                      prev,
                      activeIndex,
                      () => ({ question: "", answer: "", category: "Project Management", image: "", publishedAt: new Date().toISOString() }),
                      (item) => ({ ...item, question: e.target.value }),
                    ),
                  )
                }
                placeholder={isRtl ? "اكتب السؤال بالإنجليزي" : "Write question in English"}
                style={{ minHeight: "44px" }}
              />
              <label>{isRtl ? "الإجابة (إنجليزي)" : "Answer (English)"}</label>
              <textarea
                value={normalizedEn[activeIndex].answer}
                onChange={(e) =>
                  setFaqEn((prev) =>
                    updateItemAt(
                      prev,
                      activeIndex,
                      () => ({ question: "", answer: "", category: "Project Management", image: "", publishedAt: new Date().toISOString() }),
                      (item) => ({ ...item, answer: e.target.value }),
                    ),
                  )
                }
                placeholder={isRtl ? "اكتب الإجابة بالإنجليزي" : "Write answer in English"}
                style={{ minHeight: "110px" }}
              />
            </div>

            <div style={{ display: "grid", gap: "0.5rem" }}>
              <label>{isRtl ? "السؤال (عربي)" : "Question (Arabic)"}</label>
              <input
                type="text"
                dir="rtl"
                autoComplete="off"
                value={normalizedAr[activeIndex].question}
                onChange={(e) =>
                  setFaqAr((prev) =>
                    updateItemAt(
                      prev,
                      activeIndex,
                      () => ({ question: "", answer: "" }),
                      (item) => ({ ...item, question: e.target.value }),
                    ),
                  )
                }
                placeholder={isRtl ? "اكتب السؤال بالعربي" : "Write question in Arabic"}
                style={{ minHeight: "44px" }}
              />
              <label>{isRtl ? "الإجابة (عربي)" : "Answer (Arabic)"}</label>
              <textarea
                dir="rtl"
                value={normalizedAr[activeIndex].answer}
                onChange={(e) =>
                  setFaqAr((prev) =>
                    updateItemAt(
                      prev,
                      activeIndex,
                      () => ({ question: "", answer: "" }),
                      (item) => ({ ...item, answer: e.target.value }),
                    ),
                  )
                }
                placeholder={isRtl ? "اكتب الإجابة بالعربي" : "Write answer in Arabic"}
                style={{ minHeight: "110px" }}
              />
            </div>
          </div>

          <div style={{ marginTop: "0.75rem", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.75rem", alignItems: "end" }}>
            <div style={{ display: "grid", gap: "0.5rem" }}>
              <label>{isRtl ? "تصنيف المقال" : "Blog Category"}</label>
              <select
                value={normalizedEn[activeIndex].category || "Project Management"}
                onChange={(e) =>
                  setFaqEn((prev) =>
                    prev.map((item, i) => (i === activeIndex ? { ...item, category: e.target.value as BlogCategory } : item)),
                  )
                }
              >
                {BLOG_CATEGORIES.filter((c) => c !== "All").map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ display: "grid", gap: "0.5rem" }}>
              <label>{isRtl ? "رفع صورة" : "Upload Image"}</label>
              <input
                type="file"
                accept="image/*"
                onChange={async (event) => {
                  const file = event.target.files?.[0];
                  if (!file || activeIndex === null) return;
                  if (file.size > 5 * 1024 * 1024) {
                    alert(isRtl ? "حجم الصورة يجب أن يكون أقل من 5 ميجابايت" : "Image must be 5MB or less");
                    event.target.value = "";
                    return;
                  }
                  setIsUploadingImage(true);
                  try {
                    const payload = new FormData();
                    payload.append("file", file);
                    const response = await fetch("/api/admin/blog-image-upload", {
                      method: "POST",
                      body: payload,
                    });
                    const result = await response.json();
                    if (response.ok && result.url) {
                      setFaqEn((prev) =>
                        prev.map((item, i) => (i === activeIndex ? { ...item, image: result.url } : item)),
                      );
                      setToastMessage(isRtl ? "تم رفع الصورة بنجاح" : "Image uploaded successfully");
                      setTimeout(() => setToastMessage(""), 5000);
                    } else {
                      alert(result?.error || (isRtl ? "فشل رفع الصورة" : "Image upload failed"));
                    }
                  } finally {
                    setIsUploadingImage(false);
                    event.target.value = "";
                  }
                }}
              />
              {activeImageName ? (
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                  {isRtl ? `اسم الصورة: ${activeImageName}` : `Image: ${activeImageName}`}
                </span>
              ) : null}
            </div>
            <div style={{ display: "flex", justifyContent: isRtl ? "flex-start" : "flex-end" }}>
              <button
                type="button"
                className="btn-primary"
                style={{ whiteSpace: "nowrap" }}
                onClick={handleSaveClick}
                disabled={isSaving}
              >
                {isSaving ? (isRtl ? "جارٍ الحفظ..." : "Saving...") : (isRtl ? "حفظ المدونة" : "Save Blog")}
              </button>
            </div>
            {isUploadingImage ? (
              <span style={{ gridColumn: "1 / -1", fontSize: "0.75rem", color: "var(--text-muted)" }}>
                {isRtl ? "جارٍ رفع الصورة..." : "Uploading image..."}
              </span>
            ) : null}
          </div>

        </div>
      ) : (
        <div className="card" style={{ padding: "0.9rem 1rem", color: "var(--text-muted)", border: "1px dashed var(--border-light)" }}>
          {isRtl ? "اضغط على + إضافة مدونة جديدة أو اختر عنصراً من القائمة للبدء." : "Click + Add New Blog or select an item from the list to start."}
        </div>
      )}

      <div className="card" style={{ padding: "1rem", border: "1px solid var(--border-light)" }}>
        <div style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "0.6rem" }}>
          {isRtl ? "قائمة جميع المقالات المضافة" : "All added blogs"}
        </div>
        {blogList.length === 0 ? (
          <p style={{ margin: 0, color: "var(--text-muted)" }}>
            {isRtl ? "لا توجد عناصر بعد." : "No items added yet."}
          </p>
        ) : (
          <div style={{ display: "grid", gap: "0.5rem" }}>
            {blogList.map((item) => (
              <button
                key={item.slug}
                type="button"
                onClick={() => setActiveIndex(item.index)}
                style={{
                  width: "100%",
                  textAlign: isRtl ? "right" : "left",
                  padding: "0.65rem 0.75rem",
                  borderRadius: "var(--radius-md)",
                  border: activeIndex === item.index ? "1px solid var(--primary)" : "1px solid var(--border-light)",
                  background: activeIndex === item.index ? "var(--primary-light)" : "var(--surface)",
                  cursor: "pointer",
                  color: "var(--text)",
                  fontWeight: 600,
                }}
              >
                {item.index + 1}. {item.title}
                <span style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 500, marginTop: "0.2rem" }}>
                  {item.date} - {item.category}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
      {toastMessage ? (
        <div
          style={{
            position: "fixed",
            top: 24,
            right: 24,
            background: "var(--success)",
            color: "white",
            padding: "0.65rem 0.9rem",
            borderRadius: "10px",
            fontSize: "0.84rem",
            fontWeight: 700,
            boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
            zIndex: 60,
          }}
        >
          {toastMessage}
        </div>
      ) : null}
    </div>
  );
}
