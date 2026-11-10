import { ADMIN_TABLE_BOX } from '@/components/adminTableStyles';
const COLUMNS = ['순서', '제목', '선정', ''];
const CELL = 'px-4 py-3 max-[760px]:px-2';
/** 행 안 작은 버튼: BTN_SECONDARY와 같은 색, 높이·여백만 작게 */
const ROW_BUTTON =
  'inline-flex h-9 items-center justify-center rounded-md border border-line bg-white px-3 text-sm font-semibold whitespace-nowrap hover:border-line-strong hover:bg-surface-2 max-[760px]:h-8 max-[760px]:px-2';

/** 건강팁 노출 자리 수 */
const SLOT_COUNT = 3;

/**
 * 서버는 최대 3건만 줌: 지정 글은 그 자리에, 자동 선정 글은 남은 자리에 앞에서부터, 남는 자리는 빈 줄
 */
const toSlots = (tips) => {
  const slots = Array(SLOT_COUNT).fill(null);
  tips
    .filter((tip) => tip.hlthInfoExpsrSeq != null)
    .forEach((tip) => {
      slots[tip.hlthInfoExpsrSeq - 1] = tip;
    });
  const autoTips = tips.filter((tip) => tip.hlthInfoExpsrSeq == null);
  return slots.map((tip) => tip ?? autoTips.shift() ?? {});
};

/**
 * [오늘의 건강팁 표]
 * - tips: [{ pstSn, pstTtl, hlthInfoExpsrSeq }] 노출 자리 순서(최대 3건), hlthInfoExpsrSeq가 있으면 관리자 지정
 * - 언제나 3줄: 채울 글이 없는 자리는 "—"
 * - 관리자 지정 행만 [지정 해제] -> onUnassign(tip)
 */
export default function HealthTipTable({ tips, onUnassign }) {
  return (
    <div className={ADMIN_TABLE_BOX}>
      <table className="w-full table-fixed text-left text-base max-[760px]:text-sm">
        <colgroup>
          <col className="w-[80px] max-[760px]:w-[44px]" />
          <col />
          <col className="w-[128px] max-[760px]:w-[76px]" />
          <col className="w-[120px] max-[760px]:w-[84px]" />
        </colgroup>
        <thead>
          <tr className="border-b border-line text-sm text-subtle">
            {COLUMNS.map((column, index) => (
              <th
                key={column || index}
                scope="col"
                className="px-4 py-3 font-semibold whitespace-nowrap max-[760px]:px-2"
              >
                {column || <span className="sr-only">관리</span>}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {toSlots(tips).map((tip, index) => {
            const isAssigned = tip.hlthInfoExpsrSeq != null;
            return (
              <tr
                key={tip.pstSn ?? `empty-${index}`}
                className="border-b border-line text-ink-2 last:border-b-0"
              >
                <td className={CELL}>{index + 1}</td>
                <td
                  className={`${CELL} truncate ${tip.pstTtl ? '' : 'text-subtle'}`}
                  title={tip.pstTtl || undefined}
                >
                  {tip.pstTtl || '—'}
                </td>
                <td
                  className={`${CELL} whitespace-nowrap ${isAssigned ? 'font-semibold text-brand-900' : 'text-subtle'}`}
                >
                  {isAssigned ? '관리자 지정' : tip.pstSn ? '자동' : '—'}
                </td>
                <td className={`${CELL} text-right`}>
                  {isAssigned && (
                    <button
                      type="button"
                      aria-label={`${tip.pstTtl} 지정 해제`}
                      className={ROW_BUTTON}
                      onClick={() => onUnassign(tip)}
                    >
                      지정 해제
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
