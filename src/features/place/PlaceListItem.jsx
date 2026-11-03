import { useEffect, useRef } from 'react';
import { Hospital, Star, Store } from 'lucide-react';
import { CATEGORIES } from './placeData';
import { formatDistance, openDetail } from './placeFormat';

const HOSPITAL_CODE = CATEGORIES[0].code;

// letter가 없으면 상단 고정된 즐겨찾기 줄이다
// 카드를 누르면 카카오맵 업체 상세를 새 탭으로 연다. 지도에서 고르는 것은 핀만 한다
export default function PlaceListItem({
  place,
  letter,
  isFavorite,
  isStarred,
  isOutside,
  isSelected,
  shouldScroll,
  onToggleFavorite,
}) {
  const itemRef = useRef(null);
  const ThumbIcon = place.plcClsfCd === HOSPITAL_CODE ? Hospital : Store;

  // 지도 핀으로 고른 장소를 목록에서도 보이게 한다. 모바일은 바텀시트가 가려 건너뛴다
  useEffect(() => {
    if (shouldScroll && !window.matchMedia('(max-width: 767px)').matches) {
      itemRef.current.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [shouldScroll]);

  const handleKeyDown = (event) => {
    if (event.target !== event.currentTarget) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openDetail(place);
    }
  };

  return (
    <li
      ref={itemRef}
      tabIndex={0}
      aria-label={`${place.plcConm} — 카카오맵 상세 보기`}
      onClick={() => openDetail(place)}
      onKeyDown={handleKeyDown}
      className={`relative grid cursor-pointer grid-cols-[84px_minmax(0,1fr)] gap-4 border-b border-line-soft px-4 py-4 hover:bg-surface-2 md:px-5 lg:grid-cols-[88px_minmax(0,1fr)] ${
        isSelected
          ? 'bg-brand-50 shadow-[inset_3px_0_0_var(--color-brand-500)] hover:bg-brand-50'
          : ''
      }`}
    >
      <span
        aria-hidden="true"
        className="flex size-[84px] flex-col items-center justify-center gap-1 self-start rounded-xl bg-surface-2 text-line-strong lg:size-[88px]"
      >
        <ThumbIcon className="size-[30px]" />
        <small className="text-xs text-subtle">업체 사진</small>
      </span>
      <div className="min-w-0">
        <div className="flex items-center gap-2 pr-9">
          {letter && (
            <span
              aria-hidden="true"
              className="grid size-[22px] shrink-0 place-items-center rounded-full bg-brand-500 text-xs font-bold text-white"
            >
              {letter}
            </span>
          )}
          <h3 className="min-w-0 truncate text-lg font-bold leading-[1.35] text-ink">
            {place.plcConm}
          </h3>
          <span className="shrink-0 text-sm text-subtle">
            {place.plcClsfCdNm}
          </span>
        </div>
        {(place.distance != null || place.rprsTelno) && (
          <p className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm text-muted">
            {place.distance != null && (
              <span className="font-semibold text-ink">
                {formatDistance(place.distance)}
              </span>
            )}
            {place.distance != null && place.rprsTelno && (
              <i className="size-0.5 rounded-full bg-line-strong" />
            )}
            {place.rprsTelno && <span>{place.rprsTelno}</span>}
          </p>
        )}
        <p className="mt-1 truncate text-sm text-muted">{place.plcAddr}</p>
        {isFavorite && isOutside && (
          <div className="mt-2.5 flex flex-wrap gap-1">
            <span className="inline-flex h-6 items-center rounded bg-[#fdf3d8] px-2 text-badge font-semibold text-[#8a5a00]">
              현재 지도 밖
            </span>
          </div>
        )}
      </div>
      <button
        type="button"
        aria-pressed={isStarred}
        aria-label={`${place.plcConm} 즐겨찾기 ${isStarred ? '해제' : '추가'}`}
        onClick={(event) => {
          event.stopPropagation();
          onToggleFavorite(place);
        }}
        className={`absolute right-3 top-2 grid size-10 place-items-center rounded-full ${
          isStarred
            ? ''
            : 'text-placeholder hover:bg-surface-3 hover:text-muted'
        }`}
      >
        <span
          className={`grid size-7 place-items-center rounded-full ${
            isStarred ? 'bg-[#fbd85d] text-brand-500' : ''
          }`}
        >
          <Star className={`size-4 ${isStarred ? 'fill-current' : ''}`} />
        </span>
      </button>
    </li>
  );
}
