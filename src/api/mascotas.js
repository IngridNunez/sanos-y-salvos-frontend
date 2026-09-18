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
  // ###################################
  /* caracteristicas es un mapa libre: ahi vienen raza/tamaño/color/etc
   * cuando el que reporto los cargo, no siempre estan todos */
  const c = m.caracteristicas ?? {};
  // ###################################
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
  };
}

export async function obtenerMascotas() {
  const response = await fetch(`${API_URL}/api/v1/mascotas`);
  if (!response.ok) {
    throw new Error(`Error al obtener mascotas: ${response.status}`);
  }
  const data = await response.json();
  const contenido = data.content ?? data;
  return contenido.map(mapMascota);
}

// ###################################
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
// ###################################
