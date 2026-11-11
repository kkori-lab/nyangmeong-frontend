import { ChevronRight, Plus } from 'lucide-react';
import { BTN_SECONDARY } from '@/components/buttonStyles';
import ExpenseInfo from '../shared/ExpenseInfo';
import ExpenseMenu from '../shared/ExpenseMenu';
import { formatDayHeader, formatWon } from '../shared/expenseFormat';
import { EXPND_CLSF } from '../shared/expenseCodes';
import {
  DAY_HEAD,
  DAY_ROW_APP_TAP,
  EXPENSE_ROW,
} from '../shared/expenseStyles';

/**
 * [날짜별 지출 상세]
 * - PC: 행 오른쪽 ⋮ 메뉴의 [수정]·[삭제]
 * - 앱: 메뉴 없이 행을 누르면 지출 상세 시트(onOpenDetail), 행 끝에 ›
 */
export default function ExpenseDayDetail({
  expndYmd,
  items,
  totalAmt,
  onAdd,
  onEdit,
  onDelete,
  onOpenDetail,
}) {
  return (
    <section aria-label="날짜별 지출 상세" className="mt-5">
      <div className={`${DAY_HEAD} rounded-md`}>
        <span>{formatDayHeader(expndYmd)}</span>
        <span className="tabular-nums">
          {formatWon(totalAmt)} · {items.length}건
        </span>
      </div>
      {items.map((expense) => (
        <div
          key={expense.expndSn}
          className={`${EXPENSE_ROW} ${DAY_ROW_APP_TAP}`}
          style={{ '--cat': EXPND_CLSF[expense.expndClsfCd].color }}
        >
          <ExpenseInfo expense={expense} isDay />
          <div className="max-[760px]:hidden">
            <ExpenseMenu
              onEdit={() => onEdit(expense)}
              onDelete={() => onDelete(expense)}
            />
          </div>
          <ChevronRight
            aria-hidden="true"
            className="hidden size-4 text-line-strong max-[760px]:col-start-3 max-[760px]:row-span-2 max-[760px]:row-start-1 max-[760px]:block max-[760px]:self-center"
          />
          <button
            type="button"
            onClick={() => onOpenDetail(expense)}
            aria-label={`${EXPND_CLSF[expense.expndClsfCd].name} 지출 상세 보기`}
            className="absolute inset-0 hidden max-[760px]:block"
          />
        </div>
      ))}
      <button
        type="button"
        onClick={onAdd}
        className={`${BTN_SECONDARY} mt-2 w-full`}
      >
        <Plus className="size-4" aria-hidden="true" />
        지출 추가
      </button>
    </section>
  );
}
