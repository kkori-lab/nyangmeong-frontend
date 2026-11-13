import { NORMAL_STOOL } from '../diaryTypes';

/**
 * [상태별 횟수 막대]
 * - counts: [{ cd, nm, count }] 고정 순서, 정상 외 상태는 다른 색
 */
export default function CountBars({ counts, total }) {
  return (
    <ul
      aria-label={`배변 상태별 횟수 · 최근 ${total}건`}
      className="flex flex-col gap-3 py-4"
    >
      {counts.map((state) => (
        <li key={state.cd} className="flex items-center gap-3 text-sm/[1.6]">
          <span className="w-16 shrink-0 text-muted">{state.nm}</span>
          <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-surface-3">
            <span
              className={`block h-full rounded-full ${
                state.cd === NORMAL_STOOL ? 'bg-brand-500' : 'bg-[#9a5c0c]'
              }`}
              style={{ width: `${(state.count / total) * 100}%` }}
            />
          </span>
          <span className="w-12 shrink-0 text-right tabular-nums">
            {state.count}회
          </span>
        </li>
      ))}
    </ul>
  );
}
