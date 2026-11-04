/**
 * [아이템 부위 탭]
 * - [전체] + 공통코드 MYPG01 순서, 값 ''은 전체
 * - 순서 편집 중에는 탭 이동 막음(disabled)
 */
export default function ItemPartTabs({
  parts,
  selected,
  disabled = false,
  onSelect,
}) {
  const tabs = [
    { value: '', label: '전체' },
    ...parts.map(({ comCd, comCdNm }) => ({ value: comCd, label: comCdNm })),
  ];

  return (
    <div
      role="tablist"
      aria-label="아이템 부위"
      className="mb-4 flex gap-1 overflow-x-auto shadow-[inset_0_-1px_0_var(--color-line)] [scrollbar-width:none]"
    >
      {tabs.map(({ value, label }) => {
        const isSelected = value === selected;
        return (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={isSelected}
            disabled={disabled && !isSelected}
            className={`relative h-12 shrink-0 px-4 text-base whitespace-nowrap disabled:cursor-not-allowed disabled:text-line-strong max-[760px]:px-2 ${
              isSelected
                ? 'font-bold text-brand-900 after:absolute after:inset-x-3 after:bottom-0 max-[760px]:after:inset-x-1 after:h-0.5 after:bg-brand-900'
                : 'font-semibold text-subtle hover:enabled:text-ink'
            }`}
            onClick={() => onSelect(value)}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
