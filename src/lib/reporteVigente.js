// Un reporte se muestra en las vistas públicas (Buscar, Inicio) solo durante
// sus primeros 3 meses — pasado ese plazo, deja de aparecer ahí (sigue
// existiendo en la base de datos y el dueño lo sigue viendo en su Perfil,
// donde puede editarlo, borrarlo o marcarlo como reunificado).
const TRES_MESES_MS = 90 * 24 * 60 * 60 * 1000;

export function reporteVigente(fechaISO) {
  if (!fechaISO) return true; // sin fecha no se puede evaluar: no se oculta por las dudas
  return Date.now() - new Date(fechaISO).getTime() <= TRES_MESES_MS;
}
