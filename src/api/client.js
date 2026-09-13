// Wrapper mínimo sobre fetch para hablar con el BFF (o el API Gateway en
// AWS). No importa nada de src/context/AuthContext a propósito: el token se
// recibe como parámetro en cada llamada, así este módulo no depende de cómo
// termine mergeándose el login real de Cognito (feature/auth-cognito-google).
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export class ApiError extends Error {
  constructor(status, body) {
    super(body?.message || `Error ${status} al llamar a la API`);
    this.status = status;
    this.body = body;
  }
}

export async function apiFetch(path, { method = "GET", token, body, params } = {}) {
  if (!BASE_URL) {
    throw new Error(
      "VITE_API_BASE_URL no está configurada — copia .env.example a .env.local antes de conectar datos reales."
    );
  }

  const url = new URL(BASE_URL + path);
  if (params) {
    Object.entries(params)
      .filter(([, v]) => v !== undefined && v !== null && v !== "")
      .forEach(([k, v]) => url.searchParams.set(k, v));
  }

  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    let errorBody = null;
    try {
      errorBody = await response.json();
    } catch {
      // el error puede no traer cuerpo JSON (ej. 401 del propio Gateway)
    }
    throw new ApiError(response.status, errorBody);
  }

  if (response.status === 204) return null;
  return response.json();
}
