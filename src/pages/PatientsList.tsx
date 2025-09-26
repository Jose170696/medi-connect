import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listPatients, deletePatient, type Patient, type Id } from "../api/patients";

export default function PatientsList() {
  const qc = useQueryClient();

  const { data, isLoading, error } = useQuery<Patient[]>({
    queryKey: ["patients"],
    queryFn: listPatients,
  });

  // Acepta Id (number | string)
  const delMut = useMutation<void, Error, Id>({
    mutationFn: (id) => deletePatient(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["patients"] }),
  });

  if (isLoading) return <p>Cargando...</p>;
  if (error) return <p>Error al cargar pacientes</p>;

  const rows = data ?? [];

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">Pacientes</h2>
        <Link to="/patients/new" className="px-3 py-2 rounded bg-blue-600 text-white">
          Nuevo
        </Link>
      </div>

      <div className="overflow-x-auto bg-white rounded-2xl shadow">
        <table className="w-full">
          <thead className="text-left border-b">
            <tr>
              <th className="p-3">Cédula</th>
              <th className="p-3">Nombre</th>
              <th className="p-3">Teléfono</th>
              <th className="p-3">Email</th>
              <th className="p-3 w-40">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={String(p.id)} className="border-b last:border-0">
                <td className="p-3">{p.idNumber}</td>
                <td className="p-3">{p.name}</td>
                <td className="p-3">{p.phone ?? "—"}</td>
                <td className="p-3">{p.email ?? "—"}</td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <Link to={`/patients/${p.id}/edit`} className="px-3 py-1 rounded border">
                      Editar
                    </Link>
                    <button
                      className="px-3 py-1 rounded bg-red-600 text-white"
                      disabled={delMut.isPending}
                      onClick={() => {
                        if (p.id && confirm(`Eliminar a ${p.name}?`)) delMut.mutate(p.id);
                      }}
                    >
                      {delMut.isPending ? "Eliminando..." : "Eliminar"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td className="p-3" colSpan={5}>Sin registros.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
