import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router";
import { COMUNAS } from "@/data/pets";
import { obtenerMascotas } from "@/api/mascotas";
import { obtenerAlertasPorZona } from "@/api/alertas";
import { solicitarUbicacionActual } from "@/lib/geolocation";
import PetCard from "@/components/PetCard";
import StatusBadge from "@/components/StatusBadge";
import PetsMap from "@/components/map/PetsMap";

const PAGE_SIZE = 6;
const RADIO_CERCA_DE_MI_KM = 3;

export default function Listing() {
  const [searchParams, setSearchParams] = useSearchParams();

  const initStatus = searchParams.get("status") || "";
  const initComuna = searchParams.get("comuna") || "";
  const initSpecies = searchParams.get("species") || "";

  const [filterStatus, setFilterStatus] = useState(initStatus);
  const [filterComuna, setFilterComuna] = useState(initComuna);
  const [filterSpecies, setFilterSpecies] = useState(initSpecies);
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [page, setPage] = useState(1);

  /* al navegar entre links del menú (?status=extraviada → ?status=encontrada) React
   * reutiliza esta página sin volver a montarla: se vuelven a leer los filtros de la URL */
  const paramsKey = searchParams.toString();
  const [prevParamsKey, setPrevParamsKey] = useState(paramsKey);
  if (paramsKey !== prevParamsKey) {
    setPrevParamsKey(paramsKey);
    setFilterStatus(searchParams.get("status") || "");
    setFilterComuna(searchParams.get("comuna") || "");
    setFilterSpecies(searchParams.get("species") || "");
    setPage(1);
  }

  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [userLocation, setUserLocation] = useState(null);
  const [idsMascotasCercanas, setIdsMascotasCercanas] = useState(null);
  const [buscandoCercania, setBuscandoCercania] = useState(false);
  const [errorCercania, setErrorCercania] = useState(null);

  useEffect(() => {
    obtenerMascotas()
      .then(setPets)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const buscarCercaDeMi = async () => {
    setErrorCercania(null);
    setBuscandoCercania(true);
    try {
      // dispara el permiso nativo del navegador para compartir ubicación
      const ubicacion = await solicitarUbicacionActual();
      setUserLocation(ubicacion);
      const alertas = await obtenerAlertasPorZona(ubicacion.lat, ubicacion.lng, RADIO_CERCA_DE_MI_KM);
      setIdsMascotasCercanas(new Set(alertas.map((a) => a.mascotaId)));
      setViewMode("map");
    } catch (err) {
      setErrorCercania(err.message);
    } finally {
      setBuscandoCercania(false);
    }
  };

  const limpiarCercania = () => {
    setUserLocation(null);
    setIdsMascotasCercanas(null);
    setErrorCercania(null);
  };

  const filtered = useMemo(() => {
    return pets.filter((p) => {
      if (idsMascotasCercanas && !idsMascotasCercanas.has(p.id)) return false;
      if (filterStatus && p.status !== filterStatus) return false;
      if (filterComuna && p.comuna !== filterComuna) return false;
      if (filterSpecies && p.species !== filterSpecies) return false;
      return true;
    });
  }, [pets, filterStatus, filterComuna, filterSpecies, idsMascotasCercanas]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleFilter = () => {
    setPage(1);
    const p = {};
    if (filterStatus) p.status = filterStatus;
    if (filterComuna) p.comuna = filterComuna;
    if (filterSpecies) p.species = filterSpecies;
    setSearchParams(p);
  };

  const clearFilters = () => {
    setFilterStatus("");
    setFilterComuna("");
    setFilterSpecies("");
    setFilterDateFrom("");
    setFilterDateTo("");
    setPage(1);
    setSearchParams({});
    limpiarCercania();
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="font-black text-3xl text-[var(--color-text)] mb-1">Buscar mascotas</h1>
          <p className="text-[var(--color-muted)]">Encuentra o reporta mascotas en tu comuna</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-3xl p-5 mb-6 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <select
              value={filterComuna}
              onChange={(e) => setFilterComuna(e.target.value)}
              className="px-4 py-3 rounded-2xl border-2 border-[var(--color-border)] text-sm font-semibold text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)] bg-white"
            >
              <option value="">📍 Todas las comunas</option>
              {COMUNAS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>

            <select
              value={filterSpecies}
              onChange={(e) => setFilterSpecies(e.target.value)}
              className="px-4 py-3 rounded-2xl border-2 border-[var(--color-border)] text-sm font-semibold text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)] bg-white"
            >
              <option value="">🐾 Tipo de mascota</option>
              <option value="perro">🐕 Perro</option>
              <option value="gato">🐈 Gato</option>
              <option value="otro">🐇 Otro</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 rounded-2xl border-2 border-[var(--color-border)] text-sm font-semibold text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)] bg-white"
            >
              <option value="">📋 Todos los estados</option>
              <option value="extraviada">🔴 Extraviada</option>
              <option value="encontrada">🟢 Encontrada</option>
              <option value="reunificada">🟡 Reunificada</option>
            </select>

            <input
              type="date"
              value={filterDateFrom}
              onChange={(e) => setFilterDateFrom(e.target.value)}
              className="px-4 py-3 rounded-2xl border-2 border-[var(--color-border)] text-sm text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)]"
              placeholder="Desde"
            />
            <input
              type="date"
              value={filterDateTo}
              onChange={(e) => setFilterDateTo(e.target.value)}
              className="px-4 py-3 rounded-2xl border-2 border-[var(--color-border)] text-sm text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)]"
              placeholder="Hasta"
            />
          </div>
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleFilter}
              className="px-5 py-2.5 bg-[var(--color-primary)] text-white font-bold rounded-2xl hover:bg-[var(--color-primary-dark)] transition-colors text-sm"
            >
              🔍 Aplicar filtros
            </button>
            <button
              onClick={clearFilters}
              className="px-5 py-2.5 border-2 border-[var(--color-border)] text-[var(--color-muted)] font-semibold rounded-2xl hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors text-sm"
            >
              Limpiar
            </button>
          </div>
        </div>

        {/* Results header */}
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div className="text-sm text-[var(--color-muted)]">
            <span className="font-bold text-[var(--color-text)] text-base">{filtered.length}</span> mascotas encontradas
            {filterStatus && (
              <span className="ml-2">
                <StatusBadge status={filterStatus} />
              </span>
            )}
          </div>
          <div className="flex gap-2">
            {idsMascotasCercanas ? (
              <button
                onClick={limpiarCercania}
                className="px-4 py-2 rounded-2xl border-2 border-[var(--color-primary)] text-[var(--color-primary)] font-semibold text-sm hover:bg-[var(--color-bg)] transition-colors"
              >
                📍 Viendo cerca de mí — quitar
              </button>
            ) : (
              <button
                onClick={buscarCercaDeMi}
                disabled={buscandoCercania}
                className="px-4 py-2 rounded-2xl border-2 border-[var(--color-border)] text-[var(--color-text)] font-semibold text-sm hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors disabled:opacity-50"
              >
                {buscandoCercania ? "Obteniendo ubicación…" : "📍 Ver cerca de mí"}
              </button>
            )}
            <button
              onClick={() => setViewMode("grid")}
              className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-colors ${viewMode === "grid" ? "bg-[var(--color-primary)] text-white" : "bg-white text-[var(--color-muted)] hover:bg-[var(--color-bg)]"}`}
            >
              ▦
            </button>
            <button
              onClick={() => setViewMode("map")}
              className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm transition-colors ${viewMode === "map" ? "bg-[var(--color-primary)] text-white" : "bg-white text-[var(--color-muted)] hover:bg-[var(--color-bg)]"}`}
            >
              🗺
            </button>
          </div>
        </div>

        {errorCercania && (
          <p className="text-sm text-[var(--color-primary)] font-semibold mb-4">{errorCercania}</p>
        )}

        {/* Content */}
        {loading ? (
          <div className="text-center py-24 bg-white rounded-3xl">
            <p className="text-[var(--color-muted)]">Cargando mascotas...</p>
          </div>
        ) : error ? (
          <div className="text-center py-24 bg-white rounded-3xl">
            <p className="text-[var(--color-primary)] font-semibold">No se pudo conectar con el servidor: {error}</p>
          </div>
        ) : viewMode === "map" ? (
          <PetsMap
            // una mascota reunificada ya no tiene alerta activa ni sentido en el
            // mapa de búsqueda — sigue visible en la vista de tarjetas (grid)
            pets={filtered.filter((p) => p.lat != null && p.lng != null && p.status !== "reunificada")}
            userLocation={userLocation}
            radioBusquedaKm={idsMascotasCercanas ? RADIO_CERCA_DE_MI_KM : null}
          />
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="font-black text-xl text-[var(--color-text)] mb-2">Sin resultados</h3>
            <p className="text-[var(--color-muted)] mb-6">No encontramos mascotas con esos filtros. Intenta con otras opciones.</p>
            <button
              onClick={clearFilters}
              className="px-5 py-2.5 bg-[var(--color-primary)] text-white font-bold rounded-2xl hover:bg-[var(--color-primary-dark)] transition-colors text-sm"
            >
              Ver todas las mascotas
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
              {paged.map((pet) => (
                <PetCard key={pet.id} pet={pet} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  className="px-4 py-2 rounded-2xl border-2 border-[var(--color-border)] text-sm font-semibold text-[var(--color-muted)] disabled:opacity-40 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors"
                >
                  ← Anterior
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-9 h-9 rounded-xl text-sm font-bold transition-colors ${p === page ? "bg-[var(--color-primary)] text-white" : "bg-white text-[var(--color-muted)] hover:bg-[var(--color-bg)]"}`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                  className="px-4 py-2 rounded-2xl border-2 border-[var(--color-border)] text-sm font-semibold text-[var(--color-muted)] disabled:opacity-40 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors"
                >
                  Siguiente →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
