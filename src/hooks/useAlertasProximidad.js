import { useCallback, useEffect, useRef, useState } from "react";
import { obtenerAlertasPorZona } from "@/api/alertas";
import { distanciaKm } from "@/lib/distancia";
import { redondear } from "@/lib/geolocation";
import { notificarProximidad, solicitarPermisoNotificaciones } from "@/lib/notificaciones";

// Radio amplio de búsqueda al servidor (trae todas las alertas activas
// "cerca" de la ciudad); el filtro real de "¿estoy dentro?" se hace después,
// comparando contra el radioKm propio de cada alerta — no contra este valor.
const RADIO_BUSQUEDA_KM = 20;

// Cada cuánto se revisa la última posición conocida contra las alertas
// activas. No se revisa en cada tick del GPS (watchPosition puede disparar
// muy seguido) para no spamear al backend ni a la persona.
const INTERVALO_REVISION_MS = 30000;

/* Mientras está activo, avisa con una notificación del navegador al entrar a
 * la zona de una alerta activa. Solo funciona con la pestaña abierta (no hay
 * push en 2do plano todavía — ver notificaciones.js). */
export function useAlertasProximidad() {
  const [activo, setActivo] = useState(false);
  const [error, setError] = useState(null);

  const watchIdRef = useRef(null);
  const timerRef = useRef(null);
  const ultimaPosicionRef = useRef(null);
  const dentroRef = useRef(new Set());

  const revisarZonas = useCallback(async () => {
    const posicion = ultimaPosicionRef.current;
    if (!posicion) return;
    try {
      const alertas = await obtenerAlertasPorZona(posicion.lat, posicion.lng, RADIO_BUSQUEDA_KM);
      const idsDentroAhora = new Set();
      for (const alerta of alertas) {
        const distancia = distanciaKm(posicion.lat, posicion.lng, alerta.latitudCentro, alerta.longitudCentro);
        if (distancia > alerta.radioKm) continue;
        idsDentroAhora.add(alerta.id);
        if (!dentroRef.current.has(alerta.id)) {
          notificarProximidad(alerta);
        }
      }
      dentroRef.current = idsDentroAhora;
    } catch {
      // un fallo puntual de red no debería apagar el seguimiento — se
      // reintenta solo en la próxima revisión
    }
  }, []);

  const desactivar = useCallback(() => {
    if (watchIdRef.current != null) navigator.geolocation.clearWatch(watchIdRef.current);
    if (timerRef.current != null) clearInterval(timerRef.current);
    watchIdRef.current = null;
    timerRef.current = null;
    ultimaPosicionRef.current = null;
    dentroRef.current = new Set();
    setActivo(false);
  }, []);

  const activar = useCallback(async () => {
    setError(null);

    if (!("geolocation" in navigator)) {
      setError("Tu navegador no admite geolocalización.");
      return;
    }

    const permisoOk = await solicitarPermisoNotificaciones();
    if (!permisoOk) {
      setError("Debes permitir las notificaciones del navegador para avisarte cuando estés cerca de una alerta.");
      return;
    }

    let primeraPosicion = true;

    watchIdRef.current = navigator.geolocation.watchPosition(
      (posicion) => {
        ultimaPosicionRef.current = {
          lat: redondear(posicion.coords.latitude),
          lng: redondear(posicion.coords.longitude),
        };
        if (primeraPosicion) {
          primeraPosicion = false;
          revisarZonas();
        }
      },
      () => setError("No pudimos acceder a tu ubicación. Revisa el permiso de ubicación del navegador."),
      { enableHighAccuracy: false, maximumAge: 60000, timeout: 20000 },
    );

    timerRef.current = setInterval(revisarZonas, INTERVALO_REVISION_MS);
    setActivo(true);
  }, [revisarZonas]);

  // si la persona cierra o navega fuera, se corta el seguimiento igual
  useEffect(() => () => desactivar(), [desactivar]);

  return { activo, error, activar, desactivar };
}
