import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { COMUNAS } from "@/data/pets";
import { obtenerMascotas } from "@/api/mascotas";
import PetCard from "@/components/PetCard";
import { useAuth } from "@/context/AuthContext";

const VALUES = [
  {
    icon: "📍",
    title: "Búsqueda por comuna",
    desc: "Filtra reportes por tu comuna y encuentra mascotas cerca de ti.",
    color: "#C46081",
  },
  {
    icon: "🤝",
    title: "Red comunitaria activa",
    desc: "Vecinos conectados que colaboran para reunir familias.",
    color: "#99A966",
  },
  {
    icon: "🛡️",
    title: "Proceso seguro y confiable",
    desc: "Tus datos de contacto son privados. Solo comparte lo que quieras.",
    color: "#EFB357",
  },
];

const STEPS = [
  { num: "1", icon: "📋", title: "Reporta", desc: "Publica la información de tu mascota perdida en minutos." },
  { num: "2", icon: "🤝", title: "Comparte", desc: "Nuestra comunidad difunde el reporte en la zona." },
  { num: "3", icon: "🔍", title: "Busca", desc: "Usamos tecnología e IA para ampliar la búsqueda y coincidencias." },
  { num: "4", icon: "🏠", title: "Reencuentro", desc: "Trabajamos para que vuelvan sanos y salvos a casa." },
];

// Filtra por la fecha del reporte. "este-mes"/"anio" son calendario; el resto, ventana móvil.
function enRango(fechaISO, range) {
  if (!fechaISO) return false;
  const fecha = new Date(fechaISO);
  const ahora = new Date();
  if (range === "este-mes") return fecha.getFullYear() === ahora.getFullYear() && fecha.getMonth() === ahora.getMonth();
  if (range === "anio") return fecha.getFullYear() === ahora.getFullYear();
  const dias = range === "semana" ? 7 : 90;
  return ahora - fecha <= dias * 24 * 60 * 60 * 1000;
}

function StatsBlock({ pets }) {
  const [comuna, setComuna] = useState("Viña del Mar");
  const [range, setRange] = useState("este-mes");

  const filtered = pets.filter((p) => p.comuna === comuna && enRango(p.fechaISO, range));
  const lost = filtered.filter((p) => p.status === "extraviada").length;
  const found = filtered.filter((p) => p.status === "encontrada").length;
  const reunited = filtered.filter((p) => p.status === "reunificada").length;

  const chartData = [
    { name: "Extraviadas", value: lost, fill: "#C46081" },
    { name: "Encontradas", value: found, fill: "#99A966" },
    { name: "Reunificadas", value: reunited, fill: "#EFB357" },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="font-black text-3xl text-[#2B2B2B] mb-2">Reporte de Reunificaciones</h2>
          <p className="text-[#8a7a80]">Estado de mascotas en tu comuna</p>
        </div>

        <div className="bg-[#FFECF2] rounded-3xl p-6 md:p-8">
          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-8">
            <select
              value={comuna}
              onChange={(e) => setComuna(e.target.value)}
              className="px-4 py-2.5 rounded-2xl border-2 border-[#f0d5df] bg-white text-sm font-semibold text-[#2B2B2B] focus:outline-none focus:border-[#C46081]"
            >
              {COMUNAS.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
            <select
              value={range}
              onChange={(e) => setRange(e.target.value)}
              className="px-4 py-2.5 rounded-2xl border-2 border-[#f0d5df] bg-white text-sm font-semibold text-[#2B2B2B] focus:outline-none focus:border-[#C46081]"
            >
              <option value="este-mes">Este mes</option>
              <option value="semana">Esta semana</option>
              <option value="tres-meses">Últimos 3 meses</option>
              <option value="anio">Este año</option>
            </select>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Numbers */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Extraviadas", count: lost, color: "#C46081", bg: "bg-[#C46081]" },
                { label: "Encontradas", count: found, color: "#99A966", bg: "bg-[#99A966]" },
                { label: "Reunificadas", count: reunited, color: "#EFB357", bg: "bg-[#EFB357]" },
              ].map((s) => (
                <div key={s.label} className="bg-white rounded-3xl p-5 text-center shadow-sm">
                  <div
                    className="text-4xl font-black mb-1"
                    style={{ color: s.color }}
                  >
                    {s.count}
                  </div>
                  <div className="text-xs font-semibold text-[#8a7a80]">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Bar chart */}
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} barSize={40}>
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#8a7a80" }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{ borderRadius: "1rem", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}
                    cursor={{ fill: "rgba(196,96,129,0.06)" }}
                  />
                  <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                    {chartData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchComuna, setSearchComuna] = useState("");
  const [searchSpecies, setSearchSpecies] = useState("");
  const [heroComuna, setHeroComuna] = useState("Viña del Mar, Valparaíso");

  const [pets, setPets] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let cancelado = false;
    obtenerMascotas()
      .then((data) => {
        if (!cancelado) setPets(data);
      })
      .catch(() => {
        if (!cancelado) setPets([]);
      })
      .finally(() => {
        if (!cancelado) setCargando(false);
      });
    return () => {
      cancelado = true;
    };
  }, []);

  // el API ya viene ordenado por fecha desc, así que "recientes" = las primeras activas
  const recentPets = pets.filter((p) => p.status !== "reunificada").slice(0, 4);
  const reunitedPets = pets.filter((p) => p.status === "reunificada").slice(0, 6);

  const handleReport = () => {
    if (!user) navigate("/login?redirect=/reportar");
    else navigate("/reportar");
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchComuna) params.set("comuna", searchComuna);
    if (searchSpecies) params.set("species", searchSpecies);
    navigate(`/buscar?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* HERO */}
      <section className="relative bg-gradient-to-b from-[#FFECF2] to-white overflow-hidden pb-20 lg:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Left */}
            <div>
              <h1 className="font-black text-4xl md:text-5xl text-[#2B2B2B] leading-tight mb-3">
                Porque su familia{" "}
                <span className="text-[#C46081]">nunca deja de buscarlos</span>
              </h1>
              <p className="text-[#8a7a80] text-lg mb-8 leading-relaxed max-w-lg">
                Plataforma comunitaria que conecta personas, tecnología y amor para reunir mascotas perdidas con sus familias.
              </p>

              <div className="flex flex-wrap gap-3 mb-10">
                <button
                  onClick={handleReport}
                  className="flex items-center gap-2 px-6 py-3.5 bg-[#C46081] text-white font-bold rounded-2xl hover:bg-[#a84e6c] transition-all shadow-md shadow-[#C46081]/30 text-sm"
                >
                  <span>＋</span> Reportar Mascota Extraviada
                </button>
                <button
                  onClick={() => navigate("/buscar?status=encontrada")}
                  className="flex items-center gap-2 px-6 py-3.5 border-2 border-[#C46081] text-[#C46081] font-bold rounded-2xl hover:bg-white transition-colors text-sm"
                >
                  <span>🔍</span> Ver Mascotas Encontradas
                </button>
              </div>

              {/* Value icons */}
              <div className="flex flex-col sm:flex-row gap-4">
                {VALUES.map((v) => (
                  <div key={v.title} className="flex items-start gap-2.5">
                    <div
                      className="w-9 h-9 rounded-2xl flex items-center justify-center text-base shrink-0"
                      style={{ backgroundColor: v.color + "22" }}
                    >
                      {v.icon}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-[#2B2B2B] leading-tight">{v.title}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — dog image + floating card */}
            <div className="relative">
              {/* Decorative blobs */}
              <div className="absolute -top-10 -right-10 w-64 h-64 bg-[#99A966]/15 rounded-full blur-3xl" />
              <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-[#C46081]/10 rounded-full blur-3xl" />

              <div className="relative rounded-3xl overflow-hidden aspect-[4/3] shadow-xl">
                <img
                  src="https://images.unsplash.com/photo-1509205477838-a534e43a849f?q=80&w=878&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                  alt="Mascota feliz esperando ser encontrada"
                  className="w-full h-full object-cover"
                />
                {/* Paw decoration */}
                <div className="absolute top-4 right-4 text-4xl opacity-20 select-none">🐾</div>
              </div>

              {/* Floating community card */}
              <div className="absolute -bottom-10 sm:-bottom-14 -right-4 sm:-right-8 bg-white rounded-3xl shadow-xl p-4 min-w-[180px]">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[#C46081] text-sm">📍</span>
                  <span className="text-xs text-[#8a7a80] font-semibold">Tu comunidad</span>
                </div>
                <select
                  value={heroComuna}
                  onChange={(e) => setHeroComuna(e.target.value)}
                  className="text-xs font-bold text-[#2B2B2B] bg-transparent border-none w-full focus:outline-none mb-2 cursor-pointer"
                >
                  {COMUNAS.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
                <div className="text-3xl font-black text-[#C46081] leading-none">128</div>
                <div className="text-xs text-[#8a7a80] mt-0.5">mascotas reunidas este mes</div>
                <div className="mt-2 text-[#C46081] text-lg">❤️</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SEARCH BAR — floating card overlapping the hero/next-section seam */}
      <section className="relative -mt-14 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl shadow-xl p-5 sm:p-6 flex flex-col sm:flex-row items-center gap-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 bg-[#FFECF2] rounded-2xl flex items-center justify-center text-[#C46081] text-lg shrink-0">
                🔍
              </div>
              <div>
                <div className="font-bold text-[#2B2B2B] text-sm">¿Viste una mascota?</div>
                <div className="text-xs text-[#8a7a80]">Ayúdanos a encontrar a su familia.</div>
              </div>
            </div>
            <select
              value={searchComuna}
              onChange={(e) => setSearchComuna(e.target.value)}
              className="px-4 py-3 rounded-2xl border-2 border-[#f0d5df] text-sm font-semibold text-[#2B2B2B] focus:outline-none focus:border-[#C46081] bg-white w-full sm:w-52"
            >
              <option value="">📍 Selecciona tu comuna</option>
              {COMUNAS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select
              value={searchSpecies}
              onChange={(e) => setSearchSpecies(e.target.value)}
              className="px-4 py-3 rounded-2xl border-2 border-[#f0d5df] text-sm font-semibold text-[#2B2B2B] focus:outline-none focus:border-[#C46081] bg-white w-full sm:w-44"
            >
              <option value="">🐾 Tipo de mascota</option>
              <option value="perro">🐕 Perro</option>
              <option value="gato">🐈 Gato</option>
              <option value="otro">🐇 Otro</option>
            </select>
            <button
              onClick={handleSearch}
              className="px-6 py-3 bg-[#C46081] text-white font-bold rounded-2xl hover:bg-[#a84e6c] transition-colors flex items-center gap-2 shrink-0 text-sm w-full sm:w-auto justify-center"
            >
              🔍 Buscar
            </button>
          </div>
        </div>
      </section>

      {/* RECENT REPORTS */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-black text-2xl text-[#2B2B2B]">Reportes recientes</h2>
            <button
              onClick={() => navigate("/buscar")}
              className="text-[#C46081] font-bold text-sm hover:underline flex items-center gap-1"
            >
              Ver todos →
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {recentPets.map((pet) => (
              <PetCard key={pet.id} pet={pet} />
            ))}
          </div>
          {!cargando && recentPets.length === 0 && (
            <p className="text-center text-[#8a7a80] py-6">Aún no hay reportes activos.</p>
          )}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="como-funciona" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-black text-3xl text-[#2B2B2B] mb-2">Cómo funciona</h2>
            <p className="text-[#8a7a80]">4 pasos para reunir a tu mascota con su familia</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((step, i) => (
              <div key={step.num} className="text-center group">
                <div className="relative inline-block mb-4">
                  <div className="w-16 h-16 bg-[#FFECF2] rounded-3xl flex items-center justify-center text-3xl mx-auto group-hover:bg-[#C46081] group-hover:scale-110 transition-all duration-200">
                    {step.icon}
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#C46081] text-white text-xs font-black rounded-full flex items-center justify-center">
                    {step.num}
                  </div>
                </div>
                <h3 className="font-black text-lg text-[#2B2B2B] mb-2">{step.title}</h3>
                <p className="text-sm text-[#8a7a80] leading-relaxed">{step.desc}</p>
                {i < STEPS.length - 1 && (
                  <div className="hidden lg:block absolute" />
                )}
              </div>
            ))}
          </div>

          {/* CTA strip */}
          <div className="mt-12 bg-[#FFECF2] rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="font-black text-lg text-[#2B2B2B]">Cada alerta puede ser el reencuentro.</div>
              <div className="text-sm text-[#C46081] font-semibold">¡Tu ayuda hace la diferencia!</div>
            </div>
            <button
              onClick={handleReport}
              className="px-6 py-3 bg-[#C46081] text-white font-bold rounded-2xl hover:bg-[#a84e6c] transition-colors shrink-0 text-sm"
            >
              Reportar ahora
            </button>
          </div>
        </div>
      </section>

      {/* STATS BLOCK */}
      <StatsBlock pets={pets} />

      {/* REUNITED */}
      <section className="py-16 bg-[#FFECF2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="font-black text-3xl text-[#2B2B2B] mb-2">🏠 Ya en casa</h2>
            <p className="text-[#8a7a80]">Mascotas que volvieron con sus familias gracias a la comunidad</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {reunitedPets.map((pet) => (
              <PetCard key={pet.id} pet={pet} />
            ))}
          </div>
          {!cargando && reunitedPets.length === 0 && (
            <p className="text-center text-[#8a7a80] py-6">Cuando una mascota vuelva a casa, aparecerá aquí.</p>
          )}
        </div>
      </section>

      {/* VALUE PROPS detailed */}
      <section id="conocenos" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-black text-3xl text-[#2B2B2B] mb-2">¿Por qué Sanos y Salvos?</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {VALUES.map((v) => (
              <div
                key={v.title}
                className="rounded-3xl p-8 text-center"
                style={{ backgroundColor: v.color + "12" }}
              >
                <div
                  className="w-16 h-16 rounded-3xl flex items-center justify-center text-3xl mx-auto mb-4"
                  style={{ backgroundColor: v.color + "25" }}
                >
                  {v.icon}
                </div>
                <h3 className="font-black text-xl text-[#2B2B2B] mb-3">{v.title}</h3>
                <p className="text-[#8a7a80] text-sm leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ALIANZAS (teaser: el detalle vive en /alianzas) */}
      <section className="py-12 bg-[#FFECF2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-black text-2xl text-[#2B2B2B] mb-2">Alianzas</h2>
          <p className="text-[#8a7a80] text-sm mb-6">
            Buscamos veterinarias, municipios y fundaciones que compartan nuestra misión
          </p>
          <button
            onClick={() => navigate("/alianzas")}
            className="px-6 py-3 border-2 border-[#C46081] text-[#C46081] font-bold rounded-2xl hover:bg-white transition-colors text-sm"
          >
            Conoce cómo sumarte →
          </button>
        </div>
      </section>
    </div>
  );
}
