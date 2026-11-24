import { Pencil } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { BTN_PRIMARY } from '@/components/buttonStyles';
import LoadError from '@/components/LoadError';
import PostList, { POST_LIST_GRID } from '@/features/community/PostList';
import { getBoardCode } from '@/features/community/postCodes';
import { usePostInfiniteList } from '@/features/community/queries';
import StoryRail from '@/features/community/StoryRail';
import SubPageLayout from '@/layouts/SubPageLayout';
import { PATHS } from '@/routes/paths';
import Skeleton from '@/components/Skeleton';
import { THUMB_COLS } from '@/constants/listLayout';

const PAGE_SIZE = 10;
const DESCRIPTION = '반려생활의 일상과 유용한 정보를 함께 나눠요';

/** 로딩 자리: 카드 안쪽도 실제 카드 모양(왼쪽 글 · 오른쪽 썸네일)으로 그린다. 모바일은 실제 목록처럼 썸네일 있는 카드와 없는 카드를 섞는다 */
function PostCardSkeleton({ hasThumbOnMobile }) {
  return (
    <div className="@container">
      <div
        aria-hidden="true"
        className={`grid h-[208px] ${THUMB_COLS} gap-x-8 gap-y-4 rounded-[14px] border border-line bg-white px-7 py-6 max-[760px]:h-auto max-[760px]:grid-cols-1 max-[760px]:gap-3 max-[760px]:px-4 max-[760px]:pt-4 max-[760px]:pb-5 max-[760px]:overflow-hidden`}
      >
        <div className="min-w-0 max-[760px]:order-2">
          <div className="flex gap-2">
            <Skeleton className="h-6 w-14 rounded-full" />
            <Skeleton className="h-6 w-11 rounded-full" />
          </div>
          <Skeleton className="mt-3 h-[22px] w-3/4" />
          <Skeleton className="mt-4 h-3.5 w-full" />
          <Skeleton className="mt-2 h-3.5 w-3/5" />
        </div>
        <Skeleton
          className={`col-start-2 row-span-2 row-start-1 h-[150px] self-start rounded-[10px] max-[760px]:-mx-4 max-[760px]:-mt-4 max-[760px]:rounded-none max-[760px]:border-b max-[760px]:border-line ${hasThumbOnMobile ? '' : 'max-[760px]:hidden'} max-[760px]:order-1 max-[760px]:col-start-1 max-[760px]:row-span-1 max-[760px]:row-start-auto max-[760px]:aspect-[16/9] max-[760px]:h-auto`}
        />
        <div className="flex items-center gap-2 max-[760px]:order-3">
          <Skeleton className="size-6 rounded-full" />
          <Skeleton className="h-3.5 w-20" />
          <Skeleton className="h-3.5 w-28" />
        </div>
      </div>
    </div>
  );
}

/** 로딩 자리: 왼쪽(필터 2열 + 건수 줄 + 카드 한 쪽 개수)과 오른쪽 레일(실제 목록과 같은 배치) */
function PostListSkeleton() {
  return (
    <div aria-busy="true" className={POST_LIST_GRID}>
      <div className="flex min-w-0 flex-col gap-5 max-[1100px]:col-span-full">
        <div
          aria-hidden="true"
          className="flex flex-col gap-3 rounded-card border border-line bg-white p-5"
        >
          <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
            <div className="flex gap-2">
              {Array.from({ length: 3 }, (_, index) => (
                <Skeleton key={index} className="h-9 w-16 rounded-full" />
              ))}
            </div>
            <div className="ml-auto flex items-center gap-2 max-[760px]:ml-0 max-[760px]:w-full">
              <Skeleton className="h-10 w-[104px] shrink-0" />
              <Skeleton className="h-10 w-[280px] max-[760px]:w-auto max-[760px]:flex-1" />
            </div>
          </div>
          <Skeleton className="h-9 w-28" />
        </div>
        <Skeleton aria-hidden="true" className="h-5 w-16" />
        <div className="flex flex-col gap-3 max-[760px]:gap-2">
          {Array.from({ length: PAGE_SIZE }, (_, index) => (
            <PostCardSkeleton key={index} hasThumbOnMobile={index % 2 === 0} />
          ))}
        </div>
      </div>
      <StoryRail action={writeAction} />
    </div>
  );
}

/** 오른쪽 레일 맨 위 글쓰기 버튼 */
const writeAction = (
  <Link
    to={PATHS.COMMUNITY_POST_NEW}
    className={`${BTN_PRIMARY} h-10! w-full text-base`}
  >
    <Pencil size={16} aria-hidden="true" />
    펫이야기 글쓰기
  </Link>
);

export default function PostListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const keyword = searchParams.get('q') ?? '';
  const sort = searchParams.get('sort') === 'hot' ? 'hot' : 'new';
  /** URL에는 게시판 이름, 서버에는 코드로 보낸다. 모르는 이름은 전체 */
  const boardName = searchParams.get('board') ?? '';
  const bbsCd = getBoardCode(boardName) ?? '';
  const board = bbsCd ? boardName : '';
  const mine = searchParams.get('mine') === '1';
  const {
    data: posts,
    isPending,
    isError,
    refetch,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = usePostInfiniteList({
    size: PAGE_SIZE,
    bbsCd,
    sort,
    keyword,
    mineYn: mine,
  });

  /** 기본값(최신순)과 빈 값은 URL에 남기지 않는다. 검색어는 ?q=, 내 글만 보기는 ?mine=1 */
  const setQuery = (
    { keyword: nextKeyword, mine: nextMine, ...rest },
    options,
  ) => {
    const next = { ...rest, q: nextKeyword, mine: nextMine ? '1' : '' };
    setSearchParams(
      Object.fromEntries(
        Object.entries(next).filter(([key, value]) =>
          key === 'sort' ? value === 'hot' : value,
        ),
      ),
      options,
    );
  };

  /** 탭·정렬·검색어·내 글만 보기가 바뀌면 첫 쪽부터. 필터를 바꿀 때는 검색창에 입력 중인 글자(typed)도 함께 적용 */
  const handleBoardChange = (nextBoard, typed = keyword) =>
    setQuery({ board: nextBoard, sort, keyword: typed, mine });

  const handleSortChange = (nextSort, typed = keyword) =>
    setQuery({ board, sort: nextSort, keyword: typed, mine });

  /** 입력하는 동안 자동 검색이 뒤로 가기 기록을 쌓지 않게 바꿔 끼운다 */
  const handleSearch = (nextKeyword) =>
    setQuery({ board, sort, keyword: nextKeyword, mine }, { replace: true });

  const handleMineChange = (nextMine, typed = keyword) =>
    setQuery({ board, sort, keyword: typed, mine: nextMine });

  let body;
  if (isPending) {
    body = <PostListSkeleton />;
  } else if (isError) {
    body = (
      <div className={POST_LIST_GRID}>
        <LoadError
          message="게시글을 불러오지 못했어요. 잠시 뒤 다시 시도해 주세요"
          onRetry={() => refetch()}
          className="min-w-0 py-16 max-[1100px]:col-span-full"
        />
        <StoryRail action={writeAction} />
      </div>
    );
  } else {
    body = (
      <PostList
        posts={posts}
        board={board}
        sort={sort}
        keyword={keyword}
        mine={mine}
        onBoardChange={handleBoardChange}
        onSortChange={handleSortChange}
        onMineChange={handleMineChange}
        onSearch={handleSearch}
        hasNext={Boolean(hasNextPage)}
        isFetchingNext={isFetchingNextPage}
        onLoadMore={fetchNextPage}
        onReset={() => setSearchParams({})}
        action={writeAction}
      />
    );
  }

  return (
    <SubPageLayout
      section="community"
      menu={PATHS.COMMUNITY}
      description={DESCRIPTION}
    >
      {body}
    </SubPageLayout>
  );
}
