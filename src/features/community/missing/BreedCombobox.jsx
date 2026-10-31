import { Check, ChevronDown, Pencil, Search } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';

const SELF = '__self';
const norm = (text) => text.replace(/\s/g, '').toLowerCase();

/**
 * 품종 콤보박스: 입력해서 찾거나 목록에서 고르고, 맨 아래 [직접 입력]으로 직접 쓴다(최대 20자)
 * - value: { vrtyNm, vrtyDrctInptNm, typed } (목록 품종이면 vrtyNm, 직접 입력이면 vrtyDrctInptNm, 둘 다 null이면 미선택,
 *   목록에 없는 글자를 쳐 둔 채면 typed에 그 글자)
 * - breeds: 반려동물 구분에 맞는 품종명 배열. 구분이 바뀌면 부모가 value 초기화
 * - 직접 입력값은 품종 마스터에 올리지 않고 그 글에만 저장
 */
export default function BreedCombobox({
  label,
  breeds,
  value,
  error,
  onChange,
}) {
  const id = useId();
  const rootRef = useRef(null);
  const inputRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [text, setText] = useState(
    value.vrtyNm ?? (value.vrtyDrctInptNm === null ? '' : '직접 입력'),
  );
  const [active, setActive] = useState(-1);
  const isSelf = value.vrtyDrctInptNm !== null;

  const word = norm(text);
  const picked = value.vrtyNm === text;
  const filtered = breeds.filter(
    (name) => picked || !word || norm(name).includes(word),
  );
  const options = [...filtered, SELF];

  useEffect(() => {
    if (!isOpen) return undefined;
    const handlePointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) setIsOpen(false);
    };
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [isOpen]);

  const pick = (option) => {
    setIsOpen(false);
    setActive(-1);
    if (option === SELF) {
      setText('직접 입력');
      onChange({
        vrtyNm: null,
        vrtyDrctInptNm: value.vrtyDrctInptNm ?? '',
        typed: '',
      });
      return;
    }
    setText(option);
    onChange({ vrtyNm: option, vrtyDrctInptNm: null, typed: '' });
  };

  const handleInput = (event) => {
    const next = event.target.value;
    setText(next);
    setIsOpen(true);
    const exact = breeds.find((name) => norm(name) === norm(next));
    onChange({
      vrtyNm: exact ?? null,
      vrtyDrctInptNm: null,
      typed: exact ? '' : next.trim(),
    });
    setActive(next.trim() ? 0 : -1);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      setIsOpen(true);
      const step = event.key === 'ArrowDown' ? 1 : -1;
      setActive((prev) => (prev + step + options.length) % options.length);
    } else if (event.key === 'Enter' && isOpen && active > -1) {
      event.preventDefault();
      pick(options[active]);
    } else if (event.key === 'Escape' && isOpen) {
      event.preventDefault();
      event.stopPropagation();
      setIsOpen(false);
    } else if (event.key === 'Tab') {
      setIsOpen(false);
    }
  };

  const inputId = `${id}-input`;
  const listId = `${id}-list`;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-base font-semibold text-ink">
        {label}
        <span aria-hidden="true" className="ml-0.5 font-bold text-danger">
          *
        </span>
      </label>
      <div ref={rootRef} className="relative max-w-[420px]">
        <Search
          size={20}
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-subtle"
        />
        <input
          ref={inputRef}
          id={inputId}
          type="text"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={isOpen}
          aria-controls={listId}
          aria-activedescendant={
            isOpen && active > -1 ? `${listId}-${active}` : undefined
          }
          aria-invalid={Boolean(error)}
          autoComplete="off"
          value={text}
          placeholder="품종 이름 검색 또는 목록에서 선택"
          onFocus={() => setIsOpen(true)}
          onClick={() => setIsOpen(true)}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          className={`block h-10 w-full rounded-md border bg-white pr-11 pl-10 text-base placeholder:text-placeholder hover:border-line-strong focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none ${error ? 'border-danger' : 'border-input-line'}`}
        />
        <button
          type="button"
          tabIndex={-1}
          aria-label="품종 목록 열기"
          onMouseDown={(event) => {
            event.preventDefault();
            setIsOpen((prev) => !prev);
            inputRef.current?.focus();
          }}
          className="absolute top-1/2 right-1 grid size-9 -translate-y-1/2 place-items-center rounded text-subtle"
        >
          <ChevronDown
            size={18}
            aria-hidden="true"
            className={isOpen ? 'rotate-180' : ''}
          />
        </button>
        {isOpen && (
          <ul
            id={listId}
            role="listbox"
            aria-label={`${label} 목록`}
            className="absolute top-[calc(100%+6px)] z-20 max-h-60 w-full overflow-y-auto rounded-md border border-line bg-white py-1 shadow-md"
          >
            {filtered.length === 0 && (
              <li className="px-3 py-2.5 text-muted">검색 결과가 없어요</li>
            )}
            {options.map((option, index) => {
              const isSelfOption = option === SELF;
              const selected = isSelfOption ? isSelf : value.vrtyNm === option;
              return (
                <li
                  key={option}
                  id={`${listId}-${index}`}
                  role="option"
                  aria-selected={selected}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => pick(option)}
                  className={`flex min-h-10 cursor-pointer items-center justify-between gap-2 px-3 hover:bg-surface-2 ${index === active ? 'bg-surface-2' : ''} ${selected ? 'font-semibold text-brand-600' : 'text-ink'} ${isSelfOption ? 'mt-1 justify-start border-t border-line text-ink-2' : ''}`}
                >
                  {isSelfOption && (
                    <Pencil
                      size={16}
                      aria-hidden="true"
                      className="text-subtle"
                    />
                  )}
                  {isSelfOption ? '직접 입력' : option}
                  {selected && !isSelfOption && (
                    <Check size={16} aria-hidden="true" />
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
      {isSelf && (
        <div className="flex max-w-[420px] flex-col gap-1.5">
          <label
            htmlFor={`${id}-self`}
            className="text-base font-semibold text-ink"
          >
            품종 직접 입력
            <span aria-hidden="true" className="ml-0.5 font-bold text-danger">
              *
            </span>
          </label>
          <input
            id={`${id}-self`}
            type="text"
            maxLength={20}
            value={value.vrtyDrctInptNm}
            placeholder="예: 말티푸, 믹스"
            aria-invalid={Boolean(error)}
            onChange={(event) =>
              onChange({
                vrtyNm: null,
                vrtyDrctInptNm: event.target.value,
                typed: '',
              })
            }
            className={`block h-10 w-full rounded-md border bg-white px-3 text-base placeholder:text-placeholder hover:border-line-strong focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none ${error ? 'border-danger' : 'border-input-line'}`}
          />
        </div>
      )}
      <p className="text-sm text-muted">
        공공데이터 품종코드 기준 목록이에요. 목록에 없으면 맨 아래 [직접 입력]을
        골라 주세요
      </p>
      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
