/**
 * [처리 현황 건수 카드]
 * - items: [{ key, label, value, note, isDanger, isSelected, onSelect }]
 * - onSelect가 있으면 누르는 카드(상태 필터), 없으면 읽기 전용
 */
export default function ProcessingStatCards({ items, className = '' }) {
  return (
    <ul className={`mb-4 grid grid-cols-2 gap-3 ${className}`}>
      {items.map(
        ({ key, label, value, note, isDanger, isSelected, onSelect }) => {
          const body = (
            <>
              <span className="block text-sm font-medium text-subtle">
                {label}
              </span>
              <span
                className={`mt-1 block text-2xl leading-tight font-bold tabular-nums ${isDanger ? 'text-danger' : 'text-ink'}`}
              >
                {value.toLocaleString()}
              </span>
              {note && (
                <span className="mt-0.5 block text-sm text-subtle tabular-nums">
                  {note}
                </span>
              )}
            </>
          );
          const boxClass = `block h-full w-full rounded-[14px] border bg-white px-5 py-4 text-left ${
            isSelected
              ? 'border-brand-900 shadow-[inset_0_0_0_1px_var(--color-brand-900)]'
              : 'border-line'
          }`;
          return (
            <li key={key}>
              {onSelect ? (
                <button
                  type="button"
                  aria-pressed={isSelected}
                  className={`${boxClass} hover:bg-surface-2`}
                  onClick={onSelect}
                >
                  {body}
                </button>
              ) : (
                <div className={boxClass}>{body}</div>
              )}
            </li>
          );
        },
      )}
    </ul>
  );
}
