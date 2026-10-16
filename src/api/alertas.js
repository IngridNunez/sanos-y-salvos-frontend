const API_URL = import.meta.env.VITE_API_URL ?? "";

/* GET /alertas/zona ya filtra por distancia real (Haversine) en ms-alertas;
 * devuelve las alertas activas dentro del radio, cada una con el mascotaId
 * que originó la alerta — acá solo se usa para saber qué mascotas están
 * cerca del punto entregado. */
export async function obtenerAlertasPorZona(lat, lng, radioKm) {
  const params = new URLSearchParams({ lat, lng, radioKm });
  const response = await fetch(`${API_URL}/api/v1/alertas/zona?${params}`);
  if (!response.ok) {
    throw new Error(`Error al obtener alertas por zona: ${response.status}`);
  }
  return response.json();
}
