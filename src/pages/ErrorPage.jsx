import { Link, useRouteError } from "react-router";

export default function ErrorPage() {
  const error = useRouteError();

  // Logueado para diagnóstico (consola, no en pantalla) — sin exponer el
  // stack trace crudo a quien usa la app, como hacía la pantalla por
  // defecto de React Router.
  if (error) console.error("Error de aplicación:", error);

  return (
    <div className="min-h-screen bg-[#FFECF2] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl p-10 text-center max-w-md w-full">
        <div className="text-6xl mb-4">🐾</div>
        <h2 className="font-black text-2xl text-[#2B2B2B] mb-3">Algo salió mal</h2>
        <p className="text-[#8a7a80] mb-6 text-sm leading-relaxed">
          Tuvimos un problema inesperado al mostrar esta página. A veces lo causa una extensión del
          navegador (como el traductor automático) — intenta recargar.
        </p>
        <div className="flex flex-col gap-2">
          <button
            onClick={() => window.location.reload()}
            className="w-full py-3.5 bg-[#C46081] text-white font-bold rounded-2xl hover:bg-[#a84e6c] transition-colors text-sm"
          >
            Recargar página
          </button>
          <Link
            to="/"
            className="w-full py-3 text-sm text-[#8a7a80] font-semibold hover:text-[#C46081] transition-colors"
          >
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
