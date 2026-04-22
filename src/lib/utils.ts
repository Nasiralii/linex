import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind CSS classes with clsx
 * This is the standard utility used by shadcn/ui components
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format currency amount for display
 */
export function formatCurrency(
  amount: number,
  currency: string = "SAR",
  locale: string = "ar-SA"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format date for display
 */
export function formatDate(
  date: Date | string,
  locale: string = "ar-SA"
): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(d);
}

/**
 * Generate a URL-friendly slug from text
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 100);
}

/**
 * Truncate text to a specified length
 */
export function truncate(text: string, length: number = 100): string {
  if (text.length <= length) return text;
  return text.substring(0, length).trim() + "...";
}

/**
 * Get initials from a name (supports Arabic)
 */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
}

/**
 * Transliterate Arabic text to Latin characters
 * This is a basic implementation that covers common Arabic letters
 */
export function transliterateArabic(text: string): string {
  const arabicMap: { [key: string]: string } = {
    'ا': 'a', 'أ': 'a', 'إ': 'i', 'آ': 'aa',
    'ب': 'b', 'ت': 't', 'ث': 'th', 'ج': 'j',
    'ح': 'h', 'خ': 'kh', 'د': 'd', 'ذ': 'dh',
    'ر': 'r', 'ز': 'z', 'س': 's', 'ش': 'sh',
    'ص': 's', 'ض': 'd', 'ط': 't', 'ظ': 'z',
    'ع': '3', 'غ': 'gh', 'ف': 'f', 'ق': 'q',
    'ك': 'k', 'ل': 'l', 'م': 'm', 'ن': 'n',
    'ه': 'h', 'و': 'w', 'ي': 'y', 'ى': 'a',
    'ئ': 'e', 'ء': 'e', 'ؤ': 'o',
    
    // Diacritics (ignore)
    'َ': '', 'ُ': '', 'ِ': '', 'ّ': '',
    'ْ': '', 'ٍ': '', 'ً': '', 'ٌ': ''
  };

  let result = '';
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (arabicMap[char]) {
      result += arabicMap[char];
    } else {
      result += char;
    }
  }
  
  // Handle some special cases for better readability
  result = result.replace(/aa/g, 'a');
  result = result.replace(/3/g, "'"); // Replace ع with apostrophe
  
  // Remove multiple consecutive spaces and trim
  result = result.replace(/\s+/g, ' ').trim();
  
  return result;
}

/**
 * Convert Arabic / Persian numerals to English numerals.
 */
export function normalizeDigits(value: string): string {
  const arabicIndic = "٠١٢٣٤٥٦٧٨٩";
  const easternArabicIndic = "۰۱۲۳۴۵۶۷۸۹";

  return value
    .split("")
    .map((char) => {
      const arabicIndex = arabicIndic.indexOf(char);
      if (arabicIndex >= 0) return String(arabicIndex);

      const easternIndex = easternArabicIndic.indexOf(char);
      if (easternIndex >= 0) return String(easternIndex);

      return char;
    })
    .join("");
}

/**
 * Keep only Saudi local mobile format digits: 05XXXXXXXX
 */
export function sanitizeSaudiPhoneInput(value: string): string {
  const normalized = normalizeDigits(value).replace(/\D/g, "");

  if (!normalized) return "";

  if (normalized.startsWith("9665")) {
    return `0${normalized.slice(3, 12)}`;
  }

  if (normalized.startsWith("5")) {
    return `0${normalized.slice(0, 9)}`;
  }

  if (normalized.startsWith("05")) {
    return normalized.slice(0, 10);
  }

  return normalized.slice(0, 10);
}
