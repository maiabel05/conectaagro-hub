import { useSyncExternalStore } from "react";
import { plots as basePlots, type Health } from "@/lib/mock-data";

export type LatLng = { lat: number; lng: number };
export type Plot = (typeof basePlots)[number] & { location?: LatLng; boundary?: LatLng[] };

const KEY = "conectaagro-plots";
const defaults: Plot[] = basePlots.map((p, i) => ({
  ...p,
  location: { lat: -12.55 + i * 0.006, lng: -55.72 + (i % 2) * 0.008 },
}));

let state: Plot[] = defaults;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) state = JSON.parse(raw);
  } catch { /* ignore */ }
}
function emit() {
  localStorage.setItem(KEY, JSON.stringify(state));
  listeners.forEach((l) => l());
}

export function addPlot(p: Omit<Plot, "id" | "kc" | "ndvi" | "health" | "moisture"> & { kc?: number }) {
  load();
  const n = state.length + 1;
  const plot: Plot = { kc: 1, ndvi: 0.7, health: "ótimo" as Health, moisture: 28, ...p, id: `T${n}` };
  state = [...state, plot];
  emit();
}
export function removePlot(id: string) {
  load();
  state = state.filter((p) => p.id !== id);
  emit();
}

export function usePlots(): Plot[] {
  return useSyncExternalStore(
    (cb) => { load(); listeners.add(cb); cb(); return () => listeners.delete(cb); },
    () => { load(); return state; },
    () => defaults,
  );
}
