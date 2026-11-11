import { ChevronDown } from 'lucide-react';
import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const EMPTY = { period: '', hour: '', minute: '' };
const pad = (number) => String(number).padStart(2, '0');

const PERIOD_OPTIONS = [
  { value: '', label: '--' },
  { value: 'AM', label: '오전' },
  { value: 'PM', label: '오후' },
];
const HOUR_OPTIONS = [
  { value: '', label: '--' },
  ...Array.from({ length: 12 }, (_, index) => ({
    value: pad(index + 1),
    label: pad(index + 1),
  })),
];
const MINUTE_OPTIONS = [
  { value: '', label: '--' },
  ...Array.from({ length: 60 }, (_, index) => ({
    value: pad(index),
    label: pad(index),
  })),
];

/** "HH:mm"(24시간) → 오전/오후·시(01~12)·분. 빈 값·형식이 다르면 세 칸 모두 비움 */
function parseTime(value) {
  const match = /^(\d{2}):(\d{2})/.exec(value ?? '');
  if (!match) return EMPTY;
  const hour24 = Number(match[1]);
  return {
    period: hour24 < 12 ? 'AM' : 'PM',
    hour: pad(hour24 % 12 === 0 ? 12 : hour24 % 12),
    minute: match[2],
  };
}

/** 세 칸이 다 골라졌을 때만 "HH:mm", 하나라도 비면 "" */
function toTime({ period, hour, minute }) {
  if (!period || !hour || !minute) return '';
  const hour24 = (Number(hour) % 12) + (period === 'PM' ? 12 : 0);
  return `${pad(hour24)}:${minute}`;
}

/**
 * 오전/오후 · 시 · 분 세 칸 시간 선택. 브라우저 기본 시간 창(목록이 끝없이 도는 것)과 기본 셀렉트(목록이 위로 펼쳐지기도 함) 대신 씀
 * - value·onChange는 input type="time"과 같은 "HH:mm"(24시간) 문자열. 세 칸이 다 골라지기 전에는 ""
 * - 일부만 고른 칸은 안에 들고 있어 다시 그려도 지워지지 않음
 * - ref: 첫 칸(오전/오후) 버튼에 붙음
 * - invalid: 세 칸 모두 빨간 테두리 + aria-invalid(공용 DropdownSelect·DatePicker와 같은 오류 표시)
 */
export default function TimeSelect({
  ref,
  value,
  onChange,
  disabled = false,
  invalid = false,
  'aria-label': ariaLabel = '시간',
  className = '',
}) {
  const [draft, setDraft] = useState(() => parseTime(value));
  const [prevValue, setPrevValue] = useState(value);

  // 바깥에서 값이 바뀌면(초기화·다른 기록 열기) 칸을 다시 맞춘다. 고르는 중인 칸과 같은 값이면 그대로 둔다
  if (value !== prevValue) {
    setPrevValue(value);
    if (value !== toTime(draft)) setDraft(parseTime(value));
  }

  const change = (key) => (next) => {
    const nextDraft = { ...draft, [key]: next };
    setDraft(nextDraft);
    onChange(toTime(nextDraft));
  };

  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={`flex gap-1.5 tabular-nums ${className}`}
    >
      {/* 오른쪽 화살표 자리가 고정이라 칸마다 글자가 다 보이는 최소 폭을 준다 */}
      <TimeDropdown
        ref={ref}
        className="min-w-20 flex-1"
        label={`${ariaLabel} 오전/오후`}
        value={draft.period}
        options={PERIOD_OPTIONS}
        disabled={disabled}
        invalid={invalid}
        onChange={change('period')}
      />
      <TimeDropdown
        className="min-w-17 flex-1"
        label={`${ariaLabel} 시`}
        value={draft.hour}
        options={HOUR_OPTIONS}
        disabled={disabled}
        invalid={invalid}
        onChange={change('hour')}
      />
      <TimeDropdown
        className="min-w-17 flex-1"
        label={`${ariaLabel} 분`}
        value={draft.minute}
        options={MINUTE_OPTIONS}
        disabled={disabled}
        invalid={invalid}
        onChange={change('minute')}
      />
    </div>
  );
}

/** 목록 안에서 option이 보이게 목록만 스크롤한다(페이지·모달은 움직이지 않게 scrollIntoView를 쓰지 않음) */
function scrollOptionIntoView(list, index, isCentered) {
  const option = list?.children[index];
  if (!option) return;
  const { offsetTop, offsetHeight } = option;
  if (isCentered) {
    list.scrollTop = offsetTop - (list.clientHeight - offsetHeight) / 2;
  } else if (offsetTop < list.scrollTop) {
    list.scrollTop = offsetTop;
  } else if (offsetTop + offsetHeight > list.scrollTop + list.clientHeight) {
    list.scrollTop = offsetTop + offsetHeight - list.clientHeight;
  }
}

/**
 * 칸을 품은 가장 가까운 세로 스크롤 영역(모달 본문·dialog). 모달 안이면 dialog까지만 찾는다.
 * 모달 밖이면 페이지, 단 페이지가 스크롤 잠김(overflow hidden)이면 없음
 */
function findScrollParent(node) {
  for (let el = node?.parentElement; el; el = el.parentElement) {
    const { overflowY } = getComputedStyle(el);
    if (/(auto|scroll)/.test(overflowY) && el.scrollHeight > el.clientHeight)
      return el;
    if (el.tagName === 'DIALOG') return null;
  }
  const root = document.scrollingElement;
  const isLocked = [root, document.body].some(
    (el) => getComputedStyle(el).overflowY === 'hidden',
  );
  return isLocked ? null : root;
}

/**
 * 목록이 화면 아래로 넘치면 칸이 든 스크롤 영역을 넘친 만큼 올려 목록이 다 보이게 한다(위로 뒤집지 않음).
 * 더 올릴 수 없으면 남은 높이를 돌려줘 그 높이까지만 쓰게 한다. 넘치지 않으면 null
 */
function fitBelow(button, list) {
  const gap = parseFloat(getComputedStyle(list).marginTop);
  const listRect = list.getBoundingClientRect();
  let overflow = listRect.bottom + gap - window.innerHeight;
  if (overflow <= 0) return null;
  const scroller = findScrollParent(button);
  if (scroller) {
    // 스크롤한 양이 아니라 칸이 실제로 올라간 만큼만 뺀다
    const topBefore = button.getBoundingClientRect().top;
    scroller.scrollTop += overflow;
    overflow -= topBefore - button.getBoundingClientRect().top;
  }
  return overflow > 0 ? listRect.height - overflow : null;
}

/**
 * TimeSelect 한 칸. 닫힌 칸은 공용 Select와 같은 모양, 목록은 항상 칸 바로 아래에 펼친다
 * - 목록은 칸이 든 dialog(없으면 body)에 포털로 그리고 fixed로 칸 아래에 붙인다.
 *   모달 본문 overflow에 잘리지 않고, body로 보내면 dialog(최상위 레이어) 뒤에 깔리므로 dialog 안에 둔다
 * - 키보드는 select-only 콤보박스 방식: 포커스는 칸 버튼에 두고 aria-activedescendant로 목록 위치를 알린다
 */
function TimeDropdown({
  ref,
  value,
  options,
  label,
  disabled,
  invalid,
  onChange,
  className,
}) {
  const listId = useId();
  const buttonRef = useRef(null);
  const listRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [rect, setRect] = useState(null);
  const [portalTarget, setPortalTarget] = useState(null);
  // 화면 아래 끝까지 올려도 목록이 다 안 들어갈 때만 쓰는 높이
  const [fitHeight, setFitHeight] = useState(null);
  const selectedIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  );
  const selectedLabel = options[selectedIndex].label;

  const setButtonRef = (node) => {
    buttonRef.current = node;
    if (typeof ref === 'function') ref(node);
    else if (ref) ref.current = node;
  };

  const open = () => {
    if (disabled) return;
    setActiveIndex(selectedIndex);
    setRect(buttonRef.current.getBoundingClientRect());
    setPortalTarget(buttonRef.current.closest('dialog') ?? document.body);
    setFitHeight(null);
    setIsOpen(true);
  };
  const close = () => setIsOpen(false);
  const choose = (index) => {
    const next = options[index].value;
    if (next !== value) onChange(next);
    close();
  };

  // 열 때 목록이 화면 안에 들어오게 맞춘다
  useLayoutEffect(() => {
    if (!isOpen || !listRef.current) return;
    const height = fitBelow(buttonRef.current, listRef.current);
    if (height != null) setFitHeight(height);
  }, [isOpen]);

  // 열 때(높이를 줄였으면 줄인 뒤) 고른 값을 목록 가운데에 보이게. 고르면 닫히므로 열린 동안 selectedIndex는 바뀌지 않는다
  useLayoutEffect(() => {
    if (isOpen) scrollOptionIntoView(listRef.current, selectedIndex, true);
  }, [isOpen, selectedIndex, fitHeight]);

  // 열린 동안: 바깥을 누르면 닫고, 페이지·모달이 스크롤되거나 창 크기가 바뀌면 칸 위치를 다시 잰다
  useEffect(() => {
    if (!isOpen) return undefined;
    const handlePointerDown = (event) => {
      if (
        !buttonRef.current?.contains(event.target) &&
        !listRef.current?.contains(event.target)
      )
        setIsOpen(false);
    };
    const updateRect = (event) => {
      if (event?.target === listRef.current) return;
      if (buttonRef.current) setRect(buttonRef.current.getBoundingClientRect());
    };
    document.addEventListener('pointerdown', handlePointerDown, true);
    window.addEventListener('scroll', updateRect, true);
    window.addEventListener('resize', updateRect);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown, true);
      window.removeEventListener('scroll', updateRect, true);
      window.removeEventListener('resize', updateRect);
    };
  }, [isOpen]);

  const moveActive = (nextIndex) => {
    const index = Math.min(options.length - 1, Math.max(0, nextIndex));
    setActiveIndex(index);
    scrollOptionIntoView(listRef.current, index, false);
  };

  const handleKeyDown = (event) => {
    if (!isOpen) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) {
        event.preventDefault();
        open();
      }
      return;
    }
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        moveActive(activeIndex + 1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        moveActive(activeIndex - 1);
        break;
      case 'Home':
        event.preventDefault();
        moveActive(0);
        break;
      case 'End':
        event.preventDefault();
        moveActive(options.length - 1);
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        choose(activeIndex);
        break;
      case 'Escape':
        // 모달 안에서 Esc가 모달까지 닫지 않게 여기서 멈춘다
        event.preventDefault();
        event.stopPropagation();
        close();
        break;
      case 'Tab':
        close();
        break;
      default:
    }
  };

  return (
    <div className={`relative ${className}`}>
      <button
        ref={setButtonRef}
        type="button"
        role="combobox"
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={isOpen ? listId : undefined}
        aria-activedescendant={isOpen ? `${listId}-${activeIndex}` : undefined}
        aria-invalid={invalid || undefined}
        disabled={disabled}
        className={`block h-10 w-full cursor-pointer rounded-md border bg-white pr-9 pl-3 text-left whitespace-nowrap focus:ring-focus focus:outline-none disabled:cursor-not-allowed disabled:bg-surface-2 disabled:text-subtle ${invalid ? 'border-danger' : 'border-input-line hover:border-line-strong focus:border-brand-500'}`}
        onClick={() => (isOpen ? close() : open())}
        onKeyDown={handleKeyDown}
      >
        {selectedLabel}
      </button>
      <ChevronDown
        aria-hidden="true"
        className={`pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-subtle transition-transform ${isOpen ? 'rotate-180' : ''}`}
      />

      {isOpen &&
        rect &&
        portalTarget &&
        createPortal(
          <ul
            ref={listRef}
            id={listId}
            role="listbox"
            aria-label={label}
            tabIndex={-1}
            // 아래로만 연다. 높이는 max-h-60, 화면 끝까지 올려도 모자랄 때만 남은 높이(fitHeight)
            style={{
              top: rect.bottom,
              left: rect.left,
              width: rect.width,
              ...(fitHeight != null && { maxHeight: fitHeight }),
            }}
            className="fixed z-50 mt-1 max-h-60 overflow-y-auto overscroll-contain rounded-md border border-line bg-white py-1 tabular-nums shadow-depth-sm [scrollbar-width:thin]"
          >
            {options.map((option, index) => {
              const isSelected = index === selectedIndex;
              const isActive = index === activeIndex;
              return (
                <li
                  key={option.value}
                  id={`${listId}-${index}`}
                  role="option"
                  aria-selected={isSelected}
                  className={`cursor-pointer px-3 py-1.5 ${
                    isSelected
                      ? 'bg-brand-50 font-semibold text-brand-500'
                      : isActive
                        ? 'bg-surface-2 text-ink'
                        : 'text-ink'
                  }`}
                  // 누르는 동안 포커스가 칸 버튼에서 빠지지 않게
                  onMouseDown={(event) => event.preventDefault()}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => choose(index)}
                >
                  {option.label}
                </li>
              );
            })}
          </ul>,
          portalTarget,
        )}
    </div>
  );
}
