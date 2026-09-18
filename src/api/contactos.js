const API_URL = import.meta.env.VITE_API_URL;

/* publico, no requiere login: cualquiera que encuentre una mascota puede contactar */
export async function contactarPorMascota({ mascotaId, nombre, email, telefono, mensaje }) {
  const response = await fetch(`${API_URL}/api/v1/contactos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      mascotaId,
      nombreContacto: nombre,
      emailContacto: email,
      telefonoContacto: telefono || null,
      mensaje,
    }),
  });

  if (!response.ok) {
    const detalle = await response.text().catch(() => "");
    throw new Error(`No se pudo enviar el mensaje (${response.status}). ${detalle}`);
  }
}
