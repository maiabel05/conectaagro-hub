import { createFileRoute } from "@tanstack/react-router";
import { BarChart3, CalendarDays, CloudRain, Droplets, FlaskConical, Thermometer } from "lucide-react";
import { useState } from "react";
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PageHeader, Panel } from "@/components/AppShell";
import { Calendar } from "@/components/ui/calendar";
import { ptBR } from "date-fns/locale";
import { dayHistory, plotYield, seasonCurve, seasons } from "@/lib/mock-data";

export const Route = createFileRoute("/historico")({
  head: () => ({
    meta: [
      { title: "Histórico e calendário agrícola — ConectaAgro" },
      { name: "description", content: "Consulte clima, irrigação, fotos e insumos de qualquer dia e compare safras e talhões." },
      { property: "og:title", content: "Histórico e calendário agrícola — ConectaAgro" },
      { property: "og:description", content: "Dados retroativos do cultivo e comparação de desempenho entre safras." },
    ],
  }),
  component: Historico,
});

const colors = ["var(--chart-3)", "var(--chart-2)", "var(--chart-1)"];
const tip = { contentStyle: { background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12, color: "var(--popover-foreground)" } };

function Historico() {
  const [date, setDate] = useState<Date>(new Date(2026, 9, 7));
  const h = dayHistory(date);
  const stats = [
    { l: "Temp. máx/mín", v: `${h.tmax}° / ${h.tmin}°`, i: Thermometer, c: "text-earth" },
    { l: "Chuva", v: `${h.rain} mm`, i: CloudRain, c: "text-water" },
    { l: "Irrigação", v: `${h.irrigation} L/m²`, i: Droplets, c: "text-water" },
    { l: "Umidade solo", v: `${h.soil}%`, i: Droplets, c: "text-primary" },
  ];

  return (
    <>
      <PageHeader title="Histórico e calendário" subtitle="Toque em um dia para ver os registros da lavoura" />
      <div className="grid gap-5 lg:grid-cols-[auto_1fr]">
        <Panel title="Calendário" icon={<CalendarDays className="h-5 w-5 text-primary" />}>
          <Calendar locale={ptBR} mode="single" selected={date} onSelect={(d) => d && setDate(d)} defaultMonth={date}
            fromDate={new Date(2026, 7, 10)} toDate={new Date(2026, 9, 8)} className="mx-auto" />
        </Panel>
        <Panel title={date.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {stats.map(({ l, v, i: I, c }) => (
              <div key={l} className="rounded-xl bg-muted p-3"><I className={`h-5 w-5 ${c}`} /><p className="mt-2 text-xs text-muted-foreground">{l}</p><p className="font-display text-lg font-semibold">{v}</p></div>
            ))}
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border p-4">
              <p className="flex items-center gap-2 text-sm font-semibold"><FlaskConical className="h-4 w-4 text-earth" />Insumos aplicados</p>
              <p className="mt-2 text-sm text-muted-foreground">{h.input ?? "Nenhuma aplicação neste dia."}</p>
              <p className="mt-3 text-xs text-muted-foreground">ET₀ do dia: {h.et0} mm</p>
            </div>
            {h.photo ? <img src={h.photo} alt="Foto do dia" loading="lazy" className="h-40 w-full rounded-xl object-cover" />
              : <div className="grid h-40 place-items-center rounded-xl border border-dashed text-sm text-muted-foreground">Sem fotos neste dia</div>}
          </div>
        </Panel>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <Panel title="NDVI médio por safra" icon={<BarChart3 className="h-5 w-5 text-primary" />}>
          <div className="h-72"><ResponsiveContainer width="100%" height="100%">
            <LineChart data={seasonCurve}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="week" stroke="var(--muted-foreground)" fontSize={11} />
              <YAxis stroke="var(--muted-foreground)" fontSize={11} domain={[0, 1]} />
              <Tooltip {...tip} /><Legend />
              {seasons.map((s, i) => <Line key={s} dataKey={s} stroke={colors[i]} strokeWidth={2.5} dot={false} />)}
            </LineChart>
          </ResponsiveContainer></div>
        </Panel>
        <Panel title="Produtividade por talhão (sc/ha)" icon={<BarChart3 className="h-5 w-5 text-earth" />}>
          <div className="h-72"><ResponsiveContainer width="100%" height="100%">
            <BarChart data={plotYield}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="plot" stroke="var(--muted-foreground)" fontSize={11} />
              <YAxis stroke="var(--muted-foreground)" fontSize={11} />
              <Tooltip {...tip} /><Legend />
              {seasons.map((s, i) => <Bar key={s} dataKey={s} fill={colors[i]} radius={[6, 6, 0, 0]} />)}
            </BarChart>
          </ResponsiveContainer></div>
        </Panel>
      </div>
    </>
  );
}
