import { useEffect, useRef } from 'react';
import { BTN_SECONDARY } from '@/components/buttonStyles';
import { EXPND_CLSF } from './expenseCodes';
import {
  formatFullDate,
  formatWon,
  getPetLabel,
  getPlace,
} from './expenseFormat';

/**
 * [지출 상세 시트] 앱(≤760px) 전용, 아래에서 올라오는 시트 (FN-MYP-030-22)
 * - 날짜별 상세·전체 내역의 행을 누르면 열림. PC에는 없음
 * - [편집]: 시트를 닫고 수정 폼으로, [지출 삭제]: 삭제 확인 모달로 (둘 다 부모가 처리)
 * - 영수증 원본 보기 없음
 */
function DetailRow({ label, value }) {
  return (
    <div className="grid grid-cols-[72px_minmax(0,1fr)] gap-3 border-b border-line-soft py-3">
      <dt className="text-subtle">{label}</dt>
      <dd className="m-0 font-semibold break-all">
        {value || <span className="font-normal text-line-strong">-</span>}
      </dd>
    </div>
  );
}

export default function ExpenseDetailSheet({
  expense,
  onEdit,
  onDelete,
  onClose,
}) {
  const dialogRef = useRef(null);
  const clsf = EXPND_CLSF[expense.expndClsfCd];

  useEffect(() => {
    const dialog = dialogRef.current;
    dialog.showModal();
    return () => dialog.close();
  }, []);

  const handleCancel = (event) => {
    event.preventDefault();
    onClose();
  };

  /** 배경(backdrop) 클릭 판별 */
  const handleMouseDown = (event) => {
    if (event.target !== event.currentTarget) return;
    event.preventDefault();
    onClose();
  };

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="expense-detail-title"
      onCancel={handleCancel}
      onMouseDown={handleMouseDown}
      className="m-0 mt-auto hidden w-full max-w-none rounded-t-modal bg-white p-0 shadow-depth-lg backdrop:bg-[rgba(15,23,35,0.45)] open:max-[760px]:block"
    >
      <div className="relative">
        <span
          aria-hidden="true"
          className="absolute top-2 left-1/2 h-1 w-9 -translate-x-1/2 rounded-xs bg-line-strong"
        />
        <header className="flex items-center gap-3 px-5 pt-6 pb-3">
          <h2
            id="expense-detail-title"
            className="min-w-0 flex-1 text-base font-normal text-subtle"
          >
            지출 상세
          </h2>
          <button
            type="button"
            onClick={onEdit}
            className={`${BTN_SECONDARY} h-8 px-3 text-sm`}
          >
            편집
          </button>
        </header>
        <div className="px-5 pb-2">
          <p className="flex items-center gap-2 font-bold">
            <i
              aria-hidden="true"
              className="size-3 rounded-xs"
              style={{ background: clsf.color }}
            />
            {clsf.name}
          </p>
          <p className="mt-1 text-[26px] font-bold">
            {formatWon(expense.expndAmt)}
          </p>
          <dl className="mt-4 border-t border-line-soft">
            <DetailRow label="날짜" value={formatFullDate(expense.expndYmd)} />
            <DetailRow label="반려동물" value={getPetLabel(expense)} />
            <DetailRow label="사용처" value={getPlace(expense)} />
            <DetailRow label="내용" value={expense.dtlMttr} />
          </dl>
        </div>
        <footer className="px-5 pt-3 pb-5">
          <button
            type="button"
            onClick={onDelete}
            className="h-11 w-full rounded-md bg-[#fbeeec] font-semibold text-danger hover:bg-[#f7e0dc]"
          >
            지출 삭제
          </button>
        </footer>
      </div>
    </dialog>
  );
}
