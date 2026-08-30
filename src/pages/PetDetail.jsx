import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { PETS } from "@/data/pets";
import StatusBadge from "@/components/StatusBadge";
import ContactModal from "@/components/ContactModal";

export default function PetDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showContact, setShowContact] = useState(false);

  const pet = PETS.find((p) => p.id === id);

  if (!pet) {
    return (
      <div className="min-h-screen bg-[#FFECF2] flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🐾</div>
          <h2 className="font-black text-2xl text-[#2B2B2B] mb-2">Mascota no encontrada</h2>
          <Link to="/buscar" className="text-[#C46081] font-bold hover:underline">
            ← Volver al listado
          </Link>
        </div>
      </div>
    );
  }

  const sizeLabel = { pequeño: "Pequeño", mediano: "Mediano", grande: "Grande" };
  const speciesLabel = { perro: "🐕 Perro", gato: "🐈 Gato", otro: "🐇 Otro" };

  return (
    <div className="min-h-screen bg-[#FFECF2] py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-[#8a7a80] mb-6">
          <Link to="/" className="hover:text-[#C46081] transition-colors">Inicio</Link>
          <span>/</span>
          <Link to="/buscar" className="hover:text-[#C46081] transition-colors">Mascotas</Link>
          <span>/</span>
          <span className="text-[#2B2B2B] font-semibold">{pet.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left — photo + map */}
          <div className="lg:col-span-2 space-y-4">
            {/* Photo */}
            <div className="relative rounded-3xl overflow-hidden aspect-square bg-[#FFECF2] shadow-md">
              <img
                src={pet.photo}
                alt={pet.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4">
                <StatusBadge status={pet.status} />
              </div>
            </div>

            {/* Map placeholder */}
            <div className="bg-white rounded-3xl overflow-hidden shadow-sm">
              <div className="p-4 border-b border-[#f0d5df]">
                <h3 className="font-bold text-[#2B2B2B] text-sm">Ubicación aproximada</h3>
                <p className="text-xs text-[#8a7a80]">{pet.sector}, {pet.comuna}</p>
              </div>
              <div
                className="relative h-44 flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, #e8f0d8 0%, #d8ebc8 100%)",
                }}
              >
                <div
                  className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage:
                      "repeating-linear-gradient(0deg,#99A966 0,#99A966 1px,transparent 0,transparent 40px),repeating-linear-gradient(90deg,#99A966 0,#99A966 1px,transparent 0,transparent 40px)",
                  }}
                />
                <div className="relative text-center">
                  <div className="text-3xl mb-1">📍</div>
                  <div className="text-sm font-bold text-[#2B2B2B]">{pet.sector}</div>
                  <div className="text-xs text-[#8a7a80]">{pet.comuna}</div>
                </div>
                <div className="absolute bottom-3 right-3 bg-white/80 backdrop-blur rounded-xl px-2 py-1 text-xs text-[#8a7a80]">
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
                  <h1 className="font-black text-3xl text-[#2B2B2B] mb-1">{pet.name}</h1>
                  <p className="text-[#8a7a80]">{pet.breed}</p>
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
                  <div key={item.label} className="bg-[#FFECF2] rounded-2xl p-3">
                    <div className="text-xs text-[#8a7a80] mb-0.5">{item.label}</div>
                    <div className="font-bold text-sm text-[#2B2B2B]">{item.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-3xl p-6 shadow-sm">
              <h2 className="font-bold text-[#2B2B2B] mb-3">Descripción</h2>
              <p className="text-[#8a7a80] text-sm leading-relaxed">{pet.description}</p>
            </div>

            {/* Location detail */}
            <div className="bg-white rounded-3xl p-6 shadow-sm">
              <h2 className="font-bold text-[#2B2B2B] mb-3">Dónde fue vista</h2>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-[#C46081]">📍</span>
                <span className="font-semibold text-[#2B2B2B]">{pet.sector}, {pet.comuna}</span>
              </div>
              <p className="text-xs text-[#8a7a80] mt-2">
                La ubicación exacta se muestra solo de forma aproximada para proteger la privacidad.
              </p>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-3xl p-6 shadow-sm space-y-3">
              <button
                onClick={() => setShowContact(true)}
                className="w-full py-4 bg-[#C46081] text-white font-bold rounded-2xl hover:bg-[#a84e6c] transition-all shadow-md shadow-[#C46081]/20 text-sm"
              >
                💬 Contactar
              </button>

              {pet.status === "extraviada" ? (
                <button
                  onClick={() => setShowContact(true)}
                  className="w-full py-3.5 border-2 border-[#99A966] text-[#99A966] font-bold rounded-2xl hover:bg-[#99A966]/10 transition-colors text-sm"
                >
                  👀 ¿La viste? Cuéntanos
                </button>
              ) : (
                <button
                  onClick={() => setShowContact(true)}
                  className="w-full py-3.5 border-2 border-[#C46081] text-[#C46081] font-bold rounded-2xl hover:bg-[#FFECF2] transition-colors text-sm"
                >
                  🐾 ¿Es tuya esta mascota?
                </button>
              )}

              <button
                onClick={() => navigate(-1)}
                className="w-full py-3 text-sm text-[#8a7a80] font-semibold hover:text-[#C46081] transition-colors"
              >
                ← Volver al listado
              </button>
            </div>
          </div>
        </div>
      </div>

      {showContact && (
        <ContactModal petName={pet.name} onClose={() => setShowContact(false)} />
      )}
    </div>
  );
}
