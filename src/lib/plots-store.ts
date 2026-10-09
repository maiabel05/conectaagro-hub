import { useQuery, useQueryClient } from "@tanstack/react-query";
import { plots as basePlots, type Health } from "@/lib/mock-data";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";

export type LatLng = { lat: number; lng: number };
export type Plot = (typeof basePlots)[number] & {
  uuid?: string; ownerId?: string; mine?: boolean; location?: LatLng; boundary?: LatLng[];
};

const demo: Plot[] = basePlots.map((p, i) => ({
  ...p,
  location: { lat: -12.55 + i * 0.006, lng: -55.72 + (i % 2) * 0.008 },
}));

export const plotsKey = (uid?: string) => ["plots", uid ?? "anon"] as const;

async function fetchPlots(uid: string): Promise<Plot[]> {
  const { data, error } = await supabase.from("plots").select("*").order("created_at");
  if (error) throw error;
  return (data ?? []).map((r) => ({
    id: r.code, uuid: r.id, ownerId: r.owner_id, mine: r.owner_id === uid,
    name: r.name, crop: r.crop, stage: r.stage, area: Number(r.area), kc: Number(r.kc),
    ndvi: Number(r.ndvi), health: r.health as Health, moisture: Number(r.moisture),
    ...(r.lat != null && r.lng != null ? { location: { lat: r.lat, lng: r.lng } } : {}),
    ...(Array.isArray(r.boundary) ? { boundary: r.boundary as unknown as LatLng[] } : {}),
  }));
}

/** Signed-in: plots you own + plots shared with you. Signed-out: demo plots. */
export function usePlotsQuery() {
  const { user, ready } = useAuth();
  const q = useQuery({
    queryKey: plotsKey(user?.id),
    queryFn: () => fetchPlots(user!.id),
    enabled: !!user,
  });
  return { ...q, user, ready, plots: user ? q.data ?? [] : demo };
}

export function usePlots(): Plot[] {
  const { plots, user } = usePlotsQuery();
  return user && plots.length === 0 ? demo : plots;
}

export function usePlotMutations() {
  const qc = useQueryClient();
  const refresh = () => qc.invalidateQueries({ queryKey: ["plots"] });
  return {
    async add(p: { name: string; crop: string; stage: string; area: number; location: LatLng; boundary?: LatLng[] }, code: string) {
      const { error } = await supabase.from("plots").insert({
        code, name: p.name, crop: p.crop, stage: p.stage, area: p.area,
        lat: p.location.lat, lng: p.location.lng, boundary: p.boundary ?? null,
      });
      if (error) throw error;
      await refresh();
    },
    async remove(uuid: string) {
      const { error } = await supabase.from("plots").delete().eq("id", uuid);
      if (error) throw error;
      await refresh();
    },
  };
}
