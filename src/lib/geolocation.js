// ~1.1 km de resolución en esta latitud — mismo redondeo que ya usa
// ms-mascotas para la ubicación pública de las mascotas.
const DECIMALES_UBICACION_APROXIMADA = 2;

function redondear(valor) {
  const factor = 10 ** DECIMALES_UBICACION_APROXIMADA;
  return Math.round(valor * factor) / factor;
}

/* Pide la ubicación real del navegador (dispara el permiso nativo del
 * navegador, el mismo que usa cualquier sitio para "usar tu ubicación") —
 * solo se debe llamar como reacción a un clic del usuario, nunca al cargar
 * la página, para no spamear el permiso sin que la persona lo pida.
 *
 * Android/iOS dejan elegir "ubicación aproximada" o "precisa" en el propio
 * diálogo de permiso — eso lo decide el sistema operativo, la página no
 * puede ocultar esa opción. Para que de igual cuál elija la persona, acá
 * se redondea la coordenada apenas llega, antes de usarla para nada. */
export function solicitarUbicacionActual() {
  return new Promise((resolve, reject) => {
    if (!("geolocation" in navigator)) {
      reject(new Error("Tu navegador no admite geolocalización."));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (posicion) =>
        resolve({
          lat: redondear(posicion.coords.latitude),
          lng: redondear(posicion.coords.longitude),
        }),
      (error) => reject(mapearErrorGeolocalizacion(error)),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 5 * 60 * 1000 },
    );
  });
}

function mapearErrorGeolocalizacion(error) {
  if (error.code === error.PERMISSION_DENIED) {
    return new Error("Debes permitir el acceso a tu ubicación para ver qué está pasando cerca de ti.");
  }
  if (error.code === error.TIMEOUT) {
    return new Error("No pudimos obtener tu ubicación a tiempo. Intenta de nuevo.");
  }
  return new Error("No pudimos obtener tu ubicación.");
}
