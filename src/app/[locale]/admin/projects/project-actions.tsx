"use client";

import { useState } from "react";
import { CheckCircle, XCircle, MessageSquare } from "lucide-react";
import { useToast } from "@/components/toast";
import { approveProject, requestEditsAction, rejectProject } from "./project-actions-server";

export default function ProjectActions({ projectId, isRtl }: { projectId: string; isRtl: boolean }) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);

  async function handleApprove() {
    setLoading("approve");
    const formData = new FormData();
    formData.append("projectId", projectId);
    
    const result = await approveProject(formData);

    if (result.success) {
      showToast(isRtl ? "تمت الموافقة والنشر بنجاح" : "Approved and published successfully", "success");
      window.location.reload();
    } else {
      showToast(result.error || (isRtl ? "فشلت العملية" : "Action failed"), "error");
    }
    setLoading(null);
  }

  async function handleRequestEdit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading("edit");
    const formData = new FormData(e.currentTarget);
    formData.append("projectId", projectId);
    
    const result = await requestEditsAction(formData);

    if (result.success) {
      showToast(isRtl ? "تم إرسال طلب التعديل بنجاح" : "Edit request sent successfully", "success");
      window.location.reload();
    } else {
      showToast(result.error || (isRtl ? "فشلت العملية" : "Action failed"), "error");
    }
    setLoading(null);
  }

  async function handleReject() {
    setLoading("reject");
    const formData = new FormData();
    formData.append("projectId", projectId);
    
    const result = await rejectProject(formData);

    if (result.success) {
      showToast(isRtl ? "تم الرفض بنجاح" : "Rejected successfully", "success");
      window.location.reload();
    } else {
      showToast(result.error || (isRtl ? "فشلت العملية" : "Action failed"), "error");
    }
    setLoading(null);
  }

  return (
    <div style={{ display: "flex", gap: "0.5rem", alignItems: "end", borderTop: "1px solid var(--border-light)", paddingTop: "0.75rem" }}>
      <button
        type="button"
        onClick={handleApprove}
        disabled={loading !== null}
        className="btn-primary"
        style={{ padding: "0.5rem 1rem", fontSize: "0.8125rem", display: "flex", alignItems: "center", gap: "0.25rem", opacity: loading !== null && loading !== "approve" ? 0.7 : 1 }}
      >
        {loading === "approve" && <span className="animate-spin">⏳</span>}
        {loading === "approve" ? (isRtl ? "جاري..." : "Loading...") : <><CheckCircle style={{ width: "14px", height: "14px" }} /> {isRtl ? "موافقة ونشر" : "Approve & Publish"}</>}
      </button>
      <form onSubmit={handleRequestEdit} style={{ flex: 1, display: "flex", gap: "0.375rem" }}>
        <input type="hidden" name="projectId" value={projectId} />
        <label htmlFor={`edit-notes-${projectId}`} style={{ position: "absolute", width: 1, height: 1, padding: 0, margin: -1, overflow: "hidden", clip: "rect(0, 0, 0, 0)", whiteSpace: "nowrap", border: 0 }}>
          {isRtl ? "ملاحظات طلب التعديل" : "Edit request notes"}
        </label>
        <input
          id={`edit-notes-${projectId}`}
          type="text"
          name="editNotes"
          disabled={loading !== null}
          placeholder={isRtl ? "ملاحظات التعديل المطلوبة..." : "Specify what needs to be changed..."}
          style={{ flex: 1, fontSize: "0.8125rem", opacity: loading !== null && loading !== "edit" ? 0.7 : 1 }}
        />
        <button
          type="submit"
          disabled={loading !== null}
          style={{
            padding: "0.5rem 1rem", fontSize: "0.8125rem", borderRadius: "var(--radius-md)",
            border: "1px solid var(--accent)", background: "var(--accent-light)", color: "var(--accent)",
            cursor: loading !== null ? "not-allowed" : "pointer", fontFamily: "inherit", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.25rem", whiteSpace: "nowrap", opacity: loading !== null && loading !== "edit" ? 0.7 : 1,
          }}
        >
          {loading === "edit" ? <span className="animate-spin">⏳</span> : <MessageSquare style={{ width: "14px", height: "14px" }} />}
          {loading === "edit" ? (isRtl ? "جاري..." : "Loading...") : (isRtl ? "طلب تعديل" : "Request Edit")}
        </button>
      </form>
      <button
        type="button"
        onClick={handleReject}
        disabled={loading !== null}
        style={{
          padding: "0.5rem 1rem", fontSize: "0.8125rem", borderRadius: "var(--radius-md)",
          border: "1px solid var(--error)", background: "var(--error-light)", color: "var(--error)",
          cursor: loading !== null ? "not-allowed" : "pointer", fontFamily: "inherit", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.25rem", opacity: loading !== null && loading !== "reject" ? 0.7 : 1,
        }}
      >
        {loading === "reject" ? <span className="animate-spin">⏳</span> : <XCircle style={{ width: "14px", height: "14px" }} />}
        {loading === "reject" ? (isRtl ? "جاري..." : "Loading...") : (isRtl ? "رفض" : "Reject")}
      </button>
    </div>
  );
}
