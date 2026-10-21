import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import { useAuth } from "@/context/AuthContext";
import ThemeToggle from "./ThemeToggle";

const navLinks = [
  { label: "Inicio", to: "/" },
  { label: "Mascotas Extraviadas", to: "/buscar?status=extraviada" },
  { label: "Mascotas Encontradas", to: "/buscar?status=encontrada" },
  { label: "Conócenos", to: "/conocenos" },
  { label: "Alianzas", to: "/alianzas" },
  { label: "Contacto", to: "/contacto" },
];

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cuentaAbierta, setCuentaAbierta] = useState(false);
  const cuentaRef = useRef(null);

  useEffect(() => {
    if (!cuentaAbierta) return;
    const cerrarSiEsFuera = (e) => {
      if (cuentaRef.current && !cuentaRef.current.contains(e.target)) setCuentaAbierta(false);
    };
    document.addEventListener("mousedown", cerrarSiEsFuera);
    return () => document.removeEventListener("mousedown", cerrarSiEsFuera);
  }, [cuentaAbierta]);

  const handleReport = () => {
    if (!user) {
      navigate("/login?redirect=/reportar");
    } else {
      navigate("/reportar");
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-[var(--color-border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <svg width="36" height="36" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
              <path
                d="M20 34C20 34 4 24.5 4 14.5C4 9 8 5 13 5C16 5 18.5 6.5 20 9C21.5 6.5 24 5 27 5C32 5 36 9 36 14.5C36 24.5 20 34 20 34Z"
                fill="white"
                stroke="var(--color-primary)"
                strokeWidth="2.5"
              />
              <ellipse cx="21" cy="24" rx="6.5" ry="5.5" fill="var(--color-primary)" />
              <ellipse cx="13" cy="16" rx="2.8" ry="3.4" fill="var(--color-primary)" transform="rotate(-15 13 16)" />
              <ellipse cx="18.5" cy="12.5" rx="2.8" ry="3.4" fill="var(--color-primary)" />
              <ellipse cx="24" cy="12.5" rx="2.8" ry="3.4" fill="var(--color-primary)" />
              <ellipse cx="29" cy="16" rx="2.8" ry="3.4" fill="var(--color-primary)" transform="rotate(15 29 16)" />
            </svg>
            <div>
              <span className="font-black text-[var(--color-text)] text-base leading-none block">
                Sanos y Salvos
              </span>
              <span className="text-[10px] text-[var(--color-primary)] font-semibold leading-none">
                Juntos los encontramos 🐾
              </span>
            </div>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden xl:flex items-center gap-0.5">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                className={`px-2.5 py-2 text-sm font-semibold rounded-xl whitespace-nowrap transition-colors hover:text-[var(--color-primary)] hover:bg-[var(--color-bg)] ${
                  location.pathname === link.to
                    ? "text-[var(--color-primary)] bg-[var(--color-bg)]"
                    : "text-[var(--color-text)]"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Auth buttons */}
          <div className="hidden xl:flex items-center gap-1.5 shrink-0">
            {user ? (
              <>
                <button
                  onClick={handleReport}
                  className="px-3 py-2 bg-[var(--color-primary)] text-white text-sm font-bold rounded-2xl whitespace-nowrap hover:bg-[var(--color-primary-dark)] transition-colors"
                >
                  + Reportar
                </button>
                <div className="relative" ref={cuentaRef}>
                  <button
                    onClick={() => setCuentaAbierta((v) => !v)}
                    className="px-3 py-2 text-[var(--color-text)] text-sm font-semibold rounded-2xl whitespace-nowrap hover:text-[var(--color-primary)] hover:bg-[var(--color-bg)] transition-colors flex items-center gap-1"
                  >
                    👤 Mi cuenta
                    <span className={`text-[10px] transition-transform ${cuentaAbierta ? "rotate-180" : ""}`}>▾</span>
                  </button>
                  {cuentaAbierta && (
                    <div className="absolute right-0 mt-2 w-44 bg-white rounded-2xl shadow-lg border border-[var(--color-border)] py-1.5 z-50">
                      <Link
                        to="/perfil"
                        onClick={() => setCuentaAbierta(false)}
                        className="block px-4 py-2 text-sm font-semibold text-[var(--color-text)] hover:bg-[var(--color-bg)] hover:text-[var(--color-primary)]"
                      >
                        👤 Mi perfil
                      </Link>
                      {user.esAdministrador && (
                        <Link
                          to="/admin"
                          onClick={() => setCuentaAbierta(false)}
                          className="block px-4 py-2 text-sm font-bold text-[var(--color-primary)] hover:bg-[var(--color-bg)]"
                        >
                          Administración
                        </Link>
                      )}
                    </div>
                  )}
                </div>
                <button
                  onClick={logout}
                  className="px-3 py-2 border-2 border-[var(--color-primary)] text-[var(--color-primary)] text-sm font-bold rounded-2xl whitespace-nowrap hover:bg-[var(--color-bg)] transition-colors"
                >
                  Salir
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 border-2 border-[var(--color-primary)] text-[var(--color-primary)] text-sm font-bold rounded-2xl whitespace-nowrap hover:bg-[var(--color-bg)] transition-colors"
                >
                  Iniciar sesión
                </Link>
                <Link
                  to="/login?mode=register"
                  className="px-4 py-2 bg-[var(--color-primary)] text-white text-sm font-bold rounded-2xl whitespace-nowrap hover:bg-[var(--color-primary-dark)] transition-colors flex items-center gap-1.5"
                >
                  <span>👤</span> Registrarme
                </Link>
              </>
            )}
          </div>

          <ThemeToggle className="ml-1" />

          {/* Mobile toggle */}
          <button
            className="xl:hidden p-2 rounded-xl text-[var(--color-text)]"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="xl:hidden bg-white border-t border-[var(--color-border)] px-4 py-4 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              className="block px-3 py-2.5 text-sm font-semibold rounded-xl text-[var(--color-text)] hover:text-[var(--color-primary)] hover:bg-[var(--color-bg)]"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2 flex flex-col gap-2">
            {user ? (
              <>
                <Link
                  to="/perfil"
                  className="block text-center px-4 py-2.5 text-[var(--color-text)] text-sm font-semibold rounded-2xl hover:bg-[var(--color-bg)]"
                  onClick={() => setMobileOpen(false)}
                >
                  👤 Mi perfil
                </Link>
                {user.esAdministrador && (
                  <Link
                    to="/admin"
                    className="block px-3 py-2.5 text-sm font-bold rounded-xl text-[var(--color-primary)] hover:bg-[var(--color-bg)]"
                    onClick={() => setMobileOpen(false)}
                  >
                    Administración
                  </Link>
                )}
                <button
                  onClick={() => { handleReport(); setMobileOpen(false); }}
                  className="px-4 py-2.5 bg-[var(--color-primary)] text-white text-sm font-bold rounded-2xl"
                >
                  + Reportar mascota
                </button>
                <button
                  onClick={() => { logout(); setMobileOpen(false); }}
                  className="px-4 py-2.5 border-2 border-[var(--color-primary)] text-[var(--color-primary)] text-sm font-bold rounded-2xl"
                >
                  Cerrar sesión
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block text-center px-4 py-2.5 border-2 border-[var(--color-primary)] text-[var(--color-primary)] text-sm font-bold rounded-2xl"
                  onClick={() => setMobileOpen(false)}
                >
                  Iniciar sesión
                </Link>
                <Link
                  to="/login?mode=register"
                  className="block text-center px-4 py-2.5 bg-[var(--color-primary)] text-white text-sm font-bold rounded-2xl"
                  onClick={() => setMobileOpen(false)}
                >
                  Registrarme
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
