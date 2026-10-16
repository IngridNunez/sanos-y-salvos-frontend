/* Pide la ubicación real del navegador (dispara el permiso nativo del
 * navegador, el mismo que usa cualquier sitio para "usar tu ubicación") —
 * solo se debe llamar como reacción a un clic del usuario, nunca al cargar
 * la página, para no spamear el permiso sin que la persona lo pida. */
export function solicitarUbicacionActual() {
  return new Promise((resolve, reject) => {
    if (!("geolocation" in navigator)) {
      reject(new Error("Tu navegador no admite geolocalización."));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (posicion) => resolve({ lat: posicion.coords.latitude, lng: posicion.coords.longitude }),
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
