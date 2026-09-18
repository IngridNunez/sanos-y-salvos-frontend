/* eslint-disable react-refresh/only-export-components -- el hook useAuth vive junto a su Provider a propósito */
import { createContext, useContext, useEffect, useState } from "react";
import { buildLogoutUrl, decodeIdToken } from "@/auth/cognito";

const SESSION_KEY = "sanosysalvos_session";

const AuthContext = createContext({
  user: null,
  accessToken: null,
  loginWithTokens: () => {},
  logout: () => {},
});

function sessionFromTokens(tokens) {
  const claims = decodeIdToken(tokens.id_token);
  return {
    user: {
      name: claims.name || claims.email,
      email: claims.email,
      picture: claims.picture,
    },
    accessToken: tokens.access_token,
    idToken: tokens.id_token,
    refreshToken: tokens.refresh_token,
    expiresAt: Date.now() + tokens.expires_in * 1000,
  };
}

function readStoredSession() {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    const session = JSON.parse(raw);
    if (session.expiresAt <= Date.now()) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
    return session;
  } catch {
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => readStoredSession());

  useEffect(() => {
    if (session) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
  }, [session]);

  const loginWithTokens = (tokens) => setSession(sessionFromTokens(tokens));

  const logout = () => {
    setSession(null);
    window.location.assign(buildLogoutUrl());
  };

  return (
    <AuthContext.Provider
      value={{
        user: session?.user ?? null,
        accessToken: session?.accessToken ?? null,
        idToken: session?.idToken ?? null, // ###################################
        refreshToken: session?.refreshToken ?? null, // ###################################
        loginWithTokens,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
