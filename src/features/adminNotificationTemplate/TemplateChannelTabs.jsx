/**
 * [알림 템플릿 채널 탭]
 * - [전체] + 공통코드 AIMG03 순서(이메일·인앱), 값 ''은 전체
 */
export default function TemplateChannelTabs({ channels, selected, onSelect }) {
  const tabs = [
    { value: '', label: '전체' },
    ...channels.map(({ comCd, comCdNm }) => ({ value: comCd, label: comCdNm })),
  ];

  return (
    <div
      role="tablist"
      aria-label="알림 채널"
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
            className={`relative h-12 shrink-0 px-4 text-base whitespace-nowrap max-[760px]:px-2 ${
              isSelected
                ? 'font-bold text-brand-900 after:absolute after:inset-x-3 after:bottom-0 max-[760px]:after:inset-x-1 after:h-0.5 after:bg-brand-900'
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
