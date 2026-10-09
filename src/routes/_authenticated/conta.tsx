import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { queryOptions, useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { KeyRound, Mail, Save, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { ProfileFields } from "@/components/ProfileFields";
import { emailSchema, passwordChangeSchema, profileSchema, type ProducerProfile } from "@/lib/profile";
import { getOwnProfile, saveOwnProfile } from "@/lib/profile.functions";
import { useAuth } from "@/lib/use-auth";
import { supabase } from "@/integrations/supabase/client";

const profileOptions = (id: string) => queryOptions({ queryKey: ["own-profile", id], queryFn: () => getOwnProfile() });
export const Route = createFileRoute("/_authenticated/conta")({
  loader: async ({ context }) => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw new Error("Entre novamente para acessar sua conta.");
    await context.queryClient.ensureQueryData(profileOptions(data.user.id));
    return { userId: data.user.id };
  },
  head: () => ({ meta: [
    { title: "Minha conta de produtor — ConectaAgro" },
    { name: "description", content: "Edite seu cadastro de produtor e gerencie o acesso à sua conta com privacidade." },
    { property: "og:title", content: "Minha conta de produtor — ConectaAgro" },
    { property: "og:description", content: "Gerencie seu cadastro pessoal, e-mail e senha no ConectaAgro." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: AccountPage,
});
const field = "mt-1 min-h-11 w-full rounded-lg border bg-background px-3 py-2 text-base";

function AccountPage() {
  const { userId } = Route.useLoaderData();
  const { data } = useSuspenseQuery(profileOptions(userId));
  return <AccountEditor key={userId} initial={data} userId={userId} />;
}

function AccountEditor({ initial, userId }: { initial: ProducerProfile; userId: string }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const saveProfile = useServerFn(saveOwnProfile);
  const [profile, setProfile] = useState(initial);
  const [email, setEmail] = useState("");
  const [emailBusy, setEmailBusy] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [passwords, setPasswords] = useState({ current_password: "", password: "", confirm: "" });
  const [passwordBusy, setPasswordBusy] = useState(false);
  const update = useMutation({
    mutationFn: (value: ProducerProfile) => saveProfile({ data: value }),
    onSuccess: (value) => { queryClient.setQueryData(profileOptions(userId).queryKey, value); setProfile(value); toast.success("Cadastro salvo na sua conta."); },
    onError: () => toast.error("Não foi possível salvar. Tente novamente."),
  });
  const changeEmail = async (event: React.FormEvent) => {
    event.preventDefault();
    const result = emailSchema.safeParse(email);
    if (!result.success) { toast.error("Confira o novo e-mail."); return; }
    setEmailBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ email: result.data }, { emailRedirectTo: window.location.origin });
      if (error) { toast.error("Não foi possível alterar o e-mail. Entre novamente e tente outra vez."); return; }
      setEmailSent(true); setEmail("");
    } catch { toast.error("Não foi possível enviar a alteração."); }
    finally { setEmailBusy(false); }
  };
  const changePassword = async (event: React.FormEvent) => {
    event.preventDefault();
    const result = passwordChangeSchema.safeParse(passwords);
    if (!result.success) { toast.error(result.error.issues[0]?.message ?? "Confira as senhas."); return; }
    setPasswordBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: result.data.password, current_password: result.data.current_password });
      if (error) { toast.error("Não foi possível alterar a senha. Confira a senha atual e escolha uma senha forte."); return; }
      setPasswords({ current_password: "", password: "", confirm: "" }); toast.success("Senha alterada.");
    } catch { toast.error("Não foi possível alterar a senha."); }
    finally { setPasswordBusy(false); }
  };
  return <>
    <PageHeader title="Minha conta" subtitle="Cadastro e acesso do produtor" />
    <Button variant="link" asChild className="mb-4 px-0"><Link to="/configuracoes">Voltar aos Ajustes</Link></Button>
    <div className="grid min-w-0 gap-8 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
      <section className="min-w-0">
        <h2 className="mb-4 text-lg font-semibold">Cadastro do produtor</h2>
        <form className="space-y-5" onSubmit={(event) => { event.preventDefault(); const result = profileSchema.safeParse(profile); if (!result.success) { toast.error(result.error.issues[0]?.message ?? "Confira o cadastro."); return; } update.mutate(result.data); }}>
          <ProfileFields value={profile} onChange={setProfile} disabled={update.isPending} />
          <p className="flex gap-2 text-sm text-muted-foreground"><ShieldCheck className="h-5 w-5 shrink-0 text-primary" />Seu cadastro é privado e não acompanha o compartilhamento de talhões.</p>
          <Button type="submit" disabled={update.isPending} className="w-full sm:w-auto"><Save className="h-4 w-4" />{update.isPending ? "Salvando…" : "Salvar alterações"}</Button>
        </form>
      </section>
      <div className="min-w-0 space-y-8">
        <section className="border-t pt-6 xl:border-t-0 xl:pt-0">
          <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold"><Mail className="h-5 w-5 text-primary" />E-mail de acesso</h2>
          <p className="mb-4 break-all text-sm text-muted-foreground">{user?.email}</p>
          <form onSubmit={changeEmail} className="space-y-3">
            <label className="block text-sm font-medium">Novo e-mail<input type="email" required maxLength={255} autoComplete="email" value={email} onChange={(e) => { setEmail(e.target.value); setEmailSent(false); }} className={field} /></label>
            <Button variant="outline" type="submit" disabled={emailBusy} className="w-full">{emailBusy ? "Enviando…" : "Enviar alteração de e-mail"}</Button>
          </form>
          {emailSent && <p role="status" className="mt-3 text-sm">Confira os links enviados aos e-mails envolvidos para confirmar a alteração. Seu acesso permanece com o e-mail atual até a confirmação.</p>}
        </section>
        <section className="border-t pt-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold"><KeyRound className="h-5 w-5 text-primary" />Alterar senha</h2>
          <form onSubmit={changePassword} className="space-y-3">
            {([{ key: "current_password", label: "Senha atual", autoComplete: "current-password" }, { key: "password", label: "Nova senha (mín. 8 caracteres)", autoComplete: "new-password" }, { key: "confirm", label: "Confirmar nova senha", autoComplete: "new-password" }] as const).map((f) => <label key={f.key} className="block text-sm font-medium">{f.label}<input type="password" required minLength={f.key === "current_password" ? 1 : 8} maxLength={128} autoComplete={f.autoComplete} value={passwords[f.key]} onChange={(e) => setPasswords({ ...passwords, [f.key]: e.target.value })} className={field} /></label>)}
            <Button type="submit" disabled={passwordBusy} className="w-full"><Save className="h-4 w-4" />{passwordBusy ? "Salvando…" : "Salvar nova senha"}</Button>
          </form>
          <p className="mt-3 text-xs text-muted-foreground">Contas criadas com Google podem continuar usando o botão Entrar com Google.</p>
        </section>
      </div>
    </div>
  </>;
}