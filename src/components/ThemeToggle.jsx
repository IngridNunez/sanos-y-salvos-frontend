import { useDarkMode } from "@/lib/useDarkMode";

export default function ThemeToggle({ className = "" }) {
  const [oscuro, setOscuro] = useDarkMode();

  return (
    <button
      type="button"
      onClick={() => setOscuro((v) => !v)}
      aria-label={oscuro ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      title={oscuro ? "Modo claro" : "Modo oscuro"}
      className={`w-9 h-9 shrink-0 rounded-full flex items-center justify-center text-lg hover:bg-[var(--color-bg)] transition-colors ${className}`}
    >
      {oscuro ? "☀️" : "🌙"}
    </button>
  );
}
