import { useState, useMemo } from "react";
import { useSearchParams } from "react-router";
import { PETS, COMUNAS } from "@/data/pets";
import PetCard from "@/components/PetCard";
import StatusBadge from "@/components/StatusBadge";

const PAGE_SIZE = 6;

// Simple map pin SVG — actual map requires a library; this is a placeholder tile
function MapView({ pets }) {
  return (
    <div className="relative bg-[#e8f0d8] rounded-3xl overflow-hidden" style={{ height: 480 }}>
      {/* Fake map tiles */}
      <div className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: "repeating-linear-gradient(0deg,#99A966 0,#99A966 1px,transparent 0,transparent 60px),repeating-linear-gradient(90deg,#99A966 0,#99A966 1px,transparent 0,transparent 60px)",
        }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-2">🗺️</div>
          <div className="font-bold text-[#2B2B2B]">Vista de mapa</div>
          <p className="text-sm text-[#8a7a80] mt-1">
            {pets.length} mascotas en esta zona
          </p>
        </div>
      </div>
      {/* Fake pins */}
      {pets.slice(0, 8).map((pet, i) => (
        <div
          key={pet.id}
          className="absolute flex flex-col items-center"
          style={{
            left: `${15 + (i * 11) % 70}%`,
            top: `${20 + (i * 17) % 60}%`,
          }}
        >
          <div
            className="w-9 h-9 rounded-full border-3 border-white shadow-lg flex items-center justify-center text-base overflow-hidden"
            style={{
              borderColor: "white",
              borderWidth: 2,
              backgroundColor:
                pet.status === "extraviada" ? "#C46081" : pet.status === "encontrada" ? "#99A966" : "#EFB357",
            }}
            title={pet.name}
          >
            {pet.species === "perro" ? "🐕" : "🐈"}
          </div>
          <div className="text-[10px] font-bold text-[#2B2B2B] bg-white rounded px-1 mt-0.5 shadow">
            {pet.name}
          </div>
        </div>
      ))}
    </div>
  );
}

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

  const filtered = useMemo(() => {
    return PETS.filter((p) => {
      if (filterStatus && p.status !== filterStatus) return false;
      if (filterComuna && p.comuna !== filterComuna) return false;
      if (filterSpecies && p.species !== filterSpecies) return false;
      return true;
    });
  }, [filterStatus, filterComuna, filterSpecies]);

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
  };

  return (
    <div className="min-h-screen bg-[#FFECF2] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="font-black text-3xl text-[#2B2B2B] mb-1">Buscar mascotas</h1>
          <p className="text-[#8a7a80]">Encuentra o reporta mascotas en tu comuna</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-3xl p-5 mb-6 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <select
              value={filterComuna}
              onChange={(e) => setFilterComuna(e.target.value)}
              className="px-4 py-3 rounded-2xl border-2 border-[#f0d5df] text-sm font-semibold text-[#2B2B2B] focus:outline-none focus:border-[#C46081] bg-white"
            >
              <option value="">📍 Todas las comunas</option>
              {COMUNAS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>

            <select
              value={filterSpecies}
              onChange={(e) => setFilterSpecies(e.target.value)}
              className="px-4 py-3 rounded-2xl border-2 border-[#f0d5df] text-sm font-semibold text-[#2B2B2B] focus:outline-none focus:border-[#C46081] bg-white"
            >
              <option value="">🐾 Tipo de mascota</option>
              <option value="perro">🐕 Perro</option>
              <option value="gato">🐈 Gato</option>
              <option value="otro">🐇 Otro</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 rounded-2xl border-2 border-[#f0d5df] text-sm font-semibold text-[#2B2B2B] focus:outline-none focus:border-[#C46081] bg-white"
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
              className="px-4 py-3 rounded-2xl border-2 border-[#f0d5df] text-sm text-[#2B2B2B] focus:outline-none focus:border-[#C46081]"
              placeholder="Desde"
            />
            <input
              type="date"
              value={filterDateTo}
              onChange={(e) => setFilterDateTo(e.target.value)}
              className="px-4 py-3 rounded-2xl border-2 border-[#f0d5df] text-sm text-[#2B2B2B] focus:outline-none focus:border-[#C46081]"
              placeholder="Hasta"
            />
          </div>
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleFilter}
              className="px-5 py-2.5 bg-[#C46081] text-white font-bold rounded-2xl hover:bg-[#a84e6c] transition-colors text-sm"
            >
              🔍 Aplicar filtros
            </button>
            <button
              onClick={clearFilters}
              className="px-5 py-2.5 border-2 border-[#f0d5df] text-[#8a7a80] font-semibold rounded-2xl hover:border-[#C46081] hover:text-[#C46081] transition-colors text-sm"
            >
              Limpiar
            </button>
          </div>
        </div>

        {/* Results header */}
        <div className="flex items-center justify-between mb-5">
          <div className="text-sm text-[#8a7a80]">
            <span className="font-bold text-[#2B2B2B] text-base">{filtered.length}</span> mascotas encontradas
            {filterStatus && (
              <span className="ml-2">
                <StatusBadge status={filterStatus} />
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode("grid")}
              className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-colors ${viewMode === "grid" ? "bg-[#C46081] text-white" : "bg-white text-[#8a7a80] hover:bg-[#FFECF2]"}`}
            >
              ▦
            </button>
            <button
              onClick={() => setViewMode("map")}
              className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm transition-colors ${viewMode === "map" ? "bg-[#C46081] text-white" : "bg-white text-[#8a7a80] hover:bg-[#FFECF2]"}`}
            >
              🗺
            </button>
          </div>
        </div>

        {/* Content */}
        {viewMode === "map" ? (
          <MapView pets={filtered} />
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="font-black text-xl text-[#2B2B2B] mb-2">Sin resultados</h3>
            <p className="text-[#8a7a80] mb-6">No encontramos mascotas con esos filtros. Intenta con otras opciones.</p>
            <button
              onClick={clearFilters}
              className="px-5 py-2.5 bg-[#C46081] text-white font-bold rounded-2xl hover:bg-[#a84e6c] transition-colors text-sm"
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
                  className="px-4 py-2 rounded-2xl border-2 border-[#f0d5df] text-sm font-semibold text-[#8a7a80] disabled:opacity-40 hover:border-[#C46081] hover:text-[#C46081] transition-colors"
                >
                  ← Anterior
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-9 h-9 rounded-xl text-sm font-bold transition-colors ${p === page ? "bg-[#C46081] text-white" : "bg-white text-[#8a7a80] hover:bg-[#FFECF2]"}`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                  className="px-4 py-2 rounded-2xl border-2 border-[#f0d5df] text-sm font-semibold text-[#8a7a80] disabled:opacity-40 hover:border-[#C46081] hover:text-[#C46081] transition-colors"
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
