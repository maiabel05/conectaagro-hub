import { createFileRoute } from "@tanstack/react-router";
import { Crosshair, MapPin, Trash2, Undo2 } from "lucide-react";
import { useState } from "react";
import { PageHeader, Panel } from "@/components/AppShell";
import { PlotMap, areaHa } from "@/components/PlotMap";
import { addPlot, removePlot, usePlots, type LatLng } from "@/lib/plots-store";

export const Route = createFileRoute("/talhoes")({
  head: () => ({
    meta: [
      { title: "Meus talhões no mapa — ConectaAgro" },
      { name: "description", content: "Cadastre a localização da plantação com GPS e desenhe a área no mapa para calcular o tamanho em hectares." },
      { property: "og:title", content: "Meus talhões no mapa — ConectaAgro" },
      { property: "og:description", content: "Localize plantações por GPS e meça a área direto no mapa." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Talhoes,
});

const input = "w-full rounded-lg border bg-background px-3 py-2 text-sm";

function Talhoes() {
  const plots = usePlots();
  const [draft, setDraft] = useState<LatLng[]>([]);
  const [center, setCenter] = useState<LatLng | null>(null);
  const [gpsMsg, setGpsMsg] = useState("");
  const [name, setName] = useState("");
  const [crop, setCrop] = useState("Soja");
  const [stage, setStage] = useState("V1 – Vegetativo");
  const [manualArea, setManualArea] = useState("");

  const drawn = +areaHa(draft).toFixed(2);
  const area = manualArea ? Number(manualArea.replace(",", ".")) : drawn;

  const useGps = () => {
    if (!navigator.geolocation) return setGpsMsg("Seu aparelho não tem GPS disponível.");
    setGpsMsg("Buscando sua posição…");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const p = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setCenter(p); setDraft((d) => [...d, p]);
        setGpsMsg(`Posição marcada (precisão ~${Math.round(pos.coords.accuracy)} m). Caminhe até o próximo canto e toque de novo.`);
      },
      () => setGpsMsg("Não foi possível obter o GPS. Permita o acesso à localização."),
      { enableHighAccuracy: true, timeout: 15000 },
    );
  };

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.length || !name || !(area > 0)) return;
    const location = { lat: draft.reduce((s, p) => s + p.lat, 0) / draft.length, lng: draft.reduce((s, p) => s + p.lng, 0) / draft.length };
    addPlot({ name: `${name} – ${crop}`, crop, stage, area: +area.toFixed(2), location, boundary: draft.length >= 3 ? draft : undefined });
    setDraft([]); setName(""); setManualArea(""); setGpsMsg("");
  };

  return (
    <>
      <PageHeader title="Talhões no mapa" subtitle="Marque a plantação com o GPS ou tocando no mapa — a área é calculada sozinha" />
      <div className="grid gap-5 xl:grid-cols-3">
        <Panel title="Mapa" icon={<MapPin className="h-5 w-5 text-primary" />} className="xl:col-span-2"
          action={<div className="flex gap-2">
            <button type="button" onClick={() => setDraft((d) => d.slice(0, -1))} disabled={!draft.length} className="flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs disabled:opacity-40"><Undo2 className="h-4 w-4" />Desfazer</button>
            <button type="button" onClick={useGps} className="flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground"><Crosshair className="h-4 w-4" />Marcar com GPS</button>
          </div>}>
          <PlotMap plots={plots} draft={draft} center={center} onMapClick={(p) => setDraft((d) => [...d, p])} />
          <p className="mt-2 text-xs text-muted-foreground">{gpsMsg || "Toque nos cantos da plantação no mapa (ou use o GPS em cada canto) para desenhar o contorno."}</p>
        </Panel>

        <Panel title="Nova plantação">
          <form onSubmit={save} className="space-y-3">
            <label className="block text-sm">Nome<input className={input} value={name} onChange={(e) => setName(e.target.value)} placeholder="Talhão 05" required /></label>
            <label className="block text-sm">Cultura
              <select className={input} value={crop} onChange={(e) => setCrop(e.target.value)}>
                {["Soja", "Milho", "Feijão", "Café", "Algodão", "Trigo", "Cana"].map((c) => <option key={c}>{c}</option>)}
              </select></label>
            <label className="block text-sm">Fase<input className={input} value={stage} onChange={(e) => setStage(e.target.value)} /></label>
            <div className="rounded-xl bg-muted p-3 text-sm">
              <p className="text-xs text-muted-foreground">Pontos marcados: {draft.length}</p>
              <p className="font-display text-2xl font-semibold">{drawn.toLocaleString("pt-BR")} ha</p>
              <p className="text-xs text-muted-foreground">{draft.length < 3 ? "Marque ao menos 3 cantos para calcular a área" : "Área medida pelo contorno"}</p>
            </div>
            <label className="block text-sm">Ou informe o tamanho (ha)<input className={input} inputMode="decimal" value={manualArea} onChange={(e) => setManualArea(e.target.value)} placeholder="ex: 25,5" /></label>
            <button disabled={!draft.length || !name || !(area > 0)} className="w-full rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-40">Salvar plantação</button>
          </form>
        </Panel>
      </div>

      <Panel title="Plantações cadastradas" className="mt-5">
        <ul className="divide-y">
          {plots.map((p) => (
            <li key={p.id} className="flex items-center justify-between gap-3 py-3 text-sm">
              <button type="button" className="text-left" onClick={() => p.location && setCenter({ ...p.location })}>
                <p className="font-medium">{p.id} · {p.name}</p>
                <p className="text-xs text-muted-foreground">{p.area.toLocaleString("pt-BR")} ha{p.location ? ` · ${p.location.lat.toFixed(5)}, ${p.location.lng.toFixed(5)}` : ""}</p>
              </button>
              <button type="button" aria-label="Remover" onClick={() => removePlot(p.id)} className="rounded-lg p-2 text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
            </li>
          ))}
        </ul>
      </Panel>
    </>
  );
}
