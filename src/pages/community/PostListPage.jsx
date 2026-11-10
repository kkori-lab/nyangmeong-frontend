import { useSearchParams } from 'react-router-dom';
import PostList from '@/features/community/PostList';
import { getBoardCode } from '@/features/community/postCodes';
import { usePostList } from '@/features/community/queries';
import StoryRail from '@/features/community/StoryRail';
import SubPageLayout from '@/layouts/SubPageLayout';
import { PATHS } from '@/routes/paths';
import PageSkeleton from '@/components/PageSkeleton';
import Skeleton from '@/components/Skeleton';

const PAGE_SIZE = 10;
const DESCRIPTION = '반려생활의 일상과 유용한 정보를 함께 나눠요';

/** 로딩 자리: 카드 안쪽도 실제 카드 모양(왼쪽 글 · 오른쪽 썸네일)으로 그린다. 모바일은 실제 목록처럼 썸네일 있는 카드와 없는 카드를 섞는다 */
function PostCardSkeleton({ hasThumbOnMobile }) {
  return (
    <div
      aria-hidden="true"
      className="grid h-[208px] grid-cols-[minmax(0,1fr)_200px] gap-x-8 gap-y-3.5 rounded-[14px] border border-[#e2e7e7] bg-white px-7 py-6 max-[760px]:h-auto max-[760px]:grid-cols-1 max-[760px]:gap-3 max-[760px]:px-4 max-[760px]:pt-4 max-[760px]:pb-[18px]"
    >
      <div className="min-w-0 max-[760px]:order-2">
        <div className="flex gap-2">
          <Skeleton className="h-[22px] w-14 rounded-full" />
          <Skeleton className="h-[22px] w-11 rounded-full" />
        </div>
        <Skeleton className="mt-3 h-[22px] w-3/4" />
        <Skeleton className="mt-3.5 h-3.5 w-full" />
        <Skeleton className="mt-2 h-3.5 w-3/5" />
      </div>
      <Skeleton
        className={`col-start-2 row-span-2 row-start-1 min-h-[124px] self-stretch rounded-[10px] ${hasThumbOnMobile ? '' : 'max-[760px]:hidden'} max-[760px]:order-1 max-[760px]:col-start-1 max-[760px]:row-span-1 max-[760px]:row-start-auto max-[760px]:aspect-[16/9] max-[760px]:min-h-0`}
      />
      <div className="flex items-center gap-2 max-[760px]:order-3">
        <Skeleton className="size-6 rounded-full" />
        <Skeleton className="h-3.5 w-20" />
        <Skeleton className="h-3.5 w-28" />
      </div>
    </div>
  );
}

/** 로딩 자리: 탭·정렬·검색 줄 + 카드 한 쪽 개수 + 글쓰기·쪽 번호(실제 목록과 같은 배치) */
function PostListSkeleton() {
  return (
    <PageSkeleton>
      <div
        aria-hidden="true"
        className="flex flex-wrap items-end justify-between gap-3 border-b border-[#d3dae2] px-4 pt-6 pb-3 max-[760px]:flex-col max-[760px]:items-stretch"
      >
        <div className="flex gap-8 pb-1">
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton key={index} className="h-5 w-20" />
          ))}
        </div>
        <div className="flex items-center gap-3 max-[760px]:flex-col max-[760px]:items-stretch">
          <Skeleton className="h-9 w-24 max-[760px]:w-full" />
          <Skeleton className="h-10 w-[300px] max-[760px]:w-full" />
        </div>
      </div>
      <div className="flex flex-col gap-3 max-[760px]:gap-2.5">
        {Array.from({ length: PAGE_SIZE }, (_, index) => (
          <PostCardSkeleton key={index} hasThumbOnMobile={index % 2 === 0} />
        ))}
      </div>
      <div aria-hidden="true" className="mt-7 flex flex-col gap-4">
        <Skeleton className="ml-auto h-10 w-24" />
        <Skeleton className="mx-auto h-9 w-64" />
      </div>
    </PageSkeleton>
  );
}

export default function PostListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get('page')) || 1;
  const keyword = searchParams.get('q') ?? '';
  const sort = searchParams.get('sort') === 'hot' ? 'hot' : 'new';
  /** URL에는 게시판 이름, 서버에는 코드로 보낸다. 모르는 이름은 전체 */
  const boardName = searchParams.get('board') ?? '';
  const bbsCd = getBoardCode(boardName) ?? '';
  const board = bbsCd ? boardName : '';
  const {
    data: posts,
    isPending,
    isError,
  } = usePostList({ page, size: PAGE_SIZE, bbsCd, sort, keyword });

  /** 기본값(최신순)과 빈 값은 URL에 남기지 않는다. 검색어는 ?q= */
  const setQuery = ({ keyword: nextKeyword, ...rest }) => {
    const next = { ...rest, q: nextKeyword };
    setSearchParams(
      Object.fromEntries(
        Object.entries(next).filter(([key, value]) =>
          key === 'sort' ? value === 'hot' : value,
        ),
      ),
    );
  };

  /** 탭·정렬·검색어가 바뀌면 첫 쪽부터 */
  const handleBoardChange = (nextBoard) =>
    setQuery({ board: nextBoard, sort, keyword });

  const handleSortChange = (nextSort) =>
    setQuery({ board, sort: nextSort, keyword });

  const handleSearch = (nextKeyword) =>
    setQuery({ board, sort, keyword: nextKeyword });

  const handlePageChange = (nextPage) =>
    setQuery({ board, sort, keyword, page: nextPage > 1 ? nextPage : '' });

  let body;
  if (isPending) {
    body = <PostListSkeleton />;
  } else if (isError) {
    body = (
      <p role="alert" className="text-[#566465]">
        게시글을 불러오지 못했어요. 잠시 뒤 다시 시도해 주세요
      </p>
    );
  } else {
    body = (
      <PostList
        key={keyword}
        posts={posts}
        board={board}
        sort={sort}
        keyword={keyword}
        onBoardChange={handleBoardChange}
        onSortChange={handleSortChange}
        onSearch={handleSearch}
        onPageChange={handlePageChange}
        onReset={() => setSearchParams({})}
      />
    );
  }

  return (
    <SubPageLayout
      section="community"
      menu={PATHS.COMMUNITY}
      description={DESCRIPTION}
      contentClassName="min-[1101px]:pt-0"
    >
      <div className="grid grid-cols-[minmax(0,1fr)_300px] items-start gap-8 max-[1100px]:grid-cols-2 max-[1100px]:gap-x-5 max-[1100px]:gap-y-0 max-[760px]:grid-cols-1">
        <div className="min-w-0 max-[1100px]:col-span-full">{body}</div>
        <StoryRail />
      </div>
    </SubPageLayout>
  );
}
