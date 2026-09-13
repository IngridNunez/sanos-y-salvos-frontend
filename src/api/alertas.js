import { apiFetch } from "./client";

// GET /alertas/zona es de acceso libre para invitados (igual que el listado
// de mascotas) — no hace falta token para esta llamada.
export function listarAlertasPorZona({ lat, lng, radioKm = 3 }) {
  return apiFetch("/alertas/zona", { params: { lat, lng, radioKm } });
}

export function listarAlertas() {
  return apiFetch("/alertas");
}
