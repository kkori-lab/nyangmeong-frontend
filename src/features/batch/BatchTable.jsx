import { BTN_SECONDARY } from '@/components/buttonStyles';
import { formatDate, getHmOf } from '@/utils/formatDate';
import { EMPTY_LABEL, EXCN_RSLT } from './batchLabels';
import { ADMIN_TABLE_BOX } from '@/components/adminTableStyles';

const COLUMNS = ['배치', '마지막 실행', '결과'];

/** 마지막 실행 시각 */
const formatLastRun = ({ lastBgngDt }) =>
  lastBgngDt
    ? `${formatDate(lastBgngDt, { hasYear: false, separator: '-' })} ${getHmOf(lastBgngDt)}`
    : EMPTY_LABEL;

/** 결과 칸 글자: 처리 건수를 세지 않는 배치는 건수 없음 */
const formatResult = ({ lastRsltCd, prcsCnt, failRsn }) => {
  if (lastRsltCd === EXCN_RSLT.RUNNING) return '실행 중';
  if (lastRsltCd === EXCN_RSLT.SUCCESS) {
    return prcsCnt === null ? '성공' : `성공 · ${prcsCnt.toLocaleString()}건`;
  }
  if (lastRsltCd === EXCN_RSLT.FAIL) {
    return failRsn ? `실패 · ${failRsn}` : '실패';
  }
  return EMPTY_LABEL;
};

/**
 * [배치 목록 표]
 * - 행 클릭·Enter -> 실행 이력
 * - 좁은 폭에서는 표 안에서만 가로 스크롤
 */
export default function BatchTable({
  batches,
  selectedBtchSeCd,
  onSelect,
  onRun,
}) {
  return (
    <div className={`relative ${ADMIN_TABLE_BOX}`}>
      <table className="w-full min-w-[720px] text-left text-base">
        <thead>
          <tr className="border-b border-line text-sm text-subtle">
            {COLUMNS.map((column) => (
              <th key={column} scope="col" className="px-4 py-3 font-semibold">
                {column}
              </th>
            ))}
            <th scope="col" className="px-4 py-3">
              <span className="sr-only">수동 실행</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {batches.map((batch) => (
            <tr
              key={batch.btchSeCd}
              tabIndex={0}
              aria-selected={batch.btchSeCd === selectedBtchSeCd}
              className={`cursor-pointer border-b border-line text-ink-2 last:border-b-0 hover:bg-surface-2 ${
                batch.btchSeCd === selectedBtchSeCd ? 'bg-surface-2' : ''
              }`}
              onClick={() => onSelect(batch.btchSeCd)}
              onKeyDown={(event) => {
                if (
                  event.key === 'Enter' &&
                  event.target === event.currentTarget
                ) {
                  onSelect(batch.btchSeCd);
                }
              }}
            >
              <td className="px-4 py-3 whitespace-nowrap">{batch.btchNm}</td>
              <td className="px-4 py-3 whitespace-nowrap tabular-nums">
                {formatLastRun(batch)}
              </td>
              <td
                className={`px-4 py-3 ${
                  batch.lastRsltCd === EXCN_RSLT.FAIL ? 'text-danger' : ''
                }`}
              >
                {formatResult(batch)}
              </td>
              <td className="px-4 py-3 text-right">
                <button
                  type="button"
                  disabled={batch.runningYn || !batch.runnableYn}
                  className={`${BTN_SECONDARY} whitespace-nowrap`}
                  onClick={(event) => {
                    event.stopPropagation();
                    onRun(batch);
                  }}
                >
                  {batch.runningYn ? '실행 중' : '수동 실행'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
