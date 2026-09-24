import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import { useAuth } from "@/context/AuthContext";

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

  const handleReport = () => {
    if (!user) {
      navigate("/login?redirect=/reportar");
    } else {
      navigate("/reportar");
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-[#f0d5df]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <svg width="36" height="36" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
              <path
                d="M20 34C20 34 4 24.5 4 14.5C4 9 8 5 13 5C16 5 18.5 6.5 20 9C21.5 6.5 24 5 27 5C32 5 36 9 36 14.5C36 24.5 20 34 20 34Z"
                fill="white"
                stroke="#C46081"
                strokeWidth="2.5"
              />
              <ellipse cx="21" cy="24" rx="6.5" ry="5.5" fill="#C46081" />
              <ellipse cx="13" cy="16" rx="2.8" ry="3.4" fill="#C46081" transform="rotate(-15 13 16)" />
              <ellipse cx="18.5" cy="12.5" rx="2.8" ry="3.4" fill="#C46081" />
              <ellipse cx="24" cy="12.5" rx="2.8" ry="3.4" fill="#C46081" />
              <ellipse cx="29" cy="16" rx="2.8" ry="3.4" fill="#C46081" transform="rotate(15 29 16)" />
            </svg>
            <div>
              <span className="font-black text-[#2B2B2B] text-base leading-none block">
                Sanos y Salvos
              </span>
              <span className="text-[10px] text-[#C46081] font-semibold leading-none">
                Juntos los encontramos 🐾
              </span>
            </div>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                className={`px-3 py-2 text-sm font-semibold rounded-xl transition-colors hover:text-[#C46081] hover:bg-[#FFECF2] ${
                  location.pathname === link.to
                    ? "text-[#C46081] bg-[#FFECF2]"
                    : "text-[#2B2B2B]"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Auth buttons */}
          <div className="hidden lg:flex items-center gap-2">
            {user ? (
              <>
                <button
                  onClick={handleReport}
                  className="px-4 py-2 bg-[#C46081] text-white text-sm font-bold rounded-2xl hover:bg-[#a84e6c] transition-colors"
                >
                  + Reportar
                </button>
                <button
                  onClick={logout}
                  className="px-4 py-2 border-2 border-[#C46081] text-[#C46081] text-sm font-bold rounded-2xl hover:bg-[#FFECF2] transition-colors"
                >
                  Cerrar sesión
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 border-2 border-[#C46081] text-[#C46081] text-sm font-bold rounded-2xl hover:bg-[#FFECF2] transition-colors"
                >
                  Iniciar sesión
                </Link>
                <Link
                  to="/login?mode=register"
                  className="px-4 py-2 bg-[#C46081] text-white text-sm font-bold rounded-2xl hover:bg-[#a84e6c] transition-colors flex items-center gap-1.5"
                >
                  <span>👤</span> Registrarme
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            className="lg:hidden p-2 rounded-xl text-[#2B2B2B]"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-white border-t border-[#f0d5df] px-4 py-4 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              className="block px-3 py-2.5 text-sm font-semibold rounded-xl text-[#2B2B2B] hover:text-[#C46081] hover:bg-[#FFECF2]"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2 flex flex-col gap-2">
            {user ? (
              <>
                <button
                  onClick={() => { handleReport(); setMobileOpen(false); }}
                  className="px-4 py-2.5 bg-[#C46081] text-white text-sm font-bold rounded-2xl"
                >
                  + Reportar mascota
                </button>
                <button
                  onClick={() => { logout(); setMobileOpen(false); }}
                  className="px-4 py-2.5 border-2 border-[#C46081] text-[#C46081] text-sm font-bold rounded-2xl"
                >
                  Cerrar sesión
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block text-center px-4 py-2.5 border-2 border-[#C46081] text-[#C46081] text-sm font-bold rounded-2xl"
                  onClick={() => setMobileOpen(false)}
                >
                  Iniciar sesión
                </Link>
                <Link
                  to="/login?mode=register"
                  className="block text-center px-4 py-2.5 bg-[#C46081] text-white text-sm font-bold rounded-2xl"
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
