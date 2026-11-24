/**
 * [무한 스크롤 목록 공통]
 * - 서버 목록은 { content, totalPages, totalElements }를 쪽(1부터) 단위로 준다
 * - useInfiniteQuery 옵션: initialPageParam 1, getNextPageParam 하나로 쓰고, select로 한 목록(content)으로 합친다
 */
export const INFINITE_OPTIONS = {
  initialPageParam: 1,
  /** 지금까지 받은 쪽 수가 전체 쪽 수보다 적으면 다음 쪽 */
  getNextPageParam: (lastPage, allPages) =>
    allPages.length < lastPage.totalPages ? allPages.length + 1 : undefined,
  /** 받은 쪽들을 한 목록으로. totalElements는 첫 쪽(가장 새로 고친 값은 첫 쪽부터 다시 받는다) 기준 */
  select: (data) => ({
    content: data.pages.flatMap((page) => page.content),
    totalElements: data.pages[0].totalElements,
  }),
};
