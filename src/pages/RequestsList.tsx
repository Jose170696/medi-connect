import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  listRequests,
  type Request,
  updateRequest,
  deleteRequest,
} from "../api/requests";
import { listPatients, type Patient } from "../api/patients";
import {
  getMedication,
  listMedications,
  updateMedication,
  type Medication,
} from "../api/medications";
import { Link } from "react-router-dom";

// Badge por estado (clases Tailwind)
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

// Etiqueta amigable para mostrar
const statusLabel: Record<Request["status"], string> = {
  CREADA: "Creada",
  APROBADA: "Aprobada",
  PREPARANDO: "Preparando",
  ENVIANDO: "Enviando",
  ENTREGADA: "Entregada",
  RECHAZADA: "Rechazada",
};

// Flujo de cambios de estado permitidos
const nextOptions: Record<Request["status"], Request["status"][]> = {
  CREADA: ["APROBADA", "RECHAZADA"],
  APROBADA: ["PREPARANDO", "RECHAZADA"],
  PREPARANDO: ["ENVIANDO", "RECHAZADA"],
  ENVIANDO: ["ENTREGADA", "RECHAZADA"],
  ENTREGADA: [],
  RECHAZADA: [],
};

export default function RequestsList() {
  const qc = useQueryClient();

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

  // Buscar nombre del paciente
  const nameOf = (id: number | string | undefined) =>
    patients.find((p) => String(p.id) === String(id))?.name ?? "—";

  // Etiqueta del medicamento
  const medLabel = (id: number | string | undefined) => {
    const m = meds.find((x) => String(x.id) === String(id));
    return m ? `${m.code} — ${m.name}` : "—";
  };

  const mutateStatus = useMutation({
    mutationFn: async ({ req, to }: { req: Request; to: Request["status"] }) => {
      // CREADA -> APROBADA: descontar stock
      if (req.status === "CREADA" && to === "APROBADA") {
        const med = await getMedication(req.medicationId);
        if (med.stock < req.qty) throw new Error("Stock insuficiente");
        await updateMedication(med.id!, { ...med, stock: med.stock - req.qty });
      }

      // Si se rechaza luego de haber descontado stock (APROBADA/PREPARANDO/ENVIANDO)
      if (
        ["APROBADA", "PREPARANDO", "ENVIANDO"].includes(req.status) &&
        to === "RECHAZADA"
      ) {
        const med = await getMedication(req.medicationId);
        await updateMedication(med.id!, { ...med, stock: med.stock + req.qty });
      }

      await updateRequest(req.id!, { status: to });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["requests"] });
      qc.invalidateQueries({ queryKey: ["medications"] });
    },
  });

  const mutateDelete = useMutation({
    mutationFn: async (req: Request) => {
      // Si se elimina sin estar entregada/rechazada, revisar si hay que devolver stock
      if (!["ENTREGADA", "RECHAZADA"].includes(req.status)) {
        const med = await getMedication(req.medicationId);

        // Solo se había descontado stock si estaba en estos estados
        if (["APROBADA", "PREPARANDO", "ENVIANDO"].includes(req.status)) {
          await updateMedication(med.id!, { ...med, stock: med.stock + req.qty });
        }
      }

      await deleteRequest(req.id!);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["requests"] });
      qc.invalidateQueries({ queryKey: ["medications"] });
    },
  });

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">Solicitudes</h2>
        <Link
          to="/requests/new"
          className="px-3 py-2 rounded bg-blue-600 text-white"
        >
          Nueva
        </Link>
      </div>

      <div className="overflow-x-auto bg-white rounded-2xl shadow">
        <table className="w-full">
          <thead className="text-left border-b">
            <tr>
              <th className="p-3">Paciente</th>
              <th className="p-3">Medicamento</th>
              <th className="p-3">Cantidad</th>
              <th className="p-3">Estado</th>
              <th className="p-3 w-80">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((r) => (
              <tr key={String(r.id)} className="border-b last:border-0">
                <td className="p-3">{nameOf(r.patientId)}</td>
                <td className="p-3">{medLabel(r.medicationId)}</td>
                <td className="p-3">{r.qty}</td>
                <td className="p-3">
                  <span className={badge(r.status)}>
                    {statusLabel[r.status]}
                  </span>
                </td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-2">
                    {nextOptions[r.status].map((to) => (
                      <button
                        key={to}
                        className="px-3 py-1 rounded border"
                        onClick={() => mutateStatus.mutate({ req: r, to })}
                      >
                        {statusLabel[to]}
                      </button>
                    ))}
                    <button
                      className="px-3 py-1 rounded bg-red-600 text-white"
                      onClick={() => {
                        if (confirm("¿Eliminar solicitud?")) {
                          mutateDelete.mutate(r);
                        }
                      }}
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {requests.length === 0 && (
              <tr>
                <td className="p-3" colSpan={5}>
                  Sin registros.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
