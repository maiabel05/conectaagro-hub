import { createFileRoute } from "@tanstack/react-router";
import { FlaskConical, ImagePlus, NotebookPen, ShieldCheck, Timer } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader, Panel } from "@/components/AppShell";
import { graceDaysLeft } from "@/lib/agro";
import { applications as seedApps, diary as seedDiary, gallery as seedGallery, plots, type Application } from "@/lib/mock-data";

export const Route = createFileRoute("/caderno")({
  head: () => ({
    meta: [
      { title: "Caderno de campo digital — ConectaAgro" },
      { name: "description", content: "Registre insumos e defensivos, carência para colheita segura, diário de bordo e fotos do plantio." },
      { property: "og:title", content: "Caderno de campo digital — ConectaAgro" },
      { property: "og:description", content: "Aplicações, carência regressiva, anotações e galeria da lavoura." },
    ],
  }),
  component: Caderno,
});

const TODAY = new Date(2026, 9, 8);
const fmt = (s: string) => new Date(s + "T12:00").toLocaleDateString("pt-BR");
const input = "w-full rounded-xl border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring";

function Caderno() {
  const [apps, setApps] = useState<Application[]>(seedApps);
  const [diary, setDiary] = useState(seedDiary);
  const [gallery, setGallery] = useState(seedGallery);
  const [note, setNote] = useState("");
  const [form, setForm] = useState({ date: "2026-10-08", product: "", type: "Fungicida", dose: "", plot: plots[0]!.name, graceDays: 14 });

  const addApp = (e: React.FormEvent): void => {
    e.preventDefault();
    if (!form.product || !form.dose) { toast.error("Preencha produto e dosagem"); return; }
    setApps([{ id: crypto.randomUUID(), ...form }, ...apps]);
    setForm({ ...form, product: "", dose: "" });
    toast.success("Aplicação registrada");
  };

  return (
    <>
      <PageHeader title="Caderno de campo" subtitle="Rastreabilidade completa da safra 2025/26" />
      <div className="grid gap-5 xl:grid-cols-5">
        <Panel title="Nova aplicação" icon={<FlaskConical className="h-5 w-5 text-earth" />} className="xl:col-span-2">
          <form onSubmit={addApp} className="grid grid-cols-2 gap-3">
            <label className="col-span-2 text-xs text-muted-foreground">Produto<input className={input} value={form.product} onChange={(e) => setForm({ ...form, product: e.target.value })} placeholder="Ex.: Fox Xpro" /></label>
            <label className="text-xs text-muted-foreground">Tipo
              <select className={input} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                {["Fungicida", "Inseticida", "Herbicida", "Fertilizante", "Foliar"].map((t) => <option key={t}>{t}</option>)}
              </select></label>
            <label className="text-xs text-muted-foreground">Dosagem<input className={input} value={form.dose} onChange={(e) => setForm({ ...form, dose: e.target.value })} placeholder="0,5 L/ha" /></label>
            <label className="text-xs text-muted-foreground">Data<input type="date" className={input} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></label>
            <label className="text-xs text-muted-foreground">Carência (dias)<input type="number" min={0} className={input} value={form.graceDays} onChange={(e) => setForm({ ...form, graceDays: +e.target.value })} /></label>
            <label className="col-span-2 text-xs text-muted-foreground">Talhão
              <select className={input} value={form.plot} onChange={(e) => setForm({ ...form, plot: e.target.value })}>
                {plots.map((p) => <option key={p.id}>{p.name}</option>)}
              </select></label>
            <button className="col-span-2 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground">Registrar aplicação</button>
          </form>
        </Panel>

        <Panel title="Insumos e defensivos aplicados" icon={<Timer className="h-5 w-5 text-primary" />} className="xl:col-span-3">
          <ul className="space-y-3">
            {apps.map((a) => {
              const left = graceDaysLeft(new Date(a.date + "T12:00"), a.graceDays, TODAY);
              const pct = a.graceDays ? ((a.graceDays - left) / a.graceDays) * 100 : 100;
              return (
                <li key={a.id} className="rounded-xl border p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div><p className="font-semibold">{a.product} <span className="text-xs font-normal text-muted-foreground">· {a.type}</span></p>
                      <p className="text-xs text-muted-foreground">{fmt(a.date)} · {a.dose} · {a.plot.split(" –")[0]}</p></div>
                    {left > 0 ? (
                      <span className="rounded-full bg-warning/20 px-3 py-1 text-xs font-semibold text-warning-foreground dark:text-warning">Colheita em {left} dias</span>
                    ) : (
                      <span className="flex items-center gap-1 rounded-full bg-success/15 px-3 py-1 text-xs font-semibold text-success"><ShieldCheck className="h-3.5 w-3.5" />Liberado</span>
                    )}
                  </div>
                  <div className="mt-3 h-1.5 rounded-full bg-muted"><div className={`h-1.5 rounded-full ${left ? "bg-warning" : "bg-success"}`} style={{ width: `${pct}%` }} /></div>
                </li>
              );
            })}
          </ul>
        </Panel>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <Panel title="Diário de bordo" icon={<NotebookPen className="h-5 w-5 text-earth" />}>
          <div className="flex gap-2">
            <textarea className={`${input} min-h-20`} value={note} onChange={(e) => setNote(e.target.value)} placeholder="O que aconteceu hoje na lavoura?" />
          </div>
          <button onClick={() => { if (!note.trim()) return; setDiary([{ date: "2026-10-08", text: note }, ...diary]); setNote(""); toast.success("Anotação salva"); }}
            className="mt-2 rounded-xl bg-earth px-4 py-2 text-sm font-semibold text-earth-foreground">Salvar anotação</button>
          <ol className="mt-5 space-y-4 border-l-2 border-earth/30 pl-4">
            {diary.map((d, i) => (
              <li key={i} className="relative"><span className="absolute -left-[23px] top-1 h-3 w-3 rounded-full bg-earth" />
                <p className="text-xs font-medium text-earth">{fmt(d.date)}</p><p className="text-sm">{d.text}</p></li>
            ))}
          </ol>
        </Panel>

        <Panel title="Galeria de acompanhamento" icon={<ImagePlus className="h-5 w-5 text-primary" />}
          action={<label className="cursor-pointer rounded-lg bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground">+ Foto
            <input type="file" accept="image/*" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) setGallery([...gallery, { date: "2026-10-08", src: URL.createObjectURL(f), caption: "Nova foto", plot: "Talhão 01" }]); }} /></label>}>
          <div className="space-y-4">
            {[...gallery].reverse().map((g, i) => (
              <figure key={i} className="flex gap-3">
                <img src={g.src} alt={g.caption} loading="lazy" className="h-24 w-32 shrink-0 rounded-xl object-cover" />
                <figcaption><p className="text-xs font-medium text-primary">{fmt(g.date)}</p><p className="text-sm font-medium">{g.caption}</p><p className="text-xs text-muted-foreground">{g.plot}</p></figcaption>
              </figure>
            ))}
          </div>
        </Panel>
      </div>
    </>
  );
}
