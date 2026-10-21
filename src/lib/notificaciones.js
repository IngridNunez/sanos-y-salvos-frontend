// Notificaciones del navegador (Notification API) — solo funcionan mientras
// la pestaña sigue abierta (sin Service Worker no hay push en 2do plano).
// Eso es intencional por ahora: ver zz-documentacion-md para la versión con
// push real, que queda pendiente para después.
const SOPORTADO = typeof window !== "undefined" && "Notification" in window;

export function soportaNotificaciones() {
  return SOPORTADO;
}

export function permisoNotificaciones() {
  return SOPORTADO ? Notification.permission : "denied";
}

export async function solicitarPermisoNotificaciones() {
  if (!SOPORTADO) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  const resultado = await Notification.requestPermission();
  return resultado === "granted";
}

/* "tag" evita que la misma alerta mande varias notificaciones apiladas si
 * por algo se vuelve a disparar la revisión antes de que la persona la lea. */
export function notificarProximidad(alerta) {
  if (!SOPORTADO || Notification.permission !== "granted") return;

  const notificacion = new Notification("Hay una mascota perdida cerca de ti 🐾", {
    body: "Alguien reportó una mascota extraviada dentro de tu zona. Toca para ver el detalle.",
    tag: `alerta-proximidad-${alerta.id}`,
  });

  notificacion.onclick = () => {
    window.focus();
    window.location.href = `/mascota/${alerta.mascotaId}`;
    notificacion.close();
  };
}
