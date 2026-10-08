import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, CloudRain, CloudSun, Cloud, Droplets, Gauge, Sprout, Sun, Thermometer, Timer, Waves } from "lucide-react";
import { useEffect, useState } from "react";
import { Area, AreaChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PageHeader, Panel } from "@/components/AppShell";
import { waterBalance } from "@/lib/agro";
import { alerts, forecast, hourly, plots, type Health } from "@/lib/mock-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Painel em tempo real — ConectaAgro" },
      { name: "description", content: "Monitoramento IoT de talhões, balanço hídrico diário e previsão do tempo para agricultura de precisão." },
      { property: "og:title", content: "Painel em tempo real — ConectaAgro" },
      { property: "og:description", content: "Sensores, irrigação recomendada e clima dos próximos 7 dias em um só lugar." },
    ],
  }),
  component: Dashboard,
});

const healthStyle: Record<Health, string> = {
  "ótimo": "bg-success/15 text-success",
  "atenção": "bg-warning/20 text-warning-foreground dark:text-warning",
  "crítico": "bg-destructive/15 text-destructive",
};
const wIcon = { sun: Sun, "cloud-sun": CloudSun, rain: CloudRain, cloud: Cloud };
const tip = { contentStyle: { background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12, color: "var(--popover-foreground)" } };

function useLive() {
  const [m, setM] = useState({ soil: 26.4, temp: 28.7, air: 61, rad: 742, rain: 0.4 });
  useEffect(() => {
    const id = setInterval(() => setM((p) => ({
      soil: +(p.soil + (Math.random() - 0.55) * 0.2).toFixed(1),
      temp: +(p.temp + (Math.random() - 0.5) * 0.3).toFixed(1),
      air: Math.round(Math.min(99, Math.max(30, p.air + (Math.random() - 0.5) * 2))),
      rad: Math.round(Math.max(0, p.rad + (Math.random() - 0.5) * 25)),
      rain: p.rain,
    })), 2500);
    return () => clearInterval(id);
  }, []);
  return m;
}

function Dashboard() {
  const m = useLive();
  const [plotId, setPlotId] = useState("T1");
  const plot = plots.find((p) => p.id === plotId)!;
  const wb = waterBalance({ et0: forecast[0]!.et0, kc: plot.kc, rainForecast: forecast[0]!.rain, soilMoisture: plot.moisture });
  const fillPct = Math.min(100, (wb.litersPerM2 / 8) * 100);

  const metrics = [
    { label: "Umidade do solo", value: m.soil, unit: "%", icon: Droplets, tone: "text-water bg-water/12" },
    { label: "Temperatura", value: m.temp, unit: "°C", icon: Thermometer, tone: "text-earth bg-earth/12" },
    { label: "Umidade do ar", value: m.air, unit: "%", icon: Waves, tone: "text-water bg-water/12" },
    { label: "Radiação", value: m.rad, unit: "W/m²", icon: Sun, tone: "text-warning bg-warning/15" },
    { label: "Chuva (24h)", value: m.rain, unit: "mm", icon: CloudRain, tone: "text-primary bg-primary/12" },
  ];

  return (
    <>
      <PageHeader title="Bom dia, João" subtitle="Quinta, 8 de outubro · Safra 2025/26 · 123 ha monitorados"
        right={<span className="flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary"><span className="live-dot h-2 w-2 rounded-full bg-primary" />Ao vivo</span>} />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
        {metrics.map(({ label, value, unit, icon: Icon, tone }) => (
          <div key={label} className="rounded-2xl border bg-card p-4 shadow-soft">
            <div className={`mb-3 grid h-10 w-10 place-items-center rounded-xl ${tone}`}><Icon className="h-5 w-5" /></div>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="font-display text-2xl font-semibold tabular-nums">{value}<span className="ml-1 text-sm font-normal text-muted-foreground">{unit}</span></p>
          </div>
        ))}
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-3">
        <section className="relative overflow-hidden rounded-2xl bg-water-gradient p-6 text-water-foreground shadow-soft xl:col-span-1">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-semibold"><Droplets className="h-5 w-5" />Balanço hídrico do dia</h2>
            <select value={plotId} onChange={(e) => setPlotId(e.target.value)}
              className="rounded-lg border border-water-foreground/30 bg-water-foreground/10 px-2 py-1 text-sm text-water-foreground">
              {plots.map((p) => <option key={p.id} value={p.id} className="text-foreground">{p.id}</option>)}
            </select>
          </div>
          <div className="mt-6 flex items-end gap-6">
            <div className="relative h-36 w-20 overflow-hidden rounded-2xl border-2 border-water-foreground/50 bg-water-foreground/10">
              <div className="absolute inset-x-0 bottom-0 bg-water-foreground/60 transition-all duration-700" style={{ height: `${fillPct}%` }} />
            </div>
            <div>
              <p className="text-sm opacity-80">Aplicar hoje</p>
              <p className="font-display text-5xl font-bold">{wb.litersPerM2.toLocaleString("pt-BR")}<span className="ml-1 text-xl">L/m²</span></p>
              <p className="mt-2 flex items-center gap-1.5 text-lg"><Timer className="h-5 w-5" />{Math.floor(wb.minutes / 60)}h {wb.minutes % 60}min de irrigação</p>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-3 gap-2 text-center text-xs">
            <div className="rounded-xl bg-water-foreground/10 p-2"><p className="opacity-70">ET₀</p><p className="text-base font-semibold">{forecast[0]!.et0} mm</p></div>
            <div className="rounded-xl bg-water-foreground/10 p-2"><p className="opacity-70">Kc ({plot.stage.split(" ")[0] ?? ""})</p><p className="text-base font-semibold">{plot.kc}</p></div>
            <div className="rounded-xl bg-water-foreground/10 p-2"><p className="opacity-70">Chuva efetiva</p><p className="text-base font-semibold">{wb.effectiveRain} mm</p></div>
          </div>
          <p className="mt-3 text-xs opacity-75">ETc = ET₀ × Kc = {wb.etc} mm · Vazão do sistema: 5 mm/h</p>
        </section>

        <Panel title="Sensores nas últimas 24h" icon={<Gauge className="h-5 w-5 text-primary" />} className="xl:col-span-2">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={hourly}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="hour" stroke="var(--muted-foreground)" fontSize={11} interval={3} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} />
                <Tooltip {...tip} />
                <Line type="monotone" dataKey="temp" name="Temp (°C)" stroke="var(--chart-3)" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="soil" name="Solo (%)" stroke="var(--chart-1)" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="air" name="Ar (%)" stroke="var(--chart-2)" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      <Panel title="Previsão para 7 dias" icon={<CloudSun className="h-5 w-5 text-water" />} className="mt-5">
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
          {forecast.map((f) => { const I = wIcon[f.icon]; return (
            <div key={f.day} className="rounded-xl bg-muted p-3 text-center">
              <p className="text-xs font-medium text-muted-foreground">{f.day}</p>
              <I className="mx-auto my-2 h-8 w-8 text-water" />
              <p className="text-sm font-semibold">{f.max}° <span className="text-muted-foreground">{f.min}°</span></p>
              <p className="mt-1 text-xs text-water">{f.rain} mm · {f.rainProb}%</p>
            </div>
          ); })}
        </div>
        <div className="mt-4 h-28">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={forecast}>
              <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={11} />
              <Tooltip {...tip} />
              <Area type="monotone" dataKey="rain" name="Chuva (mm)" stroke="var(--water)" fill="var(--water)" fillOpacity={0.25} />
              <Area type="monotone" dataKey="et0" name="ET₀ (mm)" stroke="var(--earth)" fill="var(--earth)" fillOpacity={0.15} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      <div className="mt-5 grid gap-5 xl:grid-cols-3">
        <Panel title="Talhões" icon={<Sprout className="h-5 w-5 text-primary" />} className="xl:col-span-2">
          <div className="grid gap-3 sm:grid-cols-2">
            {plots.map((p) => (
              <button key={p.id} onClick={() => setPlotId(p.id)}
                className={`rounded-xl border p-4 text-left transition hover:border-primary ${plotId === p.id ? "border-primary ring-2 ring-primary/20" : ""}`}>
                <div className="flex items-start justify-between gap-2">
                  <div><p className="font-semibold">{p.name}</p><p className="text-xs text-muted-foreground">{p.area} ha · {p.stage}</p></div>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${healthStyle[p.health]}`}>{p.health}</span>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div><p className="text-xs text-muted-foreground">NDVI</p>
                    <div className="mt-1 h-2 rounded-full bg-muted"><div className="h-2 rounded-full bg-primary" style={{ width: `${p.ndvi * 100}%` }} /></div>
                    <p className="mt-1 font-medium">{p.ndvi}</p></div>
                  <div><p className="text-xs text-muted-foreground">Umidade solo</p>
                    <div className="mt-1 h-2 rounded-full bg-muted"><div className="h-2 rounded-full bg-water" style={{ width: `${(p.moisture / 40) * 100}%` }} /></div>
                    <p className="mt-1 font-medium">{p.moisture}%</p></div>
                </div>
              </button>
            ))}
          </div>
        </Panel>
        <Panel title="Alertas preditivos" icon={<AlertTriangle className="h-5 w-5 text-warning" />}>
          <ul className="space-y-3">
            {alerts.slice(0, 3).map((a) => (
              <li key={a.title} className={`rounded-xl border-l-4 bg-muted p-3 ${a.level === "alto" ? "border-destructive" : a.level === "médio" ? "border-warning" : "border-primary"}`}>
                <p className="text-sm font-semibold">{a.title}</p>
                <p className="text-xs text-muted-foreground">{a.plot} · {a.action}</p>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </>
  );
}
