import { Link } from "@tanstack/react-router";
import { BookOpen, CalendarDays, LayoutDashboard, Leaf, MapPin, Moon, Microscope, Sun } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

const nav = [
  { to: "/", label: "Painel", icon: LayoutDashboard },
  { to: "/talhoes", label: "Talhões", icon: MapPin },
  { to: "/diagnostico", label: "Diagnóstico", icon: Microscope },
  { to: "/caderno", label: "Caderno", icon: BookOpen },
  { to: "/historico", label: "Histórico", icon: CalendarDays },
] as const;

function ThemeToggle() {
  const [dark, setDark] = useState(false);
  useEffect(() => { setDark(document.documentElement.classList.contains("dark")); }, []);
  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };
  return (
    <button onClick={toggle} aria-label="Alternar tema"
      className="grid h-10 w-10 place-items-center rounded-full bg-sidebar-accent text-sidebar-accent-foreground transition hover:opacity-80">
      {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen lg:flex">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col bg-sidebar p-5 text-sidebar-foreground lg:flex">
        <div className="mb-10 flex items-center gap-2">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground"><Leaf className="h-5 w-5" /></div>
          <div><p className="font-display text-lg font-semibold leading-none">ConectaAgro</p><p className="text-xs opacity-70">Fazenda Boa Vista</p></div>
        </div>
        <nav className="flex flex-col gap-1">
          {nav.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to} activeOptions={{ exact: to === "/" }}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium opacity-80 transition hover:bg-sidebar-accent hover:opacity-100"
              activeProps={{ className: "!bg-sidebar-primary !text-sidebar-primary-foreground !opacity-100" }}>
              <Icon className="h-5 w-5" />{label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto flex items-center justify-between">
          <span className="flex items-center gap-2 text-xs opacity-80"><span className="live-dot h-2 w-2 rounded-full bg-sidebar-primary" />12 sensores online</span>
          <ThemeToggle />
        </div>
      </aside>

      <header className="sticky top-0 z-30 flex items-center justify-between bg-sidebar px-4 py-3 text-sidebar-foreground lg:hidden">
        <div className="flex items-center gap-2"><Leaf className="h-5 w-5 text-sidebar-primary" /><span className="font-display font-semibold">ConectaAgro</span></div>
        <ThemeToggle />
      </header>

      <main className="flex-1 px-4 pb-28 pt-5 sm:px-6 lg:px-10 lg:pb-10 lg:pt-8">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-sidebar-border bg-sidebar text-sidebar-foreground lg:hidden">
        {nav.map(({ to, label, icon: Icon }) => (
          <Link key={to} to={to} activeOptions={{ exact: to === "/" }}
            className="flex flex-col items-center gap-1 py-3 text-xs opacity-70"
            activeProps={{ className: "!opacity-100 text-sidebar-primary" }}>
            <Icon className="h-6 w-6" />{label}
          </Link>
        ))}
      </nav>
    </div>
  );
}

export function PageHeader({ title, subtitle, right }: { title: string; subtitle?: string; right?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-semibold sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {right}
    </div>
  );
}

export function Panel({ title, icon, children, className = "", action }: { title?: string; icon?: ReactNode; children: ReactNode; className?: string; action?: ReactNode }) {
  return (
    <section className={`rounded-2xl border bg-card p-5 text-card-foreground shadow-soft ${className}`}>
      {title && (
        <div className="mb-4 flex items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 text-base font-semibold">{icon}{title}</h2>{action}
        </div>
      )}
      {children}
    </section>
  );
}
