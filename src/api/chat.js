const API_URL = import.meta.env.VITE_API_URL ?? ""; /* vacío en producción: /api va por el rewrite del mismo dominio */

const HEADERS_JSON = { "Content-Type": "application/json", "X-Requested-With": "web" };

async function leerError(response, porDefecto) {
  if (response.status === 401) return "Tu sesión expiró. Vuelve a iniciar sesión.";
  if (response.status === 404) return "Esta conversación o reporte ya no está disponible.";
  if (response.status === 503) return "El chat no está disponible por ahora. Intenta más tarde.";
  const detalle = await response.json().catch(() => null);
  return detalle?.mensaje ?? detalle?.message ?? `${porDefecto} (${response.status}).`;
}

/* inicia (o recupera) la conversación con quien reportó la mascota */
export async function iniciarConversacion(mascotaId) {
  const response = await fetch(`${API_URL}/api/v1/chat/conversaciones`, {
    method: "POST",
    credentials: "include",
    headers: HEADERS_JSON,
    body: JSON.stringify({ mascotaId }),
  });
  if (!response.ok) throw new Error(await leerError(response, "No se pudo iniciar el chat"));
  return response.json();
}

export async function obtenerConversaciones() {
  const response = await fetch(`${API_URL}/api/v1/chat/conversaciones`, { credentials: "include" });
  if (!response.ok) throw new Error(await leerError(response, "No se pudieron cargar tus conversaciones"));
  return response.json();
}

/* historial en orden cronológico; "antes" (ISO) pagina hacia atrás */
export async function obtenerMensajes(conversacionId, { antes, limite = 50 } = {}) {
  const params = new URLSearchParams({ limite: String(limite) });
  if (antes) params.set("antes", antes);
  const response = await fetch(
    `${API_URL}/api/v1/chat/conversaciones/${encodeURIComponent(conversacionId)}/mensajes?${params}`,
    { credentials: "include" },
  );
  if (!response.ok) throw new Error(await leerError(response, "No se pudo cargar el historial"));
  return response.json();
}

/* el WebSocket no puede mandar la cookie de sesión (va directo a ms-chat, otro origen):
 * el bff entrega un ticket de ~30 s y de un solo uso que sí viaja en la URL */
async function pedirTicket() {
  const response = await fetch(`${API_URL}/api/v1/chat/ticket`, {
    method: "POST",
    credentials: "include",
    headers: { "X-Requested-With": "web" },
  });
  if (!response.ok) {
    const error = new Error(await leerError(response, "No se pudo abrir el chat"));
    error.status = response.status;
    throw error;
  }
  return response.json();
}

const ESPERA_MAXIMA_MS = 15000;

/**
 * Abre el canal en tiempo real y lo mantiene vivo: si se corta, vuelve a conectar pidiendo un
 * ticket nuevo (el anterior ya se consumió) con espera creciente.
 *
 * onEstado: "conectando" | "conectado" | "reconectando" | "sin_sesion" | "no_disponible"
 * onMensaje(mensaje) llega para los mensajes propios y ajenos; onError(texto) para rechazos del servidor.
 * Devuelve { enviar(conversacionId, texto) -> boolean, cerrar() }.
 */
export function abrirCanalChat({ onMensaje, onEstado, onError }) {
  let socket = null;
  let cerrado = false;
  let intentos = 0;
  let temporizador = null;
  let latido = null;

  const programarReconexion = () => {
    if (cerrado) return;
    onEstado("reconectando");
    const espera = Math.min(1000 * 2 ** intentos, ESPERA_MAXIMA_MS);
    intentos += 1;
    temporizador = setTimeout(conectar, espera);
  };

  async function conectar() {
    if (cerrado) return;
    try {
      const { ticket, wsUrl } = await pedirTicket();
      if (cerrado) return;
      const url = new URL(wsUrl, window.location.href);
      url.searchParams.set("ticket", ticket);
      socket = new WebSocket(url);
    } catch (error) {
      if (error.status === 401) onEstado("sin_sesion");
      else if (error.status === 503) onEstado("no_disponible");
      else programarReconexion();
      return;
    }

    socket.onopen = () => {
      intentos = 0;
      onEstado("conectado");
      /* un ping cada 25 s evita que proxies/balanceadores cierren el canal por inactividad */
      latido = setInterval(() => {
        if (socket?.readyState === WebSocket.OPEN) socket.send(JSON.stringify({ tipo: "ping" }));
      }, 25000);
    };

    socket.onmessage = (evento) => {
      let datos;
      try {
        datos = JSON.parse(evento.data);
      } catch {
        return;
      }
      if (datos.tipo === "mensaje" && datos.mensaje) onMensaje(datos.mensaje);
      else if (datos.tipo === "error") onError?.(datos.mensaje ?? "El servidor rechazó la solicitud.");
    };

    socket.onclose = () => {
      clearInterval(latido);
      socket = null;
      programarReconexion();
    };
  }

  onEstado("conectando");
  conectar();

  return {
    enviar(conversacionId, texto) {
      if (socket?.readyState !== WebSocket.OPEN) return false;
      socket.send(JSON.stringify({ tipo: "mensaje", conversacionId, texto }));
      return true;
    },
    cerrar() {
      cerrado = true;
      clearTimeout(temporizador);
      clearInterval(latido);
      socket?.close();
    },
  };
}
