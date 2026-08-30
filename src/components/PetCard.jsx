import { useNavigate } from "react-router";
import StatusBadge from "./StatusBadge";

export default function PetCard({ pet }) {
  const navigate = useNavigate();

  return (
    <div
      className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 cursor-pointer group flex h-44"
      onClick={() => navigate(`/mascota/${pet.id}`)}
    >
      <div className="relative w-2/5 shrink-0 h-full overflow-hidden bg-[#FFECF2]">
        <img
          src={pet.photo}
          alt={pet.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-2 left-2">
          <StatusBadge status={pet.status} />
        </div>
      </div>
      <div className="flex-1 min-w-0 p-4 flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-base text-[#2B2B2B] leading-tight truncate">{pet.name}</h3>
          <p className="text-[#8a7a80] text-xs mb-2 truncate">{pet.breed}</p>
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-[#8a7a80]">
              <span>📍</span>
              <span className="truncate">{pet.sector}, {pet.comuna}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[#8a7a80]">
              <span>🗓</span>
              <span>{pet.date}</span>
            </div>
          </div>
        </div>
        <button
          className="w-full py-2 rounded-2xl font-semibold text-xs transition-colors"
          style={{
            backgroundColor:
              pet.status === "extraviada"
                ? "#C46081"
                : pet.status === "encontrada"
                ? "#99A966"
                : "#EFB357",
            color: "white",
          }}
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/mascota/${pet.id}`);
          }}
        >
          Ver detalles
        </button>
      </div>
    </div>
  );
}
