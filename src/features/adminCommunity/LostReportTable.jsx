import { formatDate } from '@/utils/formatDate';
import { getLostStatusLabel, LOST_STATUS } from './lostReportLabels';

const COLUMNS = ['상태', '제목', '작성자', '만료 기준일', '작성일'];

/** "11-28" 꼴 날짜 */
const toMonthDay = (dateTime) =>
  formatDate(dateTime, { hasYear: false, separator: '-' });

/** 만료 기준일은 진행 중(실종) 제보만, 나머지는 — */
const getExpiryText = (report) =>
  report.lostTpofSttsCd === LOST_STATUS.LOST && report.expryCrtrDt
    ? toMonthDay(report.expryCrtrDt)
    : '—';

/** 상태 글자: 진행 중(실종)만 진하게 */
const statusClassOf = (code) =>
  code === LOST_STATUS.LOST ? 'font-semibold text-danger' : 'text-subtle';

/**
 * [실종제보 목록]
 * - 행 클릭·Enter -> 상세 모달(onSelect)
 * - 760px 이하는 표 대신 한 줄 목록이라 가로 스크롤이 없다
 */
export default function LostReportTable({ reports, onSelect }) {
  const handleKeyDown = (event, lostTpofSn) => {
    if (event.key === 'Enter') onSelect(lostTpofSn);
  };

  return (
    <div className="rounded-[14px] border border-line bg-white">
      <table className="w-full text-left text-base max-[760px]:hidden">
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
          {reports.map((report) => (
            <tr
              key={report.lostTpofSn}
              tabIndex={0}
              className="cursor-pointer border-b border-line text-ink-2 last:border-b-0 hover:bg-surface-2"
              onClick={() => onSelect(report.lostTpofSn)}
              onKeyDown={(event) => handleKeyDown(event, report.lostTpofSn)}
            >
              <td
                className={`px-4 py-3 whitespace-nowrap ${statusClassOf(report.lostTpofSttsCd)}`}
              >
                {getLostStatusLabel(report.lostTpofSttsCd)}
              </td>
              <td className="max-w-[480px] truncate px-4 py-3">
                {report.pstTtl}
              </td>
              <td className="px-4 py-3 whitespace-nowrap">{report.mbrNcnm}</td>
              <td className="px-4 py-3 whitespace-nowrap tabular-nums">
                {getExpiryText(report)}
              </td>
              <td className="px-4 py-3 whitespace-nowrap tabular-nums">
                {toMonthDay(report.regDt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <ul className="min-[761px]:hidden">
        {reports.map((report) => (
          <li
            key={report.lostTpofSn}
            className="border-b border-line last:border-b-0"
          >
            <button
              type="button"
              className="block w-full px-4 py-3 text-left hover:bg-surface-2"
              onClick={() => onSelect(report.lostTpofSn)}
            >
              <span className="flex items-center gap-2 text-base leading-[1.3]">
                <span
                  className={`shrink-0 ${statusClassOf(report.lostTpofSttsCd)}`}
                >
                  {getLostStatusLabel(report.lostTpofSttsCd)}
                </span>
                <span className="min-w-0 truncate text-ink-2">
                  {report.pstTtl}
                </span>
              </span>
              <span className="mt-1 block text-sm leading-[1.3] text-subtle tabular-nums">
                {report.mbrNcnm} · 만료 기준일 {getExpiryText(report)} · 작성{' '}
                {toMonthDay(report.regDt)}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
