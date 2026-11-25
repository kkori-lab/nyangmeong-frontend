import BoardPagination from './BoardPagination';
import LoadMore from './LoadMore';

/**
 * 목록 아래 이어 보기: 모바일(760px 미만)은 무한 스크롤, 그 밖(태블릿·데스크탑)은 쪽 번호
 * - 모바일: hasNext·isFetchingNext·onLoadMore (LoadMore)
 * - 그 밖: page(1부터)·totalPages·onPageChange (BoardPagination)
 */
export default function ListPager({
  isMobile,
  hasNext,
  isFetchingNext,
  onLoadMore,
  page,
  totalPages,
  onPageChange,
}) {
  if (isMobile) {
    return (
      <LoadMore
        hasNext={hasNext}
        isFetching={isFetchingNext}
        onLoad={onLoadMore}
      />
    );
  }
  return (
    <div className="mt-7">
      <BoardPagination
        page={page}
        totalPages={totalPages ?? 0}
        onChange={onPageChange}
      />
    </div>
  );
}
