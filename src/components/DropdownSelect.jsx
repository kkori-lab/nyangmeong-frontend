import { Check, ChevronDown } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';

const ITEM_HEIGHT = 36;
const LIST_MAX_HEIGHT = 256;

/**
 * 목록을 직접 그리는 셀렉트 (디자인의 custom select)
 * - options: [{ value, label }], 고르지 않았을 때는 placeholder 표시
 * - isPill: 알약형 버튼에 종합 건강기록 히어로와 같은 색(초록 바탕·흰 글자). 목록은 버튼보다 좁아지지 않고 긴 이름만큼 넓어짐
 * - 키보드: ↑↓ 이동, Enter·Space 선택, Esc·Tab 닫기. 아래 공간이 모자라면 위로 열림
 */
export default function DropdownSelect({
  value,
  onChange,
  options,
  placeholder,
  label,
  isPill = false,
  className = '',
}) {
  const listId = useId();
  const rootRef = useRef(null);
  const buttonRef = useRef(null);
  const listRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isUp, setIsUp] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const selectedIndex = options.findIndex((option) => option.value === value);
  const selected = options[selectedIndex];

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
      setActiveIndex((activeIndex + step + options.length) % options.length);
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
    <div ref={rootRef} className={`relative min-w-0 ${className}`}>
      <button
        ref={buttonRef}
        type="button"
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listId}
        aria-activedescendant={isOpen ? `${listId}-${activeIndex}` : undefined}
        onClick={() => (isOpen ? close() : open())}
        onKeyDown={handleKeyDown}
        className={`flex h-10 w-full cursor-pointer items-center border text-left text-base focus:outline-none max-[760px]:h-11 ${
          isPill
            ? `rounded-full border-brand-500 bg-brand-500 pr-10 pl-5 font-semibold text-white hover:bg-brand-600 ${isOpen ? 'shadow-[0_0_0_3px_rgba(249,234,166,0.6)]' : ''}`
            : `rounded-md bg-white pr-9 pl-3 hover:border-[#b9c4c4] ${isOpen ? 'border-[#285a5c] shadow-[0_0_0_3px_rgba(182,218,172,0.5)]' : 'border-[#d3dae2]'}`
        }`}
      >
        <span
          className={`min-w-0 flex-1 truncate ${isPill ? '' : selected ? 'text-[#1a3234]' : 'text-[#8c9899]'}`}
        >
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          size={20}
          aria-hidden="true"
          className={`pointer-events-none absolute top-1/2 -translate-y-1/2 ${isPill ? 'right-4 text-white' : 'right-2.5 text-[#566465]'}`}
        />
      </button>
      {isOpen && (
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          aria-label={label}
          className={`absolute right-0 left-0 z-30 max-h-64 ${isPill ? 'min-w-max' : ''} overflow-y-auto rounded-lg border border-[#e2e7e7] bg-white p-1 shadow-[0_12px_32px_-8px_rgba(15,23,35,0.18),0_2px_6px_rgba(15,23,35,0.06)] ${isUp ? 'bottom-[calc(100%+6px)]' : 'top-[calc(100%+6px)]'}`}
        >
          {options.map((option, index) => {
            const isSelected = index === selectedIndex;
            return (
              <li
                key={option.value}
                id={`${listId}-${index}`}
                role="option"
                aria-selected={isSelected}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => pick(index)}
                className={`flex h-9 cursor-pointer items-center justify-between gap-2 rounded px-2.5 pt-px text-base ${isSelected ? 'bg-[#e9f2f2] font-semibold text-[#1e4a4c]' : 'text-[#1a3234]'} ${index === activeIndex && !isSelected ? 'bg-[#f4f6f6]' : ''} ${isSelected ? '' : 'hover:bg-[#f4f6f6]'}`}
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
