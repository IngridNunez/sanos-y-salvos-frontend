import { useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router";
import { redirectToLogin, loginConCorreo, registrarUsuario, confirmarRegistro } from "@/auth/cognito";
import { useAuth } from "@/context/AuthContext";

export default function Login() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithTokens } = useAuth();

  const redirect = searchParams.get("redirect") || "/";
  const isRegisterMode = searchParams.get("mode") === "register";

  const handleGoogleLogin = () => {
    redirectToLogin({ identityProvider: "Google", redirectTo: redirect });
  };

  const cambiarModo = (modo) => {
    const params = { redirect };
    if (modo === "register") params.mode = "register";
    setSearchParams(params);
    setStep("form");
    setError(null);
  };

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [codigo, setCodigo] = useState("");
  const [aceptaTerminos, setAceptaTerminos] = useState(false);
  const [aceptaPrivacidad, setAceptaPrivacidad] = useState(false);
  const [step, setStep] = useState("form"); // "form" | "confirm" (solo en registro)
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const tokens = await loginConCorreo(email, password);
      await loginWithTokens(tokens);
      navigate(redirect, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!aceptaTerminos || !aceptaPrivacidad) {
      setError("Debes aceptar los Términos de servicio y la Política de privacidad.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await registrarUsuario(email, password);
      setStep("confirm");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await confirmarRegistro(email, codigo);
      // cuenta ya verificada: logueamos directo con las mismas credenciales
      const tokens = await loginConCorreo(email, password);
      await loginWithTokens(tokens);
      navigate(redirect, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFECF2] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#C46081] rounded-3xl flex items-center justify-center text-white text-3xl mx-auto mb-4 shadow-lg shadow-[#C46081]/30">
              🐾
            </div>
            <h1 className="font-black text-2xl text-[#C46081] leading-tight">Sanos y Salvos</h1>
            <p className="text-xs text-[#8a7a80] mt-0.5">Juntos los encontramos</p>
          </div>

          {/* Tabs login/registro */}
          <div className="bg-[#FFECF2] rounded-2xl p-1 flex mb-6">
            <button
              type="button"
              onClick={() => cambiarModo("login")}
              className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all ${
                !isRegisterMode ? "bg-white text-[#C46081] shadow-sm" : "text-[#8a7a80]"
              }`}
            >
              Iniciar sesión
            </button>
            <button
              type="button"
              onClick={() => cambiarModo("register")}
              className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all ${
                isRegisterMode ? "bg-white text-[#C46081] shadow-sm" : "text-[#8a7a80]"
              }`}
            >
              Registrarme
            </button>
          </div>

          {isRegisterMode && step === "confirm" ? (
            <>
              <h2 className="font-black text-xl text-[#2B2B2B] text-center mb-2">
                Revisa tu correo
              </h2>
              <p className="text-sm text-[#8a7a80] text-center mb-8">
                Te enviamos un código a <span className="font-semibold">{email}</span>. Ingrésalo para confirmar tu cuenta.
              </p>
              <form onSubmit={handleConfirmCode} className="space-y-3">
                <input
                  type="text"
                  required
                  placeholder="Código de confirmación"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border-2 border-[#f0d5df] text-sm text-center tracking-widest focus:outline-none focus:border-[#C46081] transition-colors"
                />
                {error && <p className="text-xs text-[#C46081] font-semibold">{error}</p>}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-[#C46081] text-white font-bold rounded-2xl hover:bg-[#a84e6c] transition-colors disabled:opacity-50"
                >
                  {loading ? "Confirmando..." : "Confirmar cuenta"}
                </button>
              </form>
            </>
          ) : (
            <>
              <h2 className="font-black text-xl text-[#2B2B2B] text-center mb-2">
                {isRegisterMode ? "Crea tu cuenta" : (<>Inicia sesión para ayudar<br />a reunir mascotas</>)}
              </h2>
              <p className="text-sm text-[#8a7a80] text-center mb-8">
                {isRegisterMode
                  ? "Regístrate para poder reportar mascotas."
                  : "Accede para reportar mascotas o gestionar tus reportes."}
              </p>

              {/* Google button */}
              <button
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-3 px-4 py-3.5 border-2 border-[#dadce0] rounded-2xl text-sm font-semibold text-[#2B2B2B] hover:bg-gray-50 transition-colors shadow-sm"
              >
                {/* Google logo SVG */}
                <svg width="18" height="18" viewBox="0 0 18 18">
                  <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                  <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
                  <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                  <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
                </svg>
                Continuar con Google
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-[#f0d5df]" />
                <span className="text-xs text-[#8a7a80]">o con tu correo</span>
                <div className="flex-1 h-px bg-[#f0d5df]" />
              </div>

              {/* Email/password form */}
              <form onSubmit={isRegisterMode ? handleRegister : handleEmailLogin} className="space-y-3">
                <input
                  type="email"
                  required
                  placeholder="Correo electrónico"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border-2 border-[#f0d5df] text-sm focus:outline-none focus:border-[#C46081] transition-colors"
                />
                <input
                  type="password"
                  required
                  placeholder="Contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border-2 border-[#f0d5df] text-sm focus:outline-none focus:border-[#C46081] transition-colors"
                />
                {isRegisterMode && (
                  <>
                    <p className="text-xs text-[#8a7a80] -mt-1">Mínimo 8 caracteres.</p>
                    <input
                      type="password"
                      required
                      placeholder="Confirmar contraseña"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl border-2 border-[#f0d5df] text-sm focus:outline-none focus:border-[#C46081] transition-colors"
                    />
                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={aceptaTerminos}
                        onChange={(e) => setAceptaTerminos(e.target.checked)}
                        className="mt-0.5"
                      />
                      <span className="text-xs text-[#8a7a80] leading-relaxed">
                        Acepto los{" "}
                        <Link to="/terminos" target="_blank" className="text-[#C46081] font-semibold hover:underline">
                          Términos de servicio
                        </Link>
                        .
                      </span>
                    </label>
                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={aceptaPrivacidad}
                        onChange={(e) => setAceptaPrivacidad(e.target.checked)}
                        className="mt-0.5"
                      />
                      <span className="text-xs text-[#8a7a80] leading-relaxed">
                        Acepto la{" "}
                        <Link to="/privacidad" target="_blank" className="text-[#C46081] font-semibold hover:underline">
                          Política de privacidad
                        </Link>
                        .
                      </span>
                    </label>
                  </>
                )}
                {error && <p className="text-xs text-[#C46081] font-semibold">{error}</p>}
                <button
                  type="submit"
                  disabled={loading || (isRegisterMode && (!aceptaTerminos || !aceptaPrivacidad))}
                  className="w-full py-3.5 bg-[#C46081] text-white font-bold rounded-2xl hover:bg-[#a84e6c] transition-colors disabled:opacity-50"
                >
                  {loading ? "Un momento..." : isRegisterMode ? "Crear cuenta" : "Iniciar sesión"}
                </button>
              </form>
            </>
          )}

          {/* Legal (solo en login; en registro ya está el checkbox obligatorio) */}
          {!isRegisterMode && (
            <p className="text-xs text-[#8a7a80] text-center mt-6 leading-relaxed">
              Al continuar, aceptas nuestros{" "}
              <Link to="/terminos" className="text-[#C46081] font-semibold hover:underline">Términos de servicio</Link>{" "}
              y{" "}
              <Link to="/privacidad" className="text-[#C46081] font-semibold hover:underline">Política de privacidad</Link>.
            </p>
          )}
        </div>

        <div className="text-center mt-5">
          <Link to="/" className="text-sm text-[#8a7a80] hover:text-[#C46081] transition-colors font-semibold">
            ← Volver al inicio sin sesión
          </Link>
        </div>
      </div>
    </div>
  );
}
