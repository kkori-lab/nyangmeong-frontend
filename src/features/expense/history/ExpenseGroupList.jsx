import { ChevronRight } from 'lucide-react';
import ExpenseInfo from '../shared/ExpenseInfo';
import { EXPND_CLSF } from '../shared/expenseCodes';
import {
  formatDayHeader,
  formatMonthDay,
  formatWon,
} from '../shared/expenseFormat';
import {
  DAY_HEAD,
  DAY_ROW_APP_TAP,
  EXPENSE_ROW,
  ROW_BODY_APP,
} from '../shared/expenseStyles';

/**
 * 편집 여부별 줄 형태 (체크박스 라벨 또는 눌러서 열기)
 * hasDayHead: 최신순은 날짜별 묶음 머리, 금액순은 머리 없이 행마다 날짜(MM-DD)
 */
export default function ExpenseGroupList({
  items,
  groups,
  hasDayHead,
  isEditing,
  selected,
  onToggle,
  onOpenItem,
}) {
  const renderRow = (expense) => {
    const style = { '--cat': EXPND_CLSF[expense.expndClsfCd].color };
    const prefix = hasDayHead ? '' : `${formatMonthDay(expense.expndYmd)} · `;
    if (isEditing) {
      return (
        <label
          key={expense.expndSn}
          style={style}
          className={`${EXPENSE_ROW} cursor-pointer hover:bg-surface-2 max-[760px]:py-3`}
        >
          <input
            type="checkbox"
            checked={selected.has(expense.expndSn)}
            onChange={() => onToggle(expense.expndSn)}
            className="size-5 shrink-0 cursor-pointer accent-brand-500"
          />
          <span className={ROW_BODY_APP}>
            <ExpenseInfo expense={expense} prefix={prefix} isDay />
          </span>
        </label>
      );
    }
    return (
      <button
        key={expense.expndSn}
        type="button"
        onClick={() => onOpenItem(expense)}
        style={style}
        className={`${EXPENSE_ROW} ${DAY_ROW_APP_TAP} hover:bg-surface-2`}
      >
        <ExpenseInfo expense={expense} prefix={prefix} isDay />
        <ChevronRight
          aria-hidden="true"
          className="hidden size-4 text-line-strong max-[760px]:col-start-3 max-[760px]:row-span-2 max-[760px]:row-start-1 max-[760px]:block max-[760px]:self-center"
        />
      </button>
    );
  };

  if (!hasDayHead) return <>{items.map(renderRow)}</>;
  return (
    <>
      {groups.map((group, index) => (
        <div key={`${group.expndYmd}-${index}`}>
          <div className={DAY_HEAD}>
            <span>{formatDayHeader(group.expndYmd)}</span>
            <span className="tabular-nums">
              {formatWon(group.totalAmt)}
              {group.items.length > 1 && ` · ${group.items.length}건`}
            </span>
          </div>
          {group.items.map(renderRow)}
        </div>
      ))}
    </>
  );
}
