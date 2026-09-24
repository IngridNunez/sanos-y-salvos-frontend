// Leaflet calcula las rutas de sus íconos por defecto a partir de la URL del
// propio script, lo que se rompe con bundlers (Vite incluido) — sin esto, los
// pines del mapa no se ven. Se importan los PNG para que Vite los procese y
// les asigne una URL final válida.
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});
