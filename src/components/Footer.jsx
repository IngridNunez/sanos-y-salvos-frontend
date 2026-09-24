import { Link } from "react-router";

export default function Footer() {
  return (
    <footer id="contacto" className="bg-[#C46081] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center text-xl">
                🐾
              </div>
              <div>
                <span className="font-black text-lg leading-none block">Sanos y Salvos</span>
                <span className="text-xs text-white/70 leading-none">Juntos los encontramos 🐾</span>
              </div>
            </div>
            <p className="text-white/80 text-sm leading-relaxed">
              Plataforma comunitaria chilena que conecta personas, tecnología y amor para reunir mascotas perdidas con sus familias.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-bold mb-4">Navegar</h4>
            <ul className="space-y-2 text-sm text-white/80">
              <li><Link to="/" className="hover:text-white transition-colors">Inicio</Link></li>
              <li><Link to="/buscar?status=extraviada" className="hover:text-white transition-colors">Mascotas Extraviadas</Link></li>
              <li><Link to="/buscar?status=encontrada" className="hover:text-white transition-colors">Mascotas Encontradas</Link></li>
              <li><Link to="/conocenos" className="hover:text-white transition-colors">Conócenos</Link></li>
              <li><Link to="/alianzas" className="hover:text-white transition-colors">Alianzas</Link></li>
              <li><Link to="/contacto" className="hover:text-white transition-colors">Contacto</Link></li>
              <li><Link to="/#como-funciona" className="hover:text-white transition-colors">Cómo Funciona</Link></li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-bold mb-4">Síguenos</h4>
            <div className="flex gap-3 mb-4">
              <a href="#" className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center text-lg hover:bg-white/30 transition-colors">
                f
              </a>
              <a href="#" className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center text-lg hover:bg-white/30 transition-colors">
                📷
              </a>
              <a href="#" className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center text-lg hover:bg-white/30 transition-colors">
                💬
              </a>
            </div>
            <p className="text-white/70 text-xs">contacto@sanosysalvos.cl</p>
          </div>
        </div>

        <div className="border-t border-white/20 pt-6 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-white/60">
          <span>Sanos y Salvos © 2026 | Juntos los encontramos 🐾</span>
          <span>Desarrollado por <strong className="text-white/80">SpiderTech</strong></span>
        </div>
      </div>
    </footer>
  );
}
