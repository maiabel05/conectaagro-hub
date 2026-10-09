import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Share2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Panel } from "@/components/AppShell";
import { Button } from "@/components/ui/button";

export function SharePanel({ userId }: { userId: string }) {
  const qc = useQueryClient();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const shares = useQuery({
    queryKey: ["shares", userId],
    queryFn: async () => {
      const { data, error } = await supabase.from("plot_shares").select("id, viewer_email").eq("owner_id", userId);
      if (error) throw error;
      return data ?? [];
    },
  });

  const share = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.rpc("share_plots_with", { _email: email });
    setBusy(false);
    if (error) { toast.error("Não foi possível compartilhar. Tente novamente mais tarde."); return; }
    toast.success("Se houver uma conta confirmada com esse e-mail, o acesso foi liberado.");
    setEmail("");
    qc.invalidateQueries({ queryKey: ["shares", userId] });
  };
  const revoke = async (id: string) => {
    const { error } = await supabase.from("plot_shares").delete().eq("id", id);
    if (error) { toast.error("Não foi possível remover o acesso."); return; }
    toast.success("Acesso removido.");
    qc.invalidateQueries({ queryKey: ["shares", userId] });
  };

  return (
    <Panel title="Compartilhar meus talhões" icon={<Share2 className="h-5 w-5 text-primary" />} className="mt-5">
      <p className="mb-3 text-sm text-muted-foreground">A autorização inclui todos os seus talhões, localização e área, inclusive os futuros. Não inclui seu cadastro pessoal. A pessoa precisa ter conta confirmada e poderá somente visualizar. Você pode revogar o acesso.</p>
      <form onSubmit={share} className="flex flex-wrap gap-2">
        <input aria-label="E-mail da pessoa autorizada" type="email" required maxLength={255} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="e-mail da pessoa" className="min-w-0 flex-1 rounded-lg border bg-background px-3 py-2 text-sm" />
        <Button type="submit" disabled={busy}>Liberar</Button>
      </form>
      <ul className="mt-3 divide-y text-sm">
        {(shares.data ?? []).map((s) => (
          <li key={s.id} className="flex items-center justify-between py-2">
            <span className="min-w-0 break-all">{s.viewer_email}</span>
            <Button variant="ghost" size="icon" aria-label="Remover acesso" onClick={() => revoke(s.id)}><X className="h-4 w-4" /></Button>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
