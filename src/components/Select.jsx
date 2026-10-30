import { ChevronDown } from 'lucide-react';

/**
 * options: [{ value, label }], value는 문자열 비교
 * placeholder: 첫 항목이 선택된 상태(선택 전)에서 닫힌 칸에 보여 줄 문구. 안 넘기면 선택한 항목의 라벨 그대로 표시
 */
export default function Select({
  value,
  onChange,
  options,
  label,
  placeholder,
  className = '',
}) {
  const hasPlaceholder = placeholder != null;
  const selectedLabel =
    value === options[0]?.value
      ? placeholder
      : options.find((option) => option.value === value)?.label;
  return (
    <div className={`relative ${className}`}>
      <select
        aria-label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`block h-10 w-full cursor-pointer appearance-none rounded-md border border-input-line bg-white pr-9 pl-3 hover:border-line-strong focus:border-brand-500 focus:ring-focus focus:outline-none${hasPlaceholder ? ' text-transparent [&>option]:text-ink' : ''}`}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {hasPlaceholder && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-9 left-3 flex items-center"
        >
          <span className="truncate">{selectedLabel}</span>
        </span>
      )}
      <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-subtle" />
    </div>
  );
}
