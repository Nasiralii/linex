export type BlogCategory =
  | "Construction"
  | "Engineering"
  | "Project Management"
  | "Procurement"
  | "Compliance";

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string[];
  author: string;
  role: string;
  publishedAt: string;
  readTimeMinutes: number;
  category: BlogCategory;
  tags: string[];
  coverImage: string;
  featured?: boolean;
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "how-to-prepare-a-construction-brief",
    title: "How to Prepare a Construction Brief That Attracts Better Offers",
    excerpt:
      "A clear brief improves offer quality, shortens decision time, and reduces post-award disputes.",
    content: [
      "Most owners lose time before execution even starts because their project brief is incomplete. Contractors and engineers cannot price unknowns, so they either avoid the project or add risk buffers.",
      "Start by defining your scope in plain language: what is being built, what is excluded, and what success looks like. Include dimensions, quality expectations, and any authority constraints.",
      "Then specify your budget band and preferred timeline. Transparency here helps professionals respond with realistic plans rather than generic proposals.",
      "Finally, attach drawings, site photos, and any references that reduce ambiguity. Better context means better proposals and cleaner contract conversations.",
    ],
    author: "Rasi Editorial Team",
    role: "Platform Insights",
    publishedAt: "2026-04-11",
    readTimeMinutes: 6,
    category: "Project Management",
    tags: ["briefing", "owners", "procurement"],
    coverImage: "/globe.svg",
    featured: true,
  },
  {
    slug: "bid-comparison-framework-for-owners",
    title: "A Practical Bid Comparison Framework for Project Owners",
    excerpt:
      "Compare offers on value, risk, and readiness instead of price alone.",
    content: [
      "Award decisions based only on the lowest number usually create expensive corrections later. A professional comparison model balances cost with capability and execution certainty.",
      "Score each bid across five lenses: technical fit, commercial structure, delivery timeline, team quality, and documentation completeness.",
      "Use weighted scoring to reflect project priorities. For example, timeline reliability may matter more than marginal price savings in high-impact projects.",
      "Keep your final decision rationale documented. This creates fairness, protects the owner, and improves future procurement quality.",
    ],
    author: "Eng. Layla Hassan",
    role: "Procurement Advisor",
    publishedAt: "2026-03-29",
    readTimeMinutes: 7,
    category: "Procurement",
    tags: ["bids", "evaluation", "owners"],
    coverImage: "/globe.svg",
  },
  {
    slug: "verification-standards-for-contractors",
    title: "Verification Standards Every Contractor Profile Should Meet",
    excerpt:
      "Strong profiles increase trust, improve win-rate, and reduce clarification cycles.",
    content: [
      "Verification is not a badge for marketing; it is a baseline for market trust. Owners need enough confidence to invite and compare professional proposals.",
      "At minimum, contractor profiles should include legal identity, specialization areas, team capacity, and recent project evidence with measurable outcomes.",
      "A complete profile reduces repetitive pre-award questions and enables faster shortlisting by project owners.",
      "Contractors who keep records current are consistently viewed as lower risk and more reliable delivery partners.",
    ],
    author: "Rasi Trust & Safety",
    role: "Verification Unit",
    publishedAt: "2026-03-17",
    readTimeMinutes: 5,
    category: "Compliance",
    tags: ["verification", "contractors", "trust"],
    coverImage: "/globe.svg",
  },
  {
    slug: "early-risk-signals-in-project-planning",
    title: "Early Risk Signals in Project Planning You Should Not Ignore",
    excerpt:
      "Spotting planning risks before award can prevent schedule drift and budget overruns.",
    content: [
      "Risk management starts before contract signature. During planning, repeated scope changes, unclear assumptions, and missing dependencies are key warning signals.",
      "If multiple bidders ask the same clarification question, that is usually a brief-quality issue and should be corrected centrally.",
      "Map each major assumption to an owner or contractor responsibility. Undefined ownership causes delays and commercial conflict later.",
      "Treat pre-award risk reviews as a standard gate, not an optional exercise.",
    ],
    author: "Omar Al-Mutairi",
    role: "Project Controls Lead",
    publishedAt: "2026-02-22",
    readTimeMinutes: 8,
    category: "Engineering",
    tags: ["risk", "planning", "controls"],
    coverImage: "/globe.svg",
  },
  {
    slug: "digital-documentation-for-construction-teams",
    title: "Digital Documentation Habits for High-Performing Teams",
    excerpt:
      "Consistent documentation improves coordination, dispute prevention, and accountability.",
    content: [
      "Documentation is often treated as an administrative burden, but top-performing teams treat it as a project control tool.",
      "Standardize templates for scope clarifications, pricing assumptions, and communication logs. This saves time and improves traceability.",
      "Store decisions in one trusted project context where all stakeholders can review what was agreed and when.",
      "When disputes happen, documented context is your strongest protection.",
    ],
    author: "Rasi Editorial Team",
    role: "Operations Insights",
    publishedAt: "2026-02-08",
    readTimeMinutes: 5,
    category: "Construction",
    tags: ["documentation", "teams", "quality"],
    coverImage: "/globe.svg",
  },
];

export const BLOG_CATEGORIES: Array<"All" | BlogCategory> = [
  "All",
  "Construction",
  "Engineering",
  "Project Management",
  "Procurement",
  "Compliance",
];

export function getBlogPostBySlug(slug: string) {
  return BLOG_POSTS.find((post) => post.slug === slug) ?? null;
}
