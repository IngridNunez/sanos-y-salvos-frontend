import { useEffect, useMemo, useState } from "react";
import { Link, Navigate } from "react-router";
import { useAuth } from "@/context/AuthContext";
import { obtenerMisMascotas } from "@/api/mascotas";
import { COMUNAS } from "@/data/pets";
import PetCard from "@/components/PetCard";

const ESTADO_LABEL = { extraviada: "Extraviadas", encontrada: "Encontradas", reunificada: "Reunificadas" };

export default function Profile() {
  const { user, cargandoSesion } = useAuth();
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // mismos filtros que el listado (Buscar), para poder ordenar los propios reportes
  const [filterStatus, setFilterStatus] = useState("");
  const [filterComuna, setFilterComuna] = useState("");
  const [filterSpecies, setFilterSpecies] = useState("");

  useEffect(() => {
    if (!user) return;
    obtenerMisMascotas()
      .then(setPets)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [user]);

  const filtered = useMemo(() => {
    return pets.filter((p) => {
      if (filterStatus && p.status !== filterStatus) return false;
      if (filterComuna && p.comuna !== filterComuna) return false;
      if (filterSpecies && p.species !== filterSpecies) return false;
      return true;
    });
  }, [pets, filterStatus, filterComuna, filterSpecies]);

  const clearFilters = () => {
    setFilterStatus("");
    setFilterComuna("");
    setFilterSpecies("");
  };

  if (cargandoSesion) {
    return (
      <div className="min-h-screen bg-[#FFECF2] flex items-center justify-center">
        <p className="text-[#8a7a80]">Cargando...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login?redirect=/perfil" replace />;
  }

  const conteos = pets.reduce((acc, p) => {
    acc[p.status] = (acc[p.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-[#FFECF2] py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Encabezado — ancho al contenido, no a todo el layout */}
        <div className="inline-flex items-center gap-3 bg-white rounded-2xl px-4 py-2.5 shadow-sm mb-6 max-w-full">
          <div className="w-10 h-10 rounded-full bg-[#FFECF2] flex items-center justify-center text-base font-black text-[#C46081] shrink-0">
            {(user.name || user.email || "?").charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h1 className="font-bold text-base text-[#2B2B2B] leading-tight truncate">{user.name}</h1>
            <p className="text-[#8a7a80] text-xs truncate">{user.email}</p>
          </div>
        </div>

        {/* Resumen */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {["extraviada", "encontrada", "reunificada"].map((estado) => (
            <div key={estado} className="bg-white rounded-2xl p-4 text-center shadow-sm">
              <div className="font-black text-2xl text-[#2B2B2B]">{conteos[estado] ?? 0}</div>
              <div className="text-xs text-[#8a7a80] font-semibold">{ESTADO_LABEL[estado]}</div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between mb-4">
          <h2 className="font-black text-xl text-[#2B2B2B]">Mis reportes</h2>
          <Link
            to="/reportar"
            className="px-4 py-2 bg-[#C46081] text-white text-sm font-bold rounded-2xl hover:bg-[#a84e6c] transition-colors"
          >
            + Reportar
          </Link>
        </div>

        {/* Filtros — mismos que el listado público (Buscar), para ordenar los reportes propios */}
        {pets.length > 0 && (
          <div className="bg-white rounded-3xl p-5 mb-6 shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
            </div>
            {(filterComuna || filterSpecies || filterStatus) && (
              <button
                onClick={clearFilters}
                className="mt-3 px-5 py-2.5 border-2 border-[#f0d5df] text-[#8a7a80] font-semibold rounded-2xl hover:border-[#C46081] hover:text-[#C46081] transition-colors text-sm"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        )}

        {loading ? (
          <div className="text-center py-24 bg-white rounded-3xl">
            <p className="text-[#8a7a80]">Cargando tus reportes...</p>
          </div>
        ) : error ? (
          <div className="text-center py-24 bg-white rounded-3xl">
            <p className="text-[#C46081] font-semibold">No se pudo conectar con el servidor: {error}</p>
          </div>
        ) : pets.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl">
            <div className="text-6xl mb-4">🐾</div>
            <h3 className="font-black text-xl text-[#2B2B2B] mb-2">Todavía no tienes reportes</h3>
            <p className="text-[#8a7a80] mb-6">Cuando reportes una mascota extraviada o encontrada, aparecerá aquí.</p>
            <Link
              to="/reportar"
              className="px-5 py-2.5 bg-[#C46081] text-white font-bold rounded-2xl hover:bg-[#a84e6c] transition-colors text-sm inline-block"
            >
              Reportar una mascota
            </Link>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="font-black text-xl text-[#2B2B2B] mb-2">Sin resultados</h3>
            <p className="text-[#8a7a80] mb-6">Ninguno de tus reportes calza con esos filtros.</p>
            <button
              onClick={clearFilters}
              className="px-5 py-2.5 bg-[#C46081] text-white font-bold rounded-2xl hover:bg-[#a84e6c] transition-colors text-sm"
            >
              Ver todos mis reportes
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((pet) => (
              <PetCard key={pet.id} pet={pet} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
