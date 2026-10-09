import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { profileSchema, type ProducerProfile } from "@/lib/profile";

const columns = "full_name, farm_name, city, phone, address, state, postal_code, main_crops, producer_type";
export const getOwnProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.from("profiles").select(columns).eq("id", context.userId).single();
    if (error || !data) throw new Error("Não foi possível carregar seu cadastro.");
    return profileSchema.parse(data);
  });

export const saveOwnProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: ProducerProfile) => profileSchema.parse(input))
  .handler(async ({ data, context }) => {
    const response = await context.supabase.from("profiles").update(data).eq("id", context.userId).select(columns).single();
    if (response.error || !response.data) throw new Error("Não foi possível salvar seu cadastro.");
    return profileSchema.parse(response.data);
  });