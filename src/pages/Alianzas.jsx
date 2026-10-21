import { Link } from "react-router";

const CORREO = "contacto@sanosysalvos.cl";

const TIPOS = [
  {
    icon: "🏥",
    color: "var(--color-primary)",
    titulo: "Veterinarias y clínicas",
    desc: "Actúan como punto de reporte institucional: registran mascotas encontradas que llegan a su atención y ayudan a contactar a sus dueños.",
  },
  {
    icon: "🏛️",
    color: "var(--color-secondary)",
    titulo: "Municipalidades",
    desc: "Difunden la plataforma entre sus vecinos y coordinan la búsqueda por comuna con sus equipos de tenencia responsable.",
  },
  {
    icon: "💗",
    color: "var(--color-accent)",
    titulo: "Fundaciones y organizaciones",
    desc: "Comparten reportes en su red, apoyan casos de mascotas encontradas y aportan experiencia en rescate y cuidado.",
  },
];

export default function Alianzas() {
  const mailto = `mailto:${CORREO}?subject=${encodeURIComponent("Quiero ser aliado de Sanos y Salvos")}`;
  return (
    <div className="min-h-screen bg-[var(--color-bg)] py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <header className="text-center max-w-3xl mx-auto">
          <h1 className="font-black text-4xl text-[var(--color-text)] mb-3">Alianzas</h1>
          <p className="text-[var(--color-muted)] leading-relaxed">
            Una mascota perdida se encuentra más rápido cuando toda la comunidad ayuda. Buscamos sumar
            organizaciones que compartan esa misión.
          </p>
        </header>

        <section className="grid md:grid-cols-3 gap-5">
          {TIPOS.map((t) => (
            <div key={t.titulo} className="bg-white rounded-3xl p-8 shadow-sm">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-4"
                style={{ backgroundColor: t.color + "25" }}
              >
                {t.icon}
              </div>
              <h2 className="font-black text-lg text-[var(--color-text)] mb-2">{t.titulo}</h2>
              <p className="text-sm text-[var(--color-muted)] leading-relaxed">{t.desc}</p>
            </div>
          ))}
        </section>

        <section className="bg-white rounded-3xl p-8 shadow-sm">
          <h2 className="font-black text-2xl text-[var(--color-text)] mb-3">¿Qué implica ser aliado?</h2>
          <ul className="text-sm text-[var(--color-muted)] leading-relaxed space-y-2 list-disc pl-5">
            <li>Publicar y consultar reportes de mascotas de su comuna.</li>
            <li>Difundir la plataforma entre sus usuarios, vecinos o seguidores.</li>
            <li>Coordinar con nosotros los casos de mascotas encontradas.</li>
          </ul>
          <p className="text-xs text-[var(--color-muted)] mt-4">
            Por ahora las alianzas están en etapa de conversación: aún no tenemos convenios formales publicados.
          </p>
        </section>

        <section className="rounded-3xl p-8 text-center bg-[var(--color-primary)] text-white">
          <h2 className="font-black text-2xl mb-2">¿Quieres ser parte?</h2>
          <p className="text-white/85 text-sm mb-5">Escríbenos y conversamos cómo colaborar.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <a href={mailto} className="px-6 py-3 bg-white text-[var(--color-primary)] font-bold rounded-2xl hover:bg-[var(--color-bg)] transition-colors text-sm">
              ✉️ Escribir a {CORREO}
            </a>
            <Link to="/contacto" className="px-6 py-3 border-2 border-white text-white font-bold rounded-2xl hover:bg-white/10 transition-colors text-sm">
              Ir a Contacto
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
