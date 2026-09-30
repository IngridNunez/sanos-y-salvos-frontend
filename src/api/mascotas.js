const API_URL = import.meta.env.VITE_API_URL ?? ""; /* vacío en producción: /api va por el rewrite del mismo dominio */

const ESTADO_A_STATUS = {
  EXTRAVIADO: "extraviada",
  ENCONTRADO: "encontrada",
  REUNIFICADO: "reunificada",
};

const TIPO_A_SPECIES = {
  PERRO: "perro",
  GATO: "gato",
  CONEJO: "otro",
  OTRO: "otro",
};

function mapMascota(m) {
  /* caracteristicas es un mapa libre: ahi vienen raza/tamaño/color/etc
   * cuando el que reporto los cargo, no siempre estan todos */
  const c = m.caracteristicas ?? {};
  return {
    id: m.idMascota,
    name: m.nombre,
    photo: m.fotografia,
    status: ESTADO_A_STATUS[m.estado] ?? "extraviada",
    species: TIPO_A_SPECIES[m.tipoMascota] ?? "otro",
    comuna: m.comuna,
    description: m.descripcion,
    date: m.fecha
      ? new Date(m.fecha).toLocaleDateString("es-CL", { day: "numeric", month: "short", year: "numeric" })
      : "—",
    breed: c.raza ?? "—",
    color: c.color ?? "—",
    pattern: c.patron ?? c.patrón ?? "—",
    size: c.tamaño ?? c.tamano ?? null,
    // ms-mascotas no tiene un campo propio de sector/dirección (solo comuna +
    // coordenadas), así que viaja dentro de caracteristicas, igual que
    // raza/color/patrón — no se busca por él, solo se muestra.
    sector: c.sector || "", /* vacío si no se indicó: las pantallas muestran solo la comuna */
    // ms-mascotas devuelve la ubicación redondeada (~1 km) por privacidad
    // fecha cruda (ISO) para filtrar por rango en las estadísticas del Home
    fechaISO: m.fecha ?? null,
    lat: m.ubicacion?.latitud ?? null,
    lng: m.ubicacion?.longitud ?? null,
    // origen del reporte (nunca cambia, aunque el estado sí) — null en
    // mascotas ya reunificadas de antes de que ms-mascotas tuviera este campo
    tipoReporte: ESTADO_A_STATUS[m.tipoReporte] ?? null,
  };
}

// más recientes primero; size alto porque el Home cuenta reunificadas por comuna/fecha
export async function obtenerMascotas() {
  const response = await fetch(`${API_URL}/api/v1/mascotas?size=200&sort=fecha,desc`);
  if (!response.ok) {
    throw new Error(`Error al obtener mascotas: ${response.status}`);
  }
  const data = await response.json();
  const contenido = data.content ?? data;
  return contenido.map(mapMascota);
}

export async function obtenerMascotaPorId(id) {
  const response = await fetch(`${API_URL}/api/v1/mascotas/${id}`);
  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    throw new Error(`Error al obtener mascota: ${response.status}`);
  }
  return mapMascota(await response.json());
}

const SPECIES_A_TIPO = { perro: "PERRO", gato: "GATO", otro: "OTRO" };
const TAB_A_ESTADO = { extraviada: "EXTRAVIADO", encontrada: "ENCONTRADO" };

// foto de stock segun la especie, para reportes sin foto propia
const FOTO_PLACEHOLDER = {
  PERRO: "https://images.unsplash.com/photo-1547482354-89d4259dbc4b?w=600&h=600&fit=crop&auto=format",
  GATO: "https://images.unsplash.com/photo-1682839764237-2f7f7515f252?w=600&h=600&fit=crop&auto=format",
  OTRO: "https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=600&h=600&fit=crop&auto=format",
};

/* mismos limites que valida ms-mascotas al firmar la URL (S3Service) */
const EXTENSION_POR_TIPO = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
const MAX_FOTO_BYTES = 5 * 1024 * 1024;

/* sube la foto directo a S3 con una URL firmada que entrega ms-mascotas; devuelve la URL publica del objeto */
export async function subirFoto(file) {
  const extension = EXTENSION_POR_TIPO[file.type];
  if (!extension) throw new Error("La foto debe ser JPG, PNG o WEBP.");
  if (file.size > MAX_FOTO_BYTES) throw new Error("La foto no puede pesar más de 5 MB.");

  const params = new URLSearchParams({
    fileName: `foto.${extension}`, /* nombre fijo: el original puede traer caracteres que S3Service rechaza */
    contentType: file.type,
    fileSize: String(file.size),
  });
  const firma = await fetch(`${API_URL}/api/v1/mascotas/presigned-url?${params}`, { credentials: "include" });
  if (!firma.ok) throw new Error(`No se pudo preparar la subida de la foto (${firma.status}).`);
  const { url } = await firma.json();

  /* va directo a S3, sin cookies: la URL firmada ya trae la autorizacion */
  const subida = await fetch(url, { method: "PUT", headers: { "Content-Type": file.type }, body: file });
  if (!subida.ok) throw new Error(`No se pudo subir la foto (${subida.status}).`);

  return url.split("?")[0];
}

/* form: lo que junta ReportForm.jsx | tab: "extraviada" | "encontrada" | fotografiaUrl: resultado de subirFoto (opcional) */
export async function crearMascota(form, tab, correoUsuario, fotografiaUrl) {
  const tipoMascota = SPECIES_A_TIPO[form.species] ?? "OTRO";

  const caracteristicas = {};
  if (form.breed) caracteristicas.raza = form.breed;
  if (form.color) caracteristicas.color = form.color;
  if (form.pattern) caracteristicas.patron = form.pattern;
  if (form.size) caracteristicas.tamaño = form.size;
  if (form.sector) caracteristicas.sector = form.sector;

  const body = {
    tipoMascota,
    nombre: form.name,
    fotografia: fotografiaUrl ?? FOTO_PLACEHOLDER[tipoMascota],
    estado: TAB_A_ESTADO[tab] ?? "EXTRAVIADO",
    comuna: form.comuna,
    descripcion: form.description,
    caracteristicas,
    emailContacto: correoUsuario,
  };
  if (form.location) {
    body.ubicacion = { latitud: form.location.lat, longitud: form.location.lng };
  }

  const response = await fetch(`${API_URL}/api/v1/mascotas`, {
    method: "POST",
    credentials: "include", /* manda la cookie de sesion en vez de armar el header a mano */
    headers: {
      "Content-Type": "application/json",
      "X-Requested-With": "web",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const detalle = await response.text().catch(() => "");
    throw new Error(`No se pudo publicar el reporte (${response.status}). ${detalle}`);
  }

  return mapMascota(await response.json());
}

/* la sesión viaja en cookies httpOnly: solo hay que incluirlas (y el header anti-CSRF en escrituras) */
const headersSesion = {
  "Content-Type": "application/json",
  "X-Requested-With": "web",
};

/* ids de las mascotas que reportó el usuario logueado — el listado público no trae
 * usuarioId (privacidad), así que "soy el dueño" se resuelve con /mis-mascotas */
export async function obtenerIdsMisMascotas() {
  const response = await fetch(`${API_URL}/api/v1/mascotas/mis-mascotas?size=200`, {
    credentials: "include",
    headers: headersSesion,
  });
  if (!response.ok) {
    throw new Error(`Error al obtener tus mascotas: ${response.status}`);
  }
  const data = await response.json();
  return new Set((data.content ?? data).map((m) => m.idMascota));
}

/* estado: "EXTRAVIADO" | "ENCONTRADO" | "REUNIFICADO" — solo el dueño puede (lo valida ms-mascotas) */
export async function cambiarEstadoMascota(id, estado) {
  const response = await fetch(`${API_URL}/api/v1/mascotas/${id}/estado`, {
    method: "PATCH",
    credentials: "include",
    headers: headersSesion,
    body: JSON.stringify({ estado }),
  });
  if (!response.ok) {
    throw new Error(`No se pudo actualizar el estado (${response.status})`);
  }
  return mapMascota(await response.json());
}
