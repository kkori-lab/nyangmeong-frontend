import { useId } from 'react';
import { EXPND_CLSF_LIST } from './expenseCodes';

/** 카테고리 칩 원탭 선택. isRequired: 필수 입력(스크린리더 안내) */
export default function ExpenseCategoryChips({
  value,
  onChange,
  isRequired = false,
}) {
  const name = useId();

  return (
    <div
      role="radiogroup"
      aria-label={isRequired ? '카테고리 (필수)' : '카테고리'}
      aria-required={isRequired || undefined}
      className="flex flex-wrap gap-2"
    >
      {EXPND_CLSF_LIST.map((clsf) => (
        <label key={clsf.code} className="cursor-pointer">
          <input
            type="radio"
            name={name}
            checked={value === clsf.code}
            onChange={() => onChange(clsf.code)}
            className="peer sr-only"
          />
          <span className="inline-flex h-9 items-center rounded-full border border-line bg-white px-3.5 text-sm font-medium peer-checked:border-brand-500 peer-checked:bg-brand-500 peer-checked:text-white peer-focus-visible:ring-focus hover:border-line-strong">
            {clsf.name}
          </span>
        </label>
      ))}
    </div>
  );
}
