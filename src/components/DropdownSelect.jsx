import { Check, ChevronDown } from 'lucide-react';
import { useEffect, useId, useImperativeHandle, useRef, useState } from 'react';

const ITEM_HEIGHT = 36;
const LIST_MAX_HEIGHT = 256;

/**
 * 목록을 직접 그리는 셀렉트 (디자인의 custom select)
 * - options: [{ value, label, disabled? }], 고르지 않았을 때는 placeholder 표시. disabled 항목은 회색이고 고를 수 없다
 * - isPill: 알약형 버튼에 종합 건강기록 히어로와 같은 색(초록 바탕·흰 글자). 목록은 버튼보다 좁아지지 않고 긴 이름만큼 넓어짐
 * - placeholderValue: 이 값을 고른 상태면 닫힌 칸에 placeholder 문구를 보인다(첫 항목 '전체'를 '상태: 전체'로 보일 때)
 * - size: 'md'(기본, 높이 40px·16px) / 'sm'(높이 36px·14px)
 * - variant: 'box'(기본, 테두리 칸) / 'text'(테두리·배경 없이 글자 + 화살표, 목록 머리·칩 안에 둘 때)
 * - invalid: 빨간 테두리 + aria-invalid. id·describedBy: 버튼에 붙는다(<label htmlFor>·오류 문구 연결)
 * - disabled: 열리지 않고 회색. ref: 버튼에 붙는다(바깥에서 포커스를 줄 때)
 * - 키보드: ↑↓ 이동, Enter·Space 선택, Esc·Tab 닫기. 아래 공간이 모자라면 위로 열림
 */
export default function DropdownSelect({
  ref,
  value,
  onChange,
  options,
  placeholder,
  placeholderValue,
  label,
  isPill = false,
  size = 'md',
  variant = 'box',
  invalid = false,
  id,
  describedBy,
  disabled = false,
  className = '',
}) {
  const listId = useId();
  const rootRef = useRef(null);
  const buttonRef = useRef(null);
  const listRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isUp, setIsUp] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  useImperativeHandle(ref, () => buttonRef.current, []);

  const selectedIndex = options.findIndex((option) => option.value === value);
  const selected = options[selectedIndex];

  const isText = variant === 'text';
  const isSmall = size === 'sm' || isText;

  let buttonClass;
  if (isText) {
    buttonClass = `inline-flex max-w-full items-center bg-transparent py-1 pr-5 text-sm leading-tight tracking-[-0.03em] text-ink-2 ${invalid ? 'text-danger' : ''}`;
  } else if (isPill) {
    buttonClass = `flex h-10 w-full items-center rounded-full border border-brand-500 bg-brand-500 pr-10 pl-5 text-base font-semibold text-white hover:enabled:bg-brand-600 disabled:opacity-60 max-[760px]:h-11 ${isOpen ? 'shadow-[0_0_0_3px_rgba(249,234,166,0.6)]' : ''}`;
  } else {
    const borderClass = invalid
      ? `border-danger ${isOpen ? 'shadow-[0_0_0_3px_rgba(180,71,58,0.18)]' : ''}`
      : isOpen
        ? 'border-[#285a5c] shadow-[0_0_0_3px_rgba(182,218,172,0.5)]'
        : 'border-[#d3dae2] hover:enabled:border-[#b9c4c4]';
    buttonClass = `flex w-full items-center rounded-md border bg-white pr-9 pl-3 disabled:bg-surface-2 ${isSmall ? 'h-9 text-sm' : 'h-10 text-base max-[760px]:h-11'} ${borderClass}`;
  }

  let labelColor = '';
  if (!isPill && !isText) {
    if (disabled) labelColor = 'text-subtle';
    else labelColor = selected ? 'text-[#1a3234]' : 'text-[#8c9899]';
  }

  const open = () => {
    const rect = buttonRef.current.getBoundingClientRect();
    const below = window.innerHeight - rect.bottom;
    const need =
      Math.min(options.length * ITEM_HEIGHT + 8, LIST_MAX_HEIGHT) + 12;
    setIsUp(below < need && rect.top > below);
    setActiveIndex(Math.max(selectedIndex, 0));
    setIsOpen(true);
  };

  const close = () => setIsOpen(false);

  const pick = (index) => {
    if (options[index].disabled) return;
    onChange(options[index].value);
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

  /** 키보드로 옮긴 항목이 목록 밖이면 보이게 스크롤 */
  useEffect(() => {
    if (isOpen) {
      listRef.current.children[activeIndex]?.scrollIntoView({
        block: 'nearest',
      });
    }
  }, [isOpen, activeIndex]);

  const handleKeyDown = (event) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (!isOpen) {
        open();
        return;
      }
      const step = event.key === 'ArrowDown' ? 1 : -1;
      let next = activeIndex;
      for (let tries = 0; tries < options.length; tries += 1) {
        next = (next + step + options.length) % options.length;
        if (!options[next].disabled) break;
      }
      setActiveIndex(next);
    } else if ((event.key === 'Enter' || event.key === ' ') && isOpen) {
      event.preventDefault();
      pick(activeIndex);
    } else if (event.key === 'Escape' && isOpen) {
      event.preventDefault();
      close();
    } else if (event.key === 'Tab' && isOpen) {
      close();
    }
  };

  return (
    <div
      ref={rootRef}
      className={`relative min-w-0 ${isText ? 'inline-block' : ''} ${className}`}
    >
      <button
        ref={buttonRef}
        type="button"
        id={id}
        aria-label={label}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listId}
        aria-activedescendant={isOpen ? `${listId}-${activeIndex}` : undefined}
        disabled={disabled}
        onClick={() => (isOpen ? close() : open())}
        onKeyDown={handleKeyDown}
        className={`cursor-pointer text-left focus:outline-none disabled:cursor-not-allowed ${isText ? 'focus-visible:underline disabled:text-subtle' : ''} ${buttonClass}`}
      >
        <span className={`min-w-0 flex-1 truncate ${labelColor}`}>
          {selected &&
          (placeholderValue === undefined || value !== placeholderValue)
            ? selected.label
            : placeholder}
        </span>
        <ChevronDown
          size={isText ? 16 : isSmall ? 18 : 20}
          aria-hidden="true"
          className={`pointer-events-none absolute top-1/2 -translate-y-1/2 ${isPill ? 'right-4 text-white' : isText ? 'right-0' : 'right-2.5 text-[#566465]'}`}
        />
      </button>
      {isOpen && (
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          aria-label={label}
          // <label> 안에 둘 때 목록 클릭이 라벨을 거쳐 버튼을 다시 누르지 않게(목록이 다시 열림)
          onClick={(event) => event.preventDefault()}
          className={`absolute left-0 z-30 max-h-64 ${isText ? 'w-max min-w-28' : 'right-0'} ${isPill ? 'min-w-max' : ''} overflow-y-auto rounded-lg border border-[#e2e7e7] bg-white p-1 shadow-[0_12px_32px_-8px_rgba(15,23,35,0.18),0_2px_6px_rgba(15,23,35,0.06)] ${isUp ? 'bottom-[calc(100%+6px)]' : 'top-[calc(100%+6px)]'}`}
        >
          {options.map((option, index) => {
            const isSelected = index === selectedIndex;
            return (
              <li
                key={option.value}
                id={`${listId}-${index}`}
                role="option"
                aria-selected={isSelected}
                aria-disabled={option.disabled || undefined}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => pick(index)}
                className={`flex h-9 cursor-pointer items-center justify-between gap-2 rounded px-2.5 pt-px ${isSmall ? 'text-sm' : 'text-base'} ${isSelected ? 'bg-[#e9f2f2] font-semibold text-[#1e4a4c]' : option.disabled ? 'cursor-not-allowed text-[#8c9899]' : 'text-[#1a3234]'} ${index === activeIndex && !isSelected ? 'bg-[#f4f6f6]' : ''} ${isSelected || option.disabled ? '' : 'hover:bg-[#f4f6f6]'}`}
              >
                {option.label}
                {isSelected && (
                  <Check
                    size={18}
                    aria-hidden="true"
                    className="shrink-0 text-[#285a5c]"
                  />
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
