import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { formatYm } from '@/utils/yearMonth';

const YEAR_BUTTON =
  'grid size-10 place-items-center rounded-full border border-line bg-white text-ink-2 hover:enabled:border-line-strong disabled:cursor-not-allowed disabled:bg-surface-2 disabled:text-line-strong';

/** enabledYms: 선택 가능한 연월, maxYm 초과는 선택 불가, emptyNotice: 선택 창 아래 안내 */
export default function MonthPicker({
  ym,
  maxYm,
  enabledYms,
  onSelect,
  emptyNotice = '지출이 없는 달은 선택할 수 없어요',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewYear, setViewYear] = useState(Number(ym.slice(0, 4)));
  const rootRef = useRef(null);

  /** 바깥 클릭 시 변경 없이 닫기 */
  useEffect(() => {
    if (!isOpen) return undefined;
    const handleMouseDown = (event) => {
      if (!rootRef.current.contains(event.target)) setIsOpen(false);
    };
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const maxYear = Number(maxYm.slice(0, 4));
  const minYear = Math.min(
    maxYear,
    ...enabledYms.map((enabledYm) => Number(enabledYm.slice(0, 4))),
  );

  const handleToggle = () => {
    setViewYear(Number(ym.slice(0, 4)));
    setIsOpen((prev) => !prev);
  };

  const handleSelect = (month) => {
    onSelect(`${viewYear}-${String(month).padStart(2, '0')}`);
    setIsOpen(false);
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={handleToggle}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        className="inline-flex h-10 items-center justify-center gap-1 px-2 text-lg font-bold whitespace-nowrap hover:text-brand-600"
      >
        {formatYm(ym)}
        <ChevronDown
          className={`size-4 ${isOpen ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>
      {isOpen && (
        <div
          role="dialog"
          aria-label="월 선택"
          className="absolute top-[calc(100%+0.5rem)] left-1/2 z-30 w-80 max-w-[calc(100vw-2rem)] -translate-x-1/2 rounded-card border border-line bg-white p-4 shadow-depth-md"
        >
          <div className="mb-3 flex items-center justify-center gap-4 font-bold">
            <button
              type="button"
              onClick={() => setViewYear(viewYear - 1)}
              disabled={viewYear <= minYear}
              aria-label="이전 연도"
              className={YEAR_BUTTON}
            >
              <ChevronLeft className="size-5" />
            </button>
            <span>{viewYear}</span>
            <button
              type="button"
              onClick={() => setViewYear(viewYear + 1)}
              disabled={viewYear >= maxYear}
              aria-label="다음 연도"
              className={YEAR_BUTTON}
            >
              <ChevronRight className="size-5" />
            </button>
          </div>
          <div className="grid grid-cols-4 gap-1">
            {Array.from({ length: 12 }, (_, index) => index + 1).map(
              (month) => {
                const monthYm = `${viewYear}-${String(month).padStart(2, '0')}`;
                const isSelected = monthYm === ym;
                const isDisabled =
                  monthYm > maxYm || !enabledYms.includes(monthYm);
                return (
                  <button
                    key={month}
                    type="button"
                    onClick={() => handleSelect(month)}
                    disabled={isDisabled}
                    aria-pressed={isSelected}
                    className={`h-10 rounded-md hover:enabled:bg-surface-2 disabled:cursor-not-allowed disabled:text-line-strong ${
                      isSelected
                        ? 'bg-brand-500 font-bold text-white hover:enabled:bg-brand-500'
                        : 'text-ink-2'
                    }`}
                  >
                    {month}월
                  </button>
                );
              },
            )}
          </div>
          <p className="mt-3 text-center text-sm text-subtle">
            {emptyNotice}
          </p>
        </div>
      )}
    </div>
  );
}
