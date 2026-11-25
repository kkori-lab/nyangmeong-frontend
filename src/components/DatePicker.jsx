import {
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useEffect, useId, useImperativeHandle, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  getFixedOrigin,
  getPortalTarget,
  useLockOutsideScroll,
} from '@/hooks/useFloatingLayer';
import {
  formatDate,
  getTodayYmd,
  parseYmd,
  toYmd,
  WEEKDAYS,
} from '@/utils/formatDate';

const POPOVER_WIDTH = 296;
/** 모바일(760px 이하)에서는 칸 너비에 맞추되 이보다 좁아지지 않는다 */
const MOBILE_MIN_WIDTH = 280;
const MOBILE_MAX = 760;
const POPOVER_HEIGHT = 340;
const EDGE_GAP = 16;
/** 12년 칸: 보고 있는 해가 든 12년 묶음(예: 2016~2027) */
const YEARS_PER_PAGE = 12;

const NAV_BUTTON =
  'grid size-8 place-items-center rounded-md text-muted hover:enabled:bg-surface-2 disabled:cursor-not-allowed disabled:text-line-strong';

/** 'YYYY-MM-DD'에 날짜 수를 더한다 */
const addDays = (ymd, days) => {
  const date = parseYmd(ymd);
  date.setDate(date.getDate() + days);
  return toYmd(date);
};

/** 같은 일자로 달을 옮긴다(그 달에 없는 일자는 말일) */
const addMonths = (ymd, months) => {
  const date = parseYmd(ymd);
  const target = new Date(date.getFullYear(), date.getMonth() + months, 1);
  const lastDay = new Date(
    target.getFullYear(),
    target.getMonth() + 1,
    0,
  ).getDate();
  target.setDate(Math.min(date.getDate(), lastDay));
  return toYmd(target);
};

/** min·max 안으로 맞춘다 */
const clamp = (ymd, min, max) => {
  if (min && ymd < min) return min;
  if (max && ymd > max) return max;
  return ymd;
};

/**
 * 달력을 직접 그리는 날짜 칸 (브라우저 기본 날짜 입력 대신, 모든 기기 같은 모양)
 * - value: 'YYYY-MM-DD' 문자열, 빈 문자열이면 placeholder 표시. onChange에는 'YYYY-MM-DD' 문자열을 넘긴다
 * - min·max: 'YYYY-MM-DD', 밖의 날짜와 달 이동은 막힌다
 * - size: 'md'(기본, 높이 40px·16px) / 'sm'(높이 36px·14px) / 'xs'(높이 34px·14px)
 * - invalid: 빨간 테두리 + aria-invalid. id·describedBy: 칸 버튼에 붙는다(<label htmlFor>·오류 문구 연결)
 * - ref: 칸 버튼에 붙는다(바깥에서 포커스를 줄 때)
 * - 팝오버는 포털(모달 안이면 그 dialog, 아니면 body)에 fixed로 띄워 모달 본문 끝에 잘리지 않는다. 열린 동안 바깥 스크롤은 막는다
 * - 팝오버 너비: 데스크톱 296px, 모바일(760px 이하)은 칸 너비(최소 280px). 화면 좌우 16px 안으로 당겨 연다.
 *   연 채로 스크롤·창 크기를 바꾸면 위·아래 방향과 위치를 다시 잰다
 * - monthSelect: true면 헤더 "yyyy년 M월"을 눌러 연도 ◀▶ + 12개월 칸으로 보이는 달을 바로 옮긴다(기본 켜짐, 끄려면 false). 연·월 칸 헤더 "yyyy년"을 누르면 12년 칸으로 해를 고른다(날짜 → 월 → 연도).
 *   월을 골라도 value는 바뀌지 않고, 날짜를 눌렀을 때만 onChange가 불린다
 * - 키보드: ←→ 하루, ↑↓ 한 주 이동, Enter·Space 선택, Esc·Tab 닫기. 아래 공간이 모자라면 위로 열림
 */
export default function DatePicker({
  ref,
  value,
  onChange,
  min,
  max,
  label,
  placeholder = '날짜 선택',
  size = 'md',
  invalid = false,
  id,
  describedBy,
  disabled = false,
  monthSelect = true,
  className = '',
}) {
  const dialogId = useId();
  const rootRef = useRef(null);
  const buttonRef = useRef(null);
  const layerRef = useRef(null);
  const [anchorRect, setAnchorRect] = useState(null);
  const [portalTarget, setPortalTarget] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isUp, setIsUp] = useState(false);
  const [offsetX, setOffsetX] = useState(0);
  const [popoverWidth, setPopoverWidth] = useState(POPOVER_WIDTH);
  const [activeYmd, setActiveYmd] = useState('');
  /** monthSelect가 켜졌을 때 달력 대신 연·월 칸을 보이는 중인지 */
  const [isMonthView, setIsMonthView] = useState(false);
  const [pickerYear, setPickerYear] = useState(0);
  /** 연·월 칸에서 한 단계 더 올라가 12년 칸을 보이는 중인지, 그 첫 해 */
  const [isYearView, setIsYearView] = useState(false);
  const [yearStart, setYearStart] = useState(0);

  useImperativeHandle(ref, () => buttonRef.current, []);

  const today = getTodayYmd();
  const isOutOfRange = (ymd) => (min && ymd < min) || (max && ymd > max);

  /** 칸 위치로 팝오버 방향·너비·좌우 위치를 잰다 */
  const measure = () => {
    const rect = buttonRef.current.getBoundingClientRect();
    setAnchorRect(rect);
    const below = window.innerHeight - rect.bottom;
    setIsUp(below < POPOVER_HEIGHT && rect.top > below);
    const isMobile = window.innerWidth <= MOBILE_MAX;
    const width = Math.min(
      isMobile ? Math.max(rect.width, MOBILE_MIN_WIDTH) : POPOVER_WIDTH,
      window.innerWidth - EDGE_GAP * 2,
    );
    setPopoverWidth(width);
    const overflowRight = rect.left + width - (window.innerWidth - EDGE_GAP);
    setOffsetX(
      overflowRight > 0 ? Math.max(-overflowRight, EDGE_GAP - rect.left) : 0,
    );
  };

  const open = () => {
    setPortalTarget(getPortalTarget(buttonRef.current));
    measure();
    setActiveYmd(clamp(value || today, min, max));
    setIsMonthView(false);
    setIsYearView(false);
    setIsOpen(true);
  };

  const close = () => setIsOpen(false);

  const pick = (ymd) => {
    if (isOutOfRange(ymd)) return;
    onChange(ymd);
    close();
    buttonRef.current.focus();
  };

  /** 바깥을 누르면 닫힘 */
  useEffect(() => {
    if (!isOpen) return undefined;
    const handleMouseDown = (event) => {
      if (
        !rootRef.current.contains(event.target) &&
        !layerRef.current?.contains(event.target)
      )
        setIsOpen(false);
    };
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [isOpen]);

  useLockOutsideScroll(isOpen, layerRef);

  /** 연 채로 스크롤·리사이즈하면 다시 잰다(위로 밀려 화면 밖으로 나가지 않게) */
  useEffect(() => {
    if (!isOpen) return undefined;
    const handleChange = () => measure();
    window.addEventListener('scroll', handleChange, true);
    window.addEventListener('resize', handleChange);
    return () => {
      window.removeEventListener('scroll', handleChange, true);
      window.removeEventListener('resize', handleChange);
    };
  }, [isOpen]);

  const moveActive = (days) => {
    const next = addDays(activeYmd, days);
    if (!isOutOfRange(next)) setActiveYmd(next);
  };

  const handleKeyDown = (event) => {
    if (!isOpen) {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        open();
      }
      return;
    }
    const steps = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
    if ((isMonthView || isYearView) && event.key in steps) {
      // 연·월 칸에서는 날짜를 옮기지 않는다
      event.preventDefault();
    } else if (
      (isMonthView || isYearView) &&
      (event.key === 'Enter' || event.key === ' ')
    ) {
      // 값은 날짜를 눌렀을 때만 바뀐다
      event.preventDefault();
    } else if (event.key in steps) {
      event.preventDefault();
      moveActive(steps[event.key]);
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      pick(activeYmd);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      close();
    } else if (event.key === 'Tab') {
      close();
    }
  };

  /** 보고 있는 달: 키보드로 옮긴 날짜가 있는 달 */
  const viewDate = activeYmd ? parseYmd(activeYmd) : new Date();
  const viewYear = viewDate.getFullYear();
  const viewMonth = viewDate.getMonth();
  const firstWeekday = new Date(viewYear, viewMonth, 1).getDay();
  const dayCount = new Date(viewYear, viewMonth + 1, 0).getDate();
  const prevMonthLast = toYmd(new Date(viewYear, viewMonth, 0));
  const nextMonthFirst = toYmd(new Date(viewYear, viewMonth + 1, 1));
  const isPrevDisabled = Boolean(min) && prevMonthLast < min;
  const isNextDisabled = Boolean(max) && nextMonthFirst > max;

  const moveMonth = (months) =>
    setActiveYmd(clamp(addMonths(activeYmd, months), min, max));

  const minYear = min ? parseYmd(min).getFullYear() : null;
  const maxYear = max ? parseYmd(max).getFullYear() : null;

  const openMonthView = () => {
    setPickerYear(viewYear);
    setIsMonthView(true);
  };

  /** 보이는 달만 옮긴다. onChange를 부르지 않으므로 value는 그대로다 */
  const pickMonth = (month) => {
    const diff = (pickerYear - viewYear) * 12 + (month - viewMonth);
    setActiveYmd(clamp(addMonths(activeYmd, diff), min, max));
    setIsMonthView(false);
  };

  const openYearView = () => {
    setYearStart(Math.floor(pickerYear / YEARS_PER_PAGE) * YEARS_PER_PAGE);
    setIsMonthView(false);
    setIsYearView(true);
  };

  /** 해를 고르면 그 해의 연·월 칸으로 돌아간다 */
  const pickYear = (year) => {
    setPickerYear(year);
    setIsYearView(false);
    setIsMonthView(true);
  };

  const isYearOutOfRange = (year) =>
    (minYear !== null && year < minYear) ||
    (maxYear !== null && year > maxYear);

  const isMonthOutOfRange = (year, month) => {
    const first = toYmd(new Date(year, month, 1));
    const last = toYmd(new Date(year, month + 1, 0));
    return (min && last < min) || (max && first > max);
  };

  const borderClass = invalid
    ? `border-danger ${isOpen ? 'shadow-[0_0_0_3px_rgba(180,71,58,0.18)]' : ''}`
    : isOpen
      ? 'border-brand-500 shadow-[0_0_0_3px_rgba(182,218,172,0.5)]'
      : 'border-input-line hover:enabled:border-line-strong';
  let labelColor = 'text-placeholder';
  if (disabled) labelColor = 'text-subtle';
  else if (value) labelColor = 'text-ink';

  return (
    <div ref={rootRef} className={`relative min-w-0 ${className}`}>
      <button
        ref={buttonRef}
        type="button"
        id={id}
        aria-label={label}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-controls={isOpen ? dialogId : undefined}
        disabled={disabled}
        onClick={() => (isOpen ? close() : open())}
        onKeyDown={handleKeyDown}
        className={`flex w-full cursor-pointer items-center rounded-md border bg-white pr-9 pl-3 text-left focus:outline-none disabled:cursor-not-allowed disabled:bg-surface-2 ${size === 'xs' ? 'h-[34px] text-sm' : size === 'sm' ? 'h-9 text-sm' : 'h-10 text-base max-[760px]:h-11'} ${borderClass}`}
      >
        <span className={`min-w-0 flex-1 truncate ${labelColor}`}>
          {value ? formatDate(value) : placeholder}
        </span>
        <CalendarDays
          size={18}
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-muted"
        />
      </button>
      {isOpen &&
        anchorRect &&
        portalTarget &&
        createPortal(
          <div
            ref={layerRef}
            id={dialogId}
            role="dialog"
            aria-label={label ? `${label} 달력` : '달력'}
            onMouseDown={(event) => event.preventDefault()}
            // <label> 안에 둘 때 달력 클릭이 라벨을 거쳐 칸 버튼을 다시 누르지 않게
            onClick={(event) => event.preventDefault()}
            // 칸 아래(위로 열 때는 칸 위) 6px. fixed 기준점이 화면이 아니면 그만큼 뺀다
            style={{
              left: anchorRect.left + offsetX - getFixedOrigin(portalTarget).x,
              top:
                (isUp ? anchorRect.top - 6 : anchorRect.bottom + 6) -
                getFixedOrigin(portalTarget).y,
              width: popoverWidth,
              transform: isUp ? 'translateY(-100%)' : undefined,
            }}
            className="fixed z-30 rounded-lg border border-line bg-white p-3 text-left shadow-[0_12px_32px_-8px_rgba(15,23,35,0.18),0_2px_6px_rgba(15,23,35,0.06)]"
          >
            <div className="mb-2 flex items-center justify-between">
              <button
                type="button"
                aria-label={
                  isYearView
                    ? '이전 12년'
                    : isMonthView
                      ? '이전 연도'
                      : '이전 달'
                }
                disabled={
                  isYearView
                    ? minYear !== null && yearStart <= minYear
                    : isMonthView
                      ? minYear !== null && pickerYear <= minYear
                      : isPrevDisabled
                }
                onClick={() => {
                  if (isYearView) setYearStart(yearStart - YEARS_PER_PAGE);
                  else if (isMonthView) setPickerYear(pickerYear - 1);
                  else moveMonth(-1);
                }}
                className={NAV_BUTTON}
              >
                <ChevronLeft size={18} aria-hidden="true" />
              </button>
              {isYearView ? (
                <span
                  aria-live="polite"
                  className="text-base leading-tight font-semibold tracking-[-0.03em] text-ink"
                >
                  {yearStart}년 – {yearStart + YEARS_PER_PAGE - 1}년
                </span>
              ) : isMonthView ? (
                <button
                  type="button"
                  aria-haspopup="true"
                  aria-expanded={false}
                  aria-label={`${pickerYear}년, 연도 선택`}
                  onClick={openYearView}
                  className="inline-flex h-8 cursor-pointer items-center gap-1 rounded-md px-2 text-base leading-tight font-semibold tracking-[-0.03em] text-ink hover:bg-surface-2"
                >
                  {pickerYear}년
                  <ChevronDown size={16} aria-hidden="true" />
                </button>
              ) : monthSelect ? (
                <button
                  type="button"
                  aria-haspopup="true"
                  aria-expanded={false}
                  aria-label={`${viewYear}년 ${viewMonth + 1}월, 연·월 선택`}
                  onClick={openMonthView}
                  className="inline-flex h-8 cursor-pointer items-center gap-1 rounded-md px-2 text-base leading-tight font-semibold tracking-[-0.03em] text-ink hover:bg-surface-2"
                >
                  {viewYear}년 {viewMonth + 1}월
                  <ChevronDown size={16} aria-hidden="true" />
                </button>
              ) : (
                <span
                  aria-live="polite"
                  className="text-base leading-tight font-semibold tracking-[-0.03em] text-ink"
                >
                  {viewYear}년 {viewMonth + 1}월
                </span>
              )}
              <button
                type="button"
                aria-label={
                  isYearView
                    ? '다음 12년'
                    : isMonthView
                      ? '다음 연도'
                      : '다음 달'
                }
                disabled={
                  isYearView
                    ? maxYear !== null &&
                      yearStart + YEARS_PER_PAGE - 1 >= maxYear
                    : isMonthView
                      ? maxYear !== null && pickerYear >= maxYear
                      : isNextDisabled
                }
                onClick={() => {
                  if (isYearView) setYearStart(yearStart + YEARS_PER_PAGE);
                  else if (isMonthView) setPickerYear(pickerYear + 1);
                  else moveMonth(1);
                }}
                className={NAV_BUTTON}
              >
                <ChevronRight size={18} aria-hidden="true" />
              </button>
            </div>
            {isYearView ? (
              <div className="grid grid-cols-4 gap-1">
                {Array.from({ length: YEARS_PER_PAGE }, (_, index) => {
                  const year = yearStart + index;
                  const isCurrent = year === pickerYear;
                  return (
                    <button
                      key={year}
                      type="button"
                      tabIndex={-1}
                      disabled={isYearOutOfRange(year)}
                      aria-pressed={isCurrent}
                      onClick={() => pickYear(year)}
                      className={`h-10 rounded-md text-sm tracking-[-0.03em] tabular-nums hover:enabled:bg-surface-2 disabled:cursor-not-allowed disabled:text-line-strong ${
                        isCurrent
                          ? 'bg-brand-500 font-bold text-white hover:enabled:bg-brand-500'
                          : 'text-ink-2'
                      }`}
                    >
                      {year}
                    </button>
                  );
                })}
              </div>
            ) : isMonthView ? (
              <div className="grid grid-cols-4 gap-1">
                {Array.from({ length: 12 }, (_, index) => {
                  const isCurrent =
                    pickerYear === viewYear && index === viewMonth;
                  return (
                    <button
                      key={index}
                      type="button"
                      tabIndex={-1}
                      disabled={isMonthOutOfRange(pickerYear, index)}
                      aria-pressed={isCurrent}
                      onClick={() => pickMonth(index)}
                      className={`h-10 rounded-md text-sm tracking-[-0.03em] hover:enabled:bg-surface-2 disabled:cursor-not-allowed disabled:text-line-strong ${
                        isCurrent
                          ? 'bg-brand-500 font-bold text-white hover:enabled:bg-brand-500'
                          : 'text-ink-2'
                      }`}
                    >
                      {index + 1}월
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="grid grid-cols-7 text-center">
                {[...WEEKDAYS].map((weekday) => (
                  <span
                    key={weekday}
                    className="flex h-8 items-center justify-center text-xs leading-tight tracking-[-0.01em] text-placeholder"
                  >
                    {weekday}
                  </span>
                ))}
                {Array.from({ length: firstWeekday }, (_, index) => (
                  <span key={`blank-${index}`} aria-hidden="true" />
                ))}
                {Array.from({ length: dayCount }, (_, index) => {
                  const day = index + 1;
                  const ymd = toYmd(new Date(viewYear, viewMonth, day));
                  const isSelected = ymd === value;
                  const isActive = ymd === activeYmd;
                  const isToday = ymd === today;
                  const isDisabled = isOutOfRange(ymd);
                  return (
                    <button
                      key={ymd}
                      type="button"
                      tabIndex={-1}
                      disabled={isDisabled}
                      aria-label={formatDate(ymd, { weekday: true })}
                      aria-pressed={isSelected}
                      aria-current={isToday ? 'date' : undefined}
                      onClick={() => pick(ymd)}
                      onMouseEnter={() => setActiveYmd(ymd)}
                      className={`mx-auto flex size-9 items-center justify-center rounded-md text-sm leading-tight tracking-[-0.03em] disabled:cursor-not-allowed disabled:text-line-strong ${
                        isSelected
                          ? 'bg-brand-50 font-semibold text-brand-600'
                          : `text-ink ${isActive && !isDisabled ? 'bg-surface-2' : ''}`
                      } ${isToday && !isSelected ? 'font-semibold ring-1 ring-line-strong ring-inset' : ''}`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            )}
          </div>,
          portalTarget,
        )}
    </div>
  );
}
