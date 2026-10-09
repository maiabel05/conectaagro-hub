import { z } from "zod";

export const profileSchema = z.object({
  full_name: z.string().trim().min(1, "Informe seu nome.").max(120),
  farm_name: z.string().trim().min(1, "Informe o nome da propriedade.").max(120),
  city: z.string().trim().max(120),
  phone: z.string().trim().max(25).regex(/^[0-9+() .-]*$/, "Confira o telefone."),
  address: z.string().trim().max(240),
  state: z.string().trim().toUpperCase().regex(/^([A-Z]{2})?$/, "Use a sigla da UF."),
  postal_code: z.string().trim().regex(/^([0-9]{5}-?[0-9]{3})?$/, "Confira o CEP."),
  main_crops: z.string().trim().max(240),
  producer_type: z.enum(["individual", "family", "business", "cooperative"]),
});
export type ProducerProfile = z.infer<typeof profileSchema>;
export const emptyProfile: ProducerProfile = { full_name: "", farm_name: "", city: "", phone: "", address: "", state: "", postal_code: "", main_crops: "", producer_type: "individual" };
export const emailSchema = z.string().trim().email("Confira o e-mail.").max(255);
export const passwordChangeSchema = z.object({
  current_password: z.string().min(1, "Informe a senha atual.").max(128),
  password: z.string().min(8, "A senha precisa ter pelo menos 8 caracteres.").max(128),
  confirm: z.string().max(128),
}).refine((v) => v.password === v.confirm, "As senhas não conferem.");
export const signupSchema = profileSchema.extend({ email: emailSchema, password: z.string().min(8).max(128), confirm: z.string().max(128) })
  .refine((v) => v.password === v.confirm, "As senhas não conferem.");