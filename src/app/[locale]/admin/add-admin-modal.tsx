"use client";

import { useState } from "react";
import { X, Eye, EyeOff, Loader2 } from "lucide-react";
import { addAdmin } from "./admins/actions";
import { useToast } from "@/components/toast";

interface AddAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  isRtl: boolean;
}

export default function AddAdminModal({ isOpen, onClose, isRtl }: AddAdminModalProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  async function handleSubmit(formData: FormData) {
    try {
      setError("");
      setLoading(true);
      const result = await addAdmin(formData);
      if (result.success) {
        showToast(isRtl ? "تم إضافة المسؤول بنجاح" : "Admin added successfully", "success");
        onClose();
      } else {
        setError(result.error || "Failed to add admin");
        showToast(result.error || (isRtl ? "فشل إضافة المسؤول" : "Failed to add admin"), "error");
      }
    } catch {
      setError("Failed to add admin");
      showToast(isRtl ? "فشل إضافة المسؤول" : "Failed to add admin", "error");
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
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
            {isRtl ? "إضافة مسؤول جديد" : "Add New Admin"}
          </h2>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}
          >
            <X style={{ width: "20px", height: "20px" }} />
          </button>
        </div>

        <form action={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {error && (
            <div style={{ padding: "0.5rem", background: "#fee", color: "#c33", borderRadius: "var(--radius-md)", fontSize: "0.875rem" }}>
              {error}
            </div>
          )}
          <div>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.5rem", color: "var(--text)" }}>
              {isRtl ? "البريد الإلكتروني" : "Email"}
            </label>
            <input
              type="email"
              name="email"
              placeholder="admin@example.com"
              required
              style={{
                width: "100%",
                padding: "0.625rem",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border)",
                fontSize: "0.875rem",
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.5rem", color: "var(--text)" }}>
              {isRtl ? "كلمة المرور" : "Password"}
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
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
            disabled={loading}
            style={{
              padding: "0.75rem",
              borderRadius: "var(--radius-md)",
              fontSize: "0.875rem",
              fontWeight: 700,
              color: "white",
              background: "var(--primary)",
              border: "none",
              cursor: loading ? "not-allowed" : "pointer",
              marginTop: "0.5rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? <Loader2 style={{ width: "16px", height: "16px" }} className="animate-spin" /> : null}
            {loading ? (isRtl ? "جاري..." : "Loading...") : (isRtl ? "إضافة" : "Add")}
          </button>
        </form>
      </div>
    </div>
  );
}
