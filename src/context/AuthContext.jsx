/* eslint-disable react-refresh/only-export-components -- el hook useAuth vive junto a su Provider a propósito */
import { createContext, useContext, useEffect, useState } from "react";
import { buildLogoutUrl, decodeIdToken } from "@/auth/cognito";

const API_URL = import.meta.env.VITE_API_URL;

/* Los tokens ya no se guardan en el frontend (ni en localStorage ni en este
 * contexto): el bff los recibe una vez en /auth/session y los devuelve como
 * cookies httpOnly, invisibles para JavaScript. Acá solo se guarda el
 * usuario (nombre/correo) para mostrar en la UI. */
const AuthContext = createContext({
  user: null,
  cargandoSesion: true,
  loginWithTokens: () => {},
  logout: () => {},
});

function usuarioDesdeIdToken(idToken) {
  const claims = decodeIdToken(idToken);
  return { name: claims.name || claims.email, email: claims.email };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [cargandoSesion, setCargandoSesion] = useState(true);

  /* al cargar la app, pregunta al bff si ya hay una sesión activa (cookie) */
  useEffect(() => {
    fetch(`${API_URL}/api/v1/auth/me`, { credentials: "include" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => setUser(data ? { name: data.nombre, email: data.email } : null))
      .catch(() => setUser(null))
      .finally(() => setCargandoSesion(false));
  }, []);

  const loginWithTokens = async (tokens) => {
    const response = await fetch(`${API_URL}/api/v1/auth/session`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json", "X-Requested-With": "web" },
      body: JSON.stringify({
        accessToken: tokens.access_token,
        idToken: tokens.id_token,
        refreshToken: tokens.refresh_token,
      }),
    });

    if (!response.ok) {
      throw new Error("No se pudo iniciar sesión.");
    }

    setUser(usuarioDesdeIdToken(tokens.id_token));
  };

  const logout = async () => {
    await fetch(`${API_URL}/api/v1/auth/logout`, {
      method: "POST",
      credentials: "include",
      headers: { "X-Requested-With": "web" },
    }).catch(() => {}); /* si falla igual seguimos con el logout del lado de Cognito */
    setUser(null);
    window.location.assign(buildLogoutUrl());
  };

  return (
    <AuthContext.Provider value={{ user, cargandoSesion, loginWithTokens, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
