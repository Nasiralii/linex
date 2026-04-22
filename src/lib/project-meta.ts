export interface ProjectContact {
  name: string;
  phone: string;
  email?: string;
}

export interface ProjectMeta {
  estimatedBudget: number | null;
  neighborhood: string;
  addressName: string;
  city: string;
  detailedAddress: string;
  specifications: string;
  contacts: ProjectContact[];
}

export const EMPTY_PROJECT_META: ProjectMeta = {
  estimatedBudget: null,
  neighborhood: "",
  addressName: "",
  city: "",
  detailedAddress: "",
  specifications: "",
  contacts: [],
};

export function parseProjectMeta(scopeSummary?: string | null): ProjectMeta {
  if (!scopeSummary) return EMPTY_PROJECT_META;
  try {
    const parsed = JSON.parse(scopeSummary);
    return {
      estimatedBudget: typeof parsed?.estimatedBudget === "number" ? parsed.estimatedBudget : null,
      neighborhood: parsed?.neighborhood || "",
      addressName: parsed?.addressName || "",
      city: parsed?.city || "",
      detailedAddress: parsed?.detailedAddress || "",
      specifications: parsed?.specifications || "",
      contacts: Array.isArray(parsed?.contacts)
        ? parsed.contacts.filter((c: any) => c?.name || c?.phone).map((c: any) => ({
            name: c?.name || "",
            phone: c?.phone || "",
            email: c?.email || "",
          }))
        : [],
    };
  } catch {
    return EMPTY_PROJECT_META;
  }
}

export function stringifyProjectMeta(meta: ProjectMeta) {
  return JSON.stringify(meta);
}

export function formatProjectBudget(estimatedBudget?: number | null, budgetMax?: number | null) {
  if (estimatedBudget && estimatedBudget > 0) return estimatedBudget.toLocaleString();
  if (budgetMax && budgetMax > 0) return budgetMax.toLocaleString();
  return "—";
}
