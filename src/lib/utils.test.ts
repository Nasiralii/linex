import { transliterateArabic } from "./utils";

describe("transliterateArabic", () => {
  it("should transliterate Arabic names correctly", () => {
    expect(transliterateArabic("محمد")).toBe("mhd");
    expect(transliterateArabic("أحمد علي")).toBe("ahmd 3ly");
    expect(transliterateArabic("سارة")).toBe("srh");
    expect(transliterateArabic("عبدالله")).toBe("3bdallah");
  });

  it("should handle mixed Arabic and Latin text", () => {
    expect(transliterateArabic("محمد Smith")).toBe("mhd Smith");
    expect(transliterateArabic("أحمد Ali")).toBe("ahmd Ali");
  });

  it("should return the same text if no Arabic characters", () => {
    expect(transliterateArabic("John Doe")).toBe("John Doe");
    expect(transliterateArabic("123 Test")).toBe("123 Test");
  });
});