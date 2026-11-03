import { ExternalLink, MapPin, Navigation, Phone, X } from 'lucide-react';
import { detailUrl, formatDistance, routeUrl } from './placeFormat';

export default function PlacePopup({ place, onClose }) {
  return (
    <div
      role="dialog"
      aria-label={`${place.plcConm} 요약`}
      className="absolute bottom-8 left-1/2 z-[4] w-[min(360px,calc(100%-32px))] -translate-x-1/2 rounded-modal bg-white p-5 shadow-depth-md max-md:bottom-[calc(var(--sheet-peek)+16px)]"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="닫기"
        className="absolute right-2.5 top-2.5 grid size-8 place-items-center rounded-full text-muted hover:bg-surface-2"
      >
        <X className="size-5" />
      </button>
      <span className="mb-1 block text-sm text-subtle">
        {place.plcClsfCdNm}
        {place.distance != null && ` · ${formatDistance(place.distance)}`}
      </span>
      <h3 className="pr-8 text-xl font-bold text-ink">
        <a
          href={detailUrl(place)}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline hover:underline-offset-[3px]"
        >
          {place.plcConm}
        </a>
      </h3>
      <dl className="mt-3 grid grid-cols-[20px_minmax(0,1fr)] gap-x-2 gap-y-1.5 text-sm text-ink-2">
        {place.rprsTelno && (
          <>
            <dt>
              <Phone className="size-[18px] text-subtle" />
            </dt>
            <dd>{place.rprsTelno}</dd>
          </>
        )}
        <dt>
          <MapPin className="size-[18px] text-subtle" />
        </dt>
        <dd>{place.plcAddr}</dd>
      </dl>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <a
          href={detailUrl(place)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-10 items-center justify-center gap-1.5 rounded-md bg-brand-500 font-semibold text-white hover:bg-brand-600"
        >
          상세보기
          <ExternalLink className="size-[18px]" />
        </a>
        <a
          href={routeUrl(place)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-10 items-center justify-center gap-1.5 rounded-md border border-input-line bg-white font-semibold text-ink-2 hover:bg-surface-2"
        >
          <Navigation className="size-[18px]" />
          길찾기
        </a>
      </div>
    </div>
  );
}
