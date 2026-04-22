import { transliterateArabic } from "@/lib/utils";

// Test the transliteration function
console.log("Testing Arabic transliteration:");
console.log("محمد أحمد ->", transliterateArabic("محمد أحمد"));
console.log("سارة عبدالله ->", transliterateArabic("سارة عبدالله"));
console.log("علي حسين ->", transliterateArabic("علي حسين"));

// Test with mixed text
console.log("محمد Smith ->", transliterateArabic("محمد Smith"));