import { BTN_SECONDARY } from '@/components/buttonStyles';
import { MSN_POOL_LABELS } from './careMissionLabels';

const COLUMNS = ['풀', '미션명', '보상', '달성 기준', '이동 경로', '사용', ''];

const CELL = 'px-4 py-3 max-[760px]:px-2';

/**
 * [케어미션 목록 표]
 * - [수정] -> onEdit(미션)
 * - 좁은 폭에서는 표 상자 안에서만 가로로 밀린다
 */
export default function CareMissionTable({ missions, onEdit }) {
  return (
    <div className="relative overflow-x-auto rounded-[14px] border border-line bg-white">
      <table className="w-full min-w-[720px] table-fixed text-left text-base max-[760px]:text-sm">
        <colgroup>
          <col className="w-[104px]" />
          <col />
          <col className="w-[88px]" />
          <col className="w-[96px]" />
          <col className="w-[176px]" />
          <col className="w-[72px]" />
          <col className="w-[96px]" />
        </colgroup>
        <thead>
          <tr className="border-b border-line text-sm text-subtle">
            {COLUMNS.map((column, index) => (
              <th
                key={column || index}
                scope="col"
                className="px-4 py-3 font-semibold whitespace-nowrap max-[760px]:px-2"
              >
                {column || <span className="sr-only">수정</span>}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {missions.map((mission) => {
            const isUsed = mission.useYn === 'Y';
            return (
              <tr
                key={mission.careMsnSn}
                className="border-b border-line text-ink-2 last:border-b-0"
              >
                <td className={`${CELL} whitespace-nowrap`}>
                  {MSN_POOL_LABELS[mission.msnPoolCd] ?? mission.msnPoolCd}
                </td>
                <td className={`${CELL} truncate`}>{mission.msnNm}</td>
                <td className={`${CELL} whitespace-nowrap tabular-nums`}>
                  {mission.cmpnPnt.toLocaleString()}P
                </td>
                <td className={`${CELL} whitespace-nowrap tabular-nums`}>
                  {mission.achvCrtrNmtm}회
                </td>
                <td className={`${CELL} truncate text-sm text-subtle`}>
                  {mission.mvmnPath}
                </td>
                <td
                  className={`${CELL} whitespace-nowrap ${
                    isUsed ? '' : 'text-subtle'
                  }`}
                >
                  {isUsed ? '사용' : '미사용'}
                </td>
                <td className={`${CELL} text-right`}>
                  <button
                    type="button"
                    aria-label={`${mission.msnNm} 수정`}
                    className={BTN_SECONDARY}
                    onClick={() => onEdit(mission)}
                  >
                    수정
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
