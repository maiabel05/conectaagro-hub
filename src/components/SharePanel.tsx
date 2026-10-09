import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Share2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Panel } from "@/components/AppShell";

export function SharePanel({ userId }: { userId: string }) {
  const qc = useQueryClient();
  const [email, setEmail] = useState("");
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
    const { data, error } = await supabase.rpc("share_plots_with", { _email: email });
    if (error || !data) return toast.error("Não foi possível compartilhar. A pessoa precisa ter uma conta confirmada no ConectaAgro.");
    toast.success("Acesso liberado.");
    setEmail("");
    qc.invalidateQueries({ queryKey: ["shares", userId] });
  };
  const revoke = async (id: string) => {
    await supabase.from("plot_shares").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["shares", userId] });
  };

  return (
    <Panel title="Compartilhar meus talhões" icon={<Share2 className="h-5 w-5 text-primary" />} className="mt-5">
      <p className="mb-3 text-sm text-muted-foreground">Quem você autorizar poderá apenas ver seus talhões (sem editar ou excluir). Você pode remover o acesso a qualquer momento.</p>
      <form onSubmit={share} className="flex gap-2">
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="e-mail da pessoa" className="flex-1 rounded-lg border bg-background px-3 py-2 text-sm" />
        <button className="rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground">Liberar</button>
      </form>
      <ul className="mt-3 divide-y text-sm">
        {(shares.data ?? []).map((s) => (
          <li key={s.id} className="flex items-center justify-between py-2">
            <span>{s.viewer_email}</span>
            <button aria-label="Remover acesso" onClick={() => revoke(s.id)} className="p-1 text-muted-foreground hover:text-destructive"><X className="h-4 w-4" /></button>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
