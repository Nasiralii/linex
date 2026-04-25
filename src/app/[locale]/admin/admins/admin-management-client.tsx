"use client";

import { useState } from "react";
import { Link } from "@/i18n/routing";
import { Plus, Trash2, Edit, Power } from "lucide-react";
import AddAdminModal from "../add-admin-modal";
import { deleteAdmin, toggleAdminStatus } from "./actions";

interface Admin {
  id: string;
  email: string;
  status: string;
  createdAt: Date;
}

interface AdminManagementClientProps {
  admins: Admin[];
  isRtl: boolean;
}

export default function AdminManagementClient({ admins, isRtl }: AdminManagementClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  async function handleDelete(userId: string) {
    const choice = confirm(
      isRtl
        ? "اضغط OK للإلغاء النهائي من قاعدة البيانات\nاضغط Cancel للتعطيل فقط"
        : "Click OK to permanently delete from database\nClick Cancel to deactivate only"
    );
    const formData = new FormData();
    formData.append("userId", userId);
    formData.append("hardDelete", choice ? "true" : "false");
    try {
      await deleteAdmin(formData);
    } catch (e: any) {
      alert(e.message || "Failed to delete admin");
    }
  }

  async function handleToggleStatus(userId: string) {
    const formData = new FormData();
    formData.append("userId", userId);
    try {
      await toggleAdminStatus(formData);
    } catch (e: any) {
      alert(e.message || "Failed to toggle status");
    }
  }

  return (
    <>
      <div style={{ background: "var(--bg)", minHeight: "calc(100vh - 64px)" }}>
        <div style={{ background: "linear-gradient(135deg, #1a2332, #2d3748)", padding: "2rem 0" }}>
          <div className="container-app">
            <Link href="/admin" style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none", fontSize: "0.875rem" }}>
              ← {isRtl ? "عودة" : "Back"}
            </Link>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "white", marginTop: "0.5rem" }}>
              {isRtl ? "إدارة المسؤولين" : "Admin Management"}
            </h1>
          </div>
        </div>

        <div className="container-app" style={{ padding: "2rem 1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
            <h2 style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--text)" }}>
              {isRtl ? "المسؤولون" : "Admins"} ({admins.length})
            </h2>
            <button
              onClick={() => setIsModalOpen(true)}
              style={{
                padding: "0.625rem 1.25rem",
                borderRadius: "var(--radius-md)",
                fontSize: "0.875rem",
                fontWeight: 700,
                color: "white",
                background: "var(--primary)",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <Plus style={{ width: "16px", height: "16px" }} />
              {isRtl ? "إضافة مسؤول" : "Add Admin"}
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {admins.map((admin) => (
              <div key={admin.id} style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "1rem",
                background: "var(--surface)",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border)",
              }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--text)" }}>
                    {admin.email}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                    {admin.status} · {new Date(admin.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button
                    onClick={() => handleToggleStatus(admin.id)}
                    style={{
                      padding: "0.5rem",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--border)",
                      background: admin.status === "ACTIVE" ? "var(--surface-2)" : "#fff7ed",
                      cursor: "pointer",
                      color: admin.status === "ACTIVE" ? "var(--text-secondary)" : "#f97316",
                    }}
                    title={admin.status === "ACTIVE" ? (isRtl ? "تعطيل" : "Deactivate") : (isRtl ? "تفعيل" : "Activate")}
                  >
                    <Power style={{ width: "16px", height: "16px" }} />
                  </button>
                  <button style={{
                    padding: "0.5rem",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border)",
                    background: "var(--surface-2)",
                    cursor: "pointer",
                    color: "var(--text-secondary)",
                  }}>
                    <Edit style={{ width: "16px", height: "16px" }} />
                  </button>
                  <button
                    onClick={() => handleDelete(admin.id)}
                    style={{
                      padding: "0.5rem",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--border)",
                      background: "var(--surface-2)",
                      cursor: "pointer",
                      color: "var(--error)",
                    }}
                  >
                    <Trash2 style={{ width: "16px", height: "16px" }} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <AddAdminModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} isRtl={isRtl} />
    </>
  );
}
