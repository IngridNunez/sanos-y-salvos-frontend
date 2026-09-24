import { CognitoUser, CognitoUserPool, AuthenticationDetails, CognitoUserAttribute } from "amazon-cognito-identity-js";
import { generateCodeVerifier, generateCodeChallenge, generateState, decodeBase64Url } from "./pkce";

const domain = import.meta.env.VITE_COGNITO_DOMAIN;
const clientId = import.meta.env.VITE_COGNITO_CLIENT_ID;
const redirectUri = import.meta.env.VITE_COGNITO_REDIRECT_URI;
const logoutUri = import.meta.env.VITE_COGNITO_LOGOUT_URI;
const scope = import.meta.env.VITE_COGNITO_SCOPE || "openid email profile";
const userPoolId = import.meta.env.VITE_COGNITO_USER_POOL_ID;

/* amazon-cognito-identity-js guarda sus tokens solo en localStorage por
 * defecto durante el SRP handshake. Con un Storage en memoria (se pierde al
 * recargar la página) evitamos que queden ahí — los tokens que igual
 * necesitamos se sacan del callback onSuccess y se mandan al bff, que es
 * quien los persiste como cookie httpOnly. */
class MemoryStorage {
  constructor() {
    this.datos = {};
  }
  getItem(clave) {
    return Object.prototype.hasOwnProperty.call(this.datos, clave) ? this.datos[clave] : null;
  }
  setItem(clave, valor) {
    this.datos[clave] = valor;
  }
  removeItem(clave) {
    delete this.datos[clave];
  }
  clear() {
    this.datos = {};
  }
}

/* login con correo/contraseña directo contra Cognito (SRP, sin Hosted UI) */
const userPool = new CognitoUserPool({ UserPoolId: userPoolId, ClientId: clientId, Storage: new MemoryStorage() });

/* Cognito manda sus errores en ingles (err.code identifica el tipo); se traducen los mas comunes */
const MENSAJES_ERROR = {
  NotAuthorizedException: "Correo o contraseña incorrectos.",
  UserNotFoundException: "No existe una cuenta con ese correo.",
  UserNotConfirmedException: "Tu cuenta todavía no está confirmada. Revisa tu correo.",
  UsernameExistsException: "Ya existe una cuenta con ese correo.",
  CodeMismatchException: "El código ingresado no es correcto.",
  ExpiredCodeException: "El código venció, solicita uno nuevo.",
  LimitExceededException: "Demasiados intentos. Espera un momento antes de volver a intentar.",
  TooManyRequestsException: "Demasiados intentos. Espera un momento antes de volver a intentar.",
  InvalidParameterException: "Revisa los datos ingresados.",
};

const FRAGMENTOS_POLITICA_PASSWORD = [
  [/password not long enough/i, "debe ser más larga"],
  [/password must have uppercase characters/i, "debe tener al menos una mayúscula"],
  [/password must have lowercase characters/i, "debe tener al menos una minúscula"],
  [/password must have numeric characters/i, "debe tener al menos un número"],
  [/password must have symbol characters/i, "debe tener al menos un símbolo (ej: ! @ # $ %)"],
];

function traducirErrorCognito(err, mensajePorDefecto) {
  if (err.code === "InvalidPasswordException" && err.message) {
    // el mensaje real trae el requisito puntual que falta (largo, mayuscula, etc.)
    // no lo reemplazamos por uno generico para no decir algo inexacto
    let detalle = err.message.replace(/^Password did not conform with policy:\s*/i, "");
    for (const [patron, traduccion] of FRAGMENTOS_POLITICA_PASSWORD) {
      if (patron.test(detalle)) {
        detalle = traduccion;
        break;
      }
    }
    return new Error(`La contraseña ${detalle}.`);
  }
  return new Error(MENSAJES_ERROR[err.code] || err.message || mensajePorDefecto);
}

export function loginConCorreo(email, password) {
  return new Promise((resolve, reject) => {
    const user = new CognitoUser({ Username: email, Pool: userPool });
    const authDetails = new AuthenticationDetails({ Username: email, Password: password });

    user.authenticateUser(authDetails, {
      onSuccess: (session) => {
        resolve({
          access_token: session.getAccessToken().getJwtToken(),
          id_token: session.getIdToken().getJwtToken(),
          refresh_token: session.getRefreshToken().getToken(),
          expires_in: session.getAccessToken().getExpiration() - Math.floor(Date.now() / 1000),
        });
      },
      onFailure: (err) => {
        reject(traducirErrorCognito(err, "No se pudo iniciar sesión."));
      },
      newPasswordRequired: () => {
        reject(new Error("Tu cuenta requiere cambiar la contraseña antes de poder ingresar."));
      },
    });
  });
}

/* crea la cuenta en Cognito; queda sin confirmar hasta que se valide el codigo enviado al correo */
export function registrarUsuario(email, password) {
  return new Promise((resolve, reject) => {
    const attributes = [new CognitoUserAttribute({ Name: "email", Value: email })];
    userPool.signUp(email, password, attributes, null, (err, result) => {
      if (err) {
        reject(traducirErrorCognito(err, "No se pudo crear la cuenta."));
        return;
      }
      resolve(result);
    });
  });
}

export function confirmarRegistro(email, codigo) {
  return new Promise((resolve, reject) => {
    const user = new CognitoUser({ Username: email, Pool: userPool });
    user.confirmRegistration(codigo, true, (err, result) => {
      if (err) {
        reject(traducirErrorCognito(err, "Código inválido o vencido."));
        return;
      }
      resolve(result);
    });
  });
}

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
