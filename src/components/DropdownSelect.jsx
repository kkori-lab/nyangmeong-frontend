import { Check, ChevronDown } from 'lucide-react';
import { useEffect, useId, useImperativeHandle, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  getFixedOrigin,
  getPortalTarget,
  useLockOutsideScroll,
} from '@/hooks/useFloatingLayer';

const ITEM_HEIGHT = 36;
const LIST_MAX_HEIGHT = 256;
/** 설명이 붙은 항목의 대략 높이(설명이 두 줄로 접히는 폭까지 감안해 목록이 열리는 방향을 정할 때만 씀) */
const ITEM_HEIGHT_DESC = 56;

/**
 * 목록을 직접 그리는 셀렉트 (디자인의 custom select)
 * - options: [{ value, label, description?, disabled? }], 고르지 않았을 때는 placeholder 표시. disabled 항목은 회색이고 고를 수 없다
 * - 목록 항목은 한 줄, 넘치면 …(마우스를 올리면 전체 이름). description이 있으면 이름 아래에 작은 회색 글자로 한 줄 더 보이고 길면 줄바꿈한다. 닫힌 칸에는 label만 보인다
 * - isPill: 알약형 버튼에 종합 건강기록 히어로와 같은 색(초록 바탕·흰 글자). 목록은 버튼보다 좁아지지 않고 긴 이름만큼 넓어짐
 * - placeholderValue: 이 값을 고른 상태면 닫힌 칸에 placeholder 문구를 보인다(첫 항목 '전체'를 '상태: 전체'로 보일 때)
 * - size: 'md'(기본, 높이 40px·16px) / 'sm'(높이 36px·14px) / 'xs'(높이 34px·14px)
 * - variant: 'box'(기본, 테두리 칸) / 'text'(테두리·배경 없이 글자 + 화살표, 목록 머리·칩 안에 둘 때)
 * - invalid: 빨간 테두리 + aria-invalid. id·describedBy: 버튼에 붙는다(<label htmlFor>·오류 문구 연결)
 * - listMaxHeight: 목록 최대 높이(px, 기본 256). 항목이 이보다 많으면 목록 안에서 스크롤. 항목 수가 정해진 짧은 목록은 더 크게 줘 스크롤을 없앤다
 * - disabled: 열리지 않고 회색. ref: 버튼에 붙는다(바깥에서 포커스를 줄 때)
 * - 키보드: ↑↓ 이동, Enter·Space 선택, Esc·Tab 닫기. 아래 공간이 모자라면 위로 열림
 * - 목록은 포털(모달 안이면 그 dialog, 아니면 body)에 fixed로 띄워 모달 본문 끝에 잘리지 않는다. 열린 동안 바깥 스크롤은 막고 목록 안 스크롤만 된다
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
  listMaxHeight = LIST_MAX_HEIGHT,
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
  const [anchorRect, setAnchorRect] = useState(null);
  const [portalTarget, setPortalTarget] = useState(null);

  useImperativeHandle(ref, () => buttonRef.current, []);

  const selectedIndex = options.findIndex((option) => option.value === value);
  const selected = options[selectedIndex];

  const isText = variant === 'text';
  const isXs = size === 'xs';
  const isSmall = size === 'sm' || isXs || isText;

  let buttonClass;
  if (isText) {
    buttonClass = `inline-flex max-w-full items-center bg-transparent py-1 pr-5 text-sm leading-tight tracking-[-0.03em] text-ink-2 ${invalid ? 'text-danger' : ''}`;
  } else if (isPill) {
    buttonClass = `flex h-10 w-full items-center rounded-full border border-brand-500 bg-brand-500 pr-10 pl-5 text-base font-semibold text-white hover:enabled:bg-brand-600 disabled:opacity-60 max-[760px]:h-11 ${isOpen ? 'shadow-[0_0_0_3px_rgba(249,234,166,0.6)]' : ''}`;
  } else {
    const borderClass = invalid
      ? `border-danger ${isOpen ? 'shadow-[0_0_0_3px_rgba(180,71,58,0.18)]' : ''}`
      : isOpen
        ? 'border-brand-500 shadow-[0_0_0_3px_rgba(182,218,172,0.5)]'
        : 'border-input-line hover:enabled:border-line-strong';
    buttonClass = `flex w-full items-center rounded-md border bg-white pr-9 pl-3 disabled:bg-surface-2 ${isXs ? 'h-[34px] text-sm' : isSmall ? 'h-9 text-sm' : 'h-10 text-base max-[760px]:h-11'} ${borderClass}`;
  }

  let labelColor = '';
  if (!isPill && !isText) {
    if (disabled) labelColor = 'text-subtle';
    else labelColor = selected ? 'text-ink' : 'text-placeholder';
  }

  const open = () => {
    const rect = buttonRef.current.getBoundingClientRect();
    setAnchorRect(rect);
    setPortalTarget(getPortalTarget(buttonRef.current));
    const below = window.innerHeight - rect.bottom;
    const itemsHeight = options.reduce(
      (sum, option) =>
        sum + (option.description ? ITEM_HEIGHT_DESC : ITEM_HEIGHT),
      0,
    );
    const need = Math.min(itemsHeight + 10, listMaxHeight) + 12;
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
      if (
        !rootRef.current.contains(event.target) &&
        !listRef.current?.contains(event.target)
      )
        setIsOpen(false);
    };
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [isOpen]);

  /** 창 크기가 바뀌면 칸 위치를 다시 잰다(스크롤은 열린 동안 막혀 있음) */
  useEffect(() => {
    if (!isOpen) return undefined;
    const handleResize = () =>
      setAnchorRect(buttonRef.current.getBoundingClientRect());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen]);

  useLockOutsideScroll(isOpen, listRef);

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
          className={`pointer-events-none absolute top-1/2 -translate-y-1/2 ${isPill ? 'right-4 text-white' : isText ? 'right-0' : 'right-2.5 text-muted'}`}
        />
      </button>
      {isOpen &&
        anchorRect &&
        portalTarget &&
        createPortal(
          <ul
            ref={listRef}
            id={listId}
            role="listbox"
            aria-label={label}
            // <label> 안에 둘 때 목록 클릭이 라벨을 거쳐 버튼을 다시 누르지 않게(목록이 다시 열림)
            onClick={(event) => event.preventDefault()}
            // 칸 아래(위로 열 때는 칸 위) 6px, 폭은 칸과 같게(글자형은 내용만큼). fixed 기준점이 화면이 아니면 그만큼 뺀다
            style={{
              maxHeight: listMaxHeight,
              left: anchorRect.left - getFixedOrigin(portalTarget).x,
              top:
                (isUp ? anchorRect.top - 6 : anchorRect.bottom + 6) -
                getFixedOrigin(portalTarget).y,
              transform: isUp ? 'translateY(-100%)' : undefined,
              ...(isText
                ? {}
                : isPill
                  ? { minWidth: anchorRect.width }
                  : { width: anchorRect.width }),
            }}
            className={`fixed z-30 ${isText ? 'w-max min-w-28' : ''} ${isPill ? 'min-w-max' : ''} overflow-y-auto overscroll-contain rounded-lg border border-line bg-white p-1 text-left shadow-[0_12px_32px_-8px_rgba(15,23,35,0.18),0_2px_6px_rgba(15,23,35,0.06)]`}
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
                  title={
                    typeof option.label === 'string' ? option.label : undefined
                  }
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => pick(index)}
                  className={`flex ${option.description ? 'min-h-9 py-1.5' : 'h-9'} cursor-pointer items-center justify-between gap-2 rounded px-2.5 pt-px ${isSmall ? 'text-sm' : 'text-base'} ${isSelected ? 'bg-brand-50 font-semibold text-brand-600' : option.disabled ? 'cursor-not-allowed text-placeholder' : 'text-ink'} ${index === activeIndex && !isSelected ? 'bg-surface-2' : ''} ${isSelected || option.disabled ? '' : 'hover:bg-surface-2'}`}
                >
                  {option.description ? (
                    <span className="min-w-0 flex-1">
                      <span className="block truncate">{option.label}</span>
                      <span
                        className={`block text-xs leading-snug font-normal ${isSelected ? 'text-brand-600' : 'text-muted'}`}
                      >
                        {option.description}
                      </span>
                    </span>
                  ) : (
                    <span className="min-w-0 flex-1 truncate">
                      {option.label}
                    </span>
                  )}
                  {isSelected && (
                    <Check
                      size={18}
                      aria-hidden="true"
                      className="shrink-0 text-brand-500"
                    />
                  )}
                </li>
              );
            })}
          </ul>,
          portalTarget,
        )}
    </div>
  );
}
