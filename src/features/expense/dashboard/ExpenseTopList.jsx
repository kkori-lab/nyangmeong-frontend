import ExpenseCategoryBadge from '../shared/ExpenseCategoryBadge';
import { EXPND_CLSF } from '../shared/expenseCodes';
import {
  formatMonthDay,
  formatWon,
  getPetLabel,
} from '../shared/expenseFormat';
import {
  CARD,
  CARD_BODY,
  CARD_HEAD,
  CARD_TITLE,
} from '../shared/expenseStyles';

export default function ExpenseTopList({ expenses }) {
  return (
    <section aria-labelledby="expense-top-title" className={CARD}>
      <div className={CARD_HEAD}>
        <h2 id="expense-top-title" className={CARD_TITLE}>
          이번달 주요 지출
        </h2>
      </div>
      <div className={CARD_BODY}>
        {expenses.length === 0 ? (
          <p className="text-subtle">이번 달 지출이 없어요</p>
        ) : (
          <ul>
            {expenses.map((expense) => (
              <li
                key={expense.expndSn}
                style={{ '--cat': EXPND_CLSF[expense.expndClsfCd].color }}
                className='relative flex items-center gap-3 border-t border-line-soft py-3 first:border-t-0 max-[760px]:grid max-[760px]:grid-cols-[auto_minmax(0,1fr)_auto] max-[760px]:gap-x-0 max-[760px]:gap-y-0.5 max-[760px]:pl-[14px] max-[760px]:before:absolute max-[760px]:before:top-3 max-[760px]:before:bottom-3 max-[760px]:before:left-0 max-[760px]:before:w-1 max-[760px]:before:rounded-xs max-[760px]:before:bg-[var(--cat)] max-[760px]:before:content-[""]'
              >
                <span className="w-12 text-sm text-subtle max-[760px]:col-start-1 max-[760px]:row-start-2 max-[760px]:w-auto">
                  {formatMonthDay(expense.expndYmd)}
                </span>
                <ExpenseCategoryBadge code={expense.expndClsfCd} isDay />
                <span className="min-w-0 flex-1 truncate max-[760px]:col-start-2 max-[760px]:row-start-2 max-[760px]:text-sm max-[760px]:text-subtle">
                  <span
                    aria-hidden="true"
                    className="hidden max-[760px]:inline"
                  >
                    {'\u00a0·\u00a0'}
                  </span>
                  {getPetLabel(expense)}
                </span>
                <b className="font-bold whitespace-nowrap tabular-nums max-[760px]:col-start-3 max-[760px]:row-span-2 max-[760px]:row-start-1 max-[760px]:self-center max-[760px]:text-[15px]">
                  {formatWon(expense.expndAmt)}
                </b>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
