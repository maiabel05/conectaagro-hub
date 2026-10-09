import { z } from "zod";

export const preferencesSchema = z.object({
  language: z.literal("pt-BR"),
  theme: z.enum(["light", "dark"]),
  communication: z.enum(["direct", "detailed", "technical"]),
});
export type Preferences = z.infer<typeof preferencesSchema>;
export const defaultPreferences: Preferences = { language: "pt-BR", theme: "light", communication: "direct" };
export const preferencesKey = (userId?: string) => `conectaagro:preferences:${userId ?? "visitor"}`;
export function parsePreferences(value: unknown): Preferences {
  const result = preferencesSchema.safeParse(value);
  return result.success ? result.data : { ...defaultPreferences };
}
export const communicationPreview = {
  direct: "Confira sua sessão e o acesso aos talhões antes de continuar.",
  detailed: "Verifique se sua sessão está ativa e se seus talhões podem ser consultados. O compartilhamento permite somente leitura e não inclui seu cadastro pessoal.",
  technical: "Verifique a identidade autenticada e a consulta de talhões sob as políticas de acesso. Uma consulta bem-sucedida não comprova o isolamento entre contas.",
};