// Detecta navegadores "en app" (WhatsApp, Instagram, Facebook, Line) — el
// WebView que abren esas apps al tocar un link, no el navegador real del
// celular. Son conocidos por romper fetch() con sesión/cookies entre
// dominios distintos (ver: reporte que falló con "Failed to fetch" al
// publicar desde el link de WhatsApp).
//
// Limitación conocida: en iOS estas apps no siempre agregan una marca clara
// al user agent, así que la detección ahí es best-effort, no 100% confiable.
const PATRON_NAVEGADOR_EN_APP = /FBAN|FBAV|Instagram|WhatsApp|Line\//i;

export function esNavegadorEnApp() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || navigator.vendor || "";
  return PATRON_NAVEGADOR_EN_APP.test(ua);
}
