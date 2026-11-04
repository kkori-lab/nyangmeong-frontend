import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * [처리 대기]
 * - items: [{ key, label, value, to, sub: { label, value, to } }], 링크는 페이지가 만들어 넘김
 * - 0이면 숫자 0만, 누르는 동작 없음
 */
export default function PendingSection({ items }) {
  return (
    <section aria-labelledby="dashboard-pending" className="space-y-3">
      <h2 id="dashboard-pending" className="text-lg font-bold text-ink">
        처리 대기
      </h2>
      <ul className="grid grid-cols-2 gap-3 min-[761px]:grid-cols-3 min-[1101px]:grid-cols-6">
        {items.map(({ key, label, value, to, sub }) => {
          const hasValue = value > 0;
          const body = (
            <>
              <span className="flex items-center gap-0.5 text-sm font-medium text-subtle">
                {label}
                {hasValue && (
                  <ChevronRight
                    aria-hidden="true"
                    className="size-4 shrink-0 text-line-strong group-hover:text-brand-500"
                  />
                )}
              </span>
              <span
                className={`mt-1 block text-2xl leading-tight font-bold tabular-nums ${hasValue ? 'text-danger' : 'text-ink'}`}
              >
                {value.toLocaleString()}
              </span>
            </>
          );
          return (
            <li
              key={key}
              className="flex flex-col rounded-[14px] border border-line bg-white"
            >
              {hasValue ? (
                <Link
                  to={to}
                  className="group block flex-1 rounded-[14px] px-5 py-4 hover:bg-surface-2"
                >
                  {body}
                </Link>
              ) : (
                <div className="flex-1 px-5 py-4">{body}</div>
              )}
              {sub &&
                (sub.value > 0 ? (
                  <Link
                    to={sub.to}
                    className="mx-5 mb-3 -mt-2 self-start text-sm text-subtle tabular-nums underline-offset-2 hover:text-ink hover:underline"
                  >
                    {sub.label} {sub.value.toLocaleString()}
                  </Link>
                ) : (
                  <span className="mx-5 mb-3 -mt-2 text-sm text-subtle tabular-nums">
                    {sub.label} 0
                  </span>
                ))}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
