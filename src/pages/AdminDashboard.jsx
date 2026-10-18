import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router";
import { useAuth } from "@/context/AuthContext";
import {
  aprobarMascotaAdmin,
  eliminarMascotaAdmin,
  obtenerMascotasAdmin,
  rechazarMascotaAdmin,
} from "@/api/mascotas";

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
  const [filtro, setFiltro] = useState(FILTROS[0]);
  const [pagina, setPagina] = useState(0);
  const [recarga, setRecarga] = useState(0);
  const [mascotas, setMascotas] = useState([]);
  const [total, setTotal] = useState(0);
  const [paginaCargada, setPaginaCargada] = useState("");
  const [accionId, setAccionId] = useState(null);
  const [error, setError] = useState(null);
  const clavePagina = `${filtro.api}:${pagina}:${recarga}`;
  const cargando = paginaCargada !== clavePagina;

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
    return <div className="min-h-screen bg-[#FFECF2] flex items-center justify-center text-[#8a7a80]">Verificando sesión...</div>;
  }
  if (!user) return <Navigate to="/login?redirect=/admin" replace />;

  const totalPaginas = Math.ceil(total / TAMANO_PAGINA);

  return (
    <div className="min-h-screen bg-[#FFECF2] py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="mb-7">
          <p className="mb-1 text-sm font-bold uppercase tracking-wider text-[#C46081]">Sanos y Salvos</p>
          <h1 className="text-3xl font-black text-[#2B2B2B]">Panel de administración</h1>
          <p className="mt-1 text-[#8a7a80]">Revisa los reportes antes de que aparezcan en la comunidad.</p>
        </header>

        <section className="overflow-hidden rounded-3xl bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#f0d5df] px-5 py-5 sm:px-7">
            <div>
              <h2 className="text-lg font-black text-[#2B2B2B]">Reportes</h2>
              <p className="text-sm text-[#8a7a80]">{total} {total === 1 ? "reporte" : "reportes"}</p>
            </div>
            <button
              type="button"
              onClick={() => setRecarga((actual) => actual + 1)}
              disabled={cargando}
              className="rounded-xl border border-[#f0d5df] px-4 py-2 text-sm font-bold text-[#C46081] hover:bg-[#FFECF2] disabled:opacity-50"
            >
              Actualizar
            </button>
          </div>

          <div className="flex gap-2 overflow-x-auto border-b border-[#f0d5df] px-5 sm:px-7" role="tablist" aria-label="Estado de moderación">
            {FILTROS.map((opcion) => (
              <button
                key={opcion.id}
                type="button"
                role="tab"
                aria-selected={filtro.id === opcion.id}
                onClick={() => { setFiltro(opcion); setPagina(0); }}
                className={`whitespace-nowrap border-b-2 px-3 py-3 text-sm font-bold transition-colors ${
                  filtro.id === opcion.id
                    ? "border-[#C46081] text-[#C46081]"
                    : "border-transparent text-[#8a7a80] hover:text-[#2B2B2B]"
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
            <p className="px-6 py-14 text-center text-sm text-[#8a7a80]" role="status">Cargando reportes...</p>
          ) : mascotas.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <p className="mb-2 text-4xl" aria-hidden="true">🐾</p>
              <h3 className="font-bold text-[#2B2B2B]">No hay reportes {filtro.id === "pendiente" ? "pendientes" : filtro.id === "aprobada" ? "aprobados" : "rechazados"}</h3>
              <p className="mt-1 text-sm text-[#8a7a80]">Cuando haya cambios, aparecerán aquí.</p>
            </div>
          ) : (
            <div className="divide-y divide-[#f0d5df]">
              {mascotas.map((mascota) => (
                <article key={mascota.id} className="grid gap-5 px-5 py-6 sm:grid-cols-[9rem_1fr] sm:px-7">
                  <div>
                    <img
                      src={mascota.photo}
                      alt={`Foto de ${mascota.name}`}
                      className="h-36 w-full rounded-2xl bg-[#FFECF2] object-cover sm:h-36"
                      loading="lazy"
                    />
                    <a
                      href={mascota.photo}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 block text-center text-xs font-bold text-[#C46081] hover:underline"
                    >
                      Abrir foto original
                    </a>
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <h3 className="text-lg font-black text-[#2B2B2B]">{mascota.name}</h3>
                        <p className="text-sm text-[#8a7a80]">
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
                    <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-[#51474b]">{mascota.description || "Sin descripción."}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {mascota.moderationStatus === "aprobada" && (
                        <Link
                          to={`/mascota/${encodeURIComponent(mascota.id)}`}
                          className="rounded-xl border border-[#f0d5df] px-3 py-2 text-sm font-bold text-[#2B2B2B] hover:bg-[#FFECF2]"
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
                            className="rounded-xl bg-[#99A966] px-3 py-2 text-sm font-bold text-white hover:bg-[#7d8d52] disabled:opacity-50"
                          >
                            Aprobar
                          </button>
                          <button
                            type="button"
                            disabled={accionId !== null}
                            onClick={() => moderar(mascota, "rechazar")}
                            className="rounded-xl border border-[#C46081] px-3 py-2 text-sm font-bold text-[#C46081] hover:bg-[#FFECF2] disabled:opacity-50"
                          >
                            Rechazar
                          </button>
                        </>
                      )}
                      <button
                        type="button"
                        disabled={accionId !== null}
                        onClick={() => moderar(mascota, "eliminar")}
                        className="rounded-xl border border-red-200 px-3 py-2 text-sm font-bold text-red-700 hover:bg-red-50 disabled:opacity-50"
                      >
                        Eliminar definitivamente
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          {totalPaginas > 1 && (
            <div className="flex items-center justify-between border-t border-[#f0d5df] px-5 py-4 sm:px-7">
              <button
                type="button"
                disabled={pagina === 0 || cargando}
                onClick={() => setPagina((actual) => actual - 1)}
                className="rounded-xl px-3 py-2 text-sm font-bold text-[#C46081] disabled:text-[#cbbac0]"
              >
                Anterior
              </button>
              <span className="text-sm text-[#8a7a80]">Página {pagina + 1} de {totalPaginas}</span>
              <button
                type="button"
                disabled={pagina + 1 >= totalPaginas || cargando}
                onClick={() => setPagina((actual) => actual + 1)}
                className="rounded-xl px-3 py-2 text-sm font-bold text-[#C46081] disabled:text-[#cbbac0]"
              >
                Siguiente
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
