import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Panel } from "@/components/AppShell";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Entrar — ConectaAgro" },
      { name: "description", content: "Acesse sua conta de produtor no ConectaAgro." },
      { property: "og:title", content: "Entrar — ConectaAgro" },
      { property: "og:description", content: "Acesse seus talhões e dados da fazenda com segurança." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

export const field = "w-full rounded-lg border bg-background px-3 py-2 text-sm";

export async function googleSignIn() {
  const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
  if (r.error) toast.error("Não foi possível entrar com o Google.");
}

function AuthPage() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setBusy(false);
    if (error) { toast.error("E-mail ou senha incorretos, ou e-mail ainda não confirmado."); return; }
    nav({ to: "/talhoes" });
  };

  return (
    <div className="mx-auto max-w-md">
      <Panel title="Entrar no ConectaAgro">
        <form onSubmit={submit} className="space-y-3">
          <label className="block text-sm">E-mail<input type="email" autoComplete="email" required className={field} value={email} onChange={(e) => setEmail(e.target.value)} /></label>
          <label className="block text-sm">Senha<input type="password" autoComplete="current-password" required className={field} value={password} onChange={(e) => setPassword(e.target.value)} /></label>
          <button disabled={busy} className="w-full rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-50">Entrar</button>
        </form>
        <button onClick={googleSignIn} className="mt-3 w-full rounded-lg border py-2.5 text-sm font-medium">Entrar com Google</button>
        <p className="mt-4 text-center text-sm text-muted-foreground">Ainda não tem conta? <Link to="/cadastro" className="font-medium text-primary">Criar conta de produtor</Link></p>
      </Panel>
    </div>
  );
}
