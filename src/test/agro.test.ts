import { describe, expect, it } from "vitest";
import { graceDaysLeft, waterBalance } from "@/lib/agro";

describe("waterBalance", () => {
  it("necessidade = ET0×Kc − 80% da chuva prevista", () => {
    const r = waterBalance({ et0: 5, kc: 1.1, rainForecast: 1, soilMoisture: 25, emitterRate: 5 });
    expect(r.litersPerM2).toBe(4.7);
    expect(r.minutes).toBe(56);
  });
  it("não irriga quando a chuva cobre a demanda", () => {
    expect(waterBalance({ et0: 4, kc: 1, rainForecast: 10, soilMoisture: 20 }).litersPerM2).toBe(0);
  });
});

describe("graceDaysLeft", () => {
  it("conta dias até o fim da carência", () => {
    expect(graceDaysLeft(new Date(2026, 9, 1), 14, new Date(2026, 9, 8))).toBe(7);
    expect(graceDaysLeft(new Date(2026, 8, 1), 14, new Date(2026, 9, 8))).toBe(0);
  });
});
