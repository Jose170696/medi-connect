import { useState } from "react";
import { Link, Route, Routes } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import PatientsList from "./pages/PatientsList";
import PatientForm from "./pages/PatientForm";
import MedicationsList from "./pages/MedicationsList";
import MedicationForm from "./pages/MedicationForm";
import RequestsList from "./pages/RequestsList";
import RequestForm from "./pages/RequestForm";
import Reports from "./pages/Reports";
import Login from "./pages/Login";
import PatientRequestsList from "./pages/PatientRequestsList";

import type { Id } from "./api/patients";

type Role = "ADMIN" | "PACIENTE";

export default function App() {
  const [role, setRole] = useState<Role | null>(null);
  const [patientId, setPatientId] = useState<Id | null>(null);

  const handleLogout = () => {
    setRole(null);
    setPatientId(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="px-6 py-4 bg-white shadow-sm flex items-center justify-between">
        <h1 className="text-xl font-bold text-blue-600">MediConnect</h1>

        <nav className="flex items-center gap-4 text-sm">
          {!role && <span className="text-gray-500">Inicia sesión para continuar</span>}

          {role === "ADMIN" && (
            <>
              <Link to="/" className="hover:underline">Dashboard</Link>
              <Link to="/patients" className="hover:underline">Pacientes</Link>
              <Link to="/medications" className="hover:underline">Medicamentos</Link>
              <Link to="/requests" className="hover:underline">Solicitudes</Link>
              <Link to="/reports" className="hover:underline">Reportes</Link>
            </>
          )}

          {role === "PACIENTE" && (
            <>
              <Link to="/requests" className="hover:underline">Mis solicitudes</Link>
              <Link to="/requests/new" className="hover:underline">Nueva solicitud</Link>
            </>
          )}

          {role && (
            <button onClick={handleLogout} className="ml-4 px-3 py-1 rounded border text-xs">
              Cerrar sesión
            </button>
          )}
        </nav>
      </header>

      <main className="p-6">
        <Routes>
          {/* Si NO hay rol → Login */}
          {!role && (
            <Route
              path="*"
              element={
                <Login
                  onLoginAdmin={() => setRole("ADMIN")}
                  onLoginPatient={(id) => {
                    setRole("PACIENTE");
                    setPatientId(id); // id puede ser string o number
                  }}
                />
              }
            />
          )}

          {/* ADMIN */}
          {role === "ADMIN" && (
            <>
              <Route path="/" element={<Dashboard />} />

              <Route path="/patients" element={<PatientsList />} />
              <Route path="/patients/new" element={<PatientForm />} />
              <Route path="/patients/:id/edit" element={<PatientForm />} />

              <Route path="/medications" element={<MedicationsList />} />
              <Route path="/medications/new" element={<MedicationForm />} />
              <Route path="/medications/:id/edit" element={<MedicationForm />} />

              <Route path="/requests" element={<RequestsList />} />
              <Route path="/requests/new" element={<RequestForm />} />

              <Route path="/reports" element={<Reports />} />
            </>
          )}

          {/* PACIENTE */}
          {role === "PACIENTE" && patientId !== null && (
            <>
              <Route path="/" element={<PatientRequestsList patientId={patientId} />} />
              <Route path="/requests" element={<PatientRequestsList patientId={patientId} />} />
              <Route path="/requests/new" element={<RequestForm patientId={patientId} />} />
            </>
          )}
        </Routes>
      </main>
    </div>
  );
}
