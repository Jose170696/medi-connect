import { useNavigate } from "react-router-dom";
import { useForm, type SubmitHandler, type Resolver } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listPatients, type Patient } from "../api/patients";
import { listMedications, type Medication } from "../api/medications";
import { createRequest, type Request } from "../api/requests";

// Acepta id numérico o string
const idSchema = z.union([
  z.coerce.number().int().positive(),
  z.string().min(1)
]);

const schema = z.object({
  patientId: idSchema,
  medicationId: idSchema,
  qty: z.coerce.number().int().min(1, { message: "Cantidad mínima 1" }),
});

type FormValues = z.infer<typeof schema>;

export default function RequestForm() {
  const nav = useNavigate();
  const qc = useQueryClient();

  const { data: patients } = useQuery<Patient[]>({
    queryKey: ["patients"],
    queryFn: listPatients,
  });

  const { data: meds } = useQuery<Medication[]>({
    queryKey: ["medications"],
    queryFn: listMedications,
  });

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema) as Resolver<FormValues>,
  });

  const createMut = useMutation({
    mutationFn: (vals: FormValues) => {
      const payload: Request = {
        ...vals,
        status: "CREADA", 
        createdAt: new Date().toISOString(),
      };
      return createRequest(payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["requests"] });
      nav("/requests");
    },
  });

  const onSubmit: SubmitHandler<FormValues> = (vals) => createMut.mutate(vals);

  return (
    <section className="max-w-xl">
      <h2 className="text-lg font-semibold mb-4">Nueva solicitud</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

        {/* PACIENTE */}
        <div>
          <label className="block text-sm mb-1">Paciente</label>
          <select className="w-full rounded border p-2" {...register("patientId")}>
            <option value="">-- Elige --</option>
            {(patients ?? []).map((p) => (
              <option key={String(p.id)} value={String(p.id)}>
                {p.name}
              </option>
            ))}
          </select>
          {errors.patientId && (
            <p className="text-red-600 text-sm">{errors.patientId.message as string}</p>
          )}
        </div>

        {/* MEDICAMENTO */}
        <div>
          <label className="block text-sm mb-1">Medicamento</label>
          <select className="w-full rounded border p-2" {...register("medicationId")}>
            <option value="">-- Elige --</option>
            {(meds ?? []).map((m) => (
              <option key={String(m.id)} value={String(m.id)}>
                {m.code} — {m.name} (stock: {m.stock})
              </option>
            ))}
          </select>
          {errors.medicationId && (
            <p className="text-red-600 text-sm">{errors.medicationId.message as string}</p>
          )}
        </div>

        {/* CANTIDAD */}
        <div>
          <label className="block text-sm mb-1">Cantidad</label>
          <input
            type="number"
            className="w-full rounded border p-2"
            {...register("qty")}
            min={1}
          />
          {errors.qty && (
            <p className="text-red-600 text-sm">{errors.qty.message}</p>
          )}
        </div>

        {/* BOTONES */}
        <div className="flex gap-2">
          <button
            className="px-4 py-2 rounded bg-blue-600 text-white"
            type="submit"
            disabled={createMut.isPending}
          >
            Crear
          </button>
          <button
            className="px-4 py-2 rounded border"
            type="button"
            onClick={() => nav("/requests")}
          >
            Cancelar
          </button>
        </div>

      </form>
    </section>
  );
}
