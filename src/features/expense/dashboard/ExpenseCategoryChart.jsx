import {
  CARD,
  CARD_BODY,
  CARD_HEAD,
  CARD_TITLE,
} from '../shared/expenseStyles';
import { formatWon } from '../shared/expenseFormat';

/** 조각 사이 흰 간격(%) */
const GAP = 0.6;

/** 누적 비율 conic-gradient. 조각마다 앞에 흰 간격 */
const buildGradient = (stats) => {
  let acc = 0;
  const total = stats.reduce((sum, stat) => sum + stat.totalAmt, 0);
  const stops = stats.map((stat) => {
    const from = (acc / total) * 100;
    acc += stat.totalAmt;
    const to = (acc / total) * 100;
    return `#fff ${from}% ${from + GAP}%, ${stat.color} ${from + GAP}% ${to}%`;
  });
  return `conic-gradient(${stops.join(', ')})`;
};

export default function ExpenseCategoryChart({ stats }) {
  return (
    <section aria-labelledby="expense-category-title" className={CARD}>
      <div className={CARD_HEAD}>
        <h2 id="expense-category-title" className={CARD_TITLE}>
          카테고리별 지출
        </h2>
      </div>
      <div className={CARD_BODY}>
        {stats.length === 0 ? (
          <p className="text-subtle">이번 달 지출이 없어요</p>
        ) : (
          <div className="flex flex-wrap items-center gap-6 max-[760px]:justify-center">
            <div
              role="img"
              aria-label="카테고리별 지출 비율"
              className="relative size-36 shrink-0 rounded-full max-[760px]:size-[180px]"
              style={{ background: buildGradient(stats) }}
            >
              <div className="absolute inset-7 rounded-full bg-white max-[760px]:inset-9" />
            </div>
            <ul className="flex min-w-48 flex-1 flex-col gap-2 text-sm max-[760px]:basis-full">
              {stats.map((stat) => (
                <li key={stat.code} className="flex items-center gap-2">
                  <i
                    className="size-3 shrink-0 rounded-xs"
                    style={{ background: stat.color }}
                  />
                  <span className="flex-1 text-ink-2">{stat.name}</span>
                  <b className="font-semibold">{formatWon(stat.totalAmt)}</b>
                  <em className="w-10 text-right text-subtle not-italic">
                    {stat.ratio}%
                  </em>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
