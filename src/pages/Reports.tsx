import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { listMedications, type Medication } from "../api/medications";
import { listPatients, type Patient, type Id } from "../api/patients";
import { listRequests, type Request } from "../api/requests";

// Helpers para ids mixtos
const eqId = (a?: Id, b?: Id) => String(a) === String(b);
const byId = <T extends { id?: Id }>(list?: T[], id?: Id) =>
  list?.find((x) => eqId(x.id, id));

const patientNameOf = (id?: Id, patients?: Patient[]) =>
  byId(patients, id)?.name ?? "—";

const medLabelOf = (id?: Id, meds?: Medication[]) => {
  const m = byId(meds, id);
  return m ? `${m.code} — ${m.name}` : "—";
};

// ===== Utilidad para descargar CSV =====
function downloadCSV(filename: string, rows: string[][]) {
  const csvContent = rows.map((r) =>
    r.map((cell) => {
      // escapamos comillas y separamos con ;
      const v = String(cell ?? "");
      const safe = v.replace(/"/g, '""');
      return `"${safe}"`;
    }).join(";")
  ).join("\r\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function Reports() {
  const { data: meds = [] } = useQuery<Medication[]>({
    queryKey: ["medications"],
    queryFn: listMedications,
  });

  const { data: patients = [] } = useQuery<Patient[]>({
    queryKey: ["patients"],
    queryFn: listPatients,
  });

  const { data: reqs = [] } = useQuery<Request[]>({
    queryKey: ["requests"],
    queryFn: listRequests,
  });

  const totalStock = meds.reduce((sum, m) => sum + (m.stock ?? 0), 0);

  const delivered = reqs
    .filter((r) => r.status === "ENTREGADA")
    .slice()
    .sort(
      (a, b) =>
        new Date(b.createdAt).valueOf() - new Date(a.createdAt).valueOf()
    );

  // ==== EXPORTADORES ====
  const exportInventario = () => {
    const rows: string[][] = [
      ["Código", "Nombre", "Stock"],
      ...meds.map((m) => [m.code, m.name, String(m.stock)]),
      [],
      ["Stock total", "", String(totalStock)],
    ];
    downloadCSV("reporte_inventario.csv", rows);
  };

  const exportEntregas = () => {
    const rows: string[][] = [
      ["Paciente", "Medicamento", "Cantidad", "Fecha entrega"],
      ...delivered.map((r) => [
        patientNameOf(r.patientId, patients),
        medLabelOf(r.medicationId, meds),
        String(r.qty),
        new Date(r.createdAt).toLocaleString(),
      ]),
    ];
    downloadCSV("reporte_entregas.csv", rows);
  };

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Reportes</h2>
        <div className="flex gap-3 text-sm">
          <Link to="/medications" className="px-3 py-2 rounded border">
            Ir a medicamentos
          </Link>
          <Link to="/requests" className="px-3 py-2 rounded border">
            Ir a solicitudes
          </Link>
        </div>
      </div>

      {/* ==== REPORTE DE INVENTARIO ==== */}
      <div className="bg-white rounded-2xl shadow">
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h3 className="font-medium">Inventario de medicamentos</h3>
            <p className="text-xs text-gray-500">
              Resumen de códigos, nombres y unidades disponibles.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <p className="text-sm text-gray-600">
              Stock total:{" "}
              <span className="font-semibold">{totalStock}</span> unidades
            </p>
            <button
              onClick={exportInventario}
              className="px-3 py-2 text-xs rounded bg-blue-600 text-white"
            >
              Exportar inventario (CSV)
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="text-left border-b">
              <tr>
                <th className="p-3">Codigo</th>
                <th className="p-3">Nombre</th>
                <th className="p-3">Stock</th>
              </tr>
            </thead>
            <tbody>
              {meds.map((m) => (
                <tr key={String(m.id)} className="border-b last:border-0">
                  <td className="p-3">{m.code}</td>
                  <td className="p-3">{m.name}</td>
                  <td className="p-3">{m.stock}</td>
                </tr>
              ))}
              {meds.length === 0 && (
                <tr>
                  <td className="p-3" colSpan={3}>
                    Sin registros de medicamentos.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ==== REPORTE DE ENTREGAS ==== */}
      <div className="bg-white rounded-2xl shadow">
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h3 className="font-medium">Reporte de entregas</h3>
            <p className="text-xs text-gray-500">
              Solicitudes marcadas como <strong>"ENTREGADA"</strong>.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <p className="text-sm text-gray-600">
              Total entregas:{" "}
              <span className="font-semibold">{delivered.length}</span>
            </p>
            <button
              onClick={exportEntregas}
              className="px-3 py-2 text-xs rounded bg-emerald-600 text-white"
            >
              Exportar entregas (CSV)
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="text-left border-b">
              <tr>
                <th className="p-3">Paciente</th>
                <th className="p-3">Medicamento</th>
                <th className="p-3">Cantidad</th>
                <th className="p-3">Fecha entrega</th>
              </tr>
            </thead>
            <tbody>
              {delivered.map((r) => (
                <tr key={String(r.id)} className="border-b last:border-0">
                  <td className="p-3">
                    {patientNameOf(r.patientId, patients)}
                  </td>
                  <td className="p-3">
                    {medLabelOf(r.medicationId, meds)}
                  </td>
                  <td className="p-3">{r.qty}</td>
                  <td className="p-3">
                    {new Date(r.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
              {delivered.length === 0 && (
                <tr>
                  <td className="p-3" colSpan={4}>
                    No hay entregas registradas aún.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
