import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, type SubmitHandler, type Resolver } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { listPatients, type Patient, type Id } from "../api/patients";
import { listMedications, type Medication } from "../api/medications";
import { createRequest, type Request } from "../api/requests";

type Props = {
  /** Si viene este id, el formulario funciona en modo PACIENTE */
  patientId?: Id;
};

const idSchema = z.union([z.coerce.number().int().positive(), z.string().min(1)]);

const schema = z.object({
  patientId: idSchema,
  medicationId: idSchema,
  qty: z.coerce.number().int().min(1, { message: "Cantidad mínima 1" }),
});

type FormValues = z.infer<typeof schema>;

export default function RequestForm({ patientId }: Props) {
  const nav = useNavigate();
  const qc = useQueryClient();
  const isPatientMode = patientId !== undefined;

  const { data: patients } = useQuery<Patient[]>({
    queryKey: ["patients"],
    queryFn: listPatients,
    enabled: !isPatientMode,
  });

  const { data: meds = [] } = useQuery<Medication[]>({
    queryKey: ["medications"],
    queryFn: listMedications,
  });

  const medsById = useMemo(() => {
    const map = new Map<string, Medication>();
    meds.forEach((m) => map.set(String(m.id), m));
    return map;
  }, [meds]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema) as Resolver<FormValues>,
  });

  // Si estamos en modo paciente, fijamos el patientId en el form
  useEffect(() => {
    if (isPatientMode && patientId != null) {
      setValue("patientId", patientId as any);
    }
  }, [isPatientMode, patientId, setValue]);

  // Validación visual: máximo stock según medicamento elegido
  const selectedMedId = watch("medicationId");
  const selectedMed = selectedMedId ? medsById.get(String(selectedMedId)) : undefined;
  const maxStock = selectedMed?.stock ?? undefined;

  const createMut = useMutation({
    mutationFn: async (vals: FormValues) => {
      const med = medsById.get(String(vals.medicationId));
      if (!med) throw new Error("Medicamento inválido");

      if (vals.qty > med.stock) {
        throw new Error(`Stock insuficiente. Disponible: ${med.stock}`);
      }

      const payload: Request = {
        ...vals,
        status: "CREADA",
        createdAt: new Date().toISOString(),
      };

      return createRequest(payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["requests"] });
      qc.invalidateQueries({ queryKey: ["medications"] });
      nav("/requests");
    },
    onError: (err) => {
      alert(err instanceof Error ? err.message : "No se pudo crear la solicitud");
    },
  });

  const onSubmit: SubmitHandler<FormValues> = (vals) => createMut.mutate(vals);

  return (
    <section className="max-w-xl">
      <h2 className="text-lg font-semibold mb-4">Nueva solicitud</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Paciente (solo admin) */}
        {!isPatientMode && (
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
              <p className="text-red-600 text-sm">
                {String(errors.patientId.message ?? "Selecciona un paciente")}
              </p>
            )}
          </div>
        )}

        <div>
          <label className="block text-sm mb-1">Medicamento</label>
          <select className="w-full rounded border p-2" {...register("medicationId")}>
            <option value="">-- Elige --</option>
            {meds.map((m) => (
              <option key={String(m.id)} value={String(m.id)}>
                {m.code} — {m.name} (stock: {m.stock})
              </option>
            ))}
          </select>
          {errors.medicationId && (
            <p className="text-red-600 text-sm">
              {String(errors.medicationId.message ?? "Selecciona un medicamento")}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm mb-1">Cantidad</label>
          <input
            type="number"
            className="w-full rounded border p-2"
            {...register("qty")}
            min={1}
            max={maxStock}
          />
          {maxStock !== undefined && (
            <p className="text-xs text-gray-500 mt-1">Máximo disponible: {maxStock}</p>
          )}
          {errors.qty && <p className="text-red-600 text-sm">{errors.qty.message}</p>}
        </div>

        <div className="flex gap-2">
          <button
            className="px-4 py-2 rounded bg-blue-600 text-white"
            type="submit"
            disabled={createMut.isPending}
          >
            {createMut.isPending ? "Creando..." : "Crear"}
          </button>
          <button
            type="button"
            onClick={() => nav("/requests")}
            className="px-4 py-2 rounded border"
          >
            Cancelar
          </button>
        </div>
      </form>
    </section>
  );
}
