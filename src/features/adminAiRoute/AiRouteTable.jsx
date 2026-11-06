import { MVMN_MTHD, MVMN_MTHD_LABELS, isRoutable } from './routeLabels';
import { buildOverlapMap } from './routeOverlap';
import { ADMIN_TABLE_BOX } from '@/components/adminTableStyles';

const COLUMNS = ['지시어', '화면 ID', '파라미터', '이동 방식', '제외', '사용'];

const CELL = 'px-4 py-3 align-top';

/** 행마다 보이는 겹침 줄 수 */
const OVERLAP_SHOWN = 2;

/** 지시어 칸 아래 같은 지시어 안의 순서 */
function OverlapNote({ overlaps }) {
  if (!overlaps || overlaps.length === 0) return null;
  const shown = overlaps.slice(0, OVERLAP_SHOWN);
  return (
    <ul className="mt-1 text-sm leading-[22px] text-subtle">
      {shown.map(({ keyword, count, order }) => (
        <li key={keyword} className="break-keep">
          '{keyword}' 같은 지시어 {count}건 중 {order}번째
        </li>
      ))}
      {overlaps.length > shown.length && (
        <li>외 {overlaps.length - shown.length}개</li>
      )}
    </ul>
  );
}

/** 제외 칸: 이동하는 행은 —, 아니면 그 이유 */
const EXCLUDE_LABELS = {
  [MVMN_MTHD.NOT_ROUTABLE]: '대상 아님',
  [MVMN_MTHD.EXCLUDED]: '제외',
};

/**
 * [라우팅 매핑표 표]
 * - 행 클릭·Enter -> 수정 모달, 사용 안 함 행은 흐리게
 * - 지시어가 다른 사용 중 행과 겹치면 그 지시어 안의 순서(검색과 상관없이 allRoutes 기준)
 * - 칸이 많아 좁은 폭에서는 표 안에서만 가로 스크롤
 */
export default function AiRouteTable({ routes, allRoutes, onSelect }) {
  const overlapMap = buildOverlapMap(allRoutes ?? []);
  return (
    <div className={ADMIN_TABLE_BOX}>
      <table className="w-full min-w-[888px] table-fixed text-left text-base">
        <colgroup>
          <col />
          <col className="w-[220px]" />
          <col className="w-[160px]" />
          <col className="w-[112px]" />
          <col className="w-[96px]" />
          <col className="w-[80px]" />
        </colgroup>
        <thead>
          <tr className="border-b border-line text-sm text-subtle">
            {COLUMNS.map((column) => (
              <th
                key={column}
                scope="col"
                className="px-4 py-3 font-semibold whitespace-nowrap"
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {routes.map((route) => {
            const isUsed = route.useYn === 'Y';
            return (
              <tr
                key={route.aiRoutMpngSn}
                tabIndex={0}
                className={`cursor-pointer border-b border-line last:border-b-0 hover:bg-surface-2 ${
                  isUsed ? 'text-ink-2' : 'text-subtle'
                }`}
                onClick={() => onSelect(route)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') onSelect(route);
                }}
              >
                <td className={CELL}>
                  <p className="line-clamp-2 leading-[24px] break-keep">
                    {route.instKwrdCn || '—'}
                  </p>
                  <OverlapNote overlaps={overlapMap.get(route.aiRoutMpngSn)} />
                </td>
                <td className={CELL}>
                  <p className="truncate leading-[24px]">
                    {route.scrnId || '—'}
                  </p>
                  <p className="truncate text-sm leading-[22px] text-subtle">
                    {route.trgtScrnNm}
                    {route.rprsChipYn === 'Y' && ' · 대표 칩'}
                  </p>
                </td>
                <td className={`${CELL} truncate leading-[24px]`}>
                  {route.scrnParamCn || '—'}
                </td>
                <td className={`${CELL} whitespace-nowrap`}>
                  {isRoutable(route.mvmnMthdCd)
                    ? MVMN_MTHD_LABELS[route.mvmnMthdCd]
                    : '—'}
                </td>
                <td className={`${CELL} whitespace-nowrap`}>
                  {EXCLUDE_LABELS[route.mvmnMthdCd] ?? '—'}
                </td>
                <td className={`${CELL} whitespace-nowrap`}>
                  {isUsed ? '사용' : '미사용'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
