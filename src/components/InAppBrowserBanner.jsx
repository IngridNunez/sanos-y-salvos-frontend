import { useState } from "react";
import { esNavegadorEnApp } from "@/lib/navegadorEnApp";

const CLAVE_DESCARTADO = "sys-banner-navegador-en-app-descartado";

/* navigator/sessionStorage ya están disponibles en el primer render (SPA,
 * sin SSR) — no hace falta un efecto, solo el inicializador perezoso de useState */
function calcularVisibilidadInicial() {
  if (!esNavegadorEnApp()) return false;
  try {
    return sessionStorage.getItem(CLAVE_DESCARTADO) !== "1";
  } catch {
    return true; /* sessionStorage puede fallar en navegación privada — se muestra igual */
  }
}

export default function InAppBrowserBanner() {
  const [visible, setVisible] = useState(calcularVisibilidadInicial);

  if (!visible) return null;

  const descartar = () => {
    setVisible(false);
    try {
      sessionStorage.setItem(CLAVE_DESCARTADO, "1");
    } catch {
      /* no pasa nada si no se puede recordar la preferencia */
    }
  };

  return (
    <div className="bg-[var(--color-accent)] text-[var(--color-text)] px-4 py-2.5 text-sm flex items-center justify-center gap-3 flex-wrap text-center">
      <span>
        ⚠️ Estás usando el navegador dentro de la app (WhatsApp/Instagram) — algunas funciones como reportar una
        mascota pueden fallar acá. Abre este link en Safari o Chrome para que todo funcione bien.
      </span>
      <button
        onClick={descartar}
        className="shrink-0 font-bold underline hover:no-underline"
      >
        Entendido
      </button>
    </div>
  );
}
