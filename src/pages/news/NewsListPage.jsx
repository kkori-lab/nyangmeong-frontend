import { useSearchParams } from 'react-router-dom';
import NewsList from '@/features/news/NewsList';
import { getCategoryCode } from '@/features/news/newsCodes';
import { useNewsInfiniteList, useNewsList } from '@/features/news/queries';
import useMediaQuery from '@/hooks/useMediaQuery';
import SubPageLayout from '@/layouts/SubPageLayout';
import { PATHS } from '@/routes/paths';
import LoadError from '@/components/LoadError';
import PageSkeleton from '@/components/PageSkeleton';
import Skeleton from '@/components/Skeleton';
import { THUMB_COLS } from '@/constants/listLayout';

const PAGE_SIZE = 10;
const DESCRIPTION = '반려생활에 도움이 되는 소식을 언론사에서 모아 전해 드려요';

/** 로딩 자리: 카드 안쪽도 실제 카드 모양(왼쪽 글 · 오른쪽 썸네일)으로 그린다 */
function NewsCardSkeleton() {
  return (
    <div className="@container">
      <div
        aria-hidden="true"
        className={`grid h-[208px] ${THUMB_COLS} gap-x-8 gap-y-4 rounded-[14px] border border-line bg-white px-7 py-6 max-[760px]:h-auto max-[760px]:grid-cols-1 max-[760px]:gap-3 max-[760px]:px-4 max-[760px]:pt-4 max-[760px]:pb-5 max-[760px]:overflow-hidden`}
      >
        <div className="min-w-0 max-[760px]:order-2">
          <Skeleton className="h-[22px] w-14 rounded-full" />
          <Skeleton className="mt-3 h-[22px] w-3/4" />
          <Skeleton className="mt-4 h-3.5 w-full" />
          <Skeleton className="mt-2 h-3.5 w-3/5" />
        </div>
        <Skeleton className="col-start-2 row-span-2 row-start-1 h-[150px] w-full self-start rounded-[10px] max-[760px]:w-auto max-[760px]:-mx-4 max-[760px]:-mt-4 max-[760px]:rounded-none max-[760px]:border-b max-[760px]:border-line max-[760px]:order-1 max-[760px]:col-start-1 max-[760px]:row-span-1 max-[760px]:row-start-auto max-[760px]:aspect-[16/9] max-[760px]:h-auto" />
        <div className="flex items-center gap-2 max-[760px]:order-3">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-3.5 w-16" />
          <Skeleton className="h-3.5 w-24" />
        </div>
      </div>
    </div>
  );
}

/** 로딩 자리: 탭·검색 줄 + 카드 한 쪽 개수 + 쪽 번호(실제 목록과 같은 배치) */
function NewsListSkeleton() {
  return (
    <PageSkeleton>
      <div
        aria-hidden="true"
        className="flex flex-wrap items-center justify-between gap-3 max-[760px]:flex-col max-[760px]:items-stretch"
      >
        <div className="flex max-w-full gap-2 overflow-hidden">
          {Array.from({ length: 5 }, (_, index) => (
            <Skeleton key={index} className="h-9 w-16 rounded-full" />
          ))}
        </div>
        <Skeleton className="h-10 w-[300px] max-[760px]:w-full" />
      </div>
      <div className="flex flex-col gap-3 max-[760px]:gap-3">
        {Array.from({ length: PAGE_SIZE }, (_, index) => (
          <NewsCardSkeleton key={index} />
        ))}
      </div>
      {/* 760px 이상은 쪽 번호가 있다(모바일은 무한 스크롤이라 없음) */}
      <div aria-hidden="true" className="mt-2 hidden min-[760px]:block">
        <Skeleton className="mx-auto h-9 w-64" />
      </div>
    </PageSkeleton>
  );
}

export default function NewsListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const keyword = searchParams.get('keyword') ?? '';
  /** URL에는 카테고리 이름, 서버에는 코드로 보낸다. 모르는 이름은 전체 */
  const categoryName = searchParams.get('category') ?? '';
  const newsClsfCd = getCategoryCode(categoryName) ?? '';
  const category = newsClsfCd ? categoryName : '';
  /** 760px 미만(모바일)은 무한 스크롤, 그 밖은 ?page= 쪽 번호. 쓰는 쪽만 요청한다 */
  const isMobile = useMediaQuery('(width < 760px)');
  const page = Number(searchParams.get('page')) || 1;
  const listParams = { size: PAGE_SIZE, newsClsfCd, keyword };
  const infinite = useNewsInfiniteList(listParams, { enabled: isMobile });
  const paged = useNewsList({ ...listParams, page }, { enabled: !isMobile });
  const {
    data: news,
    isPending,
    isError,
    refetch,
  } = isMobile ? infinite : paged;

  const setQuery = (next, options) =>
    setSearchParams(
      Object.fromEntries(Object.entries(next).filter(([, value]) => value)),
      options,
    );

  /** 칩·검색어가 바뀌면 첫 쪽부터 */
  const handleCategoryChange = (nextCategory, typed = keyword) =>
    setQuery({ category: nextCategory, keyword: typed });

  const handlePageChange = (nextPage) =>
    setQuery({
      category,
      keyword,
      page: nextPage > 1 ? nextPage : '',
    });

  /** 입력하는 동안 자동 검색이 뒤로 가기 기록을 쌓지 않게 바꿔 끼운다 */
  const handleSearch = (nextKeyword) =>
    setQuery({ category, keyword: nextKeyword }, { replace: true });

  let body;
  if (isPending) {
    body = <NewsListSkeleton />;
  } else if (isError) {
    body = (
      <LoadError
        message="뉴스를 불러오지 못했어요. 잠시 뒤 다시 시도해 주세요"
        onRetry={refetch}
      />
    );
  } else {
    body = (
      <NewsList
        news={news}
        category={category}
        keyword={keyword}
        onCategoryChange={handleCategoryChange}
        onSearch={handleSearch}
        isMobile={isMobile}
        page={page}
        onPageChange={handlePageChange}
        hasNext={Boolean(infinite.hasNextPage)}
        isFetchingNext={infinite.isFetchingNextPage}
        onLoadMore={infinite.fetchNextPage}
        onReset={() => setSearchParams({})}
      />
    );
  }

  return (
    <SubPageLayout
      section="community"
      menu={PATHS.COMMUNITY_NEWS}
      description={DESCRIPTION}
    >
      {body}
    </SubPageLayout>
  );
}
