const COLUMNS = ['카테고리', '질문', '정렬', '사용'];

/**
 * [FAQ 목록 표]
 * - 행 클릭·Enter -> 수정 모달
 * - 좁은 폭에서는 질문만 줄여 표 폭을 화면에 맞춘다
 */
export default function FaqTable({ faqs, onSelect }) {
  return (
    <div className="overflow-x-auto rounded-[14px] border border-line bg-white">
      <table className="w-full table-fixed text-left text-base">
        <colgroup>
          <col className="w-[140px] max-[760px]:w-[88px]" />
          <col />
          <col className="w-[80px] max-[760px]:w-[52px]" />
          <col className="w-[96px] max-[760px]:w-[68px]" />
        </colgroup>
        <thead>
          <tr className="border-b border-line text-sm text-subtle">
            {COLUMNS.map((column) => (
              <th
                key={column}
                scope="col"
                className="px-4 py-3 font-semibold max-[760px]:px-2.5"
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {faqs.map((faq) => (
            <tr
              key={faq.faqSn}
              tabIndex={0}
              className="cursor-pointer border-b border-line text-ink-2 last:border-b-0 hover:bg-surface-2"
              onClick={() => onSelect(faq.faqSn)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') onSelect(faq.faqSn);
              }}
            >
              <td className="truncate px-4 py-3 max-[760px]:px-2.5">
                {faq.faqClsfCdNm}
              </td>
              <td className="truncate px-4 py-3 max-[760px]:px-2.5">
                {faq.qstnTtl}
              </td>
              <td className="px-4 py-3 tabular-nums max-[760px]:px-2.5">
                {faq.sortSeq}
              </td>
              <td
                className={`px-4 py-3 whitespace-nowrap max-[760px]:px-2.5 ${
                  faq.useYn ? '' : 'text-subtle'
                }`}
              >
                {faq.useYn ? '사용' : '비노출'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
