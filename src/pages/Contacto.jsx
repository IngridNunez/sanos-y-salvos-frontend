import { useState } from "react";
import { Link } from "react-router";

const CORREO = "contacto@sanosysalvos.cl";

const PREGUNTAS = [
  {
    q: "¿Cómo aviso que vi o encontré una mascota?",
    a: "Entra al detalle de la mascota y pulsa “Contactar”. Escribes tu mensaje y el dueño lo recibe por correo; no necesitas cuenta y tu correo no se muestra públicamente.",
  },
  {
    q: "¿Cómo reporto a mi mascota?",
    a: "Inicia sesión, pulsa “Reportar”, completa los datos y marca en el mapa dónde se perdió. La ubicación se muestra de forma aproximada.",
  },
  {
    q: "Ya encontré a mi mascota, ¿qué hago?",
    a: "Abre tu reporte con tu sesión iniciada y pulsa “¡Ya la encontré! Marcar como reunificada”.",
  },
  {
    q: "¿Quién ve mis datos?",
    a: "Tu correo solo se usa para que puedan contactarte por una mascota. Más detalles en la política de privacidad.",
  },
];

export default function Contacto() {
  const [abierta, setAbierta] = useState(0);
  const [form, setForm] = useState({ nombre: "", correo: "", asunto: "", mensaje: "" });

  const valido = form.nombre.trim() && /\S+@\S+\.\S+/.test(form.correo) && form.mensaje.trim();

  // Sin backend para mensajes generales: se abre el correo del usuario ya redactado.
  const enviar = (e) => {
    e.preventDefault();
    if (!valido) return;
    const asunto = form.asunto.trim() || "Consulta desde Sanos y Salvos";
    const cuerpo = `${form.mensaje.trim()}\n\n— ${form.nombre.trim()} (${form.correo.trim()})`;
    window.location.href = `mailto:${CORREO}?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(cuerpo)}`;
  };

  const campo =
    "w-full px-4 py-3 rounded-2xl border-2 border-[#f0d5df] text-sm focus:outline-none focus:border-[#C46081] transition-colors";

  return (
    <div className="min-h-screen bg-[#FFECF2] py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <header className="text-center max-w-3xl mx-auto">
          <h1 className="font-black text-4xl text-[#2B2B2B] mb-3">Contacto</h1>
          <p className="text-[#8a7a80] leading-relaxed">¿Dudas, ideas o problemas con la plataforma? Escríbenos.</p>
        </header>

        <div className="grid lg:grid-cols-5 gap-6">
          <form onSubmit={enviar} className="lg:col-span-3 bg-white rounded-3xl p-8 shadow-sm space-y-4">
            <h2 className="font-black text-xl text-[#2B2B2B]">Envíanos un mensaje</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="c-nombre" className="block text-sm font-semibold text-[#2B2B2B] mb-1.5">Tu nombre *</label>
                <input id="c-nombre" className={campo} value={form.nombre} maxLength={100}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
              </div>
              <div>
                <label htmlFor="c-correo" className="block text-sm font-semibold text-[#2B2B2B] mb-1.5">Tu correo *</label>
                <input id="c-correo" type="email" className={campo} value={form.correo} maxLength={150}
                  onChange={(e) => setForm({ ...form, correo: e.target.value })} />
              </div>
            </div>
            <div>
              <label htmlFor="c-asunto" className="block text-sm font-semibold text-[#2B2B2B] mb-1.5">Asunto</label>
              <input id="c-asunto" className={campo} value={form.asunto} maxLength={120}
                onChange={(e) => setForm({ ...form, asunto: e.target.value })} />
            </div>
            <div>
              <label htmlFor="c-mensaje" className="block text-sm font-semibold text-[#2B2B2B] mb-1.5">Mensaje *</label>
              <textarea id="c-mensaje" rows={5} className={campo} value={form.mensaje} maxLength={1000}
                onChange={(e) => setForm({ ...form, mensaje: e.target.value })} />
            </div>
            <button
              type="submit"
              disabled={!valido}
              className="w-full py-3.5 bg-[#C46081] text-white font-bold rounded-2xl hover:bg-[#a84e6c] transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Enviar mensaje
            </button>
            <p className="text-xs text-[#8a7a80]">Se abrirá tu aplicación de correo con el mensaje listo para enviar.</p>
          </form>

          <aside className="lg:col-span-2 space-y-5">
            <div className="bg-white rounded-3xl p-6 shadow-sm">
              <h2 className="font-black text-lg text-[#2B2B2B] mb-3">Otras vías</h2>
              <p className="text-sm text-[#8a7a80]">✉️ <a className="text-[#C46081] font-semibold hover:underline" href={`mailto:${CORREO}`}>{CORREO}</a></p>
              <p className="text-sm text-[#8a7a80] mt-2">📍 Trabajamos por comuna, empezando por la región de Valparaíso.</p>
            </div>
            <div className="bg-[#FFECF2] border-2 border-[#f0d5df] rounded-3xl p-6">
              <h2 className="font-black text-lg text-[#2B2B2B] mb-2">¿Vas a avisar por una mascota?</h2>
              <p className="text-sm text-[#8a7a80] mb-3">
                Para contactar al dueño de una mascota usa el botón “Contactar” de su ficha: es más rápido y directo.
              </p>
              <Link to="/buscar" className="text-sm font-bold text-[#C46081] hover:underline">Buscar mascotas →</Link>
            </div>
          </aside>
        </div>

        <section className="bg-white rounded-3xl p-8 shadow-sm">
          <h2 className="font-black text-2xl text-[#2B2B2B] mb-4">Preguntas frecuentes</h2>
          <div className="divide-y divide-[#f0d5df]">
            {PREGUNTAS.map((p, i) => (
              <div key={p.q}>
                <button
                  type="button"
                  onClick={() => setAbierta(abierta === i ? -1 : i)}
                  aria-expanded={abierta === i}
                  className="w-full flex items-center justify-between gap-4 py-4 text-left font-bold text-[#2B2B2B] text-sm"
                >
                  {p.q}
                  <span className="text-[#C46081] text-lg">{abierta === i ? "−" : "+"}</span>
                </button>
                {abierta === i && <p className="text-sm text-[#8a7a80] leading-relaxed pb-4">{p.a}</p>}
              </div>
            ))}
          </div>
          <p className="text-xs text-[#8a7a80] mt-4">
            Más información en la <Link to="/privacidad" className="text-[#C46081] font-semibold hover:underline">política de privacidad</Link>{" "}
            y los <Link to="/terminos" className="text-[#C46081] font-semibold hover:underline">términos de servicio</Link>.
          </p>
        </section>
      </div>
    </div>
  );
}
