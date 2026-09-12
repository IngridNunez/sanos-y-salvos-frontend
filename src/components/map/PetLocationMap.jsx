import { MapContainer, TileLayer, Circle } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "@/lib/leafletSetup";
import { STATUS_COLORS } from "./petIcon";

// Mapa de solo lectura para el detalle de una mascota. A propósito no pone
// un pin exacto: el radio difuso es el recordatorio visual de que esta
// ubicación ya viene aproximada por privacidad (mismo criterio que
// ms-mascotas.toUbicacionDTO() al redondear la coordenada real).
export default function PetLocationMap({ lat, lng, status }) {
  return (
    <MapContainer
      center={[lat, lng]}
      zoom={13}
      zoomControl={false}
      dragging={false}
      scrollWheelZoom={false}
      doubleClickZoom={false}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Circle
        center={[lat, lng]}
        radius={400}
        pathOptions={{
          color: STATUS_COLORS[status] ?? STATUS_COLORS.extraviada,
          fillColor: STATUS_COLORS[status] ?? STATUS_COLORS.extraviada,
          fillOpacity: 0.25,
          weight: 2,
        }}
      />
    </MapContainer>
  );
}
