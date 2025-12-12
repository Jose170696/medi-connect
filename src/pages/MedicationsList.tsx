import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listMedications, deleteMedication, type Medication } from "../api/medications";
import type { Id } from "../api/patients";

export default function MedicationsList() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [onlyAvailable, setOnlyAvailable] = useState(false);

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

  // --------- Filtros: búsqueda + solo con stock ---------
  const searchLower = search.toLowerCase();

  const filtered = rows.filter((m) => {
    const matchesSearch =
      m.code.toLowerCase().includes(searchLower) ||
      m.name.toLowerCase().includes(searchLower);

    const matchesStock = !onlyAvailable || m.stock > 0;

    return matchesSearch && matchesStock;
  });

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">Medicamentos</h2>
        <Link to="/medications/new" className="px-3 py-2 rounded bg-blue-600 text-white">
          Nuevo
        </Link>
      </div>

      {/* Barra de búsqueda y filtro */}
      <div className="flex flex-wrap items-center gap-3 mb-3">
        <input
          type="text"
          className="rounded border p-2 flex-1 min-w-[200px]"
          placeholder="Buscar por código o nombre..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <label className="inline-flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            className="rounded border"
            checked={onlyAvailable}
            onChange={(e) => setOnlyAvailable(e.target.checked)}
          />
          Mostrar solo con stock disponible
        </label>
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
            {filtered.map((m) => (
              <tr key={String(m.id)} className="border-b last:border-0">
                <td className="p-3">{m.code}</td>
                <td className="p-3">{m.name}</td>
                <td className="p-3">{m.stock}</td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <Link
                      to={`/medications/${m.id}/edit`}
                      className="px-3 py-1 rounded border"
                    >
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
            {filtered.length === 0 && (
              <tr>
                <td className="p-3" colSpan={4}>
                  No se encontraron medicamentos con esos criterios.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
