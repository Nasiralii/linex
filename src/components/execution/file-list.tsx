"use client";
import { useState } from "react";
import { FileText, Clock, History, X, Download, User } from "lucide-react";

interface FileEntry { id: string; fileName: string; fileUrl: string; fileSize: number | null; createdAt: string; uploaderName?: string }
interface FileVersion extends FileEntry { version: number }
interface VersionedFile { baseName: string; latest: FileVersion; versions: FileVersion[] }

function groupByVersions(files: FileEntry[]): VersionedFile[] {
  const groups: Record<string, FileVersion[]> = {};
  const sorted = [...files].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  for (const f of sorted) {
    const base = f.fileName.replace(/\s*\(v?\d+\)\s*/, "").trim();
    if (!groups[base]) groups[base] = [];
    groups[base].push({ ...f, version: groups[base].length + 1 });
  }
  return Object.entries(groups).map(([baseName, versions]) => ({ baseName, latest: versions[versions.length - 1], versions }));
}

function fmtSize(b: number | null) { return !b ? "" : b < 1024 ? `${b} B` : b < 1048576 ? `${(b/1024).toFixed(1)} KB` : `${(b/1048576).toFixed(1)} MB`; }

function HistoryPanel({ vf, onClose, isRtl }: { vf: VersionedFile; onClose: () => void; isRtl: boolean }) {
  return (
    <div style={{ margin: "0.25rem 0 0.5rem 1.5rem", padding: "0.75rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border)", background: "white" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
        <span style={{ fontSize: "0.75rem", fontWeight: 700 }}>{isRtl ? "سجل الإصدارات" : "Version History"}</span>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
          <X style={{ width: "14px", height: "14px" }} />
        </button>
      </div>
      {vf.versions.map((v) => {
        const isCurrent = v.version === vf.latest.version;
        return (
          <a key={v.id} href={v.fileUrl} target="_blank" rel="noopener" style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.375rem 0.5rem", borderRadius: "var(--radius-sm)", textDecoration: "none", color: "var(--text)", fontSize: "0.75rem", background: isCurrent ? "var(--primary-light)" : "transparent" }}>
            <span style={{ padding: "0.0625rem 0.25rem", borderRadius: "var(--radius-full)", background: isCurrent ? "var(--primary)" : "var(--surface-2)", color: isCurrent ? "white" : "var(--text-muted)", fontSize: "0.625rem", fontWeight: 700, minWidth: "24px", textAlign: "center" }}>v{v.version}</span>
            <Clock style={{ width: "10px", height: "10px", color: "var(--text-muted)" }} />
            <span style={{ color: "var(--text-muted)" }}>{new Date(v.createdAt).toLocaleDateString()} {new Date(v.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
            {v.uploaderName && <><User style={{ width: "10px", height: "10px", color: "var(--text-muted)" }} /><span style={{ color: "var(--text-muted)" }}>{v.uploaderName}</span></>}
            <Download style={{ width: "10px", height: "10px", color: "var(--text-muted)", marginLeft: "auto" }} />
          </a>
        );
      })}
    </div>
  );
}

export function FileList({ files, isRtl }: { files: FileEntry[]; isRtl: boolean }) {
  const [historyFor, setHistoryFor] = useState<string | null>(null);
  const grouped = groupByVersions(files);

  if (grouped.length === 0) return <p style={{ fontSize: "0.8125rem", color: "var(--text-muted)", textAlign: "center", padding: "1rem" }}>{isRtl ? "لا توجد ملفات مرفقة" : "No files attached yet"}</p>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      {grouped.map((vf) => (
        <div key={vf.baseName}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 0.75rem", borderRadius: "var(--radius-md)", background: "var(--surface-2)" }}>
            <FileText style={{ width: "16px", height: "16px", color: "var(--primary)", flexShrink: 0 }} />
            <a href={vf.latest.fileUrl} target="_blank" rel="noopener" style={{ fontSize: "0.8125rem", flex: 1, color: "var(--text)", textDecoration: "none" }}>{vf.latest.fileName}</a>
            <span style={{ padding: "0.125rem 0.375rem", borderRadius: "var(--radius-full)", background: "var(--primary)", color: "white", fontSize: "0.625rem", fontWeight: 700 }}>v{vf.latest.version}</span>
            {vf.latest.fileSize ? <span style={{ fontSize: "0.6875rem", color: "var(--text-muted)" }}>{fmtSize(vf.latest.fileSize)}</span> : null}
            {vf.versions.length > 1 && (
              <button onClick={() => setHistoryFor(historyFor === vf.baseName ? null : vf.baseName)} title={isRtl ? "عرض السجل" : "View History"} style={{ background: "none", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: "0.25rem 0.5rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.6875rem", color: "var(--primary)", fontFamily: "inherit", fontWeight: 600 }}>
                <History style={{ width: "12px", height: "12px" }} />{vf.versions.length}
              </button>
            )}
          </div>
          {historyFor === vf.baseName && <HistoryPanel vf={vf} onClose={() => setHistoryFor(null)} isRtl={isRtl} />}
        </div>
      ))}
    </div>
  );
}
