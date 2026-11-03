/**
 * [FAQ 카테고리 탭]
 * - [전체] + 공통코드 CSCG01 순서, 값 ''은 전체
 */
export default function FaqCategoryTabs({ categories, selected, onSelect }) {
  const tabs = [
    { value: '', label: '전체' },
    ...categories.map(({ comCd, comCdNm }) => ({
      value: comCd,
      label: comCdNm,
    })),
  ];

  return (
    <div
      role="tablist"
      aria-label="FAQ 카테고리"
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
            className={`relative h-12 shrink-0 px-4 text-base whitespace-nowrap ${
              isSelected
                ? 'font-bold text-brand-900 after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:bg-brand-900'
                : 'font-semibold text-subtle hover:text-ink'
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
