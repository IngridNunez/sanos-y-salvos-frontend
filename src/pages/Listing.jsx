import { useState, useMemo } from "react";
import { useSearchParams } from "react-router";
import { PETS, COMUNAS } from "@/data/pets";
import PetCard from "@/components/PetCard";
import StatusBadge from "@/components/StatusBadge";
import PetsMap from "@/components/map/PetsMap";

const PAGE_SIZE = 6;

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
          <PetsMap pets={filtered} />
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
