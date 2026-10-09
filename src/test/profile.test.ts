import { describe, expect, it } from "vitest";
import { emptyProfile, profileSchema, signupSchema, passwordChangeSchema } from "@/lib/profile";

describe("private producer account validation", () => {
  const profile = { ...emptyProfile, full_name: "Produtor", farm_name: "Propriedade" };
  it("accepts optional contact details without collecting unnecessary identity documents", () => {
    expect(profileSchema.parse(profile)).toEqual(profile);
    expect(profileSchema.safeParse({ ...profile, postal_code: "12345-678", phone: "+55 (11) 99999-0000", state: "mt" }).success).toBe(true);
  });
  it("rejects invalid contact details and oversized names", () => {
    expect(profileSchema.safeParse({ ...profile, phone: "javascript:bad" }).success).toBe(false);
    expect(profileSchema.safeParse({ ...profile, full_name: "a".repeat(121) }).success).toBe(false);
    expect(profileSchema.safeParse({ ...profile, postal_code: "123" }).success).toBe(false);
  });
  it("requires current password for signed-in changes", () => {
    expect(passwordChangeSchema.safeParse({ current_password: "", password: "newsecurepassword", confirm: "newsecurepassword" }).success).toBe(false);
    expect(passwordChangeSchema.safeParse({ current_password: "oldpassword", password: "newsecurepassword", confirm: "newsecurepassword" }).success).toBe(true);
  });
  it("rejects mismatching signup passwords", () => {
    expect(signupSchema.safeParse({ ...profile, email: "producer@example.com", password: "securepassword", confirm: "differentpassword" }).success).toBe(false);
  });
  it("loads incomplete profiles created through social sign-in", () => {
    expect(profileSchema.safeParse(emptyProfile).success).toBe(true);
  });
});