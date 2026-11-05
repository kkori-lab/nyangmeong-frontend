import {
  formatFailRate,
  formatResponseTime,
  getApiTypeName,
} from './apiUsageLabels';
import { ADMIN_TABLE_BOX } from '@/components/adminTableStyles';

const COLUMNS = ['종류', '호출', '실패율', '평균 응답'];

/**
 * [종류별 사용량 표]
 * - 행 클릭·Enter -> 일별 표
 * - 좁은 폭에서는 표 안에서만 가로 스크롤
 */
export default function ApiUsageTable({ usages, selectedCd, onSelect }) {
  return (
    <div className={ADMIN_TABLE_BOX}>
      <table className="w-full min-w-[560px] text-left text-base">
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
          {usages.map((usage) => (
            <tr
              key={usage.extlApiSeCd}
              tabIndex={0}
              aria-selected={usage.extlApiSeCd === selectedCd}
              className={`cursor-pointer border-b border-line text-ink-2 last:border-b-0 hover:bg-surface-2 ${
                usage.extlApiSeCd === selectedCd ? 'bg-surface-2' : ''
              }`}
              onClick={() => onSelect(usage.extlApiSeCd)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') onSelect(usage.extlApiSeCd);
              }}
            >
              <td className="px-4 py-3 whitespace-nowrap">
                {getApiTypeName(usage.extlApiSeCd)}
              </td>
              <td className="px-4 py-3 whitespace-nowrap tabular-nums">
                {usage.callCnt.toLocaleString()}
              </td>
              <td className="px-4 py-3 whitespace-nowrap tabular-nums">
                {formatFailRate(usage.failRt)}
              </td>
              <td className="px-4 py-3 whitespace-nowrap tabular-nums">
                {formatResponseTime(usage.avgRspnsMs)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
