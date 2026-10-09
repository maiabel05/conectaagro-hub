import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Panel } from "@/components/AppShell";
import { field, googleSignIn } from "./auth";

export const Route = createFileRoute("/cadastro")({
  head: () => ({
    meta: [
      { title: "Criar conta de produtor — ConectaAgro" },
      { name: "description", content: "Cadastre-se como produtor rural e guarde seus talhões com segurança." },
      { property: "og:title", content: "Criar conta de produtor — ConectaAgro" },
      { property: "og:description", content: "Crie sua conta e acesse seus talhões de qualquer aparelho." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Cadastro,
});

function Cadastro() {
  const [f, setF] = useState({ full_name: "", farm_name: "", city: "", email: "", password: "", confirm: "" });
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (f.password.length < 8) return toast.error("A senha precisa ter pelo menos 8 caracteres.");
    if (f.password !== f.confirm) return toast.error("As senhas não conferem.");
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email: f.email.trim(),
      password: f.password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { full_name: f.full_name.trim().slice(0, 120), farm_name: f.farm_name.trim().slice(0, 120), city: f.city.trim().slice(0, 120) },
      },
    });
    setBusy(false);
    if (error) return toast.error(/pwned|leaked|weak/i.test(error.message) ? "Essa senha é fraca ou já vazou na internet. Escolha outra." : "Não foi possível criar a conta. Verifique os dados.");
    setSent(true);
  };

  if (sent) return (
    <div className="mx-auto max-w-md"><Panel title="Confirme seu e-mail">
      <p className="text-sm">Enviamos um link de confirmação para <b>{f.email}</b>. Abra o e-mail e toque no link para ativar sua conta.</p>
      <Link to="/auth" className="mt-4 inline-block text-sm font-medium text-primary">Ir para o login</Link>
    </Panel></div>
  );

  return (
    <div className="mx-auto max-w-md">
      <Panel title="Criar conta de produtor">
        <form onSubmit={submit} className="space-y-3">
          <label className="block text-sm">Nome completo<input required maxLength={120} autoComplete="name" className={field} value={f.full_name} onChange={set("full_name")} /></label>
          <label className="block text-sm">Nome da fazenda<input required maxLength={120} className={field} value={f.farm_name} onChange={set("farm_name")} /></label>
          <label className="block text-sm">Cidade / UF<input maxLength={120} className={field} value={f.city} onChange={set("city")} placeholder="Sorriso / MT" /></label>
          <label className="block text-sm">E-mail<input type="email" required autoComplete="email" className={field} value={f.email} onChange={set("email")} /></label>
          <label className="block text-sm">Senha (mín. 8 caracteres)<input type="password" required minLength={8} autoComplete="new-password" className={field} value={f.password} onChange={set("password")} /></label>
          <label className="block text-sm">Confirmar senha<input type="password" required autoComplete="new-password" className={field} value={f.confirm} onChange={set("confirm")} /></label>
          <button disabled={busy} className="w-full rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-50">Criar conta</button>
        </form>
        <button onClick={googleSignIn} className="mt-3 w-full rounded-lg border py-2.5 text-sm font-medium">Cadastrar com Google</button>
        <p className="mt-4 text-center text-sm text-muted-foreground">Já tem conta? <Link to="/auth" className="font-medium text-primary">Entrar</Link></p>
      </Panel>
    </div>
  );
}
