import { formatDate, getHmOf } from '@/utils/formatDate';
import { CALL_RSLT, getApiTypeName } from './apiUsageLabels';

const COLUMNS = ['시각', '종류', '사유'];

/** 사유 칸 글자 */
const formatReason = ({ callRsltCd, failRsn }) =>
  callRsltCd === CALL_RSLT.TIMEOUT ? '타임아웃' : failRsn;

/**
 * [실패 호출 표]
 * - 좁은 폭에서는 표 안에서만 가로 스크롤
 */
export default function ApiFailureTable({ failures }) {
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
              <td className="px-4 py-3 whitespace-nowrap">
                {getApiTypeName(failure.extlApiSeCd)}
              </td>
              <td className="px-4 py-3">{formatReason(failure)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
