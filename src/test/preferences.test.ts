import { describe, expect, it } from "vitest";
import { parsePreferences, preferencesKey, preferencesSchema } from "@/lib/preferences";
describe("basic preferences", () => {
  it("accepts Portuguese and the three communication styles", () => {
    for (const communication of ["direct", "detailed", "technical"]) {
      expect(preferencesSchema.safeParse({ language: "pt-BR", theme: "dark", communication }).success).toBe(true);
    }
    expect(preferencesSchema.safeParse({ language: "en", theme: "dark", communication: "direct" }).success).toBe(false);
  });
  it("rejects invalid stored options", () => {
    expect(parsePreferences({ theme: "invalid" })).toEqual({ language: "pt-BR", theme: "light", communication: "direct" });
  });
  it("separates each account from visitors", () => {
    expect(preferencesKey("producer-a")).not.toBe(preferencesKey("producer-b"));
    expect(preferencesKey("producer-a")).not.toBe(preferencesKey());
  });
});