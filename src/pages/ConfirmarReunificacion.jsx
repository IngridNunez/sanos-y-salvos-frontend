import { useState } from "react";
import { useParams, useSearchParams, Link } from "react-router";
import { confirmarReunificacion } from "@/api/mascotas";

// Página pública (sin login) a la que llega el link del correo de contacto.
// A propósito el link NO confirma solo al abrirse: algunos clientes de correo
// y filtros antispam "abren" los links para escanearlos, y eso dispararía la
// reunificación sin que nadie haya hecho clic de verdad. Por eso hace falta
// este paso intermedio con un botón.
export default function ConfirmarReunificacion() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [estado, setEstado] = useState("inicial"); // inicial | confirmando | ok | error
  const [resultado, setResultado] = useState(null);
  const [errorMensaje, setErrorMensaje] = useState(null);

  const confirmar = async () => {
    setEstado("confirmando");
    try {
      const r = await confirmarReunificacion(id, token);
      setResultado(r);
      setEstado("ok");
    } catch (err) {
      setErrorMensaje(mensajeDeError(err));
      setEstado("error");
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] py-10 flex items-center justify-center">
      <div className="max-w-md w-full mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-3xl p-8 shadow-sm text-center">
          {!token ? (
            <>
              <div className="text-5xl mb-4">⚠️</div>
              <h1 className="font-black text-xl text-[var(--color-text)] mb-2">Link incompleto</h1>
              <p className="text-sm text-[var(--color-muted)]">
                Este link no trae la información necesaria para confirmar. Revisa que lo hayas
                copiado completo desde el correo.
              </p>
            </>
          ) : estado === "inicial" || estado === "confirmando" ? (
            <>
              <div className="text-5xl mb-4">🐾</div>
              <h1 className="font-black text-xl text-[var(--color-text)] mb-2">¿Confirmas la reunificación?</h1>
              <p className="text-sm text-[var(--color-muted)] mb-6">
                Si recuperaste a tu mascota gracias a esta persona, confirma para cerrar el
                reporte y avisar que ya está en casa.
              </p>
              <button
                onClick={confirmar}
                disabled={estado === "confirmando"}
                className="w-full py-3.5 bg-[var(--color-secondary)] text-white font-bold rounded-2xl hover:bg-[#83925a] transition-colors text-sm disabled:opacity-60"
              >
                {estado === "confirmando" ? "Confirmando..." : "🎉 Sí, confirmar"}
              </button>
            </>
          ) : estado === "ok" ? (
            <>
              <div className="text-5xl mb-4">🎉</div>
              <h1 className="font-black text-xl text-[var(--color-text)] mb-2">
                {resultado === "YA_REUNIFICADA" ? "Este reporte ya estaba confirmado" : "¡Listo!"}
              </h1>
              <p className="text-sm text-[var(--color-muted)] mb-6">
                {resultado === "YA_REUNIFICADA"
                  ? "Alguien ya había confirmado esta reunificación antes."
                  : "El reporte quedó marcado como reunificado. Gracias por ayudar a que las mascotas vuelvan a casa."}
              </p>
              <Link
                to="/"
                className="inline-block px-5 py-2.5 bg-[var(--color-primary)] text-white font-bold rounded-2xl hover:bg-[var(--color-primary-dark)] transition-colors text-sm"
              >
                Ir al inicio
              </Link>
            </>
          ) : (
            <>
              <div className="text-5xl mb-4">😕</div>
              <h1 className="font-black text-xl text-[var(--color-text)] mb-2">No se pudo confirmar</h1>
              <p className="text-sm text-[var(--color-muted)]">{errorMensaje}</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function mensajeDeError(err) {
  if (err.resultado === "TOKEN_EXPIRADO") {
    return "Este link ya venció. Si todavía necesitas confirmar, pide que te contacten de nuevo.";
  }
  if (err.resultado === "TOKEN_INVALIDO" || err.status === 404) {
    return "Este link no es válido o ya fue usado.";
  }
  return "Ocurrió un error inesperado. Intenta de nuevo en un rato.";
}
