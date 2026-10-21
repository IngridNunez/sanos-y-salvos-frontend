import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router";
import { COMUNAS } from "@/data/pets";
import { obtenerMisMascotas, actualizarMascota, subirFoto } from "@/api/mascotas";
import LocationPicker from "@/components/map/LocationPicker";
import { useAuth } from "@/context/AuthContext";

/* Edita un reporte propio — solo los campos que ms-mascotas deja cambiar
 * (ActualizarMascotaDTO): nombre y especie no se pueden tocar una vez
 * creado el reporte, y el estado se cambia aparte, desde el Perfil. */
export default function EditForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, cargandoSesion } = useAuth();

  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState(null);
  const [pet, setPet] = useState(null);

  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  const [enviando, setEnviando] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState(null);

  const [form, setForm] = useState({
    breed: "",
    color: "",
    pattern: "",
    size: "",
    description: "",
    comuna: "",
    sector: "",
    location: null,
  });

  useEffect(() => {
    if (!cargandoSesion && !user) navigate(`/login?redirect=/editar/${id}`, { replace: true });
  }, [user, cargandoSesion, navigate, id]);

  useEffect(() => {
    if (!user) return;
    obtenerMisMascotas()
      .then((mascotas) => {
        const encontrada = mascotas.find((m) => m.id === id);
        if (!encontrada) {
          setErrorCarga("No encontramos ese reporte entre los tuyos.");
          return;
        }
        setPet(encontrada);
        setForm({
          breed: encontrada.breed === "—" ? "" : encontrada.breed,
          color: encontrada.color === "—" ? "" : encontrada.color,
          pattern: encontrada.pattern === "—" ? "" : encontrada.pattern,
          size: encontrada.size ?? "",
          description: encontrada.description ?? "",
          comuna: encontrada.comuna ?? "",
          sector: encontrada.sector ?? "",
          location: encontrada.lat != null && encontrada.lng != null ? { lat: encontrada.lat, lng: encontrada.lng } : null,
        });
        setPhotoPreview(encontrada.photo ?? null);
      })
      .catch((err) => setErrorCarga(err.message))
      .finally(() => setCargando(false));
  }, [user, id]);

  const handlePhoto = (file) => {
    const url = URL.createObjectURL(file);
    setPhotoPreview(url);
    setPhotoFile(file);
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

  const canSubmit = form.description && form.comuna && form.location;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setEnviando(true);
    setErrorEnvio(null);
    try {
      const fotografiaUrl = photoFile ? await subirFoto(photoFile) : undefined;
      await actualizarMascota(id, form, fotografiaUrl);
      navigate("/perfil");
    } catch (err) {
      setErrorEnvio(err.message);
    } finally {
      setEnviando(false);
    }
  };

  if (!user) return null;

  if (cargando) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
        <p className="text-[var(--color-muted)]">Cargando tu reporte...</p>
      </div>
    );
  }

  if (errorCarga) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl p-10 text-center max-w-md w-full">
          <p className="text-[var(--color-primary)] font-semibold mb-6">{errorCarga}</p>
          <Link
            to="/perfil"
            className="inline-block px-5 py-2.5 bg-[var(--color-primary)] text-white font-bold rounded-2xl hover:bg-[var(--color-primary-dark)] transition-colors text-sm"
          >
            Volver a mi perfil
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="mb-6">
          <h1 className="font-black text-3xl text-[var(--color-text)] mb-1">Editar reporte</h1>
          <p className="text-[var(--color-muted)] text-sm">{pet?.name} — el nombre y la especie no se pueden cambiar</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Photo upload */}
          <div className="bg-white rounded-3xl p-6 shadow-sm">
            <h2 className="font-bold text-[var(--color-text)] mb-4">Foto de la mascota</h2>
            <div
              className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-colors ${
                dragOver
                  ? "border-[var(--color-primary)] bg-[var(--color-bg)]"
                  : "border-[var(--color-border)] hover:border-[var(--color-primary)] hover:bg-[var(--color-bg)]/50"
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
                  <p className="text-sm text-[var(--color-muted)] mt-3">Haz clic para cambiar la foto</p>
                </div>
              ) : (
                <>
                  <div className="text-4xl mb-3">📸</div>
                  <p className="font-semibold text-[var(--color-text)] text-sm">Arrastra una foto o haz clic para subir</p>
                  <p className="text-xs text-[var(--color-muted)] mt-1">JPG, PNG o WEBP hasta 5 MB</p>
                </>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="bg-white rounded-3xl p-6 shadow-sm">
            <h2 className="font-bold text-[var(--color-text)] mb-4">Detalles</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-[var(--color-text)] mb-1.5">Raza</label>
                  <input
                    type="text"
                    value={form.breed}
                    onChange={(e) => setForm({ ...form, breed: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl border-2 border-[var(--color-border)] text-sm focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[var(--color-text)] mb-1.5">Color</label>
                  <input
                    type="text"
                    value={form.color}
                    onChange={(e) => setForm({ ...form, color: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl border-2 border-[var(--color-border)] text-sm focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[var(--color-text)] mb-1.5">Patrón</label>
                  <input
                    type="text"
                    value={form.pattern}
                    onChange={(e) => setForm({ ...form, pattern: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl border-2 border-[var(--color-border)] text-sm focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[var(--color-text)] mb-1.5">Tamaño</label>
                  <select
                    value={form.size}
                    onChange={(e) => setForm({ ...form, size: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl border-2 border-[var(--color-border)] text-sm focus:outline-none focus:border-[var(--color-primary)] bg-white"
                  >
                    <option value="">Seleccionar</option>
                    <option value="pequeño">Pequeño</option>
                    <option value="mediano">Mediano</option>
                    <option value="grande">Grande</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[var(--color-text)] mb-1.5">
                  Descripción <span className="text-[var(--color-primary)]">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl border-2 border-[var(--color-border)] text-sm focus:outline-none focus:border-[var(--color-primary)] transition-colors resize-none"
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="bg-white rounded-3xl p-6 shadow-sm">
            <h2 className="font-bold text-[var(--color-text)] mb-4">Ubicación</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-semibold text-[var(--color-text)] mb-1.5">
                  Comuna <span className="text-[var(--color-primary)]">*</span>
                </label>
                <select
                  required
                  value={form.comuna}
                  onChange={(e) => setForm({ ...form, comuna: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl border-2 border-[var(--color-border)] text-sm focus:outline-none focus:border-[var(--color-primary)] bg-white"
                >
                  <option value="">Selecciona tu comuna</option>
                  {COMUNAS.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-[var(--color-text)] mb-1.5">Sector / Barrio</label>
                <input
                  type="text"
                  value={form.sector}
                  onChange={(e) => setForm({ ...form, sector: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl border-2 border-[var(--color-border)] text-sm focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                />
              </div>

              <LocationPicker
                value={form.location}
                onChange={(location) => setForm({ ...form, location })}
              />
              {!form.location && (
                <p className="text-xs text-[var(--color-primary)] font-semibold">La ubicación en el mapa es obligatoria.</p>
              )}
            </div>
          </div>

          {errorEnvio && (
            <p className="text-sm text-[var(--color-primary)] font-semibold text-center">{errorEnvio}</p>
          )}
          <div className="flex gap-3">
            <Link
              to="/perfil"
              className="flex-1 py-4 text-center font-bold rounded-2xl border-2 border-[var(--color-border)] text-[var(--color-text)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={!canSubmit || enviando}
              className="flex-1 py-4 font-black rounded-2xl transition-all text-base shadow-lg bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {enviando ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
