import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { formatYm } from '@/utils/yearMonth';

/** 12년 칸: 보고 있는 해가 든 12년 묶음(예: 2016~2027) */
const YEARS_PER_PAGE = 12;

const YEAR_BUTTON =
  'grid size-10 place-items-center rounded-full border border-line bg-white text-ink-2 hover:enabled:border-line-strong disabled:cursor-not-allowed disabled:bg-surface-2 disabled:text-line-strong';

/**
 * enabledYms: 선택 가능한 연월(넘길 때만 그 밖의 달을 막는다), maxYm: 넘기면 그 뒤 달은 선택 불가
 * emptyNotice: enabledYms를 넘겼을 때만 선택 창 아래 안내, disabled: 연월 버튼 막기
 * yearSelect: true면 창 위 연도를 눌러 12년 칸으로 해를 고른다(기본 꺼짐, 마이페이지는 끈 채로 쓴다)
 * align: 'center'(기본, 버튼 가운데 아래) / 'end'(오른쪽 끝을 맞춰 왼쪽으로 펼침, 화면 오른쪽 끝에 놓일 때)
 */
export default function MonthPicker({
  ym,
  maxYm,
  enabledYms,
  onSelect,
  emptyNotice = '지출이 없는 달은 선택할 수 없어요',
  disabled = false,
  align = 'center',
  yearSelect = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewYear, setViewYear] = useState(Number(ym.slice(0, 4)));
  /** yearSelect일 때 12년 칸을 보이는 중인지, 그 첫 해 */
  const [isYearView, setIsYearView] = useState(false);
  const [yearStart, setYearStart] = useState(0);
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

  /** 넘긴 값이 없으면 연도 이동을 막지 않는다(null) */
  const maxYear = maxYm ? Number(maxYm.slice(0, 4)) : null;
  const enabledYears = (enabledYms ?? []).map((enabledYm) =>
    Number(enabledYm.slice(0, 4)),
  );
  const minYear = enabledYms
    ? Math.min(...enabledYears, maxYear ?? Infinity)
    : null;

  const handleToggle = () => {
    setViewYear(Number(ym.slice(0, 4)));
    setIsYearView(false);
    setIsOpen((prev) => !prev);
  };

  const openYearView = () => {
    setYearStart(Math.floor(viewYear / YEARS_PER_PAGE) * YEARS_PER_PAGE);
    setIsYearView(true);
  };

  /** 해를 고르면 그 해의 월 칸으로 돌아간다 */
  const handleSelectYear = (year) => {
    setViewYear(year);
    setIsYearView(false);
  };

  const isYearOutOfRange = (year) =>
    (minYear !== null && year < minYear) ||
    (maxYear !== null && year > maxYear);

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
        disabled={disabled}
        className="inline-flex h-10 items-center justify-center gap-1 px-2 text-lg font-bold whitespace-nowrap hover:enabled:text-brand-600 disabled:cursor-not-allowed disabled:opacity-40"
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
          className={`absolute top-[calc(100%+0.5rem)] z-30 w-80 max-w-[calc(100vw-2rem)] ${align === 'end' ? 'right-0' : 'left-1/2 -translate-x-1/2'} rounded-card border border-line bg-white p-4 shadow-depth-md`}
        >
          <div className="mb-3 flex items-center justify-center gap-4 font-bold">
            <button
              type="button"
              onClick={() =>
                isYearView
                  ? setYearStart(yearStart - YEARS_PER_PAGE)
                  : setViewYear(viewYear - 1)
              }
              disabled={
                minYear !== null &&
                (isYearView ? yearStart <= minYear : viewYear <= minYear)
              }
              aria-label={isYearView ? '이전 12년' : '이전 연도'}
              className={YEAR_BUTTON}
            >
              <ChevronLeft className="size-5" />
            </button>
            {isYearView ? (
              <span className="tabular-nums">
                {yearStart} – {yearStart + YEARS_PER_PAGE - 1}
              </span>
            ) : yearSelect ? (
              <button
                type="button"
                onClick={openYearView}
                aria-label={`${viewYear}년, 연도 선택`}
                className="inline-flex h-10 items-center gap-1 rounded-md px-2 hover:bg-surface-2"
              >
                {viewYear}
                <ChevronDown className="size-4" aria-hidden="true" />
              </button>
            ) : (
              <span>{viewYear}</span>
            )}
            <button
              type="button"
              onClick={() =>
                isYearView
                  ? setYearStart(yearStart + YEARS_PER_PAGE)
                  : setViewYear(viewYear + 1)
              }
              disabled={
                maxYear !== null &&
                (isYearView
                  ? yearStart + YEARS_PER_PAGE - 1 >= maxYear
                  : viewYear >= maxYear)
              }
              aria-label={isYearView ? '다음 12년' : '다음 연도'}
              className={YEAR_BUTTON}
            >
              <ChevronRight className="size-5" />
            </button>
          </div>
          {isYearView ? (
            <div className="grid grid-cols-4 gap-1">
              {Array.from(
                { length: YEARS_PER_PAGE },
                (_, index) => yearStart + index,
              ).map((year) => (
                <button
                  key={year}
                  type="button"
                  onClick={() => handleSelectYear(year)}
                  disabled={isYearOutOfRange(year)}
                  aria-pressed={year === viewYear}
                  className={`h-10 rounded-md tabular-nums hover:enabled:bg-surface-2 disabled:cursor-not-allowed disabled:text-line-strong ${
                    year === viewYear
                      ? 'bg-brand-500 font-bold text-white hover:enabled:bg-brand-500'
                      : 'text-ink-2'
                  }`}
                >
                  {year}
                </button>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-1">
              {Array.from({ length: 12 }, (_, index) => index + 1).map(
                (month) => {
                  const monthYm = `${viewYear}-${String(month).padStart(2, '0')}`;
                  const isSelected = monthYm === ym;
                  const isDisabled =
                    (maxYm && monthYm > maxYm) ||
                    (enabledYms && !enabledYms.includes(monthYm));
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
          )}
          {enabledYms && (
            <p className="mt-3 text-center text-sm text-subtle">
              {emptyNotice}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
