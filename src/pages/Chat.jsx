import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { abrirCanalChat, obtenerConversaciones, obtenerMensajes } from "@/api/chat";
import { useAuth } from "@/context/AuthContext";

const MAX_LARGO = 1000; /* igual que chat.max-largo-mensaje en ms-chat */

const AVISO_ESTADO = {
  conectando: "Conectando…",
  reconectando: "Reconectando…",
  sin_sesion: "Tu sesión expiró. Vuelve a iniciar sesión para chatear.",
  no_disponible: "El chat no está disponible por ahora.",
};

function hora(iso) {
  return new Date(iso).toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" });
}

function fechaCorta(iso) {
  return new Date(iso).toLocaleDateString("es-CL", { day: "numeric", month: "short" });
}

export default function Chat() {
  const { user, cargandoSesion } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const seleccionadaId = searchParams.get("c");

  const [conversaciones, setConversaciones] = useState([]);
  const [cargandoLista, setCargandoLista] = useState(true);
  const [errorLista, setErrorLista] = useState(null);
  const [mensajesPorConv, setMensajesPorConv] = useState({});
  const [errorHistorial, setErrorHistorial] = useState(null);
  const [estado, setEstado] = useState("conectando");
  const [borrador, setBorrador] = useState("");
  const [errorEnvio, setErrorEnvio] = useState(null);

  const canalRef = useRef(null);
  const conversacionesRef = useRef([]);
  const finHilo = useRef(null);

  useEffect(() => {
    conversacionesRef.current = conversaciones;
  }, [conversaciones]);

  const cargarConversaciones = useCallback(() => {
    return obtenerConversaciones()
      .then((lista) => {
        setConversaciones(lista);
        setErrorLista(null);
      })
      .catch((err) => setErrorLista(err.message))
      .finally(() => setCargandoLista(false));
  }, []);

  /* sin sesión no hay chat: se manda a iniciar sesión y se vuelve acá */
  useEffect(() => {
    if (!cargandoSesion && !user) navigate("/login?redirect=/chat", { replace: true });
  }, [cargandoSesion, user, navigate]);

  useEffect(() => {
    if (!user) return;
    cargarConversaciones();
  }, [user, cargarConversaciones]);

  /* canal en tiempo real: uno por página, no por conversación */
  useEffect(() => {
    if (!user) return;
    const canal = abrirCanalChat({
      onEstado: setEstado,
      onError: setErrorEnvio,
      onMensaje: (mensaje) => {
        setMensajesPorConv((previos) => {
          const actuales = previos[mensaje.conversacionId];
          /* si esa conversación aún no se cargó, el historial ya traerá este mensaje */
          if (!actuales || actuales.some((m) => m.id === mensaje.id)) return previos;
          return { ...previos, [mensaje.conversacionId]: [...actuales, mensaje] };
        });
        if (conversacionesRef.current.some((c) => c.id === mensaje.conversacionId)) {
          setConversaciones((previas) =>
            previas
              .map((c) => (c.id === mensaje.conversacionId ? { ...c, ultimoMensajeEn: mensaje.enviadoEn } : c))
              .sort((a, b) => new Date(b.ultimoMensajeEn) - new Date(a.ultimoMensajeEn)),
          );
        } else {
          /* alguien abrió una conversación nueva contigo: hay que traerla */
          cargarConversaciones();
        }
      },
    });
    canalRef.current = canal;
    return () => {
      canal.cerrar();
      canalRef.current = null;
    };
  }, [user, cargarConversaciones]);

  /* historial de la conversación abierta (solo la primera vez que se abre) */
  const yaCargada = seleccionadaId ? mensajesPorConv[seleccionadaId] !== undefined : true;
  useEffect(() => {
    if (!user || !seleccionadaId || yaCargada) return;
    let cancelado = false;
    obtenerMensajes(seleccionadaId, { limite: 100 })
      .then((lista) => {
        if (cancelado) return;
        setErrorHistorial(null);
        setMensajesPorConv((previos) => {
          /* un mensaje en vivo pudo llegar mientras cargaba: se conserva sin duplicar */
          const vivos = (previos[seleccionadaId] ?? []).filter((m) => !lista.some((h) => h.id === m.id));
          return { ...previos, [seleccionadaId]: [...lista, ...vivos] };
        });
      })
      .catch((err) => {
        if (!cancelado) setErrorHistorial(err.message);
      });
    return () => {
      cancelado = true;
    };
  }, [user, seleccionadaId, yaCargada]);

  const mensajes = seleccionadaId ? mensajesPorConv[seleccionadaId] : undefined;
  useEffect(() => {
    finHilo.current?.scrollIntoView({ block: "end" });
  }, [mensajes]);

  const seleccionada = conversaciones.find((c) => c.id === seleccionadaId) ?? null;

  const abrirConversacion = (id) => {
    setErrorEnvio(null);
    setErrorHistorial(null);
    setBorrador("");
    setSearchParams({ c: id });
  };

  const enviar = (evento) => {
    evento.preventDefault();
    const texto = borrador.trim();
    if (!texto || !seleccionadaId) return;
    setErrorEnvio(null);
    if (canalRef.current?.enviar(seleccionadaId, texto)) {
      setBorrador("");
    } else {
      setErrorEnvio("Sin conexión con el chat. Se está reintentando; prueba de nuevo en un momento.");
    }
  };

  const alPresionarTecla = (evento) => {
    if (evento.key === "Enter" && !evento.shiftKey) enviar(evento);
  };

  if (cargandoSesion || !user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-[var(--color-muted)]">Cargando...</p>
      </div>
    );
  }

  const avisoEstado = AVISO_ESTADO[estado];
  const listaVisible = !seleccionadaId ? "block" : "hidden md:block";
  const hiloVisible = seleccionadaId ? "flex" : "hidden md:flex";

  return (
    <div className="bg-[var(--color-bg)] py-6 min-h-[calc(100vh-4rem)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-4">
          <h1 className="font-black text-2xl text-[var(--color-text)]">💬 Mis mensajes</h1>
          <p className="text-xs text-[var(--color-muted)]">
            Conversa con quien reportó (o con quien te escribió por) una mascota, sin compartir tu correo ni tu
            teléfono. Por tu privacidad, los mensajes se eliminan automáticamente con el tiempo.
          </p>
        </div>

        {avisoEstado && (
          <div className="mb-4 rounded-2xl border border-amber-300 bg-amber-50 text-amber-800 text-sm font-semibold px-4 py-2.5">
            {avisoEstado}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[70vh]">
          {/* Lista de conversaciones */}
          <aside className={`${listaVisible} md:col-span-1 bg-white rounded-3xl shadow-sm overflow-y-auto`}>
            {cargandoLista ? (
              <p className="p-6 text-sm text-[var(--color-muted)]">Cargando conversaciones…</p>
            ) : errorLista ? (
              <p className="p-6 text-sm text-[var(--color-primary)]">{errorLista}</p>
            ) : conversaciones.length === 0 ? (
              <div className="p-6 text-center">
                <div className="text-4xl mb-2">🐾</div>
                <p className="text-sm text-[var(--color-muted)] mb-3">
                  Aún no tienes conversaciones. Abre el reporte de una mascota y pulsa “Chatear”.
                </p>
                <Link to="/buscar" className="text-sm font-bold text-[var(--color-primary)] hover:underline">
                  Ver mascotas →
                </Link>
              </div>
            ) : (
              <ul>
                {conversaciones.map((c) => (
                  <li key={c.id}>
                    <button
                      onClick={() => abrirConversacion(c.id)}
                      className={`w-full text-left px-5 py-4 border-b border-[var(--color-border)] transition-colors hover:bg-[var(--color-bg)] ${
                        c.id === seleccionadaId ? "bg-[var(--color-bg)]" : ""
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-sm text-[var(--color-text)] truncate">
                          {c.mascotaNombre}
                        </span>
                        <span className="text-[11px] text-[var(--color-muted)] shrink-0">
                          {fechaCorta(c.ultimoMensajeEn)}
                        </span>
                      </div>
                      <span className="text-xs text-[var(--color-muted)]">
                        {c.esDueno ? "Alguien escribió por tu reporte" : "Escribiste a quien lo reportó"}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </aside>

          {/* Hilo */}
          <section className={`${hiloVisible} md:col-span-2 bg-white rounded-3xl shadow-sm flex-col overflow-hidden`}>
            {!seleccionadaId ? (
              <div className="flex-1 flex items-center justify-center text-sm text-[var(--color-muted)]">
                Elige una conversación para ver los mensajes.
              </div>
            ) : (
              <>
                <header className="flex items-center gap-3 px-5 py-3 border-b border-[var(--color-border)]">
                  <button
                    onClick={() => setSearchParams({})}
                    className="md:hidden text-[var(--color-primary)] font-bold"
                    aria-label="Volver a mis conversaciones"
                  >
                    ←
                  </button>
                  <div className="min-w-0">
                    <div className="font-bold text-[var(--color-text)] truncate">
                      {seleccionada?.mascotaNombre ?? "Conversación"}
                    </div>
                    {seleccionada && (
                      <Link
                        to={`/mascota/${seleccionada.mascotaId}`}
                        className="text-xs text-[var(--color-primary)] hover:underline"
                      >
                        Ver reporte
                      </Link>
                    )}
                  </div>
                </header>

                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-2">
                  {errorHistorial ? (
                    <p className="text-sm text-[var(--color-primary)]">{errorHistorial}</p>
                  ) : mensajes === undefined ? (
                    <p className="text-sm text-[var(--color-muted)]">Cargando mensajes…</p>
                  ) : mensajes.length === 0 ? (
                    <p className="text-sm text-[var(--color-muted)] text-center mt-6">
                      Escribe el primer mensaje. 👋
                    </p>
                  ) : (
                    mensajes.map((m) => (
                      <div key={m.id} className={`flex ${m.mio ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm whitespace-pre-wrap break-words ${
                            m.mio
                              ? "bg-[var(--color-primary)] text-white rounded-br-md"
                              : "bg-[var(--color-bg)] text-[var(--color-text)] rounded-bl-md"
                          }`}
                        >
                          {/* texto plano: React lo escapa, nunca se interpreta como HTML */}
                          {m.texto}
                          <div className={`text-[10px] mt-1 ${m.mio ? "text-white/70" : "text-[var(--color-muted)]"}`}>
                            {hora(m.enviadoEn)}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={finHilo} />
                </div>

                <form onSubmit={enviar} className="border-t border-[var(--color-border)] p-3">
                  {errorEnvio && <p className="text-xs text-[var(--color-primary)] mb-2">{errorEnvio}</p>}
                  <div className="flex items-end gap-2">
                    <textarea
                      value={borrador}
                      onChange={(e) => setBorrador(e.target.value)}
                      onKeyDown={alPresionarTecla}
                      maxLength={MAX_LARGO}
                      rows={2}
                      placeholder="Escribe un mensaje… (Enter envía, Shift+Enter salto de línea)"
                      className="flex-1 resize-none rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-2.5 text-sm text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)]"
                    />
                    <button
                      type="submit"
                      disabled={!borrador.trim() || estado !== "conectado"}
                      className="px-5 py-3 bg-[var(--color-primary)] text-white text-sm font-bold rounded-2xl hover:bg-[var(--color-primary-dark)] transition-colors disabled:opacity-50"
                    >
                      Enviar
                    </button>
                  </div>
                  <div className="text-[10px] text-[var(--color-muted)] text-right mt-1">
                    {borrador.length}/{MAX_LARGO}
                  </div>
                </form>
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
