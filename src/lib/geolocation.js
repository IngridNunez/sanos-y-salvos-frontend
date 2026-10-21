// ~1.1 km de resolución en esta latitud — mismo redondeo que ya usa
// ms-mascotas para la ubicación pública de las mascotas.
const DECIMALES_UBICACION_APROXIMADA = 2;

export function redondear(valor) {
  const factor = 10 ** DECIMALES_UBICACION_APROXIMADA;
  return Math.round(valor * factor) / factor;
}

/* Pide la ubicación real del navegador (dispara el permiso nativo del
 * navegador, el mismo que usa cualquier sitio para "usar tu ubicación") —
 * solo se debe llamar como reacción a un clic del usuario, nunca al cargar
 * la página, para no spamear el permiso sin que la persona lo pida.
 *
 * Sin redondear a propósito: a diferencia de la ubicación de un reporte
 * (que se guarda y cualquiera la ve), esta coordenada es la del usuario
 * buscando "cerca de mí" — nunca se guarda, solo se usa al vuelo para
 * calcular distancia contra las alertas activas. Redondearla acá no
 * protege a nadie, solo haría que el punto en el mapa no coincida con
 * dónde está la persona de verdad. */
export function solicitarUbicacionActual() {
  return new Promise((resolve, reject) => {
    if (!("geolocation" in navigator)) {
      reject(new Error("Tu navegador no admite geolocalización."));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (posicion) =>
        resolve({
          lat: posicion.coords.latitude,
          lng: posicion.coords.longitude,
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
