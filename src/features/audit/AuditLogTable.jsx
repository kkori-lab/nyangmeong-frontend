import { formatDate, getHmOf } from '@/utils/formatDate';
import { getTargetLabel } from './auditLabels';

const COLUMNS = ['일시', '관리자', '작업 유형', '대상', '요약'];

/**
 * [감사 로그 목록 표]
 * - 행 클릭·Enter -> 상세 모달
 * - 좁은 폭에서는 표 안에서만 가로 스크롤
 */
export default function AuditLogTable({ logs, taskTypes = [], onSelect }) {
  /** 작업 유형 이름: 공통코드를 못 받으면 코드 그대로 */
  const getTaskTypeName = (taskTypeCd) =>
    taskTypes.find(({ comCd }) => comCd === taskTypeCd)?.comCdNm ?? taskTypeCd;

  return (
    <div className="overflow-x-auto rounded-[14px] border border-line bg-white">
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
          {logs.map((log) => (
            <tr
              key={log.mngrTaskLogSn}
              tabIndex={0}
              className="cursor-pointer border-b border-line text-ink-2 last:border-b-0 hover:bg-surface-2"
              onClick={() => onSelect(log.mngrTaskLogSn)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') onSelect(log.mngrTaskLogSn);
              }}
            >
              <td className="px-4 py-3 whitespace-nowrap tabular-nums">
                {formatDate(log.regDt, { hasYear: false, separator: '-' })}{' '}
                {getHmOf(log.regDt)}
              </td>
              <td className="px-4 py-3 whitespace-nowrap">{log.mbrNcnm}</td>
              <td className="px-4 py-3 whitespace-nowrap">
                {getTaskTypeName(log.taskTypeCd)}
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                {getTargetLabel(log)}
              </td>
              <td className="px-4 py-3">{log.taskSmryCn}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
