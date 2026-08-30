import { useState } from "react";

export default function ContactModal({ petName, onClose }) {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(44,28,35,0.45)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-[#f0d5df]">
          <div>
            <h2 className="font-black text-xl text-[#2B2B2B]">Contactar</h2>
            <p className="text-sm text-[#8a7a80]">sobre <span className="font-semibold text-[#C46081]">{petName}</span></p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-2xl bg-[#FFECF2] text-[#C46081] text-lg font-bold flex items-center justify-center hover:bg-[#f5d5e1] transition-colors"
          >
            ✕
          </button>
        </div>

        {sent ? (
          <div className="p-8 text-center">
            <div className="text-5xl mb-4">💌</div>
            <h3 className="font-black text-xl text-[#2B2B2B] mb-2">¡Mensaje enviado!</h3>
            <p className="text-[#8a7a80] text-sm mb-6">
              El dueño/a recibirá tu mensaje pronto. Gracias por ayudar a reunir mascotas con sus familias.
            </p>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-[#C46081] text-white font-bold rounded-2xl hover:bg-[#a84e6c] transition-colors"
            >
              Cerrar
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-[#2B2B2B] mb-1.5">
                Tu nombre *
              </label>
              <input
                required
                type="text"
                placeholder="María González"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl border-2 border-[#f0d5df] text-sm focus:outline-none focus:border-[#C46081] transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#2B2B2B] mb-1.5">
                Correo electrónico *
              </label>
              <input
                required
                type="email"
                placeholder="maria@ejemplo.cl"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl border-2 border-[#f0d5df] text-sm focus:outline-none focus:border-[#C46081] transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#2B2B2B] mb-1.5">
                Teléfono <span className="text-[#8a7a80] font-normal">(opcional)</span>
              </label>
              <input
                type="tel"
                placeholder="+56 9 1234 5678"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl border-2 border-[#f0d5df] text-sm focus:outline-none focus:border-[#C46081] transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#2B2B2B] mb-1.5">
                Mensaje *
              </label>
              <textarea
                required
                rows={3}
                placeholder="Creo haber visto a tu mascota en..."
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl border-2 border-[#f0d5df] text-sm focus:outline-none focus:border-[#C46081] transition-colors resize-none"
              />
            </div>

            <div className="bg-[#FFECF2] rounded-2xl p-3 flex gap-2">
              <span className="text-[#C46081] mt-0.5">🔒</span>
              <p className="text-xs text-[#8a7a80]">
                Tus datos de contacto no se muestran públicamente. Solo serán compartidos con el dueño/a de la mascota.
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-[#C46081] text-white font-bold rounded-2xl hover:bg-[#a84e6c] transition-colors"
            >
              Enviar mensaje
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
