import { useMemo } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "@/lib/leafletSetup";
import L from "leaflet";

const DEFAULT_CENTER = [-33.03, -71.55]; // Región de Valparaíso

function ClickToPlace({ onChange }) {
  useMapEvents({
    click(e) {
      onChange({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

// Ícono neutro (no depende del estado extraviada/encontrada — acá el usuario
// todavía está marcando el punto, no viendo un reporte publicado).
const pickerIcon = new L.Icon.Default();

export default function LocationPicker({ value, onChange }) {
  const center = useMemo(
    () => (value ? [value.lat, value.lng] : DEFAULT_CENTER),
    // sólo recentra en el primer valor recibido — no queremos que el mapa
    // salte de vuelta al marcador cada vez que el usuario lo arrastra
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const handleDrag = (e) => {
    const { lat, lng } = e.target.getLatLng();
    onChange({ lat, lng });
  };

  return (
    <div className="space-y-2 relative isolate">
      <div className="rounded-2xl overflow-hidden" style={{ height: 220 }}>
        <MapContainer
          center={center}
          zoom={13}
          scrollWheelZoom={false}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickToPlace onChange={onChange} />
          {value && (
            <Marker
              position={[value.lat, value.lng]}
              icon={pickerIcon}
              draggable
              eventHandlers={{ dragend: handleDrag }}
            />
          )}
        </MapContainer>
      </div>
      <p className="text-xs text-[#8a7a80] text-center">
        {value
          ? "Arrastra el pin para ajustar el punto exacto."
          : "Haz clic en el mapa donde se perdió o encontró la mascota."}
      </p>
    </div>
  );
}
