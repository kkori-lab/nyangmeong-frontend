import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useId, useImperativeHandle, useRef, useState } from 'react';
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

const NAV_BUTTON =
  'grid size-8 place-items-center rounded-md text-[#566465] hover:enabled:bg-[#f4f6f6] disabled:cursor-not-allowed disabled:text-[#c8d0d0]';

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
 * - ref: 칸 버튼에 붙는다(바깥에서 포커스를 줄 때)
 * - 팝오버 너비: 데스크톱 296px, 모바일(760px 이하)은 칸 너비(최소 280px). 화면 좌우 16px 안으로 당겨 연다
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
  disabled = false,
  className = '',
}) {
  const dialogId = useId();
  const rootRef = useRef(null);
  const buttonRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isUp, setIsUp] = useState(false);
  const [offsetX, setOffsetX] = useState(0);
  const [popoverWidth, setPopoverWidth] = useState(POPOVER_WIDTH);
  const [activeYmd, setActiveYmd] = useState('');

  useImperativeHandle(ref, () => buttonRef.current, []);

  const today = getTodayYmd();
  const isOutOfRange = (ymd) => (min && ymd < min) || (max && ymd > max);

  const open = () => {
    const rect = buttonRef.current.getBoundingClientRect();
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
    setActiveYmd(clamp(value || today, min, max));
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
      if (!rootRef.current.contains(event.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
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
    if (event.key in steps) {
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

  return (
    <div ref={rootRef} className={`relative min-w-0 ${className}`}>
      <button
        ref={buttonRef}
        type="button"
        aria-label={label}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-controls={isOpen ? dialogId : undefined}
        disabled={disabled}
        onClick={() => (isOpen ? close() : open())}
        onKeyDown={handleKeyDown}
        className={`flex h-10 w-full cursor-pointer items-center rounded-md border bg-white pr-9 pl-3 text-left text-base focus:outline-none disabled:cursor-not-allowed disabled:bg-surface-2 max-[760px]:h-11 hover:enabled:border-[#b9c4c4] ${isOpen ? 'border-[#285a5c] shadow-[0_0_0_3px_rgba(182,218,172,0.5)]' : 'border-[#d3dae2]'}`}
      >
        <span
          className={`min-w-0 flex-1 truncate ${value && !disabled ? 'text-[#1a3234]' : 'text-[#8c9899]'}`}
        >
          {value ? formatDate(value) : placeholder}
        </span>
        <CalendarDays
          size={18}
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-[#566465]"
        />
      </button>
      {isOpen && (
        <div
          id={dialogId}
          role="dialog"
          aria-label={label ? `${label} 달력` : '달력'}
          onMouseDown={(event) => event.preventDefault()}
          style={{
            left: offsetX,
            width: popoverWidth,
          }}
          className={`absolute z-30 rounded-lg border border-[#e2e7e7] bg-white p-3 shadow-[0_12px_32px_-8px_rgba(15,23,35,0.18),0_2px_6px_rgba(15,23,35,0.06)] ${isUp ? 'bottom-[calc(100%+6px)]' : 'top-[calc(100%+6px)]'}`}
        >
          <div className="mb-2 flex items-center justify-between">
            <button
              type="button"
              aria-label="이전 달"
              disabled={isPrevDisabled}
              onClick={() => moveMonth(-1)}
              className={NAV_BUTTON}
            >
              <ChevronLeft size={18} aria-hidden="true" />
            </button>
            <span
              aria-live="polite"
              className="text-base leading-tight font-semibold tracking-[-0.03em] text-[#1a3234]"
            >
              {viewYear}년 {viewMonth + 1}월
            </span>
            <button
              type="button"
              aria-label="다음 달"
              disabled={isNextDisabled}
              onClick={() => moveMonth(1)}
              className={NAV_BUTTON}
            >
              <ChevronRight size={18} aria-hidden="true" />
            </button>
          </div>
          <div className="grid grid-cols-7 text-center">
            {[...WEEKDAYS].map((weekday) => (
              <span
                key={weekday}
                className="flex h-8 items-center justify-center text-xs leading-tight tracking-[-0.01em] text-[#8c9899]"
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
                  className={`mx-auto flex size-9 items-center justify-center rounded-md text-sm leading-tight tracking-[-0.03em] disabled:cursor-not-allowed disabled:text-[#c8d0d0] ${
                    isSelected
                      ? 'bg-[#e9f2f2] font-semibold text-[#1e4a4c]'
                      : `text-[#1a3234] ${isActive && !isDisabled ? 'bg-[#f4f6f6]' : ''}`
                  } ${isToday && !isSelected ? 'font-semibold ring-1 ring-[#b9c4c4] ring-inset' : ''}`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
