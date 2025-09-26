import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createMedication,
  getMedication,
  updateMedication,
  type Medication,
} from "../api/medications";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const schema = z.object({
  code: z.string().min(2, "Código requerido"),
  name: z.string().min(2, "Nombre requerido"),
  stock: z.number().min(0, "Stock no puede ser negativo").int("Debe ser entero"),
});
type FormValues = z.infer<typeof schema>;

export default function MedicationForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const nav = useNavigate();
  const qc = useQueryClient();

  const { register, handleSubmit, setValue, formState: { errors } } =
    useForm<FormValues>({ resolver: zodResolver(schema) });

  const { data } = useQuery({
    queryKey: ["medication", id],
    queryFn: () => getMedication(Number(id)),
    enabled: isEdit,
  });

  useEffect(() => {
    if (data) {
      setValue("code", data.code);
      setValue("name", data.name);
      setValue("stock", data.stock);
    }
  }, [data, setValue]);

  const createMut = useMutation({
    mutationFn: (vals: FormValues) => createMedication(vals as Medication),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["medications"] }); nav("/medications"); },
  });

  const updateMut = useMutation({
    mutationFn: (vals: FormValues) => updateMedication(Number(id), vals as Medication),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["medications"] }); nav("/medications"); },
  });

  const onSubmit = (vals: FormValues) => isEdit ? updateMut.mutate(vals) : createMut.mutate(vals);

  return (
    <section className="max-w-xl">
      <h2 className="text-lg font-semibold mb-4">
        {isEdit ? "Editar medicamento" : "Nuevo medicamento"}
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Código</label>
          <input className="w-full rounded border p-2" {...register("code")} />
          {errors.code && <p className="text-red-600 text-sm">{errors.code.message}</p>}
        </div>

        <div>
          <label className="block text-sm mb-1">Nombre</label>
          <input className="w-full rounded border p-2" {...register("name")} />
          {errors.name && <p className="text-red-600 text-sm">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-sm mb-1">Stock</label>
          <input
            type="number"
            className="w-full rounded border p-2"
            {...register("stock", { valueAsNumber: true })}
          />
          {errors.stock && <p className="text-red-600 text-sm">{errors.stock.message}</p>}
        </div>

        <div className="flex gap-2">
          <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white">
            {isEdit ? "Guardar cambios" : "Crear"}
          </button>
          <button type="button" onClick={() => nav("/medications")} className="px-4 py-2 rounded border">
            Cancelar
          </button>
        </div>
      </form>
    </section>
  );
}
