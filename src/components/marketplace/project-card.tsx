import { Link } from "@/i18n/routing";
import { MapPin, Calendar, Tag, ArrowRight } from "lucide-react";
import { MatchBadge } from "./match-badge";
import { parseProjectMeta, formatProjectBudget } from "@/lib/project-meta";

interface ProjectCardProps {
  project: any;
  isRtl: boolean;
  isAdmin: boolean;
  matchScore?: number | null;
  tProject: (key: string) => string;
  tCommon: (key: string) => string;
}

export function ProjectCard({ project, isRtl, isAdmin, matchScore, tProject, tCommon }: ProjectCardProps) {
  const meta = parseProjectMeta(project.scopeSummary);
  return (
    <div className="card" style={{ padding: "1.5rem", cursor: "default" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "0.75rem", flexWrap: "wrap", gap: "0.5rem" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--text)", marginBottom: "0.5rem", lineHeight: 1.3 }}>
            {isRtl ? (project.titleAr || project.title) : project.title}
          </h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", marginBottom: "0.75rem" }}>
            {project.category && (
              <span style={{ display: "flex", alignItems: "center", gap: "0.375rem", fontSize: "0.8125rem", color: "var(--text-muted)" }}>
                <Tag style={{ width: "14px", height: "14px" }} />
                {isRtl ? project.category.nameAr : project.category.name}
              </span>
            )}
            {project.location && (
              <span style={{ display: "flex", alignItems: "center", gap: "0.375rem", fontSize: "0.8125rem", color: "var(--text-muted)" }}>
                <MapPin style={{ width: "14px", height: "14px" }} />
                {isRtl ? project.location.nameAr : project.location.name}
              </span>
            )}
            {project.deadline && (
              <span style={{ display: "flex", alignItems: "center", gap: "0.375rem", fontSize: "0.8125rem", color: "var(--text-muted)" }}>
                <Calendar style={{ width: "14px", height: "14px" }} />
                {new Date(project.deadline).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem", alignItems: "flex-end", flexShrink: 0 }}>
          <span className="chip chip-success">{tProject(`status.${project.status.toLowerCase()}`)}</span>
          {project._count.bids > 0 && (
            <span className="chip chip-info">{project._count.bids} {isRtl ? "عرض" : "bids"}</span>
          )}
          {typeof matchScore === "number" && matchScore > 0 && (
            <MatchBadge score={matchScore} isRtl={isRtl} />
          )}
        </div>
      </div>

      {/* Budget visible only to admin */}
      {isAdmin && (project.budgetMin || project.budgetMax) && (
        <div style={{
          display: "inline-flex", alignItems: "baseline", gap: "0.25rem",
          padding: "0.5rem 1rem", borderRadius: "var(--radius-md)",
          background: "var(--primary-light)", marginBottom: "1rem",
        }}>
          <span style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--primary)" }}>
            {formatProjectBudget(meta.estimatedBudget, project.budgetMax)}
          </span>
          <span style={{ fontSize: "0.8125rem", fontWeight: 500, color: "var(--primary)" }}>{tCommon("sar")}</span>
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
        <p style={{
          fontSize: "0.8125rem", color: "var(--text-muted)", flex: "1 1 200px",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", minWidth: 0,
        }}>
          {isRtl ? (project.descriptionAr || project.description) : project.description}
        </p>
        <Link href={`/marketplace/${project.id}`} className="btn-primary" style={{
          padding: "0.5rem 1.25rem", fontSize: "0.8125rem",
          textDecoration: "none", flexShrink: 0,
        }}>
          {tCommon("details")} <ArrowRight style={{ width: "14px", height: "14px" }} />
        </Link>
      </div>
    </div>
  );
}
