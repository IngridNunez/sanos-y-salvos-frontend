import { useState } from "react";
import { useNavigate } from "react-router";
import { COMUNAS } from "@/data/pets";
import LocationPicker from "@/components/map/LocationPicker";

export default function ReportForm() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("extraviada");
  const [submitted, setSubmitted] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  const [form, setForm] = useState({
    name: "",
    species: "",
    breed: "",
    color: "",
    pattern: "",
    size: "",
    description: "",
    comuna: "",
    sector: "",
    phone: "",
    location: null,
    consent1: false,
    consent2: false,
  });

  const handlePhoto = (file) => {
    const url = URL.createObjectURL(file);
    setPhotoPreview(url);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) handlePhoto(file);
  };

  const handleFileInput = (e) => {
    const file = e.target.files?.[0];
    if (file) handlePhoto(file);
  };

  const canSubmit =
    form.name && form.species && form.description && form.comuna && form.location && form.consent1 && form.consent2;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#FFECF2] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl p-10 text-center max-w-md w-full">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="font-black text-2xl text-[#2B2B2B] mb-3">¡Reporte publicado!</h2>
          <p className="text-[#8a7a80] mb-6 text-sm leading-relaxed">
            Tu reporte ha sido publicado exitosamente. La comunidad de Sanos y Salvos ya está al tanto. ¡Esperamos que tu mascota vuelva pronto a casa!
          </p>
          <button
            onClick={() => navigate("/")}
            className="w-full py-4 bg-[#C46081] text-white font-bold rounded-2xl hover:bg-[#a84e6c] transition-colors"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFECF2] py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="mb-6">
          <h1 className="font-black text-3xl text-[#2B2B2B] mb-1">Reportar mascota</h1>
          <p className="text-[#8a7a80] text-sm">Completa el formulario para publicar un reporte en la comunidad</p>
        </div>

        {/* Tab selector */}
        <div className="bg-white rounded-3xl p-1.5 flex mb-6 shadow-sm">
          {["extraviada", "encontrada"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-3 rounded-2xl font-bold text-sm transition-all ${
                tab === t
                  ? t === "extraviada"
                    ? "bg-[#C46081] text-white shadow-md"
                    : "bg-[#99A966] text-white shadow-md"
                  : "text-[#8a7a80] hover:text-[#2B2B2B]"
              }`}
            >
              {t === "extraviada" ? "🔴 Mascota Extraviada" : "🟢 Mascota Encontrada"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Photo upload */}
          <div className="bg-white rounded-3xl p-6 shadow-sm">
            <h2 className="font-bold text-[#2B2B2B] mb-4">Foto de la mascota</h2>
            <div
              className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-colors ${
                dragOver
                  ? "border-[#C46081] bg-[#FFECF2]"
                  : "border-[#f0d5df] hover:border-[#C46081] hover:bg-[#FFECF2]/50"
              }`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => document.getElementById("photo-input")?.click()}
            >
              <input
                id="photo-input"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileInput}
              />
              {photoPreview ? (
                <div className="relative">
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="w-40 h-40 object-cover rounded-2xl mx-auto shadow-md"
                  />
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setPhotoPreview(null); }}
                    className="absolute -top-2 -right-2 w-7 h-7 bg-[#C46081] text-white rounded-full text-xs font-bold flex items-center justify-center mx-auto"
                    style={{ left: "calc(50% + 52px)" }}
                  >
                    ✕
                  </button>
                  <p className="text-sm text-[#8a7a80] mt-3">Haz clic para cambiar la foto</p>
                </div>
              ) : (
                <>
                  <div className="text-4xl mb-3">📸</div>
                  <p className="font-semibold text-[#2B2B2B] text-sm">Arrastra una foto o haz clic para subir</p>
                  <p className="text-xs text-[#8a7a80] mt-1">JPG, PNG o WEBP hasta 10 MB</p>
                </>
              )}
            </div>
          </div>

          {/* Basic info */}
          <div className="bg-white rounded-3xl p-6 shadow-sm">
            <h2 className="font-bold text-[#2B2B2B] mb-4">Información básica</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#2B2B2B] mb-1.5">
                  Nombre <span className="text-[#C46081]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="¿Cómo se llama?"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl border-2 border-[#f0d5df] text-sm focus:outline-none focus:border-[#C46081] transition-colors"
                />
              </div>

              {/* Species */}
              <div>
                <label className="block text-sm font-semibold text-[#2B2B2B] mb-1.5">
                  Especie <span className="text-[#C46081]">*</span>
                </label>
                <div className="flex gap-3">
                  {[
                    { value: "perro", icon: "🐕", label: "Perro" },
                    { value: "gato", icon: "🐈", label: "Gato" },
                    { value: "otro", icon: "🐇", label: "Otro" },
                  ].map((s) => (
                    <button
                      key={s.value}
                      type="button"
                      onClick={() => setForm({ ...form, species: s.value })}
                      className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-2xl border-2 font-semibold text-sm transition-all ${
                        form.species === s.value
                          ? "border-[#C46081] bg-[#FFECF2] text-[#C46081]"
                          : "border-[#f0d5df] text-[#8a7a80] hover:border-[#C46081]/50"
                      }`}
                    >
                      <span className="text-xl">{s.icon}</span>
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-[#2B2B2B] mb-1.5">Raza</label>
                  <input
                    type="text"
                    placeholder="Labrador, Mestizo..."
                    value={form.breed}
                    onChange={(e) => setForm({ ...form, breed: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl border-2 border-[#f0d5df] text-sm focus:outline-none focus:border-[#C46081] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#2B2B2B] mb-1.5">Color</label>
                  <input
                    type="text"
                    placeholder="Negro, Marrón..."
                    value={form.color}
                    onChange={(e) => setForm({ ...form, color: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl border-2 border-[#f0d5df] text-sm focus:outline-none focus:border-[#C46081] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#2B2B2B] mb-1.5">Patrón</label>
                  <input
                    type="text"
                    placeholder="Sólido, Atigrado..."
                    value={form.pattern}
                    onChange={(e) => setForm({ ...form, pattern: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl border-2 border-[#f0d5df] text-sm focus:outline-none focus:border-[#C46081] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#2B2B2B] mb-1.5">Tamaño</label>
                  <select
                    value={form.size}
                    onChange={(e) => setForm({ ...form, size: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl border-2 border-[#f0d5df] text-sm focus:outline-none focus:border-[#C46081] bg-white"
                  >
                    <option value="">Seleccionar</option>
                    <option value="pequeño">Pequeño</option>
                    <option value="mediano">Mediano</option>
                    <option value="grande">Grande</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#2B2B2B] mb-1.5">
                  Descripción <span className="text-[#C46081]">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Describe señas particulares (no incluyas datos de contacto aquí)"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl border-2 border-[#f0d5df] text-sm focus:outline-none focus:border-[#C46081] transition-colors resize-none"
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="bg-white rounded-3xl p-6 shadow-sm">
            <h2 className="font-bold text-[#2B2B2B] mb-4">Ubicación</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-semibold text-[#2B2B2B] mb-1.5">
                  Comuna <span className="text-[#C46081]">*</span>
                </label>
                <select
                  required
                  value={form.comuna}
                  onChange={(e) => setForm({ ...form, comuna: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl border-2 border-[#f0d5df] text-sm focus:outline-none focus:border-[#C46081] bg-white"
                >
                  <option value="">Selecciona tu comuna</option>
                  {COMUNAS.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#2B2B2B] mb-1.5">Sector / Barrio</label>
                <input
                  type="text"
                  placeholder="Ej: Recreo, Centro, Cerro Alegre..."
                  value={form.sector}
                  onChange={(e) => setForm({ ...form, sector: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl border-2 border-[#f0d5df] text-sm focus:outline-none focus:border-[#C46081] transition-colors"
                />
              </div>

              <LocationPicker
                value={form.location}
                onChange={(location) => setForm({ ...form, location })}
              />
              <div className="flex items-center gap-2 bg-[#FFECF2] rounded-2xl p-3">
                <span className="text-[#C46081]">🔒</span>
                <p className="text-xs text-[#8a7a80]">La ubicación pública se muestra de forma aproximada para proteger tu privacidad.</p>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="bg-white rounded-3xl p-6 shadow-sm">
            <h2 className="font-bold text-[#2B2B2B] mb-4">Contacto</h2>
            <div>
              <label className="block text-sm font-semibold text-[#2B2B2B] mb-1.5">
                Teléfono <span className="text-[#8a7a80] font-normal">(opcional · privado)</span>
              </label>
              <input
                type="tel"
                placeholder="+56 9 1234 5678"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl border-2 border-[#f0d5df] text-sm focus:outline-none focus:border-[#C46081] transition-colors"
              />
              <p className="text-xs text-[#8a7a80] mt-1.5">Tu número no se muestra públicamente. Solo se envía cuando alguien te contacta.</p>
            </div>
          </div>

          {/* Consents */}
          <div className="bg-white rounded-3xl p-6 shadow-sm space-y-3">
            <h2 className="font-bold text-[#2B2B2B] mb-2">Consentimientos</h2>
            {[
              { key: "consent1", text: "Confirmo que la información ingresada es verídica y que soy el dueño/a o quien encontró a esta mascota." },
              { key: "consent2", text: "Acepto los Términos de uso y la Política de privacidad de Sanos y Salvos, y consiento el uso de los datos para la búsqueda comunitaria." },
            ].map((c) => (
              <label key={c.key} className="flex items-start gap-3 cursor-pointer group">
                <div className="relative mt-0.5">
                  <input
                    type="checkbox"
                    checked={form[c.key]}
                    onChange={(e) => setForm({ ...form, [c.key]: e.target.checked })}
                    className="sr-only"
                  />
                  <div
                    className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-colors ${
                      form[c.key]
                        ? "bg-[#C46081] border-[#C46081]"
                        : "border-[#f0d5df] group-hover:border-[#C46081]"
                    }`}
                  >
                    {form[c.key] && (
                      <span className="text-white text-xs">✓</span>
                    )}
                  </div>
                </div>
                <span className="text-sm text-[#8a7a80] leading-relaxed">{c.text}</span>
              </label>
            ))}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full py-4 font-black rounded-2xl transition-all text-base shadow-lg disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              backgroundColor: tab === "extraviada" ? "#C46081" : "#99A966",
              color: "white",
              boxShadow: canSubmit
                ? `0 8px 24px ${tab === "extraviada" ? "#C46081" : "#99A966"}40`
                : "none",
            }}
          >
            Publicar reporte
          </button>
        </form>
      </div>
    </div>
  );
}
