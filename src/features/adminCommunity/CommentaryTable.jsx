import Toggle from '@/components/Toggle';
import { formatDate } from '@/utils/formatDate';

const COLUMNS = ['일자', 'AI 코멘트', '사용'];
const CELL = 'px-4 py-3 max-[760px]:px-2';

/**
 * [AI 코멘트 표]
 * - commentaries: [{ cmntyAiCmtrySn, cmtryCrtrYmd, cmtryCn, useYn }]
 * - 사용 스위치 -> onToggle(commentary, next), pendingSn: 전환 중인 행
 */
export default function CommentaryTable({ commentaries, pendingSn, onToggle }) {
  return (
    <div className="overflow-x-auto rounded-[14px] border border-line bg-white">
      <table className="w-full table-fixed text-left text-base max-[760px]:text-sm">
        <colgroup>
          <col className="w-[128px] max-[760px]:w-[88px]" />
          <col />
          <col className="w-[96px] max-[760px]:w-[64px]" />
        </colgroup>
        <thead>
          <tr className="border-b border-line text-sm text-subtle">
            {COLUMNS.map((column) => (
              <th
                key={column}
                scope="col"
                className="px-4 py-3 font-semibold whitespace-nowrap max-[760px]:px-2"
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {commentaries.map((commentary) => (
            <tr
              key={commentary.cmntyAiCmtrySn}
              className="border-b border-line align-top text-ink-2 last:border-b-0"
            >
              <td className={`${CELL} whitespace-nowrap`}>
                {formatDate(commentary.cmtryCrtrYmd, { separator: '-' })}
              </td>
              <td
                className={`${CELL} break-keep ${commentary.useYn ? '' : 'text-subtle'}`}
              >
                {commentary.cmtryCn}
              </td>
              <td className={CELL}>
                <Toggle
                  checked={commentary.useYn}
                  label={`${formatDate(commentary.cmtryCrtrYmd, { separator: '-' })} AI 코멘트 사용`}
                  disabled={pendingSn === commentary.cmntyAiCmtrySn}
                  onChange={(next) => onToggle(commentary, next)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
