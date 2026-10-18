// Redimensiona y recomprime cualquier foto en el navegador antes de subirla,
// para no depender de que la persona achique la foto a mano. Soluciona el
// caso típico de fotos de celular (sobre todo iPhones recientes) que superan
// los 5 MB que acepta ms-mascotas al firmar la URL de subida.
const LADO_MAXIMO_PX = 1600;
const CALIDAD_INICIAL = 0.85;
const CALIDAD_MINIMA = 0.5;
const MAX_FOTO_BYTES = 5 * 1024 * 1024;

function cargarImagen(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("No se pudo leer la imagen."));
    };
    img.src = url;
  });
}

function exportarCanvas(canvas, calidad) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("No se pudo comprimir la imagen."))),
      "image/jpeg",
      calidad,
    );
  });
}

/* Devuelve un File JPEG, redimensionado (lado más largo <= 1600px) y bajo
 * 5 MB — reintenta con menos calidad si hiciera falta (en la práctica casi
 * nunca, el resize solo ya achica mucho el peso). */
export async function comprimirImagen(file) {
  if (!file.type.startsWith("image/")) {
    throw new Error("El archivo debe ser una imagen.");
  }

  const img = await cargarImagen(file);
  const escala = Math.min(1, LADO_MAXIMO_PX / Math.max(img.width, img.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(img.width * escala);
  canvas.height = Math.round(img.height * escala);
  canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);

  let calidad = CALIDAD_INICIAL;
  let blob = await exportarCanvas(canvas, calidad);
  while (blob.size > MAX_FOTO_BYTES && calidad > CALIDAD_MINIMA) {
    calidad -= 0.1;
    blob = await exportarCanvas(canvas, calidad);
  }

  if (blob.size > MAX_FOTO_BYTES) {
    throw new Error("La foto sigue pesando demasiado incluso comprimida. Prueba con otra imagen.");
  }

  const nombre = file.name.replace(/\.[^.]+$/, "") + ".jpg";
  return new File([blob], nombre, { type: "image/jpeg" });
}
