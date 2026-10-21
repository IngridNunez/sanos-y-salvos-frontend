import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router";
import { useAuth } from "@/context/AuthContext";
import {
  aprobarMascotaAdmin,
  eliminarMascotaAdmin,
  obtenerMascotas,
  obtenerMascotasAdmin,
  rechazarMascotaAdmin,
} from "@/api/mascotas";
import { StatsBlock } from "@/pages/Home";
import PetsMap from "@/components/map/PetsMap";
import PetLocationMap from "@/components/map/PetLocationMap";

const SECCIONES = [
  { id: "reportes", label: "Reportes", icon: "📋" },
  { id: "resumen", label: "Resumen", icon: "📊" },
  { id: "mapa", label: "Mapa", icon: "🗺️" },
];

const FILTROS = [
  { id: "pendiente", label: "Pendientes", api: "PENDIENTE" },
  { id: "aprobada", label: "Aprobados", api: "APROBADA" },
  { id: "rechazada", label: "Rechazados", api: "RECHAZADA" },
];
const TAMANO_PAGINA = 12;

function fechaVisible(fecha) {
  if (!fecha) return "Fecha no disponible";
  return new Date(fecha).toLocaleDateString("es-CL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function AdminDashboard() {
  const { user, cargandoSesion } = useAuth();
  const [seccion, setSeccion] = useState("reportes");

  // Datos generales (Resumen y Mapa) — mismo origen público que usa Inicio,
  // no la lista de moderación (esa es solo para la sección Reportes).
  const [todasLasMascotas, setTodasLasMascotas] = useState([]);
  const [cargandoGeneral, setCargandoGeneral] = useState(true);

  // Moderación (sección Reportes)
  const [filtro, setFiltro] = useState(FILTROS[0]);
  const [pagina, setPagina] = useState(0);
  const [recarga, setRecarga] = useState(0);
  const [mascotas, setMascotas] = useState([]);
  const [total, setTotal] = useState(0);
  const [paginaCargada, setPaginaCargada] = useState("");
  const [accionId, setAccionId] = useState(null);
  const [error, setError] = useState(null);
  const [expandidoId, setExpandidoId] = useState(null);
  const clavePagina = `${filtro.api}:${pagina}:${recarga}`;
  const cargando = paginaCargada !== clavePagina;

  useEffect(() => {
    obtenerMascotas()
      .then(setTodasLasMascotas)
      .catch(() => setTodasLasMascotas([]))
      .finally(() => setCargandoGeneral(false));
  }, []);

  useEffect(() => {
    let vigente = true;
    obtenerMascotasAdmin(filtro.api, pagina, TAMANO_PAGINA)
      .then((resultado) => {
        if (!vigente) return;
        setMascotas(resultado.content);
        setTotal(resultado.totalElements);
        setError(null);
      })
      .catch((err) => {
        if (vigente) {
          setMascotas([]);
          setTotal(0);
          setError(err.message);
        }
      })
      .finally(() => {
        if (vigente) setPaginaCargada(clavePagina);
      });
    return () => { vigente = false; };
  }, [clavePagina, filtro.api, pagina]);

  const moderar = async (mascota, accion) => {
    if (accion === "rechazar" && !window.confirm(`¿Rechazar el reporte de ${mascota.name}? Seguirá guardado, pero no será visible al público.`)) return;
    if (accion === "eliminar" && !window.confirm(`¿Eliminar definitivamente el reporte de ${mascota.name}? Esta acción no se puede deshacer.`)) return;

    setAccionId(mascota.id);
    setError(null);
    try {
      if (accion === "aprobar") await aprobarMascotaAdmin(mascota.id);
      if (accion === "rechazar") await rechazarMascotaAdmin(mascota.id);
      if (accion === "eliminar") await eliminarMascotaAdmin(mascota.id);
      setRecarga((actual) => actual + 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setAccionId(null);
    }
  };

  if (cargandoSesion) {
    return <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center text-[var(--color-muted)]">Verificando sesión...</div>;
  }
  if (!user) return <Navigate to="/login?redirect=/admin" replace />;

  const totalPaginas = Math.ceil(total / TAMANO_PAGINA);
  const mascotasConMapa = todasLasMascotas.filter((p) => p.lat != null && p.lng != null && p.status !== "reunificada");

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* Panel lateral fijo — mismo patrón que Mi Perfil: no se mueve con el
       * scroll, se apila arriba en celular. Esta página tampoco tiene Footer
       * (se oculta en Root), así que no hay nada que el panel pueda tapar. */}
      <aside className="bg-white lg:fixed lg:left-0 lg:top-16 lg:bottom-0 lg:w-64 lg:overflow-y-auto lg:border-r lg:border-[var(--color-border)] rounded-3xl lg:rounded-none shadow-sm lg:shadow-none mx-4 sm:mx-6 lg:mx-0 mt-8 lg:mt-0 p-5 space-y-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-primary)]">Sanos y Salvos</p>
          <h1 className="font-black text-lg text-[var(--color-text)]">Administración</h1>
        </div>

        <nav className="space-y-1">
          {SECCIONES.map((s) => (
            <button
              key={s.id}
              onClick={() => setSeccion(s.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-colors ${
                seccion === s.id
                  ? "bg-[var(--color-primary)] text-white"
                  : "text-[var(--color-text)] hover:bg-[var(--color-bg)]"
              }`}
            >
              <span className="text-base">{s.icon}</span>
              {s.label}
            </button>
          ))}
        </nav>

        <Link
          to="/"
          className="block px-4 py-2.5 text-sm font-semibold text-[var(--color-muted)] hover:text-[var(--color-primary)] transition-colors"
        >
          ← Volver al sitio
        </Link>
      </aside>

      {/* Contenido */}
      <div className="lg:ml-64 px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-6xl">
          {seccion === "resumen" && (
            cargandoGeneral ? (
              <p className="text-center py-24 text-[var(--color-muted)]">Cargando resumen...</p>
            ) : (
              <div className="-mx-4 sm:-mx-6 lg:-mx-8">
                <StatsBlock pets={todasLasMascotas} />
              </div>
            )
          )}

          {seccion === "mapa" && (
            cargandoGeneral ? (
              <p className="text-center py-24 text-[var(--color-muted)]">Cargando mapa...</p>
            ) : (
              <>
                <h2 className="font-black text-xl text-[var(--color-text)] mb-4">Mapa de reportes</h2>
                <PetsMap pets={mascotasConMapa} />
              </>
            )
          )}

          {seccion === "reportes" && (
            <section className="overflow-hidden rounded-3xl bg-white shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--color-border)] px-5 py-5 sm:px-7">
                <div>
                  <h2 className="text-lg font-black text-[var(--color-text)]">Reportes</h2>
                  <p className="text-sm text-[var(--color-muted)]">{total} {total === 1 ? "reporte" : "reportes"}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setRecarga((actual) => actual + 1)}
                  disabled={cargando}
                  className="rounded-xl border border-[var(--color-border)] px-4 py-2 text-sm font-bold text-[var(--color-primary)] hover:bg-[var(--color-bg)] disabled:opacity-50"
                >
                  Actualizar
                </button>
              </div>

              <div className="flex gap-2 overflow-x-auto border-b border-[var(--color-border)] px-5 sm:px-7" role="tablist" aria-label="Estado de moderación">
                {FILTROS.map((opcion) => (
                  <button
                    key={opcion.id}
                    type="button"
                    role="tab"
                    aria-selected={filtro.id === opcion.id}
                    onClick={() => { setFiltro(opcion); setPagina(0); }}
                    className={`whitespace-nowrap border-b-2 px-3 py-3 text-sm font-bold transition-colors ${
                      filtro.id === opcion.id
                        ? "border-[var(--color-primary)] text-[var(--color-primary)]"
                        : "border-transparent text-[var(--color-muted)] hover:text-[var(--color-text)]"
                    }`}
                  >
                    {opcion.label}
                  </button>
                ))}
              </div>

              {error && (
                <div className="mx-5 mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 sm:mx-7" role="alert">
                  {error}
                </div>
              )}

              {cargando ? (
                <p className="px-6 py-14 text-center text-sm text-[var(--color-muted)]" role="status">Cargando reportes...</p>
              ) : mascotas.length === 0 ? (
                <div className="px-6 py-14 text-center">
                  <p className="mb-2 text-4xl" aria-hidden="true">🐾</p>
                  <h3 className="font-bold text-[var(--color-text)]">No hay reportes {filtro.id === "pendiente" ? "pendientes" : filtro.id === "aprobada" ? "aprobados" : "rechazados"}</h3>
                  <p className="mt-1 text-sm text-[var(--color-muted)]">Cuando haya cambios, aparecerán aquí.</p>
                </div>
              ) : (
                <div className="divide-y divide-[var(--color-border)]">
                  {mascotas.map((mascota) => (
                    <article key={mascota.id} className="grid gap-5 px-5 py-6 sm:grid-cols-[9rem_1fr] sm:px-7">
                      <div>
                        <img
                          src={mascota.photo}
                          alt={`Foto de ${mascota.name}`}
                          className="h-36 w-full rounded-2xl bg-[var(--color-bg)] object-cover sm:h-36"
                          loading="lazy"
                        />
                        <a
                          href={mascota.photo}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-2 block text-center text-xs font-bold text-[var(--color-primary)] hover:underline"
                        >
                          Abrir foto original
                        </a>
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <h3 className="text-lg font-black text-[var(--color-text)]">{mascota.name}</h3>
                            <p className="text-sm text-[var(--color-muted)]">
                              {mascota.species} · {mascota.comuna || "Comuna no indicada"} · {fechaVisible(mascota.fechaISO)}
                            </p>
                          </div>
                          <span className={`rounded-full px-3 py-1 text-xs font-bold ${
                            mascota.moderationStatus === "pendiente"
                              ? "bg-amber-100 text-amber-800"
                              : mascota.moderationStatus === "aprobada"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-700"
                          }`}>
                            {mascota.moderationStatus}
                          </span>
                        </div>
                        <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-[var(--color-text)]">{mascota.description || "Sin descripción."}</p>

                        <button
                          type="button"
                          onClick={() => setExpandidoId(expandidoId === mascota.id ? null : mascota.id)}
                          className="mt-3 text-xs font-bold text-[var(--color-primary)] hover:underline"
                        >
                          {expandidoId === mascota.id ? "Ocultar detalle completo ▲" : "Ver detalle completo ▼"}
                        </button>

                        {expandidoId === mascota.id && (
                          <div className="mt-3 rounded-2xl bg-[var(--color-bg)] p-4 space-y-3">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                              <div>
                                <span className="block text-xs text-[var(--color-muted)]">Raza</span>
                                <span className="font-semibold text-[var(--color-text)]">{mascota.breed || "—"}</span>
                              </div>
                              <div>
                                <span className="block text-xs text-[var(--color-muted)]">Color</span>
                                <span className="font-semibold text-[var(--color-text)]">{mascota.color || "—"}</span>
                              </div>
                              <div>
                                <span className="block text-xs text-[var(--color-muted)]">Patrón</span>
                                <span className="font-semibold text-[var(--color-text)]">{mascota.pattern || "—"}</span>
                              </div>
                              <div>
                                <span className="block text-xs text-[var(--color-muted)]">Tamaño</span>
                                <span className="font-semibold text-[var(--color-text)] capitalize">{mascota.size || "—"}</span>
                              </div>
                            </div>
                            {mascota.sector && (
                              <p className="text-sm">
                                <span className="text-xs text-[var(--color-muted)]">Sector: </span>
                                <span className="font-semibold text-[var(--color-text)]">{mascota.sector}</span>
                              </p>
                            )}
                            {mascota.lat != null && mascota.lng != null ? (
                              <div className="h-40 rounded-2xl overflow-hidden isolate">
                                <PetLocationMap lat={mascota.lat} lng={mascota.lng} status={mascota.status} />
                              </div>
                            ) : (
                              <p className="text-sm text-[var(--color-muted)]">Sin ubicación indicada.</p>
                            )}
                          </div>
                        )}

                        <div className="mt-4 flex flex-wrap gap-2">
                          {mascota.moderationStatus === "aprobada" && (
                            <Link
                              to={`/mascota/${encodeURIComponent(mascota.id)}`}
                              className="rounded-xl border border-[var(--color-border)] px-3 py-2 text-sm font-bold text-[var(--color-text)] hover:bg-[var(--color-bg)]"
                            >
                              Ver reporte público
                            </Link>
                          )}
                          {filtro.id === "pendiente" && (
                            <>
                              <button
                                type="button"
                                disabled={accionId !== null}
                                onClick={() => moderar(mascota, "aprobar")}
                                className="rounded-xl bg-[var(--color-secondary)] px-3 py-2 text-sm font-bold text-white hover:bg-[#7d8d52] disabled:opacity-50"
                              >
                                Aprobar
                              </button>
                              <button
                                type="button"
                                disabled={accionId !== null}
                                onClick={() => moderar(mascota, "rechazar")}
                                className="rounded-xl border border-[var(--color-primary)] px-3 py-2 text-sm font-bold text-[var(--color-primary)] hover:bg-[var(--color-bg)] disabled:opacity-50"
                              >
                                Rechazar
                              </button>
                            </>
                          )}
                          {filtro.id !== "pendiente" && (
                            <button
                              type="button"
                              disabled={accionId !== null}
                              onClick={() => moderar(mascota, "eliminar")}
                              className="rounded-xl border border-red-200 px-3 py-2 text-sm font-bold text-red-700 hover:bg-red-50 disabled:opacity-50"
                            >
                              Eliminar definitivamente
                            </button>
                          )}
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}

              {totalPaginas > 1 && (
                <div className="flex items-center justify-between border-t border-[var(--color-border)] px-5 py-4 sm:px-7">
                  <button
                    type="button"
                    disabled={pagina === 0 || cargando}
                    onClick={() => setPagina((actual) => actual - 1)}
                    className="rounded-xl px-3 py-2 text-sm font-bold text-[var(--color-primary)] disabled:text-[#cbbac0]"
                  >
                    Anterior
                  </button>
                  <span className="text-sm text-[var(--color-muted)]">Página {pagina + 1} de {totalPaginas}</span>
                  <button
                    type="button"
                    disabled={pagina + 1 >= totalPaginas || cargando}
                    onClick={() => setPagina((actual) => actual + 1)}
                    className="rounded-xl px-3 py-2 text-sm font-bold text-[var(--color-primary)] disabled:text-[#cbbac0]"
                  >
                    Siguiente
                  </button>
                </div>
              )}
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
