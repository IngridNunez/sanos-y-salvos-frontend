import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { obtenerMascotaPorId, obtenerIdsMisMascotas, cambiarEstadoMascota } from "@/api/mascotas";
import { useAuth } from "@/context/AuthContext";
import PetLocationMap from "@/components/map/PetLocationMap";
import StatusBadge from "@/components/StatusBadge";
import ContactModal from "@/components/ContactModal";

export default function PetDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showContact, setShowContact] = useState(false);
  const { user } = useAuth();
  const [esDueno, setEsDueno] = useState(false);
  const [actualizando, setActualizando] = useState(false);
  const [errorEstado, setErrorEstado] = useState(null);

  const [pet, setPet] = useState(null);
  const [loadedId, setLoadedId] = useState(null);
  const loading = loadedId !== id;

  useEffect(() => {
    let cancelado = false;
    obtenerMascotaPorId(id)
      .then((data) => {
        if (cancelado) return;
        setPet(data);
      })
      .catch(() => {
        if (cancelado) return;
        setPet(null);
      })
      .finally(() => {
        if (cancelado) return;
        setLoadedId(id);
      });
    return () => {
      cancelado = true;
    };
  }, [id]);

  useEffect(() => {
    if (!user) return;
    let cancelado = false;
    obtenerIdsMisMascotas()
      .then((ids) => {
        if (!cancelado) setEsDueno(ids.has(id));
      })
      .catch(() => {
        if (!cancelado) setEsDueno(false);
      });
    return () => {
      cancelado = true;
    };
  }, [id, user]);

  const marcarReunificada = async () => {
    if (!window.confirm(`¿Confirmas que ${pet.name} ya fue encontrada y reunida con su familia?`)) return;
    setActualizando(true);
    setErrorEstado(null);
    try {
      const actualizada = await cambiarEstadoMascota(id, "REUNIFICADO");
      setPet(actualizada);
    } catch (err) {
      setErrorEstado(err.message);
    } finally {
      setActualizando(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
        <p className="text-[var(--color-muted)]">Cargando...</p>
      </div>
    );
  }

  if (!pet) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🐾</div>
          <h2 className="font-black text-2xl text-[var(--color-text)] mb-2">Mascota no encontrada</h2>
          <Link to="/buscar" className="text-[var(--color-primary)] font-bold hover:underline">
            ← Volver al listado
          </Link>
        </div>
      </div>
    );
  }

  const sizeLabel = { pequeño: "Pequeño", mediano: "Mediano", grande: "Grande" };
  const speciesLabel = { perro: "🐕 Perro", gato: "🐈 Gato", otro: "🐇 Otro" };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-[var(--color-muted)] mb-6">
          <Link to="/" className="hover:text-[var(--color-primary)] transition-colors">Inicio</Link>
          <span>/</span>
          <Link to="/buscar" className="hover:text-[var(--color-primary)] transition-colors">Mascotas</Link>
          <span>/</span>
          <span className="text-[var(--color-text)] font-semibold">{pet.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left — photo + map */}
          <div className="lg:col-span-2 space-y-4">
            {/* Photo */}
            <div className="relative rounded-3xl overflow-hidden aspect-square bg-[var(--color-bg)] shadow-md">
              <img
                src={pet.photo}
                alt={pet.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4">
                <StatusBadge status={pet.status} />
              </div>
            </div>

            {/* Ubicación aproximada */}
            <div className="bg-white rounded-3xl overflow-hidden shadow-sm">
              <div className="p-4 border-b border-[var(--color-border)]">
                <h3 className="font-bold text-[var(--color-text)] text-sm">Ubicación aproximada</h3>
                <p className="text-xs text-[var(--color-muted)]">{pet.comuna}</p>
              </div>
              <div className="relative h-44 isolate">
                {pet.lat != null && pet.lng != null ? (
                  <PetLocationMap lat={pet.lat} lng={pet.lng} status={pet.status} />
                ) : (
                  <div className="h-full flex items-center justify-center text-sm text-[var(--color-muted)] bg-[var(--color-bg)]">
                    Sin ubicación en el mapa
                  </div>
                )}
                <div className="absolute bottom-3 right-3 z-[1000] bg-white/80 backdrop-blur rounded-xl px-2 py-1 text-xs text-[var(--color-muted)]">
                  🔒 Ubicación aproximada
                </div>
              </div>
            </div>
          </div>

          {/* Right — info */}
          <div className="lg:col-span-3 space-y-5">
            {/* Title */}
            <div className="bg-white rounded-3xl p-6 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="font-black text-3xl text-[var(--color-text)] mb-1">{pet.name}</h1>
                  <p className="text-[var(--color-muted)]">{pet.breed}</p>
                </div>
                <StatusBadge status={pet.status} />
              </div>

              {/* Ficha */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Especie", value: speciesLabel[pet.species] },
                  { label: "Tamaño", value: sizeLabel[pet.size] },
                  { label: "Raza", value: pet.breed },
                  { label: "Color", value: pet.color },
                  { label: "Patrón", value: pet.pattern },
                  { label: "Fecha del reporte", value: pet.date },
                ].map((item) => (
                  <div key={item.label} className="bg-[var(--color-bg)] rounded-2xl p-3">
                    <div className="text-xs text-[var(--color-muted)] mb-0.5">{item.label}</div>
                    <div className="font-bold text-sm text-[var(--color-text)]">{item.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-3xl p-6 shadow-sm">
              <h2 className="font-bold text-[var(--color-text)] mb-3">Descripción</h2>
              <p className="text-[var(--color-muted)] text-sm leading-relaxed">{pet.description}</p>
            </div>

            {/* Location detail */}
            <div className="bg-white rounded-3xl p-6 shadow-sm">
              <h2 className="font-bold text-[var(--color-text)] mb-3">Dónde fue vista</h2>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-[var(--color-primary)]">📍</span>
                <span className="font-semibold text-[var(--color-text)]">{[pet.sector, pet.comuna].filter(Boolean).join(", ")}</span>
              </div>
              <p className="text-xs text-[var(--color-muted)] mt-2">
                La ubicación exacta se muestra solo de forma aproximada para proteger la privacidad.
              </p>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-3xl p-6 shadow-sm space-y-3">
              {esDueno && pet.status !== "reunificada" && pet.moderationStatus === "aprobada" && (
                <div className="bg-[var(--color-secondary)]/10 border-2 border-[var(--color-secondary)] rounded-2xl p-4 space-y-2">
                  <p className="text-xs text-[#5f6b3f] font-semibold">Este reporte es tuyo</p>
                  <button
                    onClick={marcarReunificada}
                    disabled={actualizando}
                    className="w-full py-3.5 bg-[var(--color-secondary)] text-white font-bold rounded-2xl hover:bg-[#83925a] transition-colors text-sm disabled:opacity-60"
                  >
                    {actualizando
                      ? "Guardando..."
                      : pet.tipoReporte === "encontrada"
                        ? "🎉 ¡Ya se la devolví a su dueño! Marcar como reunificada"
                        : "🎉 ¡Ya la encontré! Marcar como reunificada"}
                  </button>
                  {errorEstado && <p className="text-xs text-[var(--color-primary)]">{errorEstado}</p>}
                </div>
              )}

              {/* el dueño viendo su propio reporte, antes de que un admin lo revise
                  o si lo rechazaron — sin el botón de reunificar, que no tiene
                  sentido hasta que esté publicado */}
              {esDueno && pet.moderationStatus !== "aprobada" && (
                <div className={`rounded-2xl p-4 border-2 ${
                  pet.moderationStatus === "pendiente"
                    ? "bg-amber-50 border-amber-400"
                    : "bg-red-50 border-red-400"
                }`}>
                  <p className={`text-sm font-bold ${pet.moderationStatus === "pendiente" ? "text-amber-800" : "text-red-700"}`}>
                    {pet.moderationStatus === "pendiente"
                      ? "🕓 Este reporte está en revisión y aún no es visible para el público."
                      : "🚫 Este reporte fue rechazado por un administrador y no es visible para el público."}
                  </p>
                </div>
              )}

              {!esDueno && (
                <>
                  <button
                    onClick={() => setShowContact(true)}
                    className="w-full py-4 bg-[var(--color-primary)] text-white font-bold rounded-2xl hover:bg-[var(--color-primary-dark)] transition-all shadow-md shadow-[var(--color-primary)]/20 text-sm"
                  >
                    💬 Contactar
                  </button>

                  {/* sin sentido en un reporte ya reunificado: no hay nada que "contar" ni
                      nadie que reclamar — Contactar sigue arriba por si alguien igual
                      quiere escribir */}
                  {pet.status === "reunificada" ? null : pet.status === "extraviada" ? (
                    <button
                      onClick={() => setShowContact(true)}
                      className="w-full py-3.5 border-2 border-[var(--color-secondary)] text-[var(--color-secondary)] font-bold rounded-2xl hover:bg-[var(--color-secondary)]/10 transition-colors text-sm"
                    >
                      👀 ¿La viste? Cuéntanos
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowContact(true)}
                      className="w-full py-3.5 border-2 border-[var(--color-primary)] text-[var(--color-primary)] font-bold rounded-2xl hover:bg-[var(--color-bg)] transition-colors text-sm"
                    >
                      🐾 ¿Es tuya esta mascota?
                    </button>
                  )}
                </>
              )}

              <button
                onClick={() => navigate(-1)}
                className="w-full py-3 text-sm text-[var(--color-muted)] font-semibold hover:text-[var(--color-primary)] transition-colors"
              >
                ← Volver al listado
              </button>
            </div>
          </div>
        </div>
      </div>

      {showContact && (
        <ContactModal petId={pet.id} petName={pet.name} onClose={() => setShowContact(false)} />
      )}
    </div>
  );
}
