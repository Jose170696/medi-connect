import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listMedications, deleteMedication, type Medication } from "../api/medications";
import type { Id } from "../api/patients";

export default function MedicationsList() {
  const qc = useQueryClient();

  const { data, isLoading, error } = useQuery<Medication[]>({
    queryKey: ["medications"],
    queryFn: listMedications,
  });

  // Acepta Id (number | string)
  const delMut = useMutation<void, Error, Id>({
    mutationFn: (id) => deleteMedication(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["medications"] }),
  });

  if (isLoading) return <p>Cargando...</p>;
  if (error) return <p>Error al cargar medicamentos</p>;

  const rows = data ?? [];

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">Medicamentos</h2>
        <Link to="/medications/new" className="px-3 py-2 rounded bg-blue-600 text-white">
          Nuevo
        </Link>
      </div>

      <div className="overflow-x-auto bg-white rounded-2xl shadow">
        <table className="w-full">
          <thead className="text-left border-b">
            <tr>
              <th className="p-3">Código</th>
              <th className="p-3">Nombre</th>
              <th className="p-3">Stock</th>
              <th className="p-3 w-40">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((m) => (
              <tr key={String(m.id)} className="border-b last:border-0">
                <td className="p-3">{m.code}</td>
                <td className="p-3">{m.name}</td>
                <td className="p-3">{m.stock}</td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <Link to={`/medications/${m.id}/edit`} className="px-3 py-1 rounded border">
                      Editar
                    </Link>
                    <button
                      className="px-3 py-1 rounded bg-red-600 text-white"
                      disabled={delMut.isPending}
                      onClick={() => {
                        if (m.id && confirm(`Eliminar ${m.name}?`)) delMut.mutate(m.id);
                      }}
                    >
                      {delMut.isPending ? "Eliminando..." : "Eliminar"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td className="p-3" colSpan={4}>Sin registros.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
