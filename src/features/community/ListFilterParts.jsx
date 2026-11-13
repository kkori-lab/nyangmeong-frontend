import { RotateCcw, SlidersHorizontal } from 'lucide-react';

/** 라벨을 위에 두고 아래에 입력을 놓는 한 칸. 펫돌봄·실종센터 목록 필터가 같이 쓴다 */
export function FilterField({ label, className = '', children }) {
  return (
    <div role="group" aria-label={label} className={`min-w-0 ${className}`}>
      {children}
    </div>
  );
}

export function Chips({ name, label, options, value, onChange }) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="flex min-w-0 flex-wrap gap-1.5"
    >
      {options.map((option) => (
        <label key={option.value}>
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={() => onChange(option.value)}
            className="peer sr-only"
          />
          <span className="inline-flex h-10 cursor-pointer items-center rounded-full border border-input-line bg-white px-3.5 text-sm font-medium text-ink-2 peer-checked:border-brand-500 peer-checked:bg-brand-500 peer-checked:font-semibold peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-brand-500/30 hover:border-line-strong peer-disabled:cursor-not-allowed peer-disabled:opacity-45">
            {option.label}
          </span>
        </label>
      ))}
    </div>
  );
}

/** 760px 이하에서 필터를 열고 닫는 [상세 필터] 버튼. 적용된 필터 수를 붙인다 */
export function FilterToggle({ controls, isOpen, onToggle, activeCount }) {
  return (
    <button
      type="button"
      aria-expanded={isOpen}
      aria-controls={controls}
      onClick={onToggle}
      className="col-span-full inline-flex h-10 w-fit items-center gap-1.5 rounded-md border border-line bg-white px-4 font-semibold hover:border-line-strong hover:bg-surface-2 min-[761px]:hidden"
    >
      <SlidersHorizontal size={16} aria-hidden="true" />
      상세 필터
      {activeCount > 0 && (
        <span
          aria-label={`적용된 필터 ${activeCount}개`}
          className="min-w-5 rounded-full bg-brand-500 px-1.5 text-xs leading-5 text-white"
        >
          {activeCount}
        </span>
      )}
    </button>
  );
}

/** 필터 맨 아래 줄: 왼쪽에 체크 옵션(내 글만 보기 등, children), 오른쪽에 [초기화] */
export function FilterActions({ onReset, className = '', children }) {
  return (
    <div
      className={`col-span-full -mt-1 flex items-center justify-between gap-3 ${className}`}
    >
      <div className="flex flex-wrap items-center gap-x-5">{children}</div>
      <button
        type="button"
        onClick={onReset}
        className="ml-auto inline-flex h-8 items-center gap-1.5 rounded-md px-0 text-sm font-semibold text-muted hover:text-ink"
      >
        <RotateCcw size={14} aria-hidden="true" />
        초기화
      </button>
    </div>
  );
}

/** 체크 옵션(내 글만 보기 등) */
export function CheckOption({ checked, onChange, children }) {
  return (
    <label className="flex min-h-9 cursor-pointer items-center gap-2 text-sm font-medium text-ink-2">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="size-4 accent-brand-500"
      />
      {children}
    </label>
  );
}
