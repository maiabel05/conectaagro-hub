import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, Save, Settings, ShieldCheck, UserRound, LogIn } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, Panel } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { communicationPreview, defaultPreferences, parsePreferences, preferencesKey, preferencesSchema, type Preferences } from "@/lib/preferences";

export const Route = createFileRoute("/configuracoes")({
  head: () => ({ meta: [
    { title: "Configurações e segurança — ConectaAgro" },
    { name: "description", content: "Preferências de idioma, aparência, comunicação e verificações de acesso do ConectaAgro." },
    { property: "og:title", content: "Configurações e segurança — ConectaAgro" },
    { property: "og:description", content: "Personalize suas preferências e confira sessão, acesso e salvamento dos dados." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: Configuracoes,
});

const field = "mt-2 min-h-11 w-full rounded-lg border bg-background px-3 py-2 text-base";

function Configuracoes() {
  const { user, ready } = useAuth();
  const key = preferencesKey(user?.id);
  const [preferences, setPreferences] = useState<Preferences>(defaultPreferences);
  const [loadedKey, setLoadedKey] = useState("");
  const [busy, setBusy] = useState(false);
  const [checks, setChecks] = useState<string[]>([]);
  useEffect(() => {
    if (!ready) return;
    try {
      const raw = localStorage.getItem(key);
      setPreferences(raw ? parsePreferences(JSON.parse(raw)) : { ...defaultPreferences, theme: document.documentElement.classList.contains("dark") ? "dark" : "light" });
    } catch { setPreferences(defaultPreferences); }
    setLoadedKey(key);
    setChecks([]);
  }, [key, ready]);

  const save = (event: React.FormEvent) => {
    event.preventDefault();
    const result = preferencesSchema.safeParse(preferences);
    if (!result.success) { toast.error("Confira as preferências selecionadas."); return; }
    try {
      localStorage.setItem(key, JSON.stringify(result.data));
      localStorage.setItem("theme", result.data.theme);
      document.documentElement.classList.toggle("dark", result.data.theme === "dark");
      window.dispatchEvent(new Event("conectaagro:theme"));
      toast.success("Preferências salvas neste aparelho.");
    } catch { toast.error("Seu navegador não permitiu salvar as preferências."); }
  };

  const verify = async () => {
    setBusy(true);
    const results: string[] = [];
    try {
      const probe = `${key}:check`;
      try {
        localStorage.setItem(probe, "ok");
        results.push(localStorage.getItem(probe) === "ok" ? "Armazenamento deste navegador: disponível." : "Armazenamento deste navegador: indisponível.");
        localStorage.removeItem(probe);
      } catch { results.push("Armazenamento deste navegador: bloqueado."); }
      results.push(preferencesSchema.safeParse(preferences).success ? "Formulário de preferências: opções válidas." : "Formulário de preferências: confira as opções.");
      if (user) {
        const { data, error } = await supabase.auth.getUser();
        if (error || data.user?.id !== user.id) results.push("Autenticação: não foi possível confirmar a sessão. Entre novamente.");
        else {
          results.push("Autenticação: sessão confirmada.");
          const response = await supabase.from("plots").select("id", { count: "exact", head: true });
          results.push(response.error ? "Consulta de talhões: falhou. Tente novamente." : "Consulta de talhões: disponível para sua sessão.");
        }
      } else results.push("Autenticação e consulta de talhões: entre na sua conta para verificar.");
    } catch { results.push("Não foi possível concluir a verificação. Tente novamente."); }
    finally { setChecks(results); setBusy(false); }
  };

  return <>
    <PageHeader title="Configurações" subtitle="Preferências e segurança da sua conta" />
    <section className="mb-6 flex min-w-0 flex-col gap-4 border-b pb-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0"><h2 className="flex items-center gap-2 text-lg font-semibold"><UserRound className="h-5 w-5 text-primary" />Conta do produtor</h2><p className="mt-1 text-sm text-muted-foreground">{user ? "Atualize seu cadastro, e-mail e senha." : "Entre na sua conta ou crie seu cadastro de produtor."}</p></div>
      <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
        {ready && (user ? <Button asChild><Link to="/conta"><UserRound className="h-4 w-4" />Modificar minha conta</Link></Button> : <><Button asChild><Link to="/auth" search={{ next: "conta" }}><LogIn className="h-4 w-4" />Entrar na conta</Link></Button><Button variant="outline" asChild><Link to="/cadastro">Criar conta de produtor</Link></Button></>)}
      </div>
    </section>
    <div className="grid min-w-0 gap-6 xl:grid-cols-2">
      <Panel title="Suas preferências" icon={<Settings className="h-5 w-5 text-primary" />}>
        <form onSubmit={save} className="space-y-5">
          <label className="block text-sm font-medium">Idioma<select className={field} value={preferences.language} onChange={() => setPreferences({ ...preferences, language: "pt-BR" })}><option value="pt-BR">Português (Brasil)</option></select></label>
          <fieldset><legend className="text-sm font-medium">Aparência</legend><div className="mt-2 grid grid-cols-2 gap-2">{(["light", "dark"] as const).map((theme) => <Button key={theme} type="button" variant={preferences.theme === theme ? "default" : "outline"} aria-pressed={preferences.theme === theme} onClick={() => setPreferences({ ...preferences, theme })}>{theme === "light" ? "Claro" : "Escuro"}</Button>)}</div></fieldset>
          <label className="block text-sm font-medium">Estilo de comunicação<select className={field} value={preferences.communication} onChange={(event) => { const result = preferencesSchema.shape.communication.safeParse(event.target.value); if (result.success) setPreferences({ ...preferences, communication: result.data }); }}><option value="direct">Direto e simples</option><option value="detailed">Detalhado</option><option value="technical">Técnico</option></select></label>
          <div className="border-l-2 border-primary pl-4"><p className="mb-1 text-xs text-muted-foreground">Prévia do estilo</p><p className="text-sm">{communicationPreview[preferences.communication]}</p></div>
          <p className="text-xs text-muted-foreground">Preferências guardadas neste aparelho, separadas por conta. O estilo personaliza os resumos nesta página; não altera os diagnósticos simulados.</p>
          <Button type="submit" disabled={!ready || loadedKey !== key} className="w-full"><Save className="h-4 w-4" />Salvar preferências</Button>
        </form>
      </Panel>
      <Panel title="Segurança e funcionamento" icon={<ShieldCheck className="h-5 w-5 text-primary" />}>
        <p className="mb-4 text-sm">{communicationPreview[preferences.communication]}</p>
        <dl className="divide-y text-sm">
          <div className="py-3"><dt className="font-semibold">Sessão</dt><dd className="mt-1 text-muted-foreground">{!ready ? "Conferindo…" : user ? "Conta conectada. Use a verificação para confirmar a sessão." : "Você está navegando sem login."}</dd></div>
          <div className="py-3"><dt className="font-semibold">Permissões de acesso</dt><dd className="mt-1 text-muted-foreground">Talhões privados, com compartilhamento autorizado somente para leitura. Seu cadastro pessoal não é compartilhado.</dd><Button variant="link" asChild className="mt-1 px-0"><Link to={user ? "/talhoes" : "/auth"}>{user ? "Conferir compartilhamentos" : "Entrar na conta"}</Link></Button></div>
          <div className="py-3"><dt className="font-semibold">Persistência dos dados</dt><dd className="mt-1 text-muted-foreground">Talhões: salvos na conta. Aplicações, diário, fotos e favoritos: não permanecem após recarregar. Preferências: salvas apenas neste aparelho.</dd></div>
          <div className="py-3"><dt className="font-semibold">Verificação de formulários</dt><dd className="mt-1 text-muted-foreground">Esta verificação confere as opções das preferências. Não testa o envio de cadastro, aplicações ou compartilhamentos.</dd></div>
        </dl>
        <Button variant="outline" className="mt-4 w-full" disabled={busy || !ready} onClick={verify}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}{busy ? "Verificando…" : "Verificar agora"}</Button>
        <div aria-live="polite" className="mt-4 space-y-2">{checks.map((check) => <p key={check} className="text-sm">{check}</p>)}</div>
        <p className="mt-4 text-xs text-muted-foreground">Nenhuma permissão é alterada. Estas verificações não comprovam isolamento entre contas nem salvamento completo; isso exige testes com contas confirmadas.</p>
      </Panel>
    </div>
  </>;
}