import { BTN_DANGER } from '@/components/buttonStyles';
import { formatWon } from '../shared/expenseFormat';

/** 페이지 간 선택 건수·합계 */
export default function ExpenseSelectBar({ count, totalAmt, onDelete }) {
  return (
    <div className="sticky bottom-4 z-5 flex items-center justify-between gap-3 rounded-card bg-brand-900 py-3 pr-3 pl-5 text-white shadow-depth-md">
      <span>
        <b>{count}건</b> 선택 ·{' '}
        <b className="tabular-nums">{formatWon(totalAmt)}</b>
      </span>
      <button
        type="button"
        onClick={onDelete}
        disabled={count === 0}
        className={BTN_DANGER}
      >
        삭제
      </button>
    </div>
  );
}
