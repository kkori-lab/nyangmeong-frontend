import { formatDate, getHmOf } from '@/utils/formatDate';
import { formatPointChange } from './pointLabels';

const COLUMNS = ['일시', '회원', '거래 유형', '증감', '거래 후 잔액', '메모'];

/** 숫자 열은 오른쪽 정렬 */
const NUMBER_COLUMNS = ['증감', '거래 후 잔액'];

/**
 * [포인트 원장 표]
 * - 읽기 전용, 차감은 붉은 글씨
 * - 좁은 폭에서는 표 안에서만 가로 스크롤
 */
export default function PointLedgerTable({ ledgers }) {
  return (
    <div className="overflow-x-auto rounded-[14px] border border-line bg-white">
      <table className="w-full min-w-[760px] text-left text-base">
        <thead>
          <tr className="border-b border-line text-sm text-subtle">
            {COLUMNS.map((column) => (
              <th
                key={column}
                scope="col"
                className={`px-4 py-3 font-semibold ${NUMBER_COLUMNS.includes(column) ? 'text-right' : ''}`}
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ledgers.map((ledger) => (
            <tr
              key={ledger.pntGnlgrSn}
              className="border-b border-line text-ink-2 last:border-b-0"
            >
              <td className="px-4 py-3 whitespace-nowrap tabular-nums">
                {formatDate(ledger.regDt, { hasYear: false, separator: '-' })}{' '}
                {getHmOf(ledger.regDt)}
              </td>
              <td className="px-4 py-3 whitespace-nowrap">{ledger.mbrNcnm}</td>
              <td className="px-4 py-3 whitespace-nowrap">
                {ledger.pntDlngTypeCdNm}
              </td>
              <td
                className={`px-4 py-3 text-right whitespace-nowrap tabular-nums ${ledger.dlngPnt < 0 ? 'text-danger' : 'text-ink'}`}
              >
                {formatPointChange(ledger.dlngPnt)}
              </td>
              <td className="px-4 py-3 text-right whitespace-nowrap tabular-nums">
                {ledger.dlngAftrBlncPnt.toLocaleString()}
              </td>
              <td className="px-4 py-3">{ledger.memoCn || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
