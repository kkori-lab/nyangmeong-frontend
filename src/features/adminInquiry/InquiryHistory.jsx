import { formatDateTime } from '@/utils/formatDate';

/** 상태 변화 표시: 접수 이력은 바뀐 상태만 */
const formatChange = ({ bfrSttsCdNm, aftrSttsCdNm }) =>
  bfrSttsCdNm ? `${bfrSttsCdNm} → ${aftrSttsCdNm}` : aftrSttsCdNm;

/**
 * [1:1 문의 상태 이력]
 * - 오래된 순, 바꾼 회원(접수는 작성자, 답변은 관리자)
 */
export default function InquiryHistory({ histories }) {
  if (histories.length === 0) {
    return (
      <p className="rounded-[14px] border border-line bg-white py-8 text-center text-base text-subtle">
        상태 이력이 없어요
      </p>
    );
  }

  return (
    <ul className="rounded-[14px] border border-line bg-white">
      {histories.map((history, index) => (
        <li
          key={`${history.regDt}-${index}`}
          className="border-b border-line px-4 py-3 text-base text-ink-2 last:border-b-0"
        >
          <p>
            <span className="tabular-nums">
              {formatDateTime(history.regDt)}
            </span>{' '}
            · {formatChange(history)}
            {history.mbrNcnm && ` · ${history.mbrNcnm}`}
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
