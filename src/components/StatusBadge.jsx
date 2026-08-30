const config = {
  extraviada: { label: "EXTRAVIADA", bg: "bg-[#C46081]", text: "text-white" },
  encontrada: { label: "ENCONTRADA", bg: "bg-[#99A966]", text: "text-white" },
  reunificada: { label: "REUNIFICADA", bg: "bg-[#EFB357]", text: "text-white" },
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
