import { useNavigate, useSearchParams, Link } from "react-router";
import { useAuth } from "@/context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();

  const redirect = searchParams.get("redirect") || "/";

  const handleGoogleLogin = () => {
    // Simulate Google login
    login({
      name: "María González",
      email: "maria@ejemplo.cl",
    });
    navigate(redirect);
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

          <h2 className="font-black text-xl text-[#2B2B2B] text-center mb-2">
            Inicia sesión para ayudar<br />a reunir mascotas
          </h2>
          <p className="text-sm text-[#8a7a80] text-center mb-8">
            Accede para reportar mascotas o gestionar tus reportes.
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

          {/* Legal */}
          <p className="text-xs text-[#8a7a80] text-center mt-6 leading-relaxed">
            Al continuar, aceptas nuestros{" "}
            <a href="#" className="text-[#C46081] font-semibold hover:underline">Términos de servicio</a>{" "}
            y{" "}
            <a href="#" className="text-[#C46081] font-semibold hover:underline">Política de privacidad</a>.
          </p>
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
