import { useState } from "react";
import { Bell, Check, Sprout } from "lucide-react";
import { Button } from "@/components/ui/button";
import { alerts } from "@/lib/mock-data";
import type { Plot } from "@/lib/plots-store";

export function PlotNotifications({ plots }: { plots: Plot[] }) {
  const [selected, setSelected] = useState("");
  const [read, setRead] = useState<string[]>([]);
  const plot = plots.find((p) => (p.uuid ?? p.id) === selected) ?? plots[0];
  if (!plot) return <p className="text-sm text-muted-foreground">Nenhum talhão disponível.</p>;
  const notifications = plot.uuid ? [] : alerts.filter((a) => a.plot === "Todos" || a.plot === `Talhão ${plot.id.replace("T", "").padStart(2, "0")}`);
  return <div className="space-y-4">
    <label className="block text-sm font-medium">Talhão para orientações<select aria-label="Talhão para orientações" value={plot.uuid ?? plot.id} onChange={(e) => setSelected(e.target.value)} className="mt-2 min-h-11 w-full rounded-lg border bg-background px-3 py-2 text-base">{plots.map((p) => <option key={p.uuid ?? p.id} value={p.uuid ?? p.id}>{p.name}</option>)}</select></label>
    <p className="flex items-center gap-2 text-sm font-medium"><Sprout className="h-4 w-4 shrink-0 text-primary" />{plot.crop} · {plot.stage}</p>
    <p className="text-xs text-muted-foreground">{plot.uuid ? "Sem monitoramento conectado. Não há notificações reais disponíveis para este talhão." : "Demonstração: orientações e notificações simuladas, sem envio ao celular. Confirme o manejo com um agrônomo."}</p>
    <ul className="space-y-3">{notifications.map((a) => {
      const key = `${plot.id}:${a.title}`;
      return <li key={key} className="border-b pb-3">
        <div className="flex items-start gap-2"><Bell className="mt-0.5 h-4 w-4 shrink-0 text-warning" /><p className="text-sm font-semibold">{a.title}</p></div>
        <p className="mt-2 text-xs text-muted-foreground">{a.detail}</p>
        <p className="mt-2 text-sm">{a.level === "alto" ? "Inspecione as folhas e peça avaliação agronômica antes de aplicar produtos." : a.action}</p>
        <Button size="sm" variant="ghost" className="mt-2" disabled={read.includes(key)} onClick={() => setRead((r) => [...r, key])}><Check className="h-4 w-4" />{read.includes(key) ? "Lida" : "Marcar como lida"}</Button>
      </li>;
    })}</ul>
    {notifications.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma notificação para este talhão.</p>}
  </div>;
}