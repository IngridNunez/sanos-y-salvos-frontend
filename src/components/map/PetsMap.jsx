import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "@/lib/leafletSetup";
import { createPetIcon, STATUS_COLORS } from "./petIcon";

// Centro por defecto: región de Valparaíso, donde vive todo el dataset de
// ejemplo. Cuando haya reportes reales, conviene centrar según la comuna
// del usuario o el primer resultado en vez de este valor fijo.
const DEFAULT_CENTER = [-33.03, -71.55];
const DEFAULT_ZOOM = 11;

// Radio de alerta del MVP (ver ms-alertas: POST /alertas crea una alerta con
// este mismo radio recomendado alrededor del punto reportado) — se dibuja
// solo para reportes activos, una reunificación ya no genera alerta.
const RADIO_ALERTA_METROS = 3000;

export default function PetsMap({ pets }) {
  const navigate = useNavigate();
  const [showAlertRadius, setShowAlertRadius] = useState(true);

  const center = useMemo(() => {
    if (pets.length === 0) return DEFAULT_CENTER;
    const lat = pets.reduce((sum, p) => sum + p.lat, 0) / pets.length;
    const lng = pets.reduce((sum, p) => sum + p.lng, 0) / pets.length;
    return [lat, lng];
  }, [pets]);

  return (
    <div className="rounded-3xl overflow-hidden shadow-sm relative" style={{ height: 480 }}>
      <label className="absolute z-[1000] top-3 right-3 bg-white/95 backdrop-blur rounded-2xl px-3 py-2 text-xs font-semibold text-[#2B2B2B] shadow-md flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={showAlertRadius}
          onChange={(e) => setShowAlertRadius(e.target.checked)}
        />
        Zona de alerta (3 km)
      </label>

      <MapContainer
        center={center}
        zoom={DEFAULT_ZOOM}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {pets.map((pet) => (
          <div key={pet.id}>
            {showAlertRadius && pet.status !== "reunificada" && (
              <Circle
                center={[pet.lat, pet.lng]}
                radius={RADIO_ALERTA_METROS}
                pathOptions={{
                  color: STATUS_COLORS[pet.status],
                  fillColor: STATUS_COLORS[pet.status],
                  fillOpacity: 0.06,
                  weight: 1,
                }}
              />
            )}
            <Marker
              position={[pet.lat, pet.lng]}
              icon={createPetIcon(pet)}
              eventHandlers={{ click: () => navigate(`/mascota/${pet.id}`) }}
            >
              <Popup>
                <div className="flex gap-2 items-center min-w-[160px]">
                  <img
                    src={pet.photo}
                    alt={pet.name}
                    className="w-12 h-12 rounded-xl object-cover shrink-0"
                  />
                  <div>
                    <div className="font-bold text-sm text-[#2B2B2B]">{pet.name}</div>
                    <div className="text-xs text-[#8a7a80]">{pet.sector}, {pet.comuna}</div>
                  </div>
                </div>
              </Popup>
            </Marker>
          </div>
        ))}
      </MapContainer>
    </div>
  );
}
