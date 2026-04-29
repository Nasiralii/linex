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

export const BLOG_CATEGORIES: Array<"All" | BlogCategory> = [
  "All",
  "Construction",
  "Engineering",
  "Project Management",
  "Procurement",
  "Compliance",
];
