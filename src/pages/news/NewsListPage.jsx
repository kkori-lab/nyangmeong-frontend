import { useSearchParams } from 'react-router-dom';
import NewsList from '@/features/news/NewsList';
import { getCategoryCode } from '@/features/news/newsCodes';
import { useNewsList } from '@/features/news/queries';
import SubPageLayout from '@/layouts/SubPageLayout';
import { PATHS } from '@/routes/paths';
import PageSkeleton from '@/components/PageSkeleton';
import Skeleton from '@/components/Skeleton';

const PAGE_SIZE = 10;
const DESCRIPTION = '반려생활에 도움이 되는 소식을 언론사에서 모아 전해 드려요';

/** 로딩 자리: 카드 안쪽도 실제 카드 모양(왼쪽 글 · 오른쪽 썸네일)으로 그린다 */
function NewsCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="grid h-[208px] grid-cols-[minmax(0,1fr)_200px] gap-x-8 gap-y-3.5 rounded-[14px] border border-[#e2e7e7] bg-white px-7 py-6 max-[760px]:h-auto max-[760px]:grid-cols-1 max-[760px]:gap-3 max-[760px]:px-4 max-[760px]:pt-4 max-[760px]:pb-[18px]"
    >
      <div className="min-w-0 max-[760px]:order-2">
        <Skeleton className="h-[22px] w-14 rounded-full" />
        <Skeleton className="mt-3 h-[22px] w-3/4" />
        <Skeleton className="mt-3.5 h-3.5 w-full" />
        <Skeleton className="mt-2 h-3.5 w-3/5" />
      </div>
      <Skeleton className="col-start-2 row-span-2 row-start-1 h-[150px] w-full self-start rounded-[10px] max-[760px]:order-1 max-[760px]:col-start-1 max-[760px]:row-span-1 max-[760px]:row-start-auto max-[760px]:aspect-[16/9] max-[760px]:h-auto" />
      <div className="flex items-center gap-2 max-[760px]:order-3">
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-3.5 w-16" />
        <Skeleton className="h-3.5 w-24" />
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
        className="flex flex-wrap items-end justify-between gap-3 border-b border-[#d3dae2] px-4 pt-6 pb-3 max-[760px]:flex-col max-[760px]:items-stretch"
      >
        <div className="flex max-w-full gap-8 overflow-hidden pb-1 max-[760px]:gap-3">
          {Array.from({ length: 5 }, (_, index) => (
            <Skeleton key={index} className="h-5 w-14 max-[760px]:w-11" />
          ))}
        </div>
        <Skeleton className="h-10 w-[300px] max-[760px]:w-full" />
      </div>
      <div className="flex flex-col gap-3 max-[760px]:gap-2.5">
        {Array.from({ length: PAGE_SIZE }, (_, index) => (
          <NewsCardSkeleton key={index} />
        ))}
      </div>
      <Skeleton className="mx-auto mt-7 h-9 w-64" />
    </PageSkeleton>
  );
}

export default function NewsListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get('page')) || 1;
  const keyword = searchParams.get('keyword') ?? '';
  /** URL에는 카테고리 이름, 서버에는 코드로 보낸다. 모르는 이름은 전체 */
  const categoryName = searchParams.get('category') ?? '';
  const newsClsfCd = getCategoryCode(categoryName) ?? '';
  const category = newsClsfCd ? categoryName : '';
  const {
    data: news,
    isPending,
    isError,
  } = useNewsList({ page, size: PAGE_SIZE, newsClsfCd, keyword });

  const setQuery = (next) =>
    setSearchParams(
      Object.fromEntries(Object.entries(next).filter(([, value]) => value)),
    );

  /** 칩·검색어가 바뀌면 첫 쪽부터 */
  const handleCategoryChange = (nextCategory) =>
    setQuery({ category: nextCategory, keyword });

  const handleSearch = (nextKeyword) =>
    setQuery({ category, keyword: nextKeyword });

  const handlePageChange = (nextPage) =>
    setQuery({ category, keyword, page: nextPage > 1 ? nextPage : '' });

  let body;
  if (isPending) {
    body = <NewsListSkeleton />;
  } else if (isError) {
    body = (
      <p role="alert" className="text-[#566465]">
        뉴스를 불러오지 못했어요. 잠시 뒤 다시 시도해 주세요
      </p>
    );
  } else {
    body = (
      <NewsList
        key={keyword}
        news={news}
        category={category}
        keyword={keyword}
        onCategoryChange={handleCategoryChange}
        onSearch={handleSearch}
        onPageChange={handlePageChange}
        onReset={() => setSearchParams({})}
      />
    );
  }

  return (
    <SubPageLayout
      section="community"
      menu={PATHS.COMMUNITY_NEWS}
      description={DESCRIPTION}
      contentClassName="min-[1101px]:pt-0"
    >
      {body}
    </SubPageLayout>
  );
}
