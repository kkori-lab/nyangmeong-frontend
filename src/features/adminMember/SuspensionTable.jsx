import { BTN_SECONDARY } from '@/components/buttonStyles';
import { formatDate, getHmOf } from '@/utils/formatDate';

const COLUMNS = [
  '닉네임',
  '정지 종류',
  '정지 일시',
  '종료 일시',
  '사유',
  '처리 관리자',
  '해제',
];

/** 월-일 시:분 표시: 값이 없으면 — */
const formatMonthDayTime = (dateTime) =>
  dateTime
    ? `${formatDate(dateTime, { hasYear: false, separator: '-' })} ${getHmOf(dateTime)}`
    : '—';

/**
 * [정지 회원 표]
 * - 닉네임 -> 회원 상세, [해제] -> 해제 모달
 * - 좁은 폭에서는 표 안에서만 가로 스크롤
 */
export default function SuspensionTable({ suspensions, onSelect, onRelease }) {
  return (
    <div className="overflow-x-auto rounded-[14px] border border-line bg-white">
      <table className="w-full min-w-[840px] text-left text-base">
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
          {suspensions.map((suspension) => (
            <tr
              key={suspension.mbrSn}
              className="border-b border-line text-ink-2 last:border-b-0"
            >
              <td className="px-4 py-3 whitespace-nowrap">
                <button
                  type="button"
                  className="font-semibold text-brand-900 hover:underline"
                  onClick={() => onSelect(suspension.mbrSn)}
                >
                  {suspension.mbrNcnm}
                </button>
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                {suspension.suspnEndDt ? '기간' : '영구'}
              </td>
              <td className="px-4 py-3 whitespace-nowrap tabular-nums">
                {formatMonthDayTime(suspension.suspnDt)}
              </td>
              <td className="px-4 py-3 whitespace-nowrap tabular-nums">
                {formatMonthDayTime(suspension.suspnEndDt)}
              </td>
              <td className="px-4 py-3">{suspension.suspnRsn ?? '—'}</td>
              <td className="px-4 py-3 whitespace-nowrap">
                {suspension.prcrNcnm ?? '—'}
              </td>
              <td className="px-4 py-2">
                <button
                  type="button"
                  className={BTN_SECONDARY}
                  onClick={() => onRelease(suspension)}
                >
                  해제
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
