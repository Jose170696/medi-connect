import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { listPatients, type Patient, type Id } from "../api/patients";

type LoginProps = {
  onLoginAdmin: () => void;
  onLoginPatient: (patientId: Id) => void;
};

// Credenciales SIMPLES para el admin (solo uso académico)
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "admin123";

export default function Login({ onLoginAdmin, onLoginPatient }: LoginProps) {
  const { data: patients = [], isLoading, error } = useQuery<Patient[]>({
    queryKey: ["patients"],
    queryFn: listPatients,
  });

  const [selectedPatientId, setSelectedPatientId] = useState<string>("");

  const [adminUser, setAdminUser] = useState("");
  const [adminPass, setAdminPass] = useState("");
  const [adminError, setAdminError] = useState<string | null>(null);

  const handleAdminLogin = () => {
    if (adminUser === ADMIN_USERNAME && adminPass === ADMIN_PASSWORD) {
      setAdminError(null);
      onLoginAdmin();
    } else {
      setAdminError("Usuario o contraseña incorrectos");
    }
  };

  const handlePatientLogin = () => {
    if (!selectedPatientId) return;

    // Guardamos el id tal cual (string) como Id
    onLoginPatient(selectedPatientId);
  };

  return (
    <section className="max-w-3xl mx-auto mt-10 space-y-8">
      <h2 className="text-2xl font-semibold text-center mb-4">Iniciar sesión</h2>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Card ADMIN */}
        <div className="p-6 bg-white rounded-2xl shadow">
          <h3 className="text-lg font-medium mb-2">Administrador</h3>
          <p className="text-sm text-gray-600 mb-4">
            Acceso completo al sistema: gestión de pacientes, medicamentos, solicitudes y reportes.
          </p>

          <div className="space-y-3 mb-3">
            <div>
              <label className="block text-sm mb-1">Usuario</label>
              <input
                className="w-full rounded border p-2 text-sm"
                value={adminUser}
                onChange={(e) => setAdminUser(e.target.value)}
                placeholder="admin"
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Contraseña</label>
              <input
                type="password"
                className="w-full rounded border p-2 text-sm"
                value={adminPass}
                onChange={(e) => setAdminPass(e.target.value)}
                placeholder="admin123"
              />
            </div>

            {adminError && <p className="text-xs text-red-600">{adminError}</p>}
          </div>

          <button
            onClick={handleAdminLogin}
            className="px-4 py-2 rounded bg-blue-600 text-white text-sm"
          >
            Entrar como administrador
          </button>
        </div>

        {/* Card PACIENTE */}
        <div className="p-6 bg-white rounded-2xl shadow">
          <h3 className="text-lg font-medium mb-2">Paciente</h3>
          <p className="text-sm text-gray-600 mb-4">
            Acceso limitado para crear y consultar sus propias solicitudes de medicamentos.
          </p>

          {isLoading && <p className="text-sm text-gray-500">Cargando pacientes...</p>}
          {error && (
            <p className="text-sm text-red-600">
              Error al cargar pacientes. Verifique el servidor.
            </p>
          )}

          {!isLoading && !error && (
            <>
              <label className="block text-sm mb-1">Selecciona tu nombre</label>
              <select
                className="w-full rounded border p-2 mb-3"
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
              >
                <option value="">-- Elige un paciente --</option>
                {patients.map((p) => (
                  <option key={String(p.id)} value={String(p.id)}>
                    {p.name} (Cédula: {p.idNumber})
                  </option>
                ))}
              </select>

              <button
                onClick={handlePatientLogin}
                disabled={!selectedPatientId}
                className="px-4 py-2 rounded bg-emerald-600 text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Entrar como paciente
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
