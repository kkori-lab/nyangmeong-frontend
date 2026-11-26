import { formatDate } from '@/utils/formatDate';
import { formatCost, getRcrtStatusLabel, RCRT_STATUS } from './careMatchLabels';

const COLUMNS = ['상태', '제목', '작성자', '비용', '작성일'];

/** 거른 회원이 글 작성자면 보호자, 아니면 돌보미 */
const roleOf = (recruit, viewerMbrSn) =>
  recruit.mbrSn === viewerMbrSn ? '보호자' : '돌보미';

/** "10-28" 꼴 날짜 */
const toMonthDay = (dateTime) =>
  formatDate(dateTime, { hasYear: false, separator: '-' });

/** 상태 글자: 모집중만 진하게 */
const statusClassOf = (code) =>
  code === RCRT_STATUS.OPEN ? 'font-semibold text-brand-900' : 'text-subtle';

/**
 * [펫돌봄 모집글 목록]
 * - 행 클릭·Enter -> 매칭 상세 모달(onSelect)
 * - 760px 이하는 표 대신 한 줄 목록이라 가로 스크롤이 없다
 * - viewerMbrSn(회원으로 거른 목록)이 있으면 그 회원의 역할(보호자·돌보미)을 보여 준다
 */
export default function CareRecruitTable({ recruits, onSelect, viewerMbrSn }) {
  const hasRole = viewerMbrSn != null;
  const columns = hasRole ? ['역할', ...COLUMNS] : COLUMNS;

  const handleKeyDown = (event, petPrtcRcrtSn) => {
    if (event.key === 'Enter') onSelect(petPrtcRcrtSn);
  };

  return (
    <div className="rounded-[14px] border border-line bg-white">
      <table className="w-full text-left text-base max-[760px]:hidden">
        <thead>
          <tr className="border-b border-line text-sm text-subtle">
            {columns.map((column) => (
              <th key={column} scope="col" className="px-4 py-3 font-semibold">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {recruits.map((recruit) => (
            <tr
              key={recruit.petPrtcRcrtSn}
              tabIndex={0}
              className="cursor-pointer border-b border-line text-ink-2 last:border-b-0 hover:bg-surface-2"
              onClick={() => onSelect(recruit.petPrtcRcrtSn)}
              onKeyDown={(event) => handleKeyDown(event, recruit.petPrtcRcrtSn)}
            >
              {hasRole && (
                <td className="px-4 py-3 font-semibold whitespace-nowrap text-ink">
                  {roleOf(recruit, viewerMbrSn)}
                </td>
              )}
              <td
                className={`px-4 py-3 whitespace-nowrap ${statusClassOf(recruit.rcrtSttsCd)}`}
              >
                {getRcrtStatusLabel(recruit.rcrtSttsCd)}
              </td>
              <td className="max-w-[480px] truncate px-4 py-3">
                {recruit.pstTtl}
              </td>
              <td className="px-4 py-3 whitespace-nowrap">{recruit.mbrNcnm}</td>
              <td className="px-4 py-3 whitespace-nowrap tabular-nums">
                {formatCost(recruit.cstAmt, recruit.cstUnitCd)}
              </td>
              <td className="px-4 py-3 whitespace-nowrap tabular-nums">
                {toMonthDay(recruit.regDt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <ul className="min-[760px]:hidden">
        {recruits.map((recruit) => (
          <li
            key={recruit.petPrtcRcrtSn}
            className="border-b border-line last:border-b-0"
          >
            <button
              type="button"
              className="block w-full px-4 py-3 text-left hover:bg-surface-2"
              onClick={() => onSelect(recruit.petPrtcRcrtSn)}
            >
              <span className="flex items-center gap-2 text-base leading-[1.3]">
                <span
                  className={`shrink-0 ${statusClassOf(recruit.rcrtSttsCd)}`}
                >
                  {getRcrtStatusLabel(recruit.rcrtSttsCd)}
                </span>
                <span className="min-w-0 truncate text-ink-2">
                  {recruit.pstTtl}
                </span>
              </span>
              <span className="mt-1 block text-sm leading-[1.3] text-subtle tabular-nums">
                {hasRole && (
                  <span className="font-semibold text-ink">
                    {roleOf(recruit, viewerMbrSn)} ·{' '}
                  </span>
                )}
                {recruit.mbrNcnm} ·{' '}
                {formatCost(recruit.cstAmt, recruit.cstUnitCd)} · 작성{' '}
                {toMonthDay(recruit.regDt)}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
