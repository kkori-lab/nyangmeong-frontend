import { formatDate, getYmdOf } from '@/utils/formatDate';

const COLUMNS = ['고정', '제목', '사용', '조회수', '알림 발송', '등록일'];

/** 알림 발송 칸: 'MM-DD · N명', 안 보냈으면 — */
const formatSending = ({ ntfctnSndngDt, ntfctnTrgtCnt }) => {
  if (!ntfctnSndngDt) return '—';
  const sentDate = formatDate(getYmdOf(ntfctnSndngDt), {
    separator: '-',
    hasYear: false,
  });
  return `${sentDate} · ${ntfctnTrgtCnt.toLocaleString()}명`;
};

/**
 * [공지 목록 표]
 * - 행 클릭·Enter -> 공지 수정
 * - 좁은 폭에서는 표 안에서만 가로 스크롤
 */
export default function NoticeTable({ notices, onSelect }) {
  return (
    <div className="overflow-x-auto rounded-[14px] border border-line bg-white">
      <table className="w-full min-w-[760px] text-left text-base">
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
          {notices.map((notice) => (
            <tr
              key={notice.ntcMttrSn}
              tabIndex={0}
              className="cursor-pointer border-b border-line text-ink-2 last:border-b-0 hover:bg-surface-2"
              onClick={() => onSelect(notice.ntcMttrSn)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') onSelect(notice.ntcMttrSn);
              }}
            >
              <td className="px-4 py-3 font-semibold whitespace-nowrap text-brand-900">
                {notice.upendFixYn ? '고정' : ''}
              </td>
              <td className="max-w-[420px] truncate px-4 py-3">
                {notice.ntcMttrTtl}
              </td>
              <td
                className={`px-4 py-3 whitespace-nowrap ${
                  notice.useYn ? '' : 'text-subtle'
                }`}
              >
                {notice.useYn ? '사용' : '비노출'}
              </td>
              <td className="px-4 py-3 whitespace-nowrap tabular-nums">
                {notice.inqCnt.toLocaleString()}
              </td>
              <td className="px-4 py-3 whitespace-nowrap tabular-nums">
                {formatSending(notice)}
              </td>
              <td className="px-4 py-3 whitespace-nowrap tabular-nums">
                {formatDate(getYmdOf(notice.regDt), { separator: '-' })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
