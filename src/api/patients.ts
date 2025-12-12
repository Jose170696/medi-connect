import { API } from "./client";

export type Id = number | string;

export type Patient = {
  id?: Id;

  // Datos personales
  idNumber: string;
  name: string;
  birthDate: string;       // YYYY-MM-DD
  phone?: string;
  email?: string;
  address?: string;

  // Datos médicos esenciales
  bloodType?: string;          // O+, O-, A+, A-, etc.
  allergies?: string;          // Ej: "Penicilina"
  chronicConditions?: string;  // Ej: "Diabetes, Hipertensión"
};

/** GET /patients */
export async function listPatients(): Promise<Patient[]> {
  const res = await fetch(`${API}/patients`);
  if (!res.ok) throw new Error("Error fetching patients");
  return res.json();
}

/** GET /patients/:id */
export async function getPatient(id: Id): Promise<Patient> {
  const res = await fetch(`${API}/patients/${id}`);
  if (!res.ok) throw new Error("Patient not found");
  return res.json();
}

/** POST /patients */
export async function createPatient(data: Omit<Patient, "id">): Promise<Patient> {
  const res = await fetch(`${API}/patients`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error creating patient");
  return res.json();
}

/** PATCH /patients/:id */
export async function updatePatient(id: Id, partial: Partial<Patient>): Promise<Patient> {
  const res = await fetch(`${API}/patients/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(partial),
  });
  if (!res.ok) throw new Error("Error updating patient");
  return res.json();
}

/** DELETE /patients/:id */
export async function deletePatient(id: Id): Promise<void> {
  const res = await fetch(`${API}/patients/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Error deleting patient");
}
