import BoardPagination from '@/components/BoardPagination';
import { BTN_SECONDARY } from '@/components/buttonStyles';
import SkeletonCard from '@/components/SkeletonCard';

/**
 * [회원 상세 탭 표]
 * - 조회 결과에 따라 스켈레톤·오류·빈 문구·표 표시
 * - onPageChange를 넘기면 쪽 번호 표시
 * - 좁은 폭에서는 표 안에서만 가로 스크롤
 */
export default function MemberTabTable({
  query,
  columns,
  emptyText,
  errorText,
  getRowKey,
  renderCells,
  page,
  onPageChange,
}) {
  if (query.isPending) return <SkeletonCard className="h-[150px]" />;
  if (query.isError) {
    return (
      <div role="alert" className="flex flex-col items-center gap-3 py-16">
        <p className="text-base text-subtle">{errorText}</p>
        <button
          type="button"
          className={BTN_SECONDARY}
          onClick={() => query.refetch()}
        >
          다시 시도
        </button>
      </div>
    );
  }

  const rows = query.data.content ?? query.data;
  if (rows.length === 0) {
    return (
      <p className="rounded-[14px] border border-line bg-white py-16 text-center text-base text-subtle">
        {emptyText}
      </p>
    );
  }

  return (
    <>
      <div className="overflow-x-auto rounded-[14px] border border-line bg-white">
        <table className="w-full min-w-[720px] text-left text-base">
          <thead>
            <tr className="border-b border-line text-sm text-subtle">
              {columns.map((column) => (
                <th
                  key={column}
                  scope="col"
                  className="px-4 py-3 font-semibold"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr
                key={getRowKey(row, index)}
                className="border-b border-line text-ink-2 last:border-b-0"
              >
                {renderCells(row).map((cell, cellIndex) => (
                  <td key={columns[cellIndex]} className="px-4 py-3">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {onPageChange && (
        <div className="mt-3">
          <BoardPagination
            page={page}
            totalPages={query.data.totalPages}
            onChange={onPageChange}
          />
        </div>
      )}
    </>
  );
}
