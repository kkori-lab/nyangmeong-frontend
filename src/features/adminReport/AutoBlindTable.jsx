import { generatePath, Link } from 'react-router-dom';
import { BTN_SECONDARY } from '@/components/buttonStyles';
import { PATHS } from '@/routes/paths';
import { formatDate } from '@/utils/formatDate';
import { getTargetLabel } from './reportLabels';
import { ADMIN_TABLE_BOX } from '@/components/adminTableStyles';

const COLUMNS = [
  '대상',
  '내용',
  '작성자',
  '같은 대상',
  '접수 대기',
  '마지막 신고',
  '',
];

/**
 * [자동 블라인드 표]
 * - 대상별 1행, 행 클릭·Enter -> 대상의 최신 신고 상세
 * - 작성자 -> 회원 상세, [복구] -> 복구 모달
 */
export default function AutoBlindTable({ reports, onSelect, onRestore }) {
  return (
    <div className={ADMIN_TABLE_BOX}>
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
                <Link
                  to={generatePath(PATHS.ADMIN_MEMBER_DETAIL, {
                    mbrSn: report.trgtMbrSn,
                  })}
                  className="hover:underline"
                  onClick={(event) => event.stopPropagation()}
                  onKeyDown={(event) => event.stopPropagation()}
                >
                  {report.trgtMbrNcnm}
                </Link>
              </td>
              <td className="px-4 py-3 whitespace-nowrap tabular-nums">
                {report.dclrCnt.toLocaleString()}건
              </td>
              <td className="px-4 py-3 whitespace-nowrap tabular-nums">
                {report.rcptDclrCnt.toLocaleString()}건
              </td>
              <td className="px-4 py-3 whitespace-nowrap tabular-nums">
                {formatDate(report.lastRegDt, { separator: '-' })}
              </td>
              <td className="px-4 py-3 text-right whitespace-nowrap">
                <button
                  type="button"
                  className={BTN_SECONDARY}
                  onClick={(event) => {
                    event.stopPropagation();
                    onRestore(report);
                  }}
                  onKeyDown={(event) => event.stopPropagation()}
                >
                  복구
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
