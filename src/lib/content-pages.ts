export type ManagedContentPageKey =
  | "homepage"
  | "about-us"
  | "services"
  | "for-project-owners"
  | "for-contractors-engineers"
  | "how-it-works"
  | "competitive-advantages"
  | "verification-qualification"
  | "faq"
  | "partners"
  | "contact-us";

export interface ManagedContentPageDefinition {
  key: ManagedContentPageKey;
  slug: string;
  title: string;
  titleAr: string;
  excerpt: string;
  excerptAr: string;
  content: string;
  contentAr: string;
}

export const MANAGED_CONTENT_PAGES: ManagedContentPageDefinition[] = [
  {
    key: "homepage",
    slug: "",
    title: "Homepage",
    titleAr: "الرئيسية",
    excerpt: "Main homepage editorial content.",
    excerptAr: "المحتوى التحريري الأساسي للصفحة الرئيسية.",
    content:
      "Welcome to Rasi. Update this section from the admin CMS to control homepage editorial content.",
    contentAr:
      "مرحباً بكم في راسي. يمكن تعديل هذا القسم من نظام إدارة المحتوى داخل لوحة الإدارة للتحكم بالمحتوى التحريري للصفحة الرئيسية.",
  },
  {
    key: "about-us",
    slug: "about-us",
    title: "About Us",
    titleAr: "من نحن",
    excerpt: "Learn more about Rasi.",
    excerptAr: "تعرّف أكثر على راسي.",
    content:
      "This page explains who we are, our mission, and what value we bring to the Saudi construction market.",
    contentAr:
      "تشرح هذه الصفحة من نحن، وما هي رسالتنا، وما القيمة التي نقدمها لسوق المقاولات السعودي.",
  },
  {
    key: "services",
    slug: "services",
    title: "Services",
    titleAr: "الخدمات",
    excerpt: "Platform services for the construction ecosystem.",
    excerptAr: "خدمات المنصة لمنظومة قطاع المقاولات.",
    content:
      "Describe the services available on the platform for owners, contractors, engineers, and partners.",
    contentAr:
      "قم بوصف الخدمات المتاحة على المنصة للملاك والمقاولين والمهندسين والشركاء.",
  },
  {
    key: "for-project-owners",
    slug: "for-project-owners",
    title: "For Project Owners",
    titleAr: "لأصحاب المشاريع",
    excerpt: "Dedicated information for project owners.",
    excerptAr: "محتوى مخصص لأصحاب المشاريع.",
    content:
      "Explain how owners post projects, compare bids, award work, and manage execution through the platform.",
    contentAr:
      "اشرح كيف يمكن للمالك نشر المشروع، مقارنة العروض، ترسية العمل، وإدارة التنفيذ من خلال المنصة.",
  },
  {
    key: "for-contractors-engineers",
    slug: "for-contractors-engineers",
    title: "For Contractors and Engineers",
    titleAr: "للمقاولين والمهندسين",
    excerpt: "How the platform supports contractors and engineers.",
    excerptAr: "كيف تدعم المنصة المقاولين والمهندسين.",
    content:
      "Explain marketplace access, bidding, verification, wallet features, contracts, and execution workflow.",
    contentAr:
      "اشرح الوصول إلى السوق، وتقديم العروض، والتحقق، وخصائص المحفظة، والعقود، وسير عمل التنفيذ.",
  },
  {
    key: "how-it-works",
    slug: "how-it-works",
    title: "How It Works",
    titleAr: "كيف تعمل المنصة",
    excerpt: "Step-by-step explanation of the platform workflow.",
    excerptAr: "شرح خطوة بخطوة لآلية عمل المنصة.",
    content:
      "Use this page to explain the full lifecycle from project posting to completion.",
    contentAr:
      "استخدم هذه الصفحة لشرح دورة العمل كاملة من نشر المشروع حتى الإنجاز.",
  },
  {
    key: "competitive-advantages",
    slug: "competitive-advantages",
    title: "Competitive Advantages",
    titleAr: "المزايا التنافسية",
    excerpt: "What makes Rasi different.",
    excerptAr: "ما الذي يميز راسي عن غيرها.",
    content:
      "Highlight the platform's unique strengths, trust model, workflow structure, and local market fit.",
    contentAr:
      "سلّط الضوء على نقاط قوة المنصة، ونموذج الثقة، وبنية سير العمل، وملاءمتها للسوق المحلي.",
  },
  {
    key: "verification-qualification",
    slug: "verification-qualification",
    title: "Verification and Qualification",
    titleAr: "التحقق والتأهيل",
    excerpt: "How verification and qualification work.",
    excerptAr: "كيف تعمل آلية التحقق والتأهيل.",
    content:
      "Explain user verification, document requirements, and qualification workflows.",
    contentAr:
      "اشرح آلية التحقق من المستخدمين، ومتطلبات الوثائق، وإجراءات التأهيل.",
  },
  {
    key: "faq",
    slug: "faq",
    title: "FAQ",
    titleAr: "الأسئلة الشائعة",
    excerpt: "Frequently asked questions.",
    excerptAr: "الأسئلة الأكثر شيوعاً.",
    content:
      "Add common questions and answers here. In version 1, this page is managed as plain content.",
    contentAr:
      "أضف هنا الأسئلة الشائعة وإجاباتها. في الإصدار الأول تُدار هذه الصفحة كمحتوى نصي بسيط.",
  },
  {
    key: "partners",
    slug: "partners",
    title: "Partners",
    titleAr: "الشركاء",
    excerpt: "Strategic partners and collaborators.",
    excerptAr: "الشركاء الاستراتيجيون والمتعاونون.",
    content:
      "Use this page to present strategic partners, ecosystem collaborators, or sponsorship information.",
    contentAr:
      "استخدم هذه الصفحة لعرض الشركاء الاستراتيجيين أو الجهات المتعاونة أو معلومات الرعاية.",
  },
  {
    key: "contact-us",
    slug: "contact-us",
    title: "Contact Us",
    titleAr: "اتصل بنا",
    excerpt: "How to get in touch with us.",
    excerptAr: "طرق التواصل معنا.",
    content:
      "Add support email, phone numbers, office information, and business inquiry details here.",
    contentAr:
      "أضف بريد الدعم وأرقام التواصل ومعلومات المكتب وبيانات الاستفسارات التجارية هنا.",
  },
];

export const MANAGED_CONTENT_PAGE_MAP = new Map(
  MANAGED_CONTENT_PAGES.map((page) => [page.key, page]),
);

export const PUBLIC_CONTENT_PAGES = MANAGED_CONTENT_PAGES.filter(
  (page) => page.key !== "homepage",
);
