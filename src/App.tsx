import { Link, Route, Routes } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import PatientsList from "./pages/PatientsList";
import PatientForm from "./pages/PatientForm";
import MedicationsList from "./pages/MedicationsList";
import MedicationForm from "./pages/MedicationForm";
import RequestsList from "./pages/RequestsList";
import RequestForm from "./pages/RequestForm";
import Reports from "./pages/Reports";

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="px-6 py-4 bg-white shadow-sm flex items-center justify-between">
        <h1 className="text-xl font-bold text-blue-600">MediConnect</h1>
        <nav className="space-x-4">
          <Link to="/" className="hover:underline">Dashboard</Link>
          <Link to="/patients" className="hover:underline">Pacientes</Link>
          <Link to="/medications" className="hover:underline">Medicamentos</Link>
          <Link to="/requests" className="hover:underline">Solicitudes</Link>
          <Link to="/reports" className="hover:underline">Reportes</Link> 
        </nav>
      </header>

      <main className="p-6">
        <Routes>
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
        </Routes>
      </main>
    </div>
  );
}
