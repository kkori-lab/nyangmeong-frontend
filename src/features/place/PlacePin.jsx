import { Star } from 'lucide-react';
// label이 없으면 즐겨찾기 핀(별)이다. 위치는 PlaceOverlay가 잡는다
export default function PlacePin({ place, label, isSelected, onSelect }) {
  const isFavorite = !label;
  return (
    <button
      type="button"
      onClick={() => onSelect(place.plcSn)}
      aria-label={`${place.plcConm} 핀`}
      className={`relative block h-12 w-10 drop-shadow-[0_3px_4px_rgba(26,50,52,0.3)] transition-transform before:absolute before:left-0.5 before:top-0 before:size-9 before:-rotate-45 before:rounded-[50%_50%_50%_0] before:border-2 before:border-white before:content-[''] hover:z-[3] hover:origin-bottom hover:scale-[1.18] ${
        isSelected
          ? 'z-[3] origin-bottom scale-[1.18] text-white before:bg-ink'
          : isFavorite
            ? 'z-[1] text-brand-500 before:bg-[#fbd85d]'
            : 'z-[1] text-white before:bg-brand-500'
      }`}
    >
      <span className="relative -top-[7px] grid h-9 w-10 place-items-center text-sm font-bold">
        {isFavorite ? <Star className="size-5 fill-current" /> : label}
      </span>
    </button>
  );
}
