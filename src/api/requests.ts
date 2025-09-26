import { API } from "./client";
import type { Id } from "./patients";

export type Request = {
  id?: Id;
  patientId: Id;            
  medicationId: Id;
  qty: number;
  status: "CREATED" | "APPROVED" | "PREPARING" | "OUT_FOR_DELIVERY" | "DELIVERED" | "REJECTED";
  createdAt: string;
};

/** GET /requests */
export async function listRequests(): Promise<Request[]> {
  const res = await fetch(`${API}/requests?_sort=id&_order=asc`);
  if (!res.ok) throw new Error("Error fetching requests");
  return res.json();
}

/** POST /requests */
export async function createRequest(data: Request): Promise<Request> {
  const res = await fetch(`${API}/requests`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error creating request");
  return res.json();
}

/** PATCH /requests/:id */
export async function updateRequest(id: Id, partial: Partial<Request>): Promise<Request> {
  const res = await fetch(`${API}/requests/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(partial),
  });
  if (!res.ok) throw new Error("Error updating request");
  return res.json();
}

/** DELETE /requests/:id */
export async function deleteRequest(id: Id): Promise<void> {
  const res = await fetch(`${API}/requests/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Error deleting request");
}
