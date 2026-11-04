import { BTN_SECONDARY } from '@/components/buttonStyles';
import { codeLabel } from './keywordLabels';

const CELL = 'px-4 py-3 align-top';

/**
 * [키워드 사전 표]
 * - 결과가 코드인 탭은 연결 코드("HLTC0057 병원"), 아니면 해석 결과 칸
 * - [수정] -> 수정 모달(삭제도 거기서)
 * - 좁은 폭에서는 표 안에서만 가로 스크롤
 */
export default function AiKeywordTable({ tab, keywords, onEdit }) {
  const hasCode = tab.codes != null;
  const columns = ['항목', '키워드', hasCode ? '연결 코드' : '해석 결과', ''];

  return (
    <div className="relative overflow-x-auto rounded-[14px] border border-line bg-white">
      <table className="w-full min-w-[760px] table-fixed text-left text-base">
        <colgroup>
          <col className="w-[160px]" />
          <col />
          <col className="w-[240px]" />
          <col className="w-[96px]" />
        </colgroup>
        <thead>
          <tr className="border-b border-line text-sm text-subtle">
            {columns.map((column, index) => (
              <th
                key={index}
                scope="col"
                aria-label={column || '수정'}
                className="px-4 py-3 font-semibold whitespace-nowrap"
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {keywords.map((keyword) => (
            <tr
              key={keyword.kwrdDictSn}
              className="border-b border-line text-ink-2 last:border-b-0"
            >
              <td className={`${CELL} leading-[24px] break-keep`}>
                {keyword.artclNm}
              </td>
              <td className={`${CELL} leading-[24px] break-keep`}>
                {keyword.kwrdCn}
              </td>
              <td className={`${CELL} leading-[24px] break-keep`}>
                {hasCode ? (
                  <>
                    <span className="tabular-nums">{keyword.mpngCd}</span>{' '}
                    {codeLabel(tab, keyword.mpngCd) ?? ''}
                  </>
                ) : (
                  keyword.intrpRsltCn || '—'
                )}
              </td>
              <td className={`${CELL} text-right`}>
                <button
                  type="button"
                  className={BTN_SECONDARY}
                  aria-label={`${keyword.artclNm} 수정`}
                  onClick={() => onEdit(keyword)}
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
