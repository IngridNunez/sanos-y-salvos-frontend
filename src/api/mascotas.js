const API_URL = import.meta.env.VITE_API_URL;

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
    // el backend no tiene un campo de sector/dirección, solo coordenadas
    sector: "—",
    // ms-mascotas devuelve la ubicación redondeada (~1 km) por privacidad
    // fecha cruda (ISO) para filtrar por rango en las estadísticas del Home
    fechaISO: m.fecha ?? null,
    lat: m.ubicacion?.latitud ?? null,
    lng: m.ubicacion?.longitud ?? null,
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

// no hay subida de imagenes real todavia: se usa una foto de stock segun la especie
const FOTO_PLACEHOLDER = {
  PERRO: "https://images.unsplash.com/photo-1547482354-89d4259dbc4b?w=600&h=600&fit=crop&auto=format",
  GATO: "https://images.unsplash.com/photo-1682839764237-2f7f7515f252?w=600&h=600&fit=crop&auto=format",
  OTRO: "https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=600&h=600&fit=crop&auto=format",
};

/* form: lo que junta ReportForm.jsx | tab: "extraviada" | "encontrada" */
export async function crearMascota(form, tab, correoUsuario) {
  const tipoMascota = SPECIES_A_TIPO[form.species] ?? "OTRO";

  const caracteristicas = {};
  if (form.breed) caracteristicas.raza = form.breed;
  if (form.color) caracteristicas.color = form.color;
  if (form.pattern) caracteristicas.patron = form.pattern;
  if (form.size) caracteristicas.tamaño = form.size;

  const body = {
    tipoMascota,
    nombre: form.name,
    fotografia: FOTO_PLACEHOLDER[tipoMascota],
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

function authHeaders(tokens) {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${tokens.accessToken}`,
    "X-Id-Token": `Bearer ${tokens.idToken}`,
    "X-Refresh-Token": tokens.refreshToken,
  };
}

/* ids de las mascotas que reportó el usuario logueado — el listado público no trae
 * usuarioId (privacidad), así que "soy el dueño" se resuelve con /mis-mascotas */
export async function obtenerIdsMisMascotas(tokens) {
  const response = await fetch(`${API_URL}/api/v1/mascotas/mis-mascotas?size=200`, {
    headers: authHeaders(tokens),
  });
  if (!response.ok) {
    throw new Error(`Error al obtener tus mascotas: ${response.status}`);
  }
  const data = await response.json();
  return new Set((data.content ?? data).map((m) => m.idMascota));
}

/* estado: "EXTRAVIADO" | "ENCONTRADO" | "REUNIFICADO" — solo el dueño puede (lo valida ms-mascotas) */
export async function cambiarEstadoMascota(id, estado, tokens) {
  const response = await fetch(`${API_URL}/api/v1/mascotas/${id}/estado`, {
    method: "PATCH",
    headers: authHeaders(tokens),
    body: JSON.stringify({ estado }),
  });
  if (!response.ok) {
    throw new Error(`No se pudo actualizar el estado (${response.status})`);
  }
  return mapMascota(await response.json());
}
