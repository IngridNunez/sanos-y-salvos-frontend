import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router";
import { handleAuthCallback } from "@/auth/cognito";
import { useAuth } from "@/context/AuthContext";

export default function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { loginWithTokens } = useAuth();
  const [error, setError] = useState(null);
  const ranOnce = useRef(false);

  useEffect(() => {
    if (ranOnce.current) return;
    ranOnce.current = true;

    handleAuthCallback(searchParams)
      .then(({ tokens, redirectTo }) => {
        loginWithTokens(tokens);
        navigate(redirectTo, { replace: true });
      })
      .catch((err) => setError(err.message));
  }, [searchParams, loginWithTokens, navigate]);

  return (
    <div className="min-h-screen bg-[#FFECF2] flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl p-8 text-center">
        {error ? (
          <>
            <p className="font-black text-lg text-[#2B2B2B] mb-2">No se pudo iniciar sesión</p>
            <p className="text-sm text-[#8a7a80] mb-6">{error}</p>
            <Link to="/login" className="text-sm text-[#C46081] font-semibold hover:underline">
              Volver a intentar
            </Link>
          </>
        ) : (
          <p className="text-sm text-[#8a7a80]">Iniciando sesión...</p>
        )}
      </div>
    </div>
  );
}
