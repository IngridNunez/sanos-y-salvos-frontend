import { useEffect, useState } from "react";

const CLAVE = "sys-tema-oscuro";

/* El modo claro es el principal: la primera vez que alguien entra (sin
 * elección guardada todavía) siempre parte en claro, sin importar la
 * preferencia del sistema operativo — el oscuro queda como opción
 * secundaria, que la persona activa a propósito con el botón. */
function temaInicial() {
  try {
    const guardado = localStorage.getItem(CLAVE);
    if (guardado !== null) return guardado === "1";
  } catch {
    /* localStorage puede fallar en navegación privada — se sigue con el claro por defecto */
  }
  return false;
}

/* aplica/saca la clase .dark en <html> (de ahí toman los tokens de color en
 * index.css) y recuerda la elección de la persona en localStorage. */
export function useDarkMode() {
  const [oscuro, setOscuro] = useState(temaInicial);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", oscuro);
    try {
      localStorage.setItem(CLAVE, oscuro ? "1" : "0");
    } catch {
      /* no pasa nada si no se puede recordar la preferencia */
    }
  }, [oscuro]);

  return [oscuro, setOscuro];
}
