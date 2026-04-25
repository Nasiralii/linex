"use client";

import { useState } from "react";
import { Link } from "@/i18n/routing";
import { Plus, Trash2, Edit, Power, Loader2, X, Eye, EyeOff } from "lucide-react";
import AddAdminModal from "../add-admin-modal";
import { deleteAdmin, toggleAdminStatus, updateAdminPassword } from "./actions";
import { useToast } from "@/components/toast";
import { isFullAccessAdmin } from "@/lib/admin-config";

interface Admin {
  id: string;
  email: string;
  status: string;
  createdAt: Date;
}

interface AdminManagementClientProps {
  admins: Admin[];
  isRtl: boolean;
  currentUserEmail: string;
}

export default function AdminManagementClient({ admins, isRtl, currentUserEmail }: AdminManagementClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { showToast } = useToast();

  async function handleDelete(userId: string) {
    const choice = confirm(
      isRtl
        ? "اضغط OK للإلغاء النهائي من قاعدة البيانات\nاضغط Cancel للتعطيل فقط"
        : "Click OK to permanently delete from database\nClick Cancel to deactivate only"
    );
    const formData = new FormData();
    formData.append("userId", userId);
    formData.append("hardDelete", choice ? "true" : "false");
    setLoadingId(userId);
    try {
      const result = await deleteAdmin(formData);
      if (result.success) {
        showToast(isRtl ? "تم حذف المسؤول بنجاح" : "Admin deleted successfully", "success");
      } else {
        showToast(result.error || (isRtl ? "فشل حذف المسؤول" : "Failed to delete admin"), "error");
      }
    } catch {
      showToast(isRtl ? "فشل حذف المسؤول" : "Failed to delete admin", "error");
    }
    setLoadingId(null);
  }

  async function handleToggleStatus(userId: string, currentStatus: string) {
    const formData = new FormData();
    formData.append("userId", userId);
    setLoadingId(userId);
    try {
      const result = await toggleAdminStatus(formData);
      if (result.success) {
        const isActivating = currentStatus !== "ACTIVE";
        showToast(
          isActivating 
            ? (isRtl ? "تم تفعيل المسؤول بنجاح" : "Admin activated successfully")
            : (isRtl ? "تم تعطيل المسؤول بنجاح" : "Admin deactivated successfully"),
          "success"
        );
      } else {
        showToast(result.error || (isRtl ? "فشل تغيير الحالة" : "Failed to toggle status"), "error");
      }
    } catch {
      showToast(isRtl ? "فشل تغيير الحالة" : "Failed to toggle status", "error");
    }
    setLoadingId(null);
  }

  function handleEditPassword(admin: Admin) {
    setSelectedAdmin(admin);
    setIsPasswordModalOpen(true);
    setShowPassword(false);
  }

  async function handlePasswordSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedAdmin) return;
    
    const formData = new FormData(e.currentTarget);
    formData.append("userId", selectedAdmin.id);
    
    setPasswordLoading(true);
    try {
      const result = await updateAdminPassword(formData);
      if (result.success) {
        showToast(isRtl ? "تم تحديث كلمة المرور وتم تسجيل خروج المسؤول" : "Password updated and admin logged out", "success");
        setIsPasswordModalOpen(false);
        setSelectedAdmin(null);
      } else {
        showToast(result.error || (isRtl ? "فشل تحديث كلمة المرور" : "Failed to update password"), "error");
      }
    } catch {
      showToast(isRtl ? "فشل تحديث كلمة المرور" : "Failed to update password", "error");
    }
    setPasswordLoading(false);
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
            {admins.map((admin) => {
              const isFullAccess = isFullAccessAdmin(admin.email);
              const isLoading = loadingId === admin.id;
              return (
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
                      {isFullAccess && (
                        <span style={{
                          marginInlineStart: "0.5rem",
                          fontSize: "0.75rem",
                          padding: "0.125rem 0.375rem",
                          background: "#2563eb",
                          color: "white",
                          borderRadius: "4px",
                        }}>
                          {isRtl ? "مدير" : "Super Admin"}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                      {admin.status} · {new Date(admin.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  {/* Hide actions for full access admin */}
                  {!isFullAccess && (
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button
                        onClick={() => handleToggleStatus(admin.id, admin.status)}
                        disabled={isLoading}
                        style={{
                          padding: "0.5rem",
                          borderRadius: "var(--radius-md)",
                          border: "1px solid var(--border)",
                          background: admin.status === "ACTIVE" ? "var(--surface-2)" : "#fff7ed",
                          cursor: isLoading ? "not-allowed" : "pointer",
                          color: admin.status === "ACTIVE" ? "var(--text-secondary)" : "#f97316",
                          opacity: isLoading ? 0.5 : 1,
                        }}
                        title={admin.status === "ACTIVE" ? (isRtl ? "تعطيل" : "Deactivate") : (isRtl ? "تفعيل" : "Activate")}
                      >
                        {isLoading ? <Loader2 style={{ width: "16px", height: "16px" }} className="animate-spin" /> : <Power style={{ width: "16px", height: "16px" }} />}
                      </button>
                      <button
                        onClick={() => handleEditPassword(admin)}
                        disabled={isLoading}
                        style={{
                          padding: "0.5rem",
                          borderRadius: "var(--radius-md)",
                          border: "1px solid var(--border)",
                          background: "var(--surface-2)",
                          cursor: isLoading ? "not-allowed" : "pointer",
                          color: "var(--text-secondary)",
                          opacity: isLoading ? 0.5 : 1,
                        }}
                        title={isRtl ? "تغيير كلمة المرور" : "Change password"}
                      >
                        <Edit style={{ width: "16px", height: "16px" }} />
                      </button>
                      <button
                        onClick={() => handleDelete(admin.id)}
                        disabled={isLoading}
                        style={{
                          padding: "0.5rem",
                          borderRadius: "var(--radius-md)",
                          border: "1px solid var(--border)",
                          background: "var(--surface-2)",
                          cursor: isLoading ? "not-allowed" : "pointer",
                          color: "var(--error)",
                          opacity: isLoading ? 0.5 : 1,
                        }}
                      >
                        <Trash2 style={{ width: "16px", height: "16px" }} />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <AddAdminModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} isRtl={isRtl} />
      
      {/* Password Edit Modal */}
      {isPasswordModalOpen && selectedAdmin && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
        }}>
          <div style={{
            background: "var(--surface)",
            borderRadius: "var(--radius-lg)",
            padding: "2rem",
            width: "100%",
            maxWidth: "400px",
            border: "1px solid var(--border)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h2 style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--text)" }}>
                {isRtl ? "تغيير كلمة المرور" : "Change Password"}
              </h2>
              <button
                onClick={() => setIsPasswordModalOpen(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}
              >
                <X style={{ width: "20px", height: "20px" }} />
              </button>
            </div>
            
            <div style={{ marginBottom: "1rem", fontSize: "0.875rem", color: "var(--text-muted)" }}>
              {isRtl ? "المسؤول: " : "Admin: "} <strong>{selectedAdmin.email}</strong>
            </div>

            <form onSubmit={handlePasswordSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.5rem", color: "var(--text)" }}>
                  {isRtl ? "كلمة المرور الجديدة" : "New Password"}
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="newPassword"
                    placeholder="••••••••"
                    required
                    minLength={8}
                    style={{
                      width: "100%",
                      padding: "0.625rem",
                      paddingRight: "3rem",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--border)",
                      fontSize: "0.875rem",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: "absolute",
                      right: "0.625rem",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--text-muted)",
                      padding: "0",
                    }}
                  >
                    {showPassword ? <EyeOff style={{ width: "18px", height: "18px" }} /> : <Eye style={{ width: "18px", height: "18px" }} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={passwordLoading}
                style={{
                  padding: "0.75rem",
                  borderRadius: "var(--radius-md)",
                  fontSize: "0.875rem",
                  fontWeight: 700,
                  color: "white",
                  background: "var(--primary)",
                  border: "none",
                  cursor: passwordLoading ? "not-allowed" : "pointer",
                  marginTop: "0.5rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  opacity: passwordLoading ? 0.7 : 1,
                }}
              >
                {passwordLoading ? <Loader2 style={{ width: "16px", height: "16px" }} className="animate-spin" /> : null}
                {passwordLoading ? (isRtl ? "جاري..." : "Updating...") : (isRtl ? "تحديث" : "Update")}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
