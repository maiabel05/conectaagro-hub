import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, ArrowRight, Camera, CheckCircle2, Loader2, ScanSearch, Send, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { PageHeader, Panel } from "@/components/AppShell";
import { alerts, diagnoses, images } from "@/lib/mock-data";

export const Route = createFileRoute("/diagnostico")({
  head: () => ({
    meta: [
      { title: "Diagnóstico fitossanitário com IA — ConectaAgro" },
      { name: "description", content: "Fotografe folhas e identifique pragas, doenças e deficiências com recomendações de manejo." },
      { property: "og:title", content: "Diagnóstico fitossanitário com IA — ConectaAgro" },
      { property: "og:description", content: "Análise de imagens de plantas e alertas preditivos de risco." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Diagnostico,
});

function Diagnostico() {
  const [img, setImg] = useState<string | null>(null);
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  const fileRef = useRef<HTMLInputElement>(null);
  const camRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (state !== "loading") return;
    const timer = setTimeout(() => setState("done"), 2200);
    return () => clearTimeout(timer);
  }, [state]);
  useEffect(() => () => { if (img?.startsWith("blob:")) URL.revokeObjectURL(img); }, [img]);
  const selectImage = (src: string) => { setImg(src); setState("idle"); };
  const onFile = (f?: File) => f && selectImage(URL.createObjectURL(f));

  return (
    <>
      <PageHeader title="Diagnóstico fitossanitário" subtitle="Envie uma foto da folha ou planta afetada para análise" />
      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title="Imagem" icon={<Camera className="h-5 w-5 text-primary" />}>
          <div onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); onFile(e.dataTransfer.files[0]); }}
            className="relative grid aspect-square place-items-center overflow-hidden rounded-xl border-2 border-dashed bg-muted">
            {img ? (
              <>
                <img src={img} alt="Folha enviada" className="h-full w-full object-cover" />
                {state === "loading" && (
                  <div className="absolute inset-0 grid place-items-center bg-background/60 backdrop-blur-sm">
                    <div className="text-center"><Loader2 className="mx-auto h-10 w-10 animate-spin text-primary" /><p className="mt-2 text-sm font-medium">Analisando padrões foliares…</p></div>
                  </div>
                )}
              </>
            ) : (
              <div className="p-6 text-center text-muted-foreground"><ScanSearch className="mx-auto h-12 w-12" /><p className="mt-2 text-sm">Arraste uma foto aqui ou use os botões abaixo</p></div>
            )}
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            <Button variant="secondary" disabled={state === "loading"} onClick={() => camRef.current?.click()}><Camera className="h-4 w-4" />Câmera</Button>
            <Button variant="secondary" disabled={state === "loading"} onClick={() => fileRef.current?.click()}><Upload className="h-4 w-4" />Galeria</Button>
            <Button variant="outline" disabled={state === "loading"} onClick={() => selectImage(images.leaf)}>Exemplo</Button>
          </div>
          <Button className="mt-3 w-full" disabled={!img || state === "loading"} onClick={() => setState("loading")}>
            {state === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {state === "loading" ? "Analisando…" : "Enviar para análise"}
          </Button>
          <p className="mt-2 text-xs text-muted-foreground">Análise simulada para demonstração.</p>
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => onFile(e.target.files?.[0])} />
          <input ref={camRef} type="file" accept="image/*" capture="environment" hidden onChange={(e) => onFile(e.target.files?.[0])} />
        </Panel>

        <Panel title="Resultado da análise" icon={<CheckCircle2 className="h-5 w-5 text-primary" />}>
          {state !== "done" ? (
            <p className="py-16 text-center text-sm text-muted-foreground">{state === "loading" ? "Processando imagem…" : "Nenhuma imagem analisada ainda."}</p>
          ) : (
            <div className="space-y-4">
              {diagnoses.map((d, i) => (
                <div key={d.name} className={`rounded-xl border p-4 ${i === 0 ? "border-destructive/40 bg-destructive/5" : ""}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div><p className="font-semibold">{d.name}</p><p className="text-xs text-muted-foreground">{d.type} · Severidade {d.severity}</p></div>
                    <span className="font-display text-xl font-bold">{d.confidence}%</span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-muted"><div className={`h-2 rounded-full ${i === 0 ? "bg-destructive" : i === 1 ? "bg-warning" : "bg-primary"}`} style={{ width: `${d.confidence}%` }} /></div>
                  {i === 0 && (
                    <ul className="mt-3 space-y-1.5 text-sm">
                      {d.recs.map((r) => <li key={r} className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />{r}</li>)}
                    </ul>
                  )}
                </div>
              ))}
              <p className="text-xs text-muted-foreground">Análise simulada para demonstração. Confirme com um agrônomo antes de aplicar defensivos.</p>
              <Button asChild className="w-full"><Link to="/caderno">Continuar no caderno<ArrowRight className="h-4 w-4" /></Link></Button>
            </div>
          )}
        </Panel>
      </div>

      <Panel title="Alertas preditivos" icon={<AlertTriangle className="h-5 w-5 text-warning" />} className="mt-5">
        <div className="grid gap-3 md:grid-cols-2">
          {alerts.map((a) => (
            <div key={a.title} className={`rounded-xl border-l-4 bg-muted p-4 ${a.level === "alto" ? "border-destructive" : a.level === "médio" ? "border-warning" : "border-primary"}`}>
              <div className="flex items-center justify-between gap-2"><p className="font-semibold">{a.title}</p><span className="text-xs uppercase text-muted-foreground">Risco {a.level}</span></div>
              <p className="mt-1 text-sm text-muted-foreground">{a.plot} — {a.detail}</p>
              <p className="mt-2 text-sm font-medium text-primary">→ {a.action}</p>
            </div>
          ))}
        </div>
      </Panel>
    </>
  );
}
