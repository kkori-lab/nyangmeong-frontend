import { formatDate, getHmOf } from '@/utils/formatDate';
import { EMPTY_LABEL, EXCN_SE } from './batchLabels';
import { ADMIN_TABLE_BOX } from '@/components/adminTableStyles';

const COLUMNS = ['시작', '종료', '처리', '사유', '구분'];

/** 값이 없으면 빈 표기 */
const formatCount = (count) => count?.toLocaleString() ?? EMPTY_LABEL;

/** 구분 칸 글자 */
const formatExcnSe = ({ excnSeCd, mbrNcnm }) => {
  if (excnSeCd !== EXCN_SE.MANUAL) return '자동';
  return mbrNcnm ? `수동 · ${mbrNcnm}` : '수동';
};

/**
 * [배치 실행 이력 표]
 * - 좁은 폭에서는 표 안에서만 가로 스크롤
 */
export default function BatchHistoryTable({ histories }) {
  return (
    <div className={ADMIN_TABLE_BOX}>
      <table className="w-full min-w-[720px] text-left text-base">
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
          {histories.map((history) => (
            <tr
              key={history.btchExcnHstrySn}
              className="border-b border-line text-ink-2 last:border-b-0"
            >
              <td className="px-4 py-3 whitespace-nowrap tabular-nums">
                {formatDate(history.excnBgngDt, {
                  hasYear: false,
                  separator: '-',
                })}{' '}
                {getHmOf(history.excnBgngDt)}
              </td>
              <td className="px-4 py-3 whitespace-nowrap tabular-nums">
                {history.excnEndDt ? getHmOf(history.excnEndDt) : EMPTY_LABEL}
              </td>
              <td className="px-4 py-3 whitespace-nowrap tabular-nums">
                {formatCount(history.prcsCnt)}
              </td>
              <td className="px-4 py-3">{history.failRsn ?? EMPTY_LABEL}</td>
              <td className="px-4 py-3 whitespace-nowrap">
                {formatExcnSe(history)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
