import { formatDate } from '@/utils/formatDate';
import { formatFailRate, formatResponseTime } from './apiUsageLabels';

const COLUMNS = ['날짜', '호출', '실패율', '평균 응답'];

/**
 * [한 종류의 일별 사용량 표]
 * - 좁은 폭에서는 표 안에서만 가로 스크롤
 */
export default function ApiUsageDailyTable({ days }) {
  return (
    <div className="overflow-x-auto rounded-[14px] border border-line bg-white">
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
          {days.map((day) => (
            <tr
              key={day.callYmd}
              className="border-b border-line text-ink-2 last:border-b-0"
            >
              <td className="px-4 py-3 whitespace-nowrap tabular-nums">
                {formatDate(day.callYmd, { hasYear: false, separator: '-' })}
              </td>
              <td className="px-4 py-3 whitespace-nowrap tabular-nums">
                {day.callCnt.toLocaleString()}
              </td>
              <td className="px-4 py-3 whitespace-nowrap tabular-nums">
                {formatFailRate(day.failRt)}
              </td>
              <td className="px-4 py-3 whitespace-nowrap tabular-nums">
                {formatResponseTime(day.avgRspnsMs)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
