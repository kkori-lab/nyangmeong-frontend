import { formatDate, getHmOf, getYmdOf } from '@/utils/formatDate';
import {
  getOptionLabel,
  JOIN_PATH_OPTIONS,
  ROLE_OPTIONS,
  STATUS_OPTIONS,
} from './memberLabels';
import { ADMIN_TABLE_BOX } from '@/components/adminTableStyles';

const COLUMNS = [
  '닉네임',
  '이메일',
  '가입 경로',
  '상태',
  '권한',
  '가입일',
  '최근 로그인',
];

/** 최근 로그인 표시: 기록이 없으면 — */
const formatLastLogin = (lastLgnDt) =>
  lastLgnDt
    ? `${formatDate(lastLgnDt, { hasYear: false, separator: '-' })} ${getHmOf(lastLgnDt)}`
    : '—';

/**
 * [회원 목록 표]
 * - 행 클릭·Enter -> 회원 상세
 * - 좁은 폭에서는 표 안에서만 가로 스크롤
 */
export default function MemberTable({ members, onSelect }) {
  return (
    <div className={ADMIN_TABLE_BOX}>
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
          {members.map((member) => (
            <tr
              key={member.mbrSn}
              tabIndex={0}
              className="cursor-pointer border-b border-line text-ink-2 last:border-b-0 hover:bg-surface-2"
              onClick={() => onSelect(member.mbrSn)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') onSelect(member.mbrSn);
              }}
            >
              <td className="px-4 py-3 whitespace-nowrap">{member.mbrNcnm}</td>
              <td className="px-4 py-3 whitespace-nowrap">
                {member.maskedAcntEml}
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                {getOptionLabel(JOIN_PATH_OPTIONS, member.joinPathCd)}
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                {getOptionLabel(STATUS_OPTIONS, member.mbrSttsCd)}
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                {getOptionLabel(ROLE_OPTIONS, member.mbrAuthrtCd)}
              </td>
              <td className="px-4 py-3 whitespace-nowrap tabular-nums">
                {getYmdOf(member.regDt)}
              </td>
              <td className="px-4 py-3 whitespace-nowrap tabular-nums">
                {formatLastLogin(member.lastLgnDt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
