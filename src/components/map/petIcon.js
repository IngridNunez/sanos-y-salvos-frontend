import L from "leaflet";

export const STATUS_COLORS = {
  extraviada: "#C46081",
  encontrada: "#99A966",
  reunificada: "#EFB357",
};

const SPECIES_EMOJI = { perro: "🐕", gato: "🐈", otro: "🐇" };

// Pin propio en vez del ícono azul por defecto de Leaflet, para que el mapa
// se sienta parte de la app (mismos colores que StatusBadge) y para que el
// estado se distinga de un vistazo, sin abrir el popup.
export function createPetIcon({ status, species }) {
  const color = STATUS_COLORS[status] ?? STATUS_COLORS.extraviada;
  const emoji = SPECIES_EMOJI[species] ?? "🐾";
  return L.divIcon({
    className: "",
    html: `
      <div style="
        width:34px;height:34px;border-radius:50% 50% 50% 0;
        background:${color};transform:rotate(-45deg);
        box-shadow:0 2px 6px rgba(0,0,0,0.35);
        display:flex;align-items:center;justify-content:center;
        border:2px solid white;
      ">
        <span style="transform:rotate(45deg);font-size:15px;line-height:1;">${emoji}</span>
      </div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 34],
    popupAnchor: [0, -32],
  });
}
