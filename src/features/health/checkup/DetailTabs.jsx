import { DETAIL_TABS, getPanelId, getTabId } from './checkupTypes';

/**
 * [검진상세 탭]
 * - 검사 결과 · 첨부 자료 · 처방·투약 · 반복 예방 (FN-HLT-005-15)
 * - 탭 이름 뒤에 건수를 회색 괄호로 표시하고 0건인 탭도 숨기지 않음
 */
export default function DetailTabs({ selectedKey, counts, onSelect }) {
  return (
    <div
      role="tablist"
      aria-label="검진상세"
      className="flex gap-1 overflow-x-auto shadow-[inset_0_-1px_0_var(--color-line)] [scrollbar-width:none]"
    >
      {DETAIL_TABS.map((tab) => {
        const isSelected = tab.key === selectedKey;
        return (
          <button
            key={tab.key}
            type="button"
            role="tab"
            id={getTabId(tab.key)}
            aria-controls={getPanelId(tab.key)}
            aria-selected={isSelected}
            className={`relative inline-flex h-12 shrink-0 items-center gap-1.5 px-4 text-lg/[1.6] whitespace-nowrap ${
              isSelected
                ? 'font-bold text-[#2f6f57] after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:rounded-sm after:bg-[#2f6f57]'
                : 'font-semibold text-muted hover:text-ink'
            }`}
            onClick={() => onSelect(tab.key)}
          >
            {tab.nm}
            <span className="font-semibold text-subtle tabular-nums">
              ({counts[tab.key]})
            </span>
          </button>
        );
      })}
    </div>
  );
}
