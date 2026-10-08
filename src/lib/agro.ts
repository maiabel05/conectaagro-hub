/** Balanço hídrico diário (FAO-56 simplificado). 1 mm = 1 L/m². */
export function waterBalance(opts: {
  et0: number; // mm/dia
  kc: number;
  rainForecast: number; // mm previstos
  soilMoisture: number; // % atual
  fieldCapacity?: number; // % alvo
  emitterRate?: number; // mm/h do sistema
}) {
  const { et0, kc, rainForecast, soilMoisture, fieldCapacity = 35, emitterRate = 5 } = opts;
  const etc = et0 * kc;
  const effectiveRain = rainForecast * 0.8;
  const soilBonus = soilMoisture >= fieldCapacity ? etc : 0; // solo já na capacidade
  const need = Math.max(0, +(etc - effectiveRain - soilBonus).toFixed(1));
  const minutes = Math.round((need / emitterRate) * 60);
  return { etc: +etc.toFixed(2), effectiveRain: +effectiveRain.toFixed(1), litersPerM2: need, minutes };
}

/** Dias restantes do período de carência a partir da data de aplicação. */
export function graceDaysLeft(applied: Date, graceDays: number, today = new Date()) {
  const end = new Date(applied);
  end.setDate(end.getDate() + graceDays);
  const ms = end.getTime() - new Date(today.toDateString()).getTime();
  return Math.max(0, Math.ceil(ms / 86400000));
}
