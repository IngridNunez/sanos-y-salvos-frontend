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
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
        <p className="text-[var(--color-muted)]">Cargando...</p>
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
    <div className="min-h-screen bg-[var(--color-bg)] py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Encabezado — ancho al contenido, no a todo el layout */}
        <div className="inline-flex items-center gap-3 bg-white rounded-2xl px-4 py-2.5 shadow-sm mb-6 max-w-full">
          <div className="w-10 h-10 rounded-full bg-[var(--color-bg)] flex items-center justify-center text-base font-black text-[var(--color-primary)] shrink-0">
            {(user.name || user.email || "?").charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h1 className="font-bold text-base text-[var(--color-text)] leading-tight truncate">{user.name}</h1>
            <p className="text-[var(--color-muted)] text-xs truncate">{user.email}</p>
          </div>
        </div>

        {/* Resumen */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {["extraviada", "encontrada", "reunificada"].map((estado) => (
            <div key={estado} className="bg-white rounded-2xl p-4 text-center shadow-sm">
              <div className="font-black text-2xl text-[var(--color-text)]">{conteos[estado] ?? 0}</div>
              <div className="text-xs text-[var(--color-muted)] font-semibold">{ESTADO_LABEL[estado]}</div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between mb-4">
          <h2 className="font-black text-xl text-[var(--color-text)]">Mis reportes</h2>
          <Link
            to="/reportar"
            className="px-4 py-2 bg-[var(--color-primary)] text-white text-sm font-bold rounded-2xl hover:bg-[var(--color-primary-dark)] transition-colors"
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
            </div>
            {(filterComuna || filterSpecies || filterStatus) && (
              <button
                onClick={clearFilters}
                className="mt-3 px-5 py-2.5 border-2 border-[var(--color-border)] text-[var(--color-muted)] font-semibold rounded-2xl hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors text-sm"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        )}

        {loading ? (
          <div className="text-center py-24 bg-white rounded-3xl">
            <p className="text-[var(--color-muted)]">Cargando tus reportes...</p>
          </div>
        ) : error ? (
          <div className="text-center py-24 bg-white rounded-3xl">
            <p className="text-[var(--color-primary)] font-semibold">No se pudo conectar con el servidor: {error}</p>
          </div>
        ) : pets.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl">
            <div className="text-6xl mb-4">🐾</div>
            <h3 className="font-black text-xl text-[var(--color-text)] mb-2">Todavía no tienes reportes</h3>
            <p className="text-[var(--color-muted)] mb-6">Cuando reportes una mascota extraviada o encontrada, aparecerá aquí.</p>
            <Link
              to="/reportar"
              className="px-5 py-2.5 bg-[var(--color-primary)] text-white font-bold rounded-2xl hover:bg-[var(--color-primary-dark)] transition-colors text-sm inline-block"
            >
              Reportar una mascota
            </Link>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="font-black text-xl text-[var(--color-text)] mb-2">Sin resultados</h3>
            <p className="text-[var(--color-muted)] mb-6">Ninguno de tus reportes calza con esos filtros.</p>
            <button
              onClick={clearFilters}
              className="px-5 py-2.5 bg-[var(--color-primary)] text-white font-bold rounded-2xl hover:bg-[var(--color-primary-dark)] transition-colors text-sm"
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
