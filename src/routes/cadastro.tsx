import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/AppShell";
import { field, googleSignIn } from "./auth";
import { ProfileFields } from "@/components/ProfileFields";
import { emptyProfile, signupSchema } from "@/lib/profile";

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
  const [profile, setProfile] = useState(emptyProfile);
  const [f, setF] = useState({ email: "", password: "", confirm: "" });
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = signupSchema.safeParse({ ...profile, ...f });
    if (!result.success) { toast.error(result.error.issues[0]?.message ?? "Confira os dados do cadastro."); return; }
    const { email, password, confirm: _confirm, ...metadata } = result.data;
    setBusy(true);
    try {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: metadata,
      },
    });
    if (error) { toast.error(/pwned|leaked|weak/i.test(error.message) ? "Essa senha é fraca ou já vazou na internet. Escolha outra." : "Não foi possível criar a conta. Verifique os dados."); return; }
    setSent(true);
    } catch { toast.error("Não foi possível criar a conta. Tente novamente."); }
    finally { setBusy(false); }
  };

  if (sent) return (
    <div className="mx-auto max-w-md"><Panel title="Confirme seu e-mail">
      <p className="text-sm">Enviamos um link de confirmação para <b>{f.email}</b>. Abra o e-mail e toque no link para ativar sua conta.</p>
      <Link to="/auth" className="mt-4 inline-block text-sm font-medium text-primary">Ir para o login</Link>
    </Panel></div>
  );

  return (
    <div className="mx-auto max-w-2xl">
      <Panel title="Criar conta de produtor">
        <form onSubmit={submit} className="space-y-3">
          <ProfileFields value={profile} onChange={setProfile} disabled={busy} />
          <h3 className="border-t pt-4 font-semibold">Acesso à conta</h3>
          <label className="block text-sm">E-mail<input type="email" required maxLength={255} autoComplete="email" className={field} value={f.email} onChange={set("email")} /></label>
          <label className="block text-sm">Senha (mín. 8 caracteres)<input type="password" required minLength={8} maxLength={128} autoComplete="new-password" className={field} value={f.password} onChange={set("password")} /></label>
          <label className="block text-sm">Confirmar senha<input type="password" required maxLength={128} autoComplete="new-password" className={field} value={f.confirm} onChange={set("confirm")} /></label>
          <p className="text-xs text-muted-foreground">Seus dados pessoais ficam privados. Compartilhar talhões não compartilha seu cadastro.</p>
          <Button type="submit" disabled={busy} className="w-full">{busy ? "Criando conta…" : "Criar conta"}</Button>
        </form>
        <Button variant="outline" onClick={googleSignIn} className="mt-3 w-full">Cadastrar com Google</Button>
        <p className="mt-4 text-center text-sm text-muted-foreground">Já tem conta? <Link to="/auth" className="font-medium text-primary">Entrar</Link></p>
      </Panel>
    </div>
  );
}
