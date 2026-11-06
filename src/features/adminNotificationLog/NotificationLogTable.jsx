import { formatDate, getHmOf } from '@/utils/formatDate';
import { SNDNG_RSLT_FAIL } from './api';
import { ADMIN_TABLE_BOX } from '@/components/adminTableStyles';

const COLUMNS = [
  '발송 일시',
  '수신 회원',
  '유형',
  '채널',
  '결과',
  '재시도',
  '실패 사유',
];

/** 공통코드 이름: 못 받으면 코드 그대로 */
const getCodeName = (codes = [], code) =>
  codes.find(({ comCd }) => comCd === code)?.comCdNm ?? code;

/**
 * [발송 이력 표]
 * - 읽기 전용(재발송 없음, 자동 재시도만), 알림 본문은 보이지 않는다
 * - 좁은 폭에서는 표 안에서만 가로 스크롤
 */
export default function NotificationLogTable({
  logs,
  channels,
  types,
  results,
}) {
  return (
    <div className={ADMIN_TABLE_BOX}>
      <table className="w-full min-w-[820px] text-left text-base">
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
          {logs.map((log) => {
            const isFail = log.sndngRsltCd === SNDNG_RSLT_FAIL;
            return (
              <tr
                key={log.notiSndngLogSn}
                className="border-b border-line text-ink-2 last:border-b-0"
              >
                <td className="px-4 py-3 whitespace-nowrap tabular-nums">
                  {formatDate(log.sndngDt, { hasYear: false, separator: '-' })}{' '}
                  {getHmOf(log.sndngDt)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">{log.mbrNcnm}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {getCodeName(types, log.notiTypeCd)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {getCodeName(channels, log.notiChnlCd)}
                </td>
                <td
                  className={`px-4 py-3 whitespace-nowrap ${isFail ? 'font-semibold text-danger' : ''}`}
                >
                  {getCodeName(results, log.sndngRsltCd)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap tabular-nums">
                  {log.rtryNmtm}
                </td>
                <td className="px-4 py-3">{log.failRsn || '—'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
