import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createPatient,
  getPatient,
  updatePatient,
  type Patient,
} from "../api/patients";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const schema = z.object({
  idNumber: z.string().min(5, "Cédula muy corta"),
  name: z.string().min(2, "Nombre requerido"),
  birthDate: z.string().min(1, "Fecha de nacimiento requerida"),
  phone: z.string().optional(),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  address: z.string().optional(),

  bloodType: z.string().optional(),
  allergies: z.string().optional(),
  chronicConditions: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function PatientForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const nav = useNavigate();
  const qc = useQueryClient();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const { data } = useQuery({
    queryKey: ["patient", id],
    queryFn: () => getPatient(Number(id)),
    enabled: isEdit,
  });

  useEffect(() => {
    if (data) {
      setValue("idNumber", data.idNumber);
      setValue("name", data.name);
      setValue("birthDate", data.birthDate ?? "");
      setValue("phone", data.phone ?? "");
      setValue("email", data.email ?? "");
      setValue("address", data.address ?? "");
      setValue("bloodType", data.bloodType ?? "");
      setValue("allergies", data.allergies ?? "");
      setValue("chronicConditions", data.chronicConditions ?? "");
    }
  }, [data, setValue]);

  const createMut = useMutation({
    mutationFn: (vals: FormValues) => createPatient(vals as Patient),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["patients"] });
      nav("/patients");
    },
  });

  const updateMut = useMutation({
    mutationFn: (vals: FormValues) => updatePatient(Number(id), vals as Patient),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["patients"] });
      nav("/patients");
    },
  });

  const onSubmit = (vals: FormValues) =>
    isEdit ? updateMut.mutate(vals) : createMut.mutate(vals);

  return (
    <section className="max-w-xl">
      <h2 className="text-lg font-semibold mb-4">
        {isEdit ? "Editar paciente" : "Nuevo paciente"}
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Datos personales */}
        <div>
          <label className="block text-sm mb-1">Cédula</label>
          <input
            className="w-full rounded border p-2"
            {...register("idNumber")}
          />
          {errors.idNumber && (
            <p className="text-red-600 text-sm">{errors.idNumber.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm mb-1">Nombre</label>
          <input className="w-full rounded border p-2" {...register("name")} />
          {errors.name && (
            <p className="text-red-600 text-sm">{errors.name.message}</p>
          )}
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">Fecha de nacimiento</label>
            <input
              type="date"
              className="w-full rounded border p-2"
              {...register("birthDate")}
            />
            {errors.birthDate && (
              <p className="text-red-600 text-sm">
                {errors.birthDate.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm mb-1">Teléfono</label>
            <input
              className="w-full rounded border p-2"
              {...register("phone")}
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input
              className="w-full rounded border p-2"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-red-600 text-sm">{errors.email.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm mb-1">Dirección</label>
            <input
              className="w-full rounded border p-2"
              {...register("address")}
            />
          </div>
        </div>

        {/* Datos médicos */}
        <fieldset className="border rounded p-3 space-y-3">
          <legend className="text-sm font-semibold px-1">
            Información médica
          </legend>

          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm mb-1">Tipo de sangre</label>
              <input
                className="w-full rounded border p-2"
                placeholder="O+, A-, etc."
                {...register("bloodType")}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm mb-1">Alergias</label>
              <input
                className="w-full rounded border p-2"
                placeholder="Ej: Penicilina"
                {...register("allergies")}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm mb-1">
              Enfermedades crónicas
            </label>
            <textarea
              className="w-full rounded border p-2"
              rows={2}
              placeholder="Ej: Diabetes, hipertensión"
              {...register("chronicConditions")}
            />
          </div>
        </fieldset>

        <div className="flex gap-2">
          <button
            type="submit"
            className="px-4 py-2 rounded bg-blue-600 text-white"
          >
            {isEdit ? "Guardar cambios" : "Crear"}
          </button>
          <button
            type="button"
            onClick={() => nav("/patients")}
            className="px-4 py-2 rounded border"
          >
            Cancelar
          </button>
        </div>
      </form>
    </section>
  );
}
