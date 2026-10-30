/**
 * [건강 일지 묶음 탭]
 * - items: [{ id, label }], 선택한 묶음만 화면에 보임. 탭 본문은 id가 같은 tabpanel 영역
 * - label: 탭 목록의 접근성 이름. 다른 화면(케어 캘린더)도 사용
 * - className: 바깥 여백·아래 선. 기본은 단독으로 놓을 때의 위 여백과 아래 선, 막대 안에서는 빈 문자열
 */
export default function DiaryTabs({
  items,
  activeId,
  onSelect,
  label = '건강 일지 묶음',
  className = 'mt-2 shadow-[inset_0_-1px_0_var(--color-line)]',
}) {
  return (
    <div
      role="tablist"
      aria-label={label}
      className={`flex flex-wrap gap-1 ${className}`}
    >
      {items.map((item) => {
        const isActive = item.id === activeId;
        return (
          <button
            key={item.id}
            id={`${item.id}-tab`}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-controls={item.id}
            className={`relative inline-flex h-12 items-center px-4 text-lg/[1.6] ${
              isActive
                ? "font-bold text-[#2f6f57] after:absolute after:right-3 after:bottom-0 after:left-3 after:h-0.5 after:rounded-sm after:bg-[#2f6f57] after:content-['']"
                : 'font-semibold text-muted hover:text-ink'
            }`}
            onClick={() => onSelect(item.id)}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
