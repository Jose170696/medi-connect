import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { listPatients, type Id, type Patient } from "../api/patients";
import { listMedications, type Medication } from "../api/medications";
import { listRequests, type Request } from "../api/requests";


// ===== Helpers de ids mixtos (number | string) =====
const eqId = (a?: Id, b?: Id) => String(a) === String(b);
const byId = <T extends { id?: Id }>(list?: T[], id?: Id) =>
  list?.find((x) => eqId(x.id, id));

const nameOf = (id?: Id, list?: { id?: Id; name: string }[]) =>
  byId(list, id)?.name ?? "—";

const codeNameOf = (id?: Id, meds?: Medication[]) => {
  const m = byId(meds, id);
  return m ? `${m.code} — ${m.name}` : "—";
};

// ===== Badge de estado =====
function StatusBadge({ status }: { status: Request["status"] }) {
  const map: Record<Request["status"], string> = {
    CREATED: "bg-gray-100 text-gray-800",
    APPROVED: "bg-blue-100 text-blue-800",
    PREPARING: "bg-yellow-100 text-yellow-800",
    OUT_FOR_DELIVERY: "bg-indigo-100 text-indigo-800",
    DELIVERED: "bg-green-100 text-green-800",
    REJECTED: "bg-red-100 text-red-800",
  };
  return (
    <span className={`px-2 py-1 rounded text-xs ${map[status]}`}>{status}</span>
  );
}

// ===== Card reutilizable =====
function Card({
  title,
  value,
  subtitle,
  icon,
  to,
}: {
  title: string;
  value: React.ReactNode;
  subtitle?: string;
  icon?: React.ReactNode;
  to?: string;
}) {
  const Wrapper = ({ children }: { children: React.ReactNode }) =>
    to ? (
      <Link to={to} className="block focus:outline-none">
        {children}
      </Link>
    ) : (
      <>{children}</>
    );

  return (
    <Wrapper>
      <div className="p-4 bg-white rounded-2xl shadow hover:shadow-md transition-shadow">
        <div className="flex items-start gap-3">
          <div className="shrink-0">{icon}</div>
          <div className="min-w-0">
            <p className="text-sm text-gray-500">{title}</p>
            <p className="text-3xl font-semibold leading-tight">{value}</p>
            {subtitle && <p className="mt-1 text-xs text-gray-500">{subtitle}</p>}
          </div>
        </div>
      </div>
    </Wrapper>
  );
}

export default function Dashboard() {
  // Datos
  const { data: patients } = useQuery<Patient[]>({
    queryKey: ["patients"],
    queryFn: listPatients,
  });

  const { data: meds } = useQuery<Medication[]>({
    queryKey: ["medications"],
    queryFn: listMedications,
  });

  const { data: reqs } = useQuery<Request[]>({
    queryKey: ["requests"],
    queryFn: listRequests,
  });

  // KPIs
  const totalPatients = patients?.length ?? 0;
  const totalStock = (meds ?? []).reduce((sum, m) => sum + (m.stock ?? 0), 0);
  const totalRequests = reqs?.length ?? 0;

  // Últimas solicitudes (5)
  const recents = (reqs ?? [])
    .slice()
    .sort(
      (a, b) =>
        new Date(b.createdAt).valueOf() - new Date(a.createdAt).valueOf()
    )
    .slice(0, 5);

  return (
    <section className="space-y-6">
      {/* Header + acciones rápidas */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Dashboard</h2>
        <div className="flex gap-3">
          <Link to="/patients" className="px-3 py-2 rounded border">
            Pacientes
          </Link>
          <Link to="/medications" className="px-3 py-2 rounded border">
            Medicamentos
          </Link>
          <Link to="/requests" className="px-3 py-2 rounded border">
            Solicitudes
          </Link>
          <Link
            to="/requests/new"
            className="px-4 py-2 rounded bg-blue-600 text-white"
          >
            Nueva solicitud
          </Link>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card
          to="/patients"
          title="Pacientes"
          value={totalPatients}
          subtitle="Registrados en el sistema"
          icon={
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              {/* user-group icon */}
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3Zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3Zm0 2c-2.33 0-7 1.17-7 3.5V19h10v-2.5C11 14.17 6.33 13 4 13Zm12 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.95 1.97 3.45V19h5v-2.5C22 14.17 18.33 13 16 13Z"/>
              </svg>
            </div>
          }
        />
        <Card
          to="/medications"
          title="Stock total"
          value={totalStock}
          subtitle="Unidades disponibles"
          icon={
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              {/* pills icon */}
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 3a5 5 0 0 0-5 5c0 1.33.52 2.55 1.46 3.46l8.08 8.08A4.99 4.99 0 1 0 19 11a5 5 0 0 0-5-5H8Zm7 2a3 3 0 0 1 0 6h-2V5h2ZM6.46 7.46A3 3 0 0 1 8 7h2v6H8a3 3 0 0 1-2.12-5.12l.58-.42Z"/>
              </svg>
            </div>
          }
        />
        <Card
          to="/requests"
          title="Solicitudes"
          value={totalRequests}
          subtitle="Totales"
          icon={
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              {/* inbox icon */}
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 3H5a2 2 0 0 0-2 2v12a4 4 0 0 0 4 4h10a4 4 0 0 0 4-4V5a2 2 0 0 0-2-2Zm0 12h-3.38a2 2 0 0 0-1.79 1.11l-.28.56a1 1 0 0 1-.9.56h-1.3a1 1 0 0 1-.9-.56l-.28-.56A2 2 0 0 0 8.38 15H5V5h14v10Z"/>
              </svg>
            </div>
          }
        />
      </div>

      {/* Recientes */}
      <div className="bg-white rounded-2xl shadow">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-medium">Solicitudes recientes</h3>
          <Link to="/requests" className="text-sm text-blue-600">
            Ver todas
          </Link>
        </div>

        <div className="overflow-x-auto">
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
              {recents.map((r) => (
                <tr key={r.id} className="border-b last:border-0">
                  <td className="p-3">{nameOf(r.patientId, patients)}</td>
                  <td className="p-3">{codeNameOf(r.medicationId, meds)}</td>
                  <td className="p-3">{r.qty}</td>
                  <td className="p-3">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="p-3">
                    {new Date(r.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
              {recents.length === 0 && (
                <tr>
                  <td className="p-3" colSpan={5}>
                    Sin registros.
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