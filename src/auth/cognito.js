import { generateCodeVerifier, generateCodeChallenge, generateState, decodeBase64Url } from "./pkce";

const domain = import.meta.env.VITE_COGNITO_DOMAIN;
const clientId = import.meta.env.VITE_COGNITO_CLIENT_ID;
const redirectUri = import.meta.env.VITE_COGNITO_REDIRECT_URI;
const logoutUri = import.meta.env.VITE_COGNITO_LOGOUT_URI;
const scope = import.meta.env.VITE_COGNITO_SCOPE || "openid email profile";

const PKCE_VERIFIER_KEY = "cognito_pkce_verifier";
const STATE_KEY = "cognito_oauth_state";
const POST_LOGIN_REDIRECT_KEY = "cognito_post_login_redirect";

export async function redirectToLogin({ identityProvider, redirectTo = "/" } = {}) {
  const verifier = generateCodeVerifier();
  const challenge = await generateCodeChallenge(verifier);
  const state = generateState();

  sessionStorage.setItem(PKCE_VERIFIER_KEY, verifier);
  sessionStorage.setItem(STATE_KEY, state);
  sessionStorage.setItem(POST_LOGIN_REDIRECT_KEY, redirectTo);

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    scope,
    redirect_uri: redirectUri,
    state,
    code_challenge: challenge,
    code_challenge_method: "S256",
  });

  if (identityProvider) params.set("identity_provider", identityProvider);

  window.location.assign(`${domain}/oauth2/authorize?${params.toString()}`);
}

export async function handleAuthCallback(searchParams) {
  const error = searchParams.get("error");
  if (error) {
    throw new Error(searchParams.get("error_description") || error);
  }

  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const expectedState = sessionStorage.getItem(STATE_KEY);
  const verifier = sessionStorage.getItem(PKCE_VERIFIER_KEY);

  if (!code || !state || !verifier || state !== expectedState) {
    throw new Error("No se pudo validar la respuesta de inicio de sesión.");
  }

  sessionStorage.removeItem(STATE_KEY);
  sessionStorage.removeItem(PKCE_VERIFIER_KEY);

  const response = await fetch(`${domain}/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      client_id: clientId,
      code,
      redirect_uri: redirectUri,
      code_verifier: verifier,
    }),
  });

  if (!response.ok) {
    throw new Error("No se pudieron obtener los tokens de sesión.");
  }

  const tokens = await response.json();
  const redirectTo = sessionStorage.getItem(POST_LOGIN_REDIRECT_KEY) || "/";
  sessionStorage.removeItem(POST_LOGIN_REDIRECT_KEY);

  return { tokens, redirectTo };
}

export function buildLogoutUrl() {
  const params = new URLSearchParams({ client_id: clientId, logout_uri: logoutUri });
  return `${domain}/logout?${params.toString()}`;
}

export function decodeIdToken(idToken) {
  return JSON.parse(decodeBase64Url(idToken.split(".")[1]));
}
