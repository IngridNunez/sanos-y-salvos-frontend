const config = {
  extraviada: { label: "EXTRAVIADA", bg: "bg-[var(--color-primary)]", text: "text-white" },
  encontrada: { label: "ENCONTRADA", bg: "bg-[var(--color-secondary)]", text: "text-white" },
  reunificada: { label: "REUNIFICADA", bg: "bg-[var(--color-accent)]", text: "text-white" },
};

export default function StatusBadge({ status }) {
  const c = config[status];
  return (
    <span
      className={`${c.bg} ${c.text} text-[10px] font-bold tracking-widest px-2.5 py-1 rounded-full uppercase`}
    >
      {c.label}
    </span>
  );
}
