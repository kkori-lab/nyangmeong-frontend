import Modal from '@/components/Modal';
import { BTN_PRIMARY, BTN_SECONDARY } from '@/components/buttonStyles';
import { formatDate } from '@/utils/formatDate';
import { formatAmount } from './receiptUtils';

/**
 * [가계부 중복 확인 창] (FN-HLT-002-44)
 * - rows: [{ key, petNm, amt }] 가계부에 같은 지출이 이미 있는 반려동물
 * - [가계부에도 기록하기]는 겹쳐도 기록, [가계부 기록 건너뛰기]는 겹친 반려동물의 가계부 기록만 건너뜀
 */
export default function LedgerDupModal({
  rows,
  ckupYmd,
  hospNm,
  onRecord,
  onSkip,
  onClose,
}) {
  return (
    <Modal
      isConfirm
      title="이미 가계부에 같은 지출이 있어요"
      description="그래도 기록할까요?"
      onClose={onClose}
      footer={
        <>
          <button type="button" className={BTN_SECONDARY} onClick={onSkip}>
            가계부 기록 건너뛰기
          </button>
          <button type="button" className={BTN_PRIMARY} onClick={onRecord}>
            가계부에도 기록하기
          </button>
        </>
      }
    >
      <ul className="mt-4 flex flex-col gap-2 text-left">
        {rows.map((row) => (
          <li
            key={row.key}
            className="rounded-[8px] bg-surface-2 px-3 py-2 text-ink-2 tabular-nums"
          >
            [병원] {formatDate(ckupYmd, { separator: '-', hasYear: false })} ·{' '}
            {row.petNm} · {hospNm} · {formatAmount(row.amt)}
          </li>
        ))}
      </ul>
    </Modal>
  );
}
