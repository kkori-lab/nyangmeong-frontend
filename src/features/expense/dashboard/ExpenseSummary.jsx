import { Info } from 'lucide-react';
import { BTN_SECONDARY } from '@/components/buttonStyles';
import MonthNav from '@/components/MonthNav';
import { formatYm } from '@/utils/yearMonth';
import { formatWon } from '../shared/expenseFormat';
import { getRatio } from '../shared/expenseStats';
import { CARD, CARD_BODY, CARD_HEAD } from '../shared/expenseStyles';

/** prevTotalAmt null: 증감 배지 숨김 */
export default function ExpenseSummary({
  ym,
  isNextDisabled,
  onChangeMonth,
  totalAmt,
  count,
  prevTotalAmt,
  mmExpndLimAmt,
  onOpenLimit,
}) {
  const hasLimit = mmExpndLimAmt != null;
  const usageRatio = hasLimit ? getRatio(totalAmt, mmExpndLimAmt) : 0;
  const diffRatio =
    prevTotalAmt == null ? 0 : getRatio(totalAmt - prevTotalAmt, prevTotalAmt);

  return (
    <section aria-label="이번달 총 지출" className={CARD}>
      <div className={`${CARD_HEAD} max-[400px]:gap-2 max-[400px]:px-3.5`}>
        <MonthNav
          onPrev={() => onChangeMonth(-1)}
          onNext={() => onChangeMonth(1)}
          isNextDisabled={isNextDisabled}
        >
          <b className="min-w-28 text-center text-lg max-[400px]:min-w-0 max-[400px]:px-1">
            {formatYm(ym)}
          </b>
        </MonthNav>
        {hasLimit && (
          <button
            type="button"
            onClick={onOpenLimit}
            className={`${BTN_SECONDARY} shrink-0 whitespace-nowrap max-[400px]:px-3`}
          >
            한도 설정
          </button>
        )}
      </div>
      <div className={CARD_BODY}>
        <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-muted">이번달 총 지출</p>
            <p className="flex flex-wrap items-baseline gap-2">
              <b className="text-page leading-[1.35] font-bold tabular-nums">
                {formatWon(totalAmt)}
              </b>
              {hasLimit && (
                <span className="text-subtle tabular-nums">
                  / {formatWon(mmExpndLimAmt)}
                </span>
              )}
            </p>
          </div>
          {prevTotalAmt != null && diffRatio !== 0 && (
            <span className="inline-flex h-6 items-center rounded-full bg-tone-amber-bg px-2.5 text-badge font-semibold text-tone-amber-fg">
              지난달 대비 {Math.abs(diffRatio)}%{' '}
              {diffRatio > 0 ? '증가' : '감소'}
            </span>
          )}
        </div>
        {hasLimit ? (
          <>
            <div
              role="progressbar"
              aria-label="한도 사용률"
              aria-valuenow={usageRatio}
              aria-valuemin={0}
              aria-valuemax={100}
              className="h-2.5 overflow-hidden rounded-full bg-surface-3"
            >
              <div
                className="h-full bg-warn"
                style={{ width: `${Math.min(usageRatio, 100)}%` }}
              />
            </div>
            <div className="mt-2 flex justify-between text-sm text-subtle">
              <span>한도의 {usageRatio}% 사용</span>
              <span>총 {count}건</span>
            </div>
          </>
        ) : (
          <div className="flex flex-wrap items-center gap-3 rounded-box bg-surface-2 px-4 py-3">
            <Info className="size-4 shrink-0 text-subtle" aria-hidden="true" />
            <span className="min-w-0 flex-1 text-muted">
              한도를 설정하면 지출을 관리할 수 있어요
            </span>
            <button
              type="button"
              onClick={onOpenLimit}
              className={`${BTN_SECONDARY} max-[760px]:basis-full`}
            >
              한도 설정하기
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
