import { apiFetch } from "./client";

// Formas reales de ms-mascotas (ver CrearMascotaDTO/MascotaResponseDTO) —
// deliberadamente distintas del mock de src/data/pets.js:
//   - id se llama idMascota (ObjectId de Mongo, string).
//   - no hay breed/color/pattern/size/comuna/sector como campos fijos: van
//     dentro de caracteristicas (Map<String,Object> dinámico).
//   - ubicacion es un objeto { latitud, longitud }, ya redondeado por
//     privacidad en las respuestas públicas — no esperar precisión de metros.
//   - emailContacto es obligatorio al crear, pero nunca viene en la
//     respuesta (no se expone públicamente).

export function listarMascotas({ estado, tipoMascota, page, size } = {}) {
  return apiFetch("/mascotas", {
    params: { estado, tipoMascota, page, size },
  });
}

export function obtenerMascota(id) {
  return apiFetch(`/mascotas/${id}`);
}

export function listarMisMascotas({ token, page, size }) {
  return apiFetch("/mascotas/mis-mascotas", { token, params: { page, size } });
}

/**
 * @param {object} dto
 * @param {"PERRO"|"GATO"|"CONEJO"|"OTRO"} dto.tipoMascota
 * @param {"EXTRAVIADO"|"ENCONTRADO"} dto.estado
 * @param {{latitud:number, longitud:number}} dto.ubicacion
 * @param {string} dto.emailContacto
 * @param {Record<string, unknown>} [dto.caracteristicas]
 * @param {string} token access_token de Cognito — todavía no disponible
 *   hasta que se mergee feature/auth-cognito-google.
 */
export function crearMascota(dto, token) {
  return apiFetch("/mascotas", { method: "POST", token, body: dto });
}

export function actualizarEstadoMascota(id, estado, token) {
  return apiFetch(`/mascotas/${id}/estado`, { method: "PATCH", token, body: { estado } });
}
