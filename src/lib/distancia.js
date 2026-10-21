// Fórmula de Haversine — misma idea que ya usa ms-alertas en SQL, pero acá
// en el cliente, para saber si la posición actual cayó dentro del radio de
// una alerta en particular (no solo "está dentro del radio de búsqueda").
const RADIO_TIERRA_KM = 6371;

export function distanciaKm(lat1, lng1, lat2, lng2) {
  const radianes = (grados) => (grados * Math.PI) / 180;
  const dLat = radianes(lat2 - lat1);
  const dLng = radianes(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(radianes(lat1)) * Math.cos(radianes(lat2)) * Math.sin(dLng / 2) ** 2;
  return RADIO_TIERRA_KM * 2 * Math.asin(Math.sqrt(a));
}
