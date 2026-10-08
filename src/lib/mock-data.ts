import crop1 from "@/assets/crop-1.jpg";
import crop2 from "@/assets/crop-2.jpg";
import crop3 from "@/assets/crop-3.jpg";
import leaf from "@/assets/leaf-disease.jpg";

export const images = { crop1, crop2, crop3, leaf };

export type Health = "ótimo" | "atenção" | "crítico";
export const plots = [
  { id: "T1", name: "Talhão 01 – Soja", area: 42, crop: "Soja", stage: "R3 – Início vagem", kc: 1.1, ndvi: 0.82, health: "ótimo" as Health, moisture: 31 },
  { id: "T2", name: "Talhão 02 – Milho", area: 35, crop: "Milho", stage: "V8 – Vegetativo", kc: 0.95, ndvi: 0.74, health: "atenção" as Health, moisture: 22 },
  { id: "T3", name: "Talhão 03 – Soja", area: 28, crop: "Soja", stage: "R1 – Floração", kc: 1.05, ndvi: 0.61, health: "crítico" as Health, moisture: 17 },
  { id: "T4", name: "Talhão 04 – Feijão", area: 18, crop: "Feijão", stage: "V4 – Vegetativo", kc: 0.8, ndvi: 0.79, health: "ótimo" as Health, moisture: 29 },
];

const days = ["Hoje", "Sex", "Sáb", "Dom", "Seg", "Ter", "Qua"];
export const forecast = days.map((d, i) => ({
  day: d,
  max: [31, 29, 27, 26, 28, 30, 32][i],
  min: [19, 18, 17, 16, 17, 19, 20][i],
  rain: [1, 6, 14, 3, 0, 0, 2][i],
  rainProb: [15, 55, 85, 40, 5, 5, 20][i],
  humidity: [62, 74, 88, 78, 58, 52, 60][i],
  et0: [5.4, 4.6, 3.1, 3.8, 5.0, 5.6, 5.9][i],
  icon: (["sun", "cloud-sun", "rain", "cloud", "sun", "sun", "cloud-sun"] as const)[i],
}));

export const hourly = Array.from({ length: 24 }, (_, h) => ({
  hour: `${String(h).padStart(2, "0")}h`,
  temp: +(19 + 11 * Math.sin(((h - 8) / 24) * Math.PI * 2 * 0.9 + 0.2) ** 2).toFixed(1),
  soil: +(30 - h * 0.35 + (h > 5 && h < 7 ? 6 : 0)).toFixed(1),
  air: Math.round(85 - 30 * Math.sin((Math.max(0, h - 6) / 14) * Math.PI)),
}));

export const alerts = [
  { level: "alto", title: "Risco alto de ferrugem asiática", plot: "Talhão 03", detail: "Umidade do ar > 85% por 10h e temperatura entre 18–26°C previstas para sábado. Condição ideal para Phakopsora pachyrhizi.", action: "Programar fungicida preventivo até sexta-feira." },
  { level: "médio", title: "Estresse hídrico em desenvolvimento", plot: "Talhão 02", detail: "Umidade do solo em 22%, abaixo do limite de 25% para estágio V8.", action: "Irrigar 4,8 L/m² ainda hoje." },
  { level: "médio", title: "Pressão de lagarta-do-cartucho", plot: "Talhão 02", detail: "Graus-dia acumulados indicam nova geração de Spodoptera frugiperda.", action: "Monitorar armadilhas e realizar amostragem." },
  { level: "baixo", title: "Janela ideal de pulverização", plot: "Todos", detail: "Segunda: vento < 8 km/h, Δt entre 2–8 e sem chuva prevista.", action: "Agendar aplicações para segunda 06h–10h." },
];

export const diagnoses = [
  { name: "Ferrugem asiática (Phakopsora pachyrhizi)", type: "Doença fúngica", confidence: 92, severity: "Alta",
    recs: ["Aplicar fungicida (triazol + estrobilurina) em até 48h", "Rotacionar princípios ativos para evitar resistência", "Monitorar talhões vizinhos nos próximos 5 dias"] },
  { name: "Mancha-alvo (Corynespora cassiicola)", type: "Doença fúngica", confidence: 41, severity: "Média",
    recs: ["Confirmar com análise laboratorial", "Avaliar terço inferior das plantas"] },
  { name: "Deficiência de potássio", type: "Nutricional", confidence: 18, severity: "Baixa",
    recs: ["Verificar análise de solo recente", "Considerar adubação foliar com K"] },
];

export type Application = { id: string; date: string; product: string; type: string; dose: string; plot: string; graceDays: number };
export const applications: Application[] = [
  { id: "a1", date: "2026-10-01", product: "Fox Xpro", type: "Fungicida", dose: "0,5 L/ha", plot: "Talhão 01", graceDays: 30 },
  { id: "a2", date: "2026-09-28", product: "Ureia 45%", type: "Fertilizante", dose: "150 kg/ha", plot: "Talhão 02", graceDays: 0 },
  { id: "a3", date: "2026-09-20", product: "Belt", type: "Inseticida", dose: "70 mL/ha", plot: "Talhão 02", graceDays: 14 },
  { id: "a4", date: "2026-10-05", product: "Priori Xtra", type: "Fungicida", dose: "0,3 L/ha", plot: "Talhão 03", graceDays: 30 },
];

export const diary = [
  { date: "2026-10-07", text: "Vistoria no T3: manchas amareladas no terço inferior. Coletei amostras para análise." },
  { date: "2026-10-05", text: "Aplicação de Priori Xtra no T3 com vento calmo. 6h às 9h." },
  { date: "2026-10-02", text: "Pivô 2 com pressão baixa, técnico chamado. Normalizado à tarde." },
];

export const gallery = [
  { date: "2026-08-20", src: crop1, caption: "Emergência – 10 DAS", plot: "Talhão 01" },
  { date: "2026-09-15", src: crop2, caption: "Fechamento de entrelinhas – 36 DAS", plot: "Talhão 01" },
  { date: "2026-10-06", src: crop3, caption: "Floração e início de vagens – 57 DAS", plot: "Talhão 01" },
];

// Histórico diário determinístico (pseudo-aleatório)
function rand(seed: number) { const x = Math.sin(seed) * 10000; return x - Math.floor(x); }
export function dayHistory(date: Date) {
  const s = date.getFullYear() * 400 + date.getMonth() * 32 + date.getDate();
  const photo = [crop1, crop2, crop3][Math.floor(rand(s + 9) * 3)];
  return {
    tmax: Math.round(25 + rand(s) * 9), tmin: Math.round(14 + rand(s + 1) * 6),
    rain: rand(s + 2) > 0.65 ? Math.round(rand(s + 3) * 25) : 0,
    irrigation: +(rand(s + 4) * 6).toFixed(1), soil: Math.round(18 + rand(s + 5) * 16),
    et0: +(3 + rand(s + 6) * 3).toFixed(1),
    input: rand(s + 7) > 0.8 ? ["Fungicida – Fox Xpro", "Inseticida – Belt", "Foliar K"][Math.floor(rand(s + 8) * 3)] : null,
    photo: rand(s + 10) > 0.5 ? photo : null,
  };
}

export const seasons = ["2023/24", "2024/25", "2025/26"];
export const comparison = [
  { metric: "Produtividade (sc/ha)", "2023/24": 58, "2024/25": 63, "2025/26": 67 },
];
export const seasonCurve = Array.from({ length: 12 }, (_, i) => ({
  week: `S${(i + 1) * 2}`,
  "2023/24": +(0.2 + 0.6 * Math.sin((i / 11) * Math.PI) ** 0.8).toFixed(2),
  "2024/25": +(0.22 + 0.64 * Math.sin((i / 11) * Math.PI) ** 0.8).toFixed(2),
  "2025/26": +(0.25 + 0.66 * Math.sin((i / 11) * Math.PI) ** 0.7).toFixed(2),
}));
export const plotYield = [
  { plot: "T1", "2023/24": 60, "2024/25": 65, "2025/26": 70 },
  { plot: "T2", "2023/24": 120, "2024/25": 128, "2025/26": 135 },
  { plot: "T3", "2023/24": 55, "2024/25": 59, "2025/26": 61 },
  { plot: "T4", "2023/24": 38, "2024/25": 41, "2025/26": 44 },
];
