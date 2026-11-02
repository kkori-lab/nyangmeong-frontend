import { formatDate, getHmOf } from '@/utils/formatDate';

const COLUMNS = ['닉네임', '이메일', '탈퇴 일시', '파기 예정일'];
const DATE_OPTIONS = { separator: '-' };

/**
 * [탈퇴 회원 표]
 * - 행 클릭 동작 없음
 * - 좁은 폭에서는 표 안에서만 가로 스크롤
 */
export default function WithdrawnTable({ members }) {
  return (
    <div className="overflow-x-auto rounded-[14px] border border-line bg-white">
      <table className="w-full min-w-[640px] text-left text-base">
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
          {members.map((member) => (
            <tr
              key={member.mbrSn}
              className="border-b border-line text-ink-2 last:border-b-0"
            >
              <td className="px-4 py-3 whitespace-nowrap">{member.mbrNcnm}</td>
              <td className="px-4 py-3 whitespace-nowrap">
                {member.maskedAcntEml}
              </td>
              <td className="px-4 py-3 whitespace-nowrap tabular-nums">
                {formatDate(member.whdwlDt, DATE_OPTIONS)}{' '}
                {getHmOf(member.whdwlDt)}
              </td>
              <td className="px-4 py-3 whitespace-nowrap tabular-nums">
                {formatDate(member.purgeYmd, DATE_OPTIONS)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
