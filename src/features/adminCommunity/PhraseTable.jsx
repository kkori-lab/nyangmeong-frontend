import Toggle from '@/components/Toggle';
import { ADMIN_TABLE_BOX } from '@/components/adminTableStyles';

const COLUMNS = ['문구', '사용', ''];
const CELL = 'px-4 py-3 max-[760px]:px-2';
/** 행 안 작은 버튼: BTN_SECONDARY와 같은 색, 높이·여백만 작게 */
const ROW_BUTTON =
  'inline-flex h-9 items-center justify-center rounded-md border border-line bg-white px-3 text-sm font-semibold whitespace-nowrap hover:border-line-strong hover:bg-surface-2 max-[760px]:h-8 max-[760px]:px-2';

/**
 * [오늘의 한마디 후보 문구 표]
 * - phrases: [{ todayPhrsSn, phrsCn, useYn }]
 * - 사용 스위치 -> onToggle(phrase, next), [수정] -> onEdit(phrase)
 * - pendingSn: 사용 전환 중인 행
 */
export default function PhraseTable({ phrases, pendingSn, onToggle, onEdit }) {
  return (
    <div className={ADMIN_TABLE_BOX}>
      <table className="w-full table-fixed text-left text-base max-[760px]:text-sm">
        <colgroup>
          <col />
          <col className="w-[96px] max-[760px]:w-[64px]" />
          <col className="w-[96px] max-[760px]:w-[60px]" />
        </colgroup>
        <thead>
          <tr className="border-b border-line text-sm text-subtle">
            {COLUMNS.map((column, index) => (
              <th
                key={column || index}
                scope="col"
                className="px-4 py-3 font-semibold whitespace-nowrap max-[760px]:px-2"
              >
                {column || <span className="sr-only">관리</span>}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {phrases.map((phrase) => (
            <tr
              key={phrase.todayPhrsSn}
              className="border-b border-line text-ink-2 last:border-b-0"
            >
              <td
                className={`${CELL} break-keep ${phrase.useYn ? '' : 'text-subtle'}`}
              >
                {phrase.phrsCn}
              </td>
              <td className={CELL}>
                <Toggle
                  checked={phrase.useYn}
                  label={`${phrase.phrsCn} 사용`}
                  disabled={pendingSn === phrase.todayPhrsSn}
                  onChange={(next) => onToggle(phrase, next)}
                />
              </td>
              <td className={`${CELL} text-right`}>
                <button
                  type="button"
                  aria-label={`${phrase.phrsCn} 수정`}
                  className={ROW_BUTTON}
                  onClick={() => onEdit(phrase)}
                >
                  수정
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
