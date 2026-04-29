import { getContentPageByKey } from "@/lib/content-page-service";
import { type BlogCategory, type BlogPost } from "@/lib/blog-types";

export interface BlogPostInput {
  slug?: string;
  title: string;
  description?: string;
  excerpt?: string;
  content?: string[];
  author?: string;
  role?: string;
  publishedAt?: string;
  readTimeMinutes?: number;
  category?: BlogCategory;
  tags?: string[];
  coverImage?: string;
  featured?: boolean;
}

const DEFAULT_AUTHOR = "Rasi Editorial Team";
const DEFAULT_ROLE = "Platform Insights";
const DEFAULT_CATEGORY: BlogCategory = "Construction";
const DEFAULT_COVER_IMAGE = "/globe.svg";

function slugifyTitle(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function estimateReadTimeMinutes(text: string) {
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(wordCount / 200));
}

function normalizeBlogPost(post: BlogPostInput, index: number): BlogPost {
  const excerpt = (post.excerpt || post.description || "").trim();
  const fallbackSlug = `post-${index + 1}`;
  const generatedSlug = slugifyTitle(post.title) || fallbackSlug;

  return {
    slug: post.slug?.trim() || generatedSlug,
    title: post.title,
    excerpt,
    content: post.content && post.content.length > 0 ? post.content : (excerpt ? [excerpt] : []),
    author: post.author?.trim() || DEFAULT_AUTHOR,
    role: post.role?.trim() || DEFAULT_ROLE,
    publishedAt: post.publishedAt || new Date().toISOString().slice(0, 10),
    readTimeMinutes: post.readTimeMinutes || estimateReadTimeMinutes(excerpt || post.title),
    category: post.category || DEFAULT_CATEGORY,
    tags: post.tags || [],
    coverImage: post.coverImage || DEFAULT_COVER_IMAGE,
    featured: post.featured,
  };
}

const BLOG_POSTS_INPUT: BlogPostInput[] = [];

export const BLOG_POSTS: BlogPost[] = BLOG_POSTS_INPUT.map(normalizeBlogPost);

export function getBlogPostBySlug(slug: string) {
  return BLOG_POSTS.find((post) => post.slug === slug) ?? null;
}

function estimateReadTimeFromParagraphs(paragraphs: string[]) {
  const text = paragraphs.join(" ");
  return estimateReadTimeMinutes(text);
}

function toParagraphs(content: string, excerpt: string) {
  const paragraphs = content
    .split(/\n\s*\n/)
    .map((item) => item.trim())
    .filter(Boolean);

  if (paragraphs.length > 0) return paragraphs;
  return excerpt ? [excerpt] : [];
}

type FaqItem = { question: string; answer: string; category?: BlogCategory; image?: string; publishedAt?: string };

function parseFaqItems(content: string): FaqItem[] {
  const lines = content.split("\n").map((line) => line.trim());
  const items: FaqItem[] = [];
  let question = "";
  let answer = "";
  let category: BlogCategory | undefined = undefined;
  let image = "";
  let publishedAt = "";

  for (const line of lines) {
    if (!line) continue;
    if (line.startsWith("Q:")) {
      if (question || answer) items.push({ question: question.trim(), answer: answer.trim(), category, image, publishedAt });
      question = line.slice(2).trim();
      answer = "";
      category = undefined;
      image = "";
      publishedAt = "";
      continue;
    }
    if (line.startsWith("A:")) {
      answer = line.slice(2).trim();
      continue;
    }
    if (line.startsWith("C:")) {
      category = line.slice(2).trim() as BlogCategory;
      continue;
    }
    if (line.startsWith("I:")) {
      image = line.slice(2).trim();
      continue;
    }
    if (line.startsWith("D:")) {
      publishedAt = line.slice(2).trim();
      continue;
    }
    if (!question && !answer) continue;
    answer = `${answer}\n${line}`.trim();
  }

  if (question || answer) items.push({ question: question.trim(), answer: answer.trim(), category, image, publishedAt });
  return items.filter((item) => item.question || item.answer);
}

function buildFaqBlogPosts(
  faqPage: Awaited<ReturnType<typeof getContentPageByKey>>,
  locale: string,
): BlogPost[] {
  const isRtl = locale === "ar";
  const localizedItems = parseFaqItems(isRtl ? faqPage.contentAr : faqPage.content);
  const englishItems = parseFaqItems(faqPage.content);
  const total = Math.max(localizedItems.length, englishItems.length);

  if (total === 0) {
    const title = isRtl ? faqPage.titleAr : faqPage.title;
    const excerpt = (isRtl ? faqPage.excerptAr || faqPage.excerpt : faqPage.excerpt) || "";
    const contentRaw = isRtl ? faqPage.contentAr : faqPage.content;
    const content = toParagraphs(contentRaw, excerpt);
    return [{
      slug: faqPage.slug || "faq",
      title,
      excerpt,
      content,
      author: "Rasi Blog Team",
      role: "Editorial",
      publishedAt: new Date((faqPage as any).updatedAt || new Date()).toISOString().slice(0, 10),
      readTimeMinutes: estimateReadTimeFromParagraphs(content),
      category: "Project Management",
      tags: [],
      coverImage: DEFAULT_COVER_IMAGE,
      featured: true,
    }];
  }

  const items = Array.from({ length: total }, (_, index) => {
    const localItem = localizedItems[index] || { question: "", answer: "" };
    const enItem = englishItems[index] || { question: "", answer: "" };
    const slugSuffix = slugifyTitle(enItem.question || `item-${index + 1}`) || `item-${index + 1}`;
    const title = localItem.question || enItem.question || `${isRtl ? "سؤال" : "Question"} ${index + 1}`;
    const answer = localItem.answer || enItem.answer || "";
    const content = toParagraphs(answer, answer);

    const dateValue = enItem.publishedAt || localItem.publishedAt || new Date((faqPage as any).updatedAt || new Date()).toISOString();
    return {
      slug: `${faqPage.slug || "faq"}-${slugSuffix}`,
      title,
      excerpt: answer,
      content,
      author: "Rasi Blog Team",
      role: "Editorial",
      publishedAt: dateValue,
      readTimeMinutes: estimateReadTimeFromParagraphs(content),
      category: enItem.category || localItem.category || "Project Management",
      tags: [],
      coverImage: enItem.image || localItem.image || DEFAULT_COVER_IMAGE,
      featured: false,
    };
  });

  // Latest item (by stored date) should appear first and be featured.
  return items
    .sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt))
    .map((item, index) => ({
    ...item,
    featured: index === 0,
    }));
}

export async function getBlogPosts(locale: string): Promise<BlogPost[]> {
  const posts = [...BLOG_POSTS];

  const faqPage = await getContentPageByKey("faq");
  const isPublished = !("isPublished" in faqPage) || Boolean((faqPage as any).isPublished);
  if (!isPublished) return posts;

  return [...buildFaqBlogPosts(faqPage, locale), ...posts];
}

export async function getBlogPostBySlugLive(slug: string, locale: string): Promise<BlogPost | null> {
  const fromStatic = getBlogPostBySlug(slug);
  if (fromStatic) return fromStatic;

  const faqPage = await getContentPageByKey("faq");
  const isPublished = !("isPublished" in faqPage) || Boolean((faqPage as any).isPublished);
  if (!isPublished) return null;

  return buildFaqBlogPosts(faqPage, locale).find((post) => post.slug === slug) || null;
}
