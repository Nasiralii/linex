"use client";

import { useId, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import { MessageSquare, Paperclip, Download, Upload, Loader2 } from "lucide-react";
import { QASendButton } from "./qa-send-button";

interface QAMessageItem {
  id: string;
  senderId: string;
  receiverId: string;
  senderEmail?: string;
  content: string;
  createdAt: string | Date;
}

interface QAConversationOption {
  id: string;
  label: string;
}

function parseFileMessage(content: string) {
  const normalized = String(content || "").trim();
  const marker = "FILE:";
  const markerIndex = normalized.indexOf(marker);
  if (markerIndex === -1) return null;

  const payload = normalized.slice(markerIndex + marker.length).trim();
  const separator = payload.indexOf("||");
  if (separator === -1) return null;

  const fileName = payload.slice(0, separator).trim();
  const fileUrl = payload.slice(separator + 2).trim();
  if (!fileName || !fileUrl) return null;
  return { fileName, fileUrl };
}

interface QAPanelProps {
  isRtl: boolean;
  projectId: string;
  userId: string;
  userRole: string;
  isOwner: boolean;
  isContractor: boolean;
  isEngineer: boolean;
  hasKrasat: boolean;
  initialRecipientId: string | null;
  messages: QAMessageItem[];
  conversationOptions: QAConversationOption[];
  awardedUserId: string | null;
  sendMessageAction: (formData: FormData) => Promise<void>;
}

export function QAPanel({
  isRtl,
  projectId,
  userId,
  userRole,
  isOwner,
  isContractor,
  isEngineer,
  hasKrasat,
  initialRecipientId,
  messages,
  conversationOptions,
  awardedUserId,
  sendMessageAction,
}: QAPanelProps) {
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

  const [selectedRecipientId, setSelectedRecipientId] = useState<string | null>(initialRecipientId);
  const [selectedFileName, setSelectedFileName] = useState("");
  const fileInputId = useId();
  const formatMessageTime = (value: string | Date) =>
    new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "UTC",
    }).format(new Date(value));

  const qaMessages = useMemo(() => {
    if (!selectedRecipientId) return messages;
    return messages.filter((msg) => {
      const isDirectPair =
        (msg.senderId === userId && msg.receiverId === selectedRecipientId) ||
        (msg.senderId === selectedRecipientId && msg.receiverId === userId);
      return isDirectPair;
    });
  }, [messages, selectedRecipientId, userId]);

  const activeConversationName = useMemo(() => {
    if (!selectedRecipientId) return "";
    return conversationOptions.find((option) => option.id === selectedRecipientId)?.label || "";
  }, [conversationOptions, selectedRecipientId]);

  const isAwardedConversationLocked = !!awardedUserId && !(
    userRole === "ADMIN" ||
    (isOwner && selectedRecipientId === awardedUserId) ||
    ((!isOwner && (isContractor || isEngineer)) && userId === awardedUserId)
  );

  if (!hasKrasat || (!selectedRecipientId && messages.length === 0)) return null;

  return (
    <div className="card" style={{ padding: "1.5rem", marginBottom: "1.5rem" }}>
      <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text)", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <MessageSquare style={{ width: "18px", height: "18px", color: "var(--primary)" }} />
        {isRtl ? "محادثة المشروع" : "Project Chat"}
      </h3>
      {activeConversationName && (
        <div style={{ marginTop: "-0.6rem", marginBottom: "0.75rem", fontSize: "0.75rem", color: "var(--text-muted)" }}>
          {isRtl ? "المحادثة الحالية:" : "Current conversation:"}{" "}
          <span style={{ color: "var(--text)", fontWeight: 700 }}>{activeConversationName}</span>
        </div>
      )}

      {isOwner && conversationOptions.length > 1 && (
        <div style={{ marginBottom: "0.75rem" }}>
          <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: "0.35rem" }}>
            {isRtl ? "اختر المحادثة" : "Select conversation"}
          </div>
          <div style={{ display: "flex", gap: "0.375rem", flexWrap: "wrap" }}>
            {conversationOptions.map((option) => {
              const active = option.id === selectedRecipientId;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setSelectedRecipientId(option.id)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    padding: "0.35rem 0.65rem",
                    borderRadius: "var(--radius-full)",
                    border: active ? "1px solid var(--primary)" : "1px solid var(--border-light)",
                    background: active ? "var(--primary-light)" : "var(--surface-2)",
                    color: active ? "var(--primary)" : "var(--text-secondary)",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                  }}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div style={{ maxHeight: "300px", overflowY: "auto", marginBottom: "1rem", display: "flex", flexDirection: "column", gap: "0.5rem", padding: "0.5rem", background: "var(--surface-2)", borderRadius: "var(--radius-lg)" }}>
        {qaMessages.length === 0 ? (
          <p style={{ fontSize: "0.8125rem", color: "var(--text-muted)", textAlign: "center", padding: "1rem" }}>
            {isRtl ? "لا توجد رسائل لهذه المحادثة بعد." : "No messages in this conversation yet."}
          </p>
        ) : (
          qaMessages.map((msg) => {
            const isMine = msg.senderId === userId;
            return (
              <div key={msg.id} style={{
                maxWidth: "75%", padding: "0.75rem 1rem", borderRadius: "var(--radius-lg)",
                alignSelf: isMine ? "flex-end" : "flex-start",
                background: isMine ? "var(--primary)" : "var(--surface-2)",
                color: isMine ? "white" : "var(--text)",
              }}>
                <div style={{ fontSize: "0.6875rem", marginBottom: "0.25rem", opacity: 0.7 }}>
                  {msg.senderEmail || "—"} • {formatMessageTime(msg.createdAt)}
                </div>
                <div style={{ fontSize: "0.875rem", lineHeight: 1.5 }}>
                  {(() => {
                    const fileMessage = parseFileMessage(msg.content);
                    if (!fileMessage) return msg.content;
                    return (
                      <div
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          padding: "0.35rem 0.5rem",
                          borderRadius: "var(--radius-md)",
                          background: isMine ? "rgba(255,255,255,0.15)" : "white",
                        }}
                      >
                        <Paperclip style={{ width: "13px", height: "13px", flexShrink: 0 }} />
                        <a
                          href={fileMessage.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ fontWeight: 600, color: isMine ? "white" : "var(--primary)", textDecoration: "none" }}
                        >
                          {fileMessage.fileName}
                        </a>
                        <Download style={{ width: "12px", height: "12px", flexShrink: 0 }} />
                      </div>
                    );
                  })()}
                </div>
              </div>
            );
          })
        )}
      </div>

      {selectedRecipientId ? (
        isAwardedConversationLocked ? (
          <div style={{ fontSize: "0.75rem", color: "var(--error)", padding: "0.625rem 0.75rem", borderRadius: "var(--radius-md)", background: "var(--error-light)" }}>
            {isRtl
              ? "تم إيقاف هذه المحادثة بعد ترسية المشروع على مقدم عرض آخر."
              : "This conversation is blocked because the project has been awarded to a different bidder."}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <form action={sendMessageAction} style={{ display: "flex", gap: "0.5rem" }}>
              <input type="hidden" name="receiverId" value={selectedRecipientId} />
              <input type="hidden" name="projectId" value={projectId} />
              <input type="text" name="content" placeholder={isRtl ? "اكتب رسالتك..." : "Type your message..."} required style={{ flex: 1 }} />
              <QASendButton />
            </form>
            <form action={sendMessageAction} style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              <input type="hidden" name="receiverId" value={selectedRecipientId} />
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
        )
      ) : (
        <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", margin: 0 }}>
          {isRtl ? "يمكنك عرض الرسائل الحالية، وسيتم تفعيل الرد عند تحديد الطرف المقابل للمحادثة." : "You can view the current messages. Replying will be enabled once a conversation counterpart is identified."}
        </p>
      )}
    </div>
  );
}
