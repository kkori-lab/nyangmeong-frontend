import { formatDateTime } from '@/utils/formatDate';
import { getOptionLabel, REPORT_STATUS_OPTIONS } from './reportLabels';

/** 상태 변화 표시: 처음 상태가 없으면 바뀐 상태만 */
const formatChange = ({ bfrSttsCd, aftrSttsCd }) => {
  const after = getOptionLabel(REPORT_STATUS_OPTIONS, aftrSttsCd);
  if (!bfrSttsCd) return after;
  return `${getOptionLabel(REPORT_STATUS_OPTIONS, bfrSttsCd)} → ${after}`;
};

/**
 * [신고 처리 이력]
 * - 처리자가 없으면 시스템: 자동 처리 등
 */
export default function ReportHistory({ histories }) {
  if (histories.length === 0) {
    return (
      <p className="rounded-[14px] border border-line bg-white py-8 text-center text-base text-subtle">
        처리 이력이 없어요
      </p>
    );
  }

  return (
    <ul className="rounded-[14px] border border-line bg-white">
      {histories.map((history) => (
        <li
          key={history.dclrSttsHstrySn}
          className="border-b border-line px-4 py-3 text-base text-ink-2 last:border-b-0"
        >
          <p>
            <span className="tabular-nums">
              {formatDateTime(history.regDt)}
            </span>{' '}
            · {formatChange(history)} ·{' '}
            {history.prcsMbrSn == null ? '시스템' : history.prcsMbrNcnm}
          </p>
          {history.chgRsn && (
            <p className="mt-1 break-words whitespace-pre-line text-subtle">
              {history.chgRsn}
            </p>
          )}
        </li>
      ))}
    </ul>
  );
}
