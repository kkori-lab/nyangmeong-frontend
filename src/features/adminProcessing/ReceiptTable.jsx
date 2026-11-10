import { BTN_SECONDARY } from '@/components/buttonStyles';
import { formatDate, getHmOf } from '@/utils/formatDate';
import { getCodeName, OCR_SOURCES, OCR_STTS_FAIL } from './processingLabels';
import { ADMIN_TABLE_BOX } from '@/components/adminTableStyles';

const COLUMNS = ['요청 일시', '출처', '상태', '회원', '원본'];

/**
 * [영수증 OCR 목록 표]
 * - 인식 결과 내용은 보이지 않고 상태만, [원본 보기]로 이미지 모달
 * - 좁은 폭에서는 표 안에서만 가로 스크롤
 */
export default function ReceiptTable({ receipts, statuses, onOpenImage }) {
  return (
    <div className={ADMIN_TABLE_BOX}>
      <table className="w-full min-w-[640px] text-left text-base">
        <thead>
          <tr className="border-b border-line text-sm text-subtle">
            {COLUMNS.map((column) => (
              <th key={column} scope="col" className="px-4 py-3 font-semibold">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {receipts.map((receipt) => {
            const isFail = receipt.ocrPrcsSttsCd === OCR_STTS_FAIL;
            return (
              <tr
                key={receipt.recptSn}
                className="border-b border-line text-ink-2 last:border-b-0"
              >
                <td className="px-4 py-3 whitespace-nowrap tabular-nums">
                  {formatDate(receipt.regDt, {
                    hasYear: false,
                    separator: '-',
                  })}{' '}
                  {getHmOf(receipt.regDt)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {getCodeName(OCR_SOURCES, receipt.ocrDmndSrcCd)}
                </td>
                <td
                  className={`px-4 py-3 whitespace-nowrap ${isFail ? 'font-semibold text-danger' : ''}`}
                >
                  {getCodeName(statuses, receipt.ocrPrcsSttsCd)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {receipt.mbrNcnm}
                </td>
                <td className="px-4 py-2 whitespace-nowrap">
                  <button
                    type="button"
                    className={`${BTN_SECONDARY} h-9! px-3! text-sm!`}
                    onClick={() => onOpenImage(receipt)}
                  >
                    원본 보기
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
