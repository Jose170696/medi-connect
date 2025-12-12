import { useQuery } from "@tanstack/react-query";
import { listRequests, type Request } from "../api/requests";
import { listPatients, type Patient, type Id } from "../api/patients"; 
import { listMedications, type Medication } from "../api/medications";

const badge = (s: Request["status"]) => {
  const map: Record<Request["status"], string> = {
    CREADA: "bg-gray-100 text-gray-800",
    APROBADA: "bg-blue-100 text-blue-800",
    PREPARANDO: "bg-yellow-100 text-yellow-800",
    ENVIANDO: "bg-indigo-100 text-indigo-800",
    ENTREGADA: "bg-green-100 text-green-800",
    RECHAZADA: "bg-red-100 text-red-800",
  };
  return `px-2 py-1 rounded text-xs ${map[s]}`;
};

const statusLabel: Record<Request["status"], string> = {
  CREADA: "Creada",
  APROBADA: "Aprobada",
  PREPARANDO: "Preparando",
  ENVIANDO: "Enviando",
  ENTREGADA: "Entregada",
  RECHAZADA: "Rechazada",
};

type Props = {
  patientId: Id; // ✅ antes era number
};

export default function PatientRequestsList({ patientId }: Props) {
  const { data: requests = [] } = useQuery<Request[]>({
    queryKey: ["requests"],
    queryFn: listRequests,
  });

  const { data: patients = [] } = useQuery<Patient[]>({
    queryKey: ["patients"],
    queryFn: listPatients,
  });

  const { data: meds = [] } = useQuery<Medication[]>({
    queryKey: ["medications"],
    queryFn: listMedications,
  });

  // SOLO solicitudes del paciente logueado
  const myRequests = requests.filter(
    (r) => String(r.patientId) === String(patientId)
  );

  const nameOf = (id: Id | undefined) =>
    patients.find((p) => String(p.id) === String(id))?.name ?? "—";

  const medLabel = (id: Id | undefined) => {
    const m = meds.find((x) => String(x.id) === String(id));
    return m ? `${m.code} — ${m.name}` : "—";
  };

  return (
    <section>
      <h2 className="text-lg font-semibold mb-3">Mis solicitudes</h2>

      <div className="overflow-x-auto bg-white rounded-2xl shadow">
        <table className="w-full">
          <thead className="text-left border-b">
            <tr>
              <th className="p-3">Paciente</th>
              <th className="p-3">Medicamento</th>
              <th className="p-3">Cantidad</th>
              <th className="p-3">Estado</th>
              <th className="p-3">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {myRequests.map((r) => (
              <tr key={String(r.id)} className="border-b last:border-0">
                <td className="p-3">{nameOf(r.patientId)}</td>
                <td className="p-3">{medLabel(r.medicationId)}</td>
                <td className="p-3">{r.qty}</td>
                <td className="p-3">
                  <span className={badge(r.status)}>{statusLabel[r.status]}</span>
                </td>
                <td className="p-3">{new Date(r.createdAt).toLocaleString()}</td>
              </tr>
            ))}

            {myRequests.length === 0 && (
              <tr>
                <td className="p-3" colSpan={5}>
                  No tienes solicitudes registradas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
