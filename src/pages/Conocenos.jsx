import { Link } from "react-router";

const PASOS = [
  { icon: "📋", titulo: "Reporta", desc: "Publica la mascota perdida o encontrada, con su ubicación en el mapa." },
  { icon: "🤝", titulo: "Comparte", desc: "La comunidad de la comuna ve el reporte y ayuda a difundirlo." },
  { icon: "💬", titulo: "Conecta", desc: "Quien la vio escribe un mensaje; tu correo nunca se muestra en pantalla." },
  { icon: "🏠", titulo: "Reencuentro", desc: "El dueño marca la mascota como reunificada y vuelve a casa." },
];

const VALORES = [
  { icon: "📍", color: "#C46081", titulo: "Cercanía", desc: "Buscamos por comuna: las mascotas se encuentran en el barrio donde se pierden." },
  { icon: "🤝", color: "#99A966", titulo: "Comunidad", desc: "Vecinos, veterinarias y organizaciones colaborando para reunir familias." },
  { icon: "🛡️", color: "#EFB357", titulo: "Privacidad", desc: "Ubicación aproximada y datos de contacto protegidos. Compartes solo lo necesario." },
];

export default function Conocenos() {
  return (
    <div className="min-h-screen bg-[#FFECF2] py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <header className="text-center max-w-3xl mx-auto">
          <h1 className="font-black text-4xl text-[#2B2B2B] mb-3">Conócenos</h1>
          <p className="text-[#8a7a80] leading-relaxed">
            Sanos y Salvos es una plataforma comunitaria chilena que reúne mascotas perdidas con sus familias.
          </p>
        </header>

        <section className="bg-white rounded-3xl p-8 shadow-sm">
          <h2 className="font-black text-2xl text-[#2B2B2B] mb-3">Nuestra historia</h2>
          <div className="text-sm text-[#8a7a80] leading-relaxed space-y-3">
            <p>
              Durante más de 8 años, nuestra organización ayudó a reunir mascotas con sus dueños de forma
              manual: redes sociales, llamadas y coordinación persona a persona. Funcionó gracias a la
              buena voluntad de mucha gente, pero cada caso dependía de que el mensaje correcto llegara a
              la persona correcta a tiempo.
            </p>
            <p>
              Esta plataforma es nuestro primer paso de digitalización: un lugar único donde reportar,
              buscar por comuna, ubicar en el mapa y contactar al dueño, sin exponer datos personales de más.
            </p>
          </div>
        </section>

        <section className="grid md:grid-cols-2 gap-5">
          <div className="bg-white rounded-3xl p-8 shadow-sm">
            <h2 className="font-black text-xl text-[#2B2B2B] mb-2">🎯 Misión</h2>
            <p className="text-sm text-[#8a7a80] leading-relaxed">
              Reducir el tiempo que una mascota pasa lejos de su familia, conectando a quienes la buscan con
              quienes la encuentran, con tecnología simple y accesible para todos.
            </p>
          </div>
          <div className="bg-white rounded-3xl p-8 shadow-sm">
            <h2 className="font-black text-xl text-[#2B2B2B] mb-2">🌱 Visión</h2>
            <p className="text-sm text-[#8a7a80] leading-relaxed">
              Que cada comuna de Chile cuente con una red activa de vecinos, veterinarias y municipios que
              actúe en conjunto cuando una mascota se pierde.
            </p>
          </div>
        </section>

        <section>
          <h2 className="font-black text-2xl text-[#2B2B2B] text-center mb-6">Nuestros valores</h2>
          <div className="grid md:grid-cols-3 gap-5">
            {VALORES.map((v) => (
              <div key={v.titulo} className="rounded-3xl p-8 text-center" style={{ backgroundColor: v.color + "18" }}>
                <div
                  className="w-16 h-16 rounded-3xl flex items-center justify-center text-3xl mx-auto mb-4"
                  style={{ backgroundColor: v.color + "30" }}
                >
                  {v.icon}
                </div>
                <h3 className="font-black text-lg text-[#2B2B2B] mb-2">{v.titulo}</h3>
                <p className="text-sm text-[#8a7a80] leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-3xl p-8 shadow-sm">
          <h2 className="font-black text-2xl text-[#2B2B2B] text-center mb-6">Cómo funciona</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {PASOS.map((p, i) => (
              <div key={p.titulo} className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-[#FFECF2] flex items-center justify-center text-2xl mx-auto mb-3">
                  {p.icon}
                </div>
                <h3 className="font-bold text-[#2B2B2B] mb-1">{i + 1}. {p.titulo}</h3>
                <p className="text-xs text-[#8a7a80] leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-3xl p-8 shadow-sm">
          <h2 className="font-black text-xl text-[#2B2B2B] mb-2">Detrás de la plataforma</h2>
          <p className="text-sm text-[#8a7a80] leading-relaxed">
            Sanos y Salvos fue desarrollada por el equipo <strong>SpiderTech</strong> como proyecto de Ingeniería
            en Informática en Duoc UC. Puedes leer cómo tratamos tus datos en nuestra{" "}
            <Link to="/privacidad" className="text-[#C46081] font-semibold hover:underline">política de privacidad</Link>.
          </p>
        </section>

        <div className="flex flex-wrap justify-center gap-3 pb-4">
          <Link to="/reportar" className="px-6 py-3 bg-[#C46081] text-white font-bold rounded-2xl hover:bg-[#a84e6c] transition-colors text-sm">
            + Reportar una mascota
          </Link>
          <Link to="/buscar" className="px-6 py-3 border-2 border-[#C46081] text-[#C46081] font-bold rounded-2xl hover:bg-white transition-colors text-sm">
            Buscar mascotas
          </Link>
        </div>
      </div>
    </div>
  );
}
