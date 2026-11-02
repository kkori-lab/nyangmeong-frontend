import { generatePath, Link } from 'react-router-dom';
import { PATHS } from '@/routes/paths';
import { formatDate } from '@/utils/formatDate';
import {
  getOptionLabel,
  getTargetLabel,
  REPORT_REASON_OPTIONS,
  REPORT_STATUS_OPTIONS,
} from './reportLabels';

const COLUMNS = [
  '대상',
  '내용',
  '사유',
  '신고자',
  '같은 대상',
  '상태',
  '접수일',
];

/**
 * [신고 목록 표]
 * - 행 클릭·Enter -> 신고 상세, 신고자 -> 회원 상세
 * - 좁은 폭에서는 표 안에서만 가로 스크롤
 */
export default function ReportTable({ reports, onSelect }) {
  return (
    <div className="overflow-x-auto rounded-[14px] border border-line bg-white">
      <table className="w-full min-w-[860px] text-left text-base">
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
              key={report.dclrSn}
              tabIndex={0}
              className="cursor-pointer border-b border-line text-ink-2 last:border-b-0 hover:bg-surface-2"
              onClick={() => onSelect(report.dclrSn)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') onSelect(report.dclrSn);
              }}
            >
              <td className="px-4 py-3 whitespace-nowrap">
                {getTargetLabel(report)}
              </td>
              <td className="max-w-[320px] truncate px-4 py-3">
                {report.trgtCn}
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                {getOptionLabel(REPORT_REASON_OPTIONS, report.dclrRsnCd)}
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <Link
                  to={generatePath(PATHS.ADMIN_MEMBER_DETAIL, {
                    mbrSn: report.mbrSn,
                  })}
                  className="hover:underline"
                  onClick={(event) => event.stopPropagation()}
                  onKeyDown={(event) => event.stopPropagation()}
                >
                  {report.mbrNcnm}
                </Link>
              </td>
              <td className="px-4 py-3 whitespace-nowrap tabular-nums">
                {report.dclrCnt.toLocaleString()}건
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                {getOptionLabel(REPORT_STATUS_OPTIONS, report.dclrPrcsSttsCd)}
              </td>
              <td className="px-4 py-3 whitespace-nowrap tabular-nums">
                {formatDate(report.regDt, { separator: '-' })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
