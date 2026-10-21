import { useEffect, useState } from "react";

const CLAVE = "sys-tema-oscuro";

function temaInicial() {
  try {
    const guardado = localStorage.getItem(CLAVE);
    if (guardado !== null) return guardado === "1";
  } catch {
    /* localStorage puede fallar en navegación privada — se sigue con la preferencia del sistema */
  }
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
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
