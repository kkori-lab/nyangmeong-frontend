import { BTN_SECONDARY } from '@/components/buttonStyles';
import { formatDate } from '@/utils/formatDate';
import { ADMIN_TABLE_BOX } from '@/components/adminTableStyles';

const COLUMNS = ['닉네임', '이메일', '지정일', '해제'];
const DATE_OPTIONS = { hasYear: false, separator: '-' };

/**
 * [관리자 표]
 * - 내 행과 마지막 남은 관리자는 [해제] 비활성
 * - 좁은 폭에서는 표 안에서만 가로 스크롤
 */
export default function AdminTable({
  admins,
  myMbrSn,
  isLastAdmin,
  onRelease,
}) {
  return (
    <div className={ADMIN_TABLE_BOX}>
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
          {admins.map((admin) => {
            const isMe = admin.mbrSn === myMbrSn;
            return (
              <tr
                key={admin.mbrSn}
                className="border-b border-line text-ink-2 last:border-b-0"
              >
                <td className="px-4 py-3 whitespace-nowrap">
                  {admin.mbrNcnm}
                  {isMe && ' (나)'}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {admin.maskedAcntEml}
                </td>
                <td className="px-4 py-3 whitespace-nowrap tabular-nums">
                  {admin.apntDt ? formatDate(admin.apntDt, DATE_OPTIONS) : '—'}
                </td>
                <td className="px-4 py-2">
                  <button
                    type="button"
                    className={BTN_SECONDARY}
                    disabled={isMe || isLastAdmin}
                    onClick={() => onRelease(admin)}
                  >
                    해제
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
