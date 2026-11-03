import { BTN_SECONDARY } from '@/components/buttonStyles';

const COLUMNS = ['이름', '정렬', '사용', ''];

const CELL = 'px-4 py-2 max-[760px]:px-2';

/**
 * [품종 목록 표]
 * - 이름·정렬·사용, 행 끝 [수정] -> onEdit(품종)
 * - 사용 안 함 품종은 흐린 글자
 */
export default function BreedTable({ breeds, onEdit }) {
  return (
    <div className="overflow-x-auto rounded-[14px] border border-line bg-white">
      <table className="w-full table-fixed text-left text-base max-[760px]:text-sm">
        <colgroup>
          <col />
          <col className="w-[96px] max-[760px]:w-[56px]" />
          <col className="w-[104px] max-[760px]:w-[64px]" />
          <col className="w-[96px] max-[760px]:w-[76px]" />
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
          {breeds.map((breed) => (
            <tr
              key={breed.vrtySn}
              className={`border-b border-line last:border-b-0 ${
                breed.useYn ? 'text-ink-2' : 'text-subtle'
              }`}
            >
              <td className={`${CELL} truncate`}>{breed.vrtyNm}</td>
              <td className={`${CELL} tabular-nums`}>{breed.sortSeq}</td>
              <td className={`${CELL} whitespace-nowrap`}>
                {breed.useYn ? '사용' : '안 함'}
              </td>
              <td className={`${CELL} text-right`}>
                <button
                  type="button"
                  aria-label={`${breed.vrtyNm} 수정`}
                  className={`${BTN_SECONDARY} h-8 px-3 text-sm`}
                  onClick={() => onEdit(breed)}
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
