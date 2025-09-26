import { API } from "./client";
import type { Id } from "./patients";

export type Medication = {
  id?: Id;
  code: string;
  name: string;
  stock: number;
};

/** GET /medications */
export async function listMedications(): Promise<Medication[]> {
  const res = await fetch(`${API}/medications`);
  if (!res.ok) throw new Error("Error fetching medications");
  return res.json();
}

/** GET /medications/:id */
export async function getMedication(id: Id): Promise<Medication> {
  const res = await fetch(`${API}/medications/${id}`);
  if (!res.ok) throw new Error("Medication not found");
  return res.json();
}

/** POST /medications */
export async function createMedication(data: Omit<Medication, "id">): Promise<Medication> {
  const res = await fetch(`${API}/medications`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error creating medication");
  return res.json();
}

/** PATCH /medications/:id */
export async function updateMedication(id: Id, partial: Partial<Medication>): Promise<Medication> {
  const res = await fetch(`${API}/medications/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(partial),
  });
  if (!res.ok) throw new Error("Error updating medication");
  return res.json();
}

/** DELETE /medications/:id */
export async function deleteMedication(id: Id): Promise<void> {
  const res = await fetch(`${API}/medications/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Error deleting medication");
}
