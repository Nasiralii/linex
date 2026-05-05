"use client";

import { useId, useState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2, Paperclip, Download, Send, MessageSquare, Upload } from "lucide-react";
import { sendWorkspaceMessage, shareFileMessage } from "@/app/[locale]/dashboard/execution/[id]/actions";

interface WorkspaceChatProps {
  messages: any[];
  userId: string;
  projectId: string;
  isRtl: boolean;
}

function SendMessageButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary" style={{ padding: "0.5rem 1rem" }} disabled={pending}>
      {pending ? <Loader2 className="animate-spin" style={{ width: "16px", height: "16px" }} /> : <Send style={{ width: "16px", height: "16px" }} />}
    </button>
  );
}

function ShareFileButton({ isRtl }: { isRtl: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      style={{
        padding: "0.5rem 0.75rem",
        fontSize: "0.75rem",
        borderRadius: "var(--radius-md)",
        border: "1px solid var(--border)",
        background: pending ? "var(--surface)" : "var(--surface-2)",
        color: pending ? "var(--text-muted)" : "var(--text)",
        cursor: pending ? "not-allowed" : "pointer",
        opacity: pending ? 0.8 : 1,
        fontFamily: "inherit",
        fontWeight: 600,
        display: "flex",
        alignItems: "center",
        gap: "0.35rem",
        whiteSpace: "nowrap",
      }}
    >
      {pending ? (
        <>
          <Loader2 className="animate-spin" style={{ width: "12px", height: "12px" }} />
          {isRtl ? "جارٍ الإرسال..." : "Sending..."}
        </>
      ) : (
        <>
          <Paperclip style={{ width: "12px", height: "12px" }} />
          {isRtl ? "مشاركة ملف" : "Share File"}
        </>
      )}
    </button>
  );
}

export function WorkspaceChat({ messages, userId, projectId, isRtl }: WorkspaceChatProps) {
  const fileInputId = useId();
  const [selectedFileName, setSelectedFileName] = useState("");
  const formatMessageTime = (value: string | Date) =>
    new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "UTC",
    }).format(new Date(value));

  return (
    <div className="card" style={{ padding: "1.5rem", marginTop: "1.5rem" }}>
      <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text)", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <MessageSquare style={{ width: "18px", height: "18px", color: "var(--primary)" }} />
        {isRtl ? "محادثة المشروع" : "Project Chat"}
      </h3>
      <div style={{ maxHeight: "400px", overflowY: "auto", marginBottom: "1rem", display: "flex", flexDirection: "column", gap: "0.5rem", padding: "0.5rem", background: "var(--surface-2)", borderRadius: "var(--radius-lg)" }}>
        {messages.length === 0 ? (
          <p style={{ fontSize: "0.8125rem", color: "var(--text-muted)", textAlign: "center", padding: "2rem" }}>
            {isRtl ? "لا توجد رسائل بعد" : "No messages yet"}
          </p>
        ) : messages.map((msg: any) => {
          const isMine = msg.senderId === userId;
          return (
            <div key={msg.id} style={{
              maxWidth: "75%", padding: "0.75rem 1rem", borderRadius: "var(--radius-lg)",
              alignSelf: isMine ? "flex-end" : "flex-start",
              background: isMine ? "var(--primary)" : "white",
              color: isMine ? "white" : "var(--text)",
            }}>
              <div style={{ fontSize: "0.6875rem", marginBottom: "0.25rem", opacity: 0.7 }}>
                {msg.sender?.email} • {formatMessageTime(msg.createdAt)}
              </div>
              <div style={{ fontSize: "0.875rem", lineHeight: 1.5 }}>
                {msg.content.startsWith("📎 FILE:") ? (
                  (() => {
                    const payload = msg.content.replace("📎 FILE: ", "");
                    const [fileName, fileUrl] = payload.split("||");
                    return (
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.375rem 0.5rem", borderRadius: "var(--radius-md)", background: isMine ? "rgba(255,255,255,0.15)" : "var(--surface-2)" }}>
                        <Paperclip style={{ width: "14px", height: "14px", flexShrink: 0 }} />
                        {fileUrl ? (
                          <a href={fileUrl} target="_blank" rel="noopener noreferrer" style={{ fontWeight: 600, color: isMine ? "white" : "var(--primary)", textDecoration: "none" }}>
                            {fileName}
                          </a>
                        ) : (
                          <span style={{ fontWeight: 600 }}>{fileName}</span>
                        )}
                        <Download style={{ width: "12px", height: "12px", flexShrink: 0 }} />
                      </div>
                    );
                  })()
                ) : msg.content.startsWith("📋") ? (
                  <div style={{ padding: "0.25rem 0.5rem", borderRadius: "var(--radius-md)", background: isMine ? "rgba(255,255,255,0.15)" : "var(--primary-light)", fontWeight: 600 }}>
                    {msg.content}
                  </div>
                ) : msg.content}
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <form action={sendWorkspaceMessage} style={{ display: "flex", gap: "0.5rem" }}>
          <input type="hidden" name="projectId" value={projectId} />
          <input type="text" name="content" placeholder={isRtl ? "اكتب رسالتك..." : "Type a message..."} required style={{ flex: 1 }} />
          <SendMessageButton />
        </form>
        <form action={shareFileMessage} style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <input type="hidden" name="projectId" value={projectId} />
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flex: 1 }}>
            <input
              id={fileInputId}
              type="file"
              name="file"
              required
              onChange={(e) => setSelectedFileName(e.target.files?.[0]?.name || "")}
              style={{ display: "none" }}
            />
            <label
              htmlFor={fileInputId}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.35rem",
                padding: "0.5rem 0.75rem",
                borderRadius: "var(--radius-md)",
                border: "1px dashed var(--border)",
                background: "var(--surface-2)",
                color: "var(--primary)",
                cursor: "pointer",
                fontSize: "0.75rem",
                fontWeight: 700,
                whiteSpace: "nowrap",
              }}
            >
              <Upload style={{ width: "13px", height: "13px" }} />
              {isRtl ? "رفع ملف" : "Upload File"}
            </label>
            <span style={{ fontSize: "0.75rem", color: selectedFileName ? "var(--text)" : "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {selectedFileName || (isRtl ? "لم يتم اختيار ملف" : "No file selected")}
            </span>
          </div>
          <ShareFileButton isRtl={isRtl} />
        </form>
      </div>
    </div>
  );
}
