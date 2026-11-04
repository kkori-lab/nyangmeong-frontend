import { formatDate, getHmOf } from '@/utils/formatDate';
import { CALL_RSLT } from './processingLabels';

const COLUMNS = ['호출 일시', '결과', '오류 메시지'];

/** 호출결과 이름 */
const getResultName = (callRsltCd) =>
  callRsltCd === CALL_RSLT.TIMEOUT ? '시간 초과' : 'API 오류';

/**
 * [검사결과지 분석 실패 표]
 * - 실패 호출만, 분석 결과 내용 없음
 * - 좁은 폭에서는 표 안에서만 가로 스크롤
 */
export default function PdfFailureTable({ failures }) {
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
          {failures.map((failure) => (
            <tr
              key={failure.extlApiCallLogSn}
              className="border-b border-line text-ink-2 last:border-b-0"
            >
              <td className="px-4 py-3 whitespace-nowrap tabular-nums">
                {formatDate(failure.callDt, { hasYear: false, separator: '-' })}{' '}
                {getHmOf(failure.callDt)}
              </td>
              <td className="px-4 py-3 font-semibold whitespace-nowrap text-danger">
                {getResultName(failure.callRsltCd)}
              </td>
              <td className="px-4 py-3">{failure.failRsn || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
