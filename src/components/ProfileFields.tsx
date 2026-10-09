import type { ProducerProfile } from "@/lib/profile";

const field = "mt-1 min-h-11 w-full rounded-lg border bg-background px-3 py-2 text-base";
const fields: { key: keyof ProducerProfile; label: string; max: number; autoComplete?: string; type?: string; required?: boolean }[] = [
  { key: "full_name", label: "Nome completo", max: 120, autoComplete: "name", required: true },
  { key: "farm_name", label: "Nome da propriedade", max: 120, required: true },
  { key: "phone", label: "Telefone (opcional)", max: 25, autoComplete: "tel", type: "tel" },
  { key: "city", label: "Cidade (opcional)", max: 120, autoComplete: "address-level2" },
  { key: "state", label: "UF (opcional)", max: 2, autoComplete: "address-level1" },
  { key: "postal_code", label: "CEP (opcional)", max: 9, autoComplete: "postal-code" },
  { key: "address", label: "Endereço (opcional)", max: 240, autoComplete: "street-address" },
  { key: "main_crops", label: "Principais culturas (opcional)", max: 240 },
];

export function ProfileFields({ value, onChange, disabled = false }: { value: ProducerProfile; onChange: (value: ProducerProfile) => void; disabled?: boolean }) {
  return <fieldset disabled={disabled} className="grid min-w-0 gap-4 sm:grid-cols-2">
    {fields.map((f) => <label key={f.key} className={`min-w-0 text-sm font-medium ${f.key === "address" || f.key === "main_crops" ? "sm:col-span-2" : ""}`}>
      {f.label}<input className={field} required={f.required} maxLength={f.max} type={f.type ?? "text"} autoComplete={f.autoComplete} value={value[f.key]} onChange={(e) => onChange({ ...value, [f.key]: e.target.value })} />
    </label>)}
    <label className="text-sm font-medium sm:col-span-2">Perfil de produção<select className={field} value={value.producer_type} onChange={(e) => {
      const type = e.target.value;
      if (type === "individual" || type === "family" || type === "business" || type === "cooperative") onChange({ ...value, producer_type: type });
    }}><option value="individual">Produtor individual</option><option value="family">Agricultura familiar</option><option value="business">Empresa rural</option><option value="cooperative">Cooperativa</option></select></label>
  </fieldset>;
}