import ExpenseCategoryBadge from './ExpenseCategoryBadge';
import { formatWon, getExpenseDesc, getPetLabel } from './expenseFormat';

/**
 * 지출 한 줄 (배지·반려동물·내용 · 사용처·금액)
 * isDay(앱 색 막대 행): 2줄에 "반려동물 · 내용 · 사용처"를 한 줄 말줄임으로 표시
 */
export default function ExpenseInfo({ expense, prefix = '', isDay = false }) {
  const desc = getExpenseDesc(expense);
  return (
    <>
      <ExpenseCategoryBadge code={expense.expndClsfCd} isDay={isDay} />
      <span
        className={`min-w-0 flex-1 ${isDay ? 'max-[760px]:col-start-1 max-[760px]:row-start-2' : ''}`}
      >
        <span
          className={`block font-semibold ${isDay ? 'max-[760px]:hidden' : ''}`}
        >
          {prefix}
          {getPetLabel(expense)}
        </span>
        {desc && (
          <span
            className={`block text-sm text-subtle ${isDay ? 'max-[760px]:hidden' : ''}`}
          >
            {desc}
          </span>
        )}
        {isDay && (
          <span className="hidden truncate text-sm text-subtle max-[760px]:block">
            {prefix}
            {[getPetLabel(expense), desc].filter(Boolean).join(' · ')}
          </span>
        )}
      </span>
      <b
        className={`font-bold whitespace-nowrap ${isDay ? 'max-[760px]:col-start-2 max-[760px]:row-span-2 max-[760px]:row-start-1 max-[760px]:self-center max-[760px]:text-[15px]' : ''}`}
      >
        {formatWon(expense.expndAmt)}
      </b>
    </>
  );
}
