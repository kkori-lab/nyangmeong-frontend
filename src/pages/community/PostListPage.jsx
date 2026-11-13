import { Pencil } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { BTN_PRIMARY } from '@/components/buttonStyles';
import PostList, { POST_LIST_GRID } from '@/features/community/PostList';
import { getBoardCode } from '@/features/community/postCodes';
import { usePostList } from '@/features/community/queries';
import StoryRail from '@/features/community/StoryRail';
import SubPageLayout from '@/layouts/SubPageLayout';
import { PATHS } from '@/routes/paths';
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

/** 로딩 자리: 왼쪽(필터 2열 + 건수 줄 + 카드 한 쪽 개수 + 쪽 번호)과 오른쪽 레일(실제 목록과 같은 배치) */
function PostListSkeleton() {
  return (
    <div aria-busy="true" className={POST_LIST_GRID}>
      <div className="flex min-w-0 flex-col gap-5 max-[1100px]:col-span-full">
        <div aria-hidden="true" className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
            <div className="flex gap-1.5">
              {Array.from({ length: 3 }, (_, index) => (
                <Skeleton key={index} className="h-[34px] w-16 rounded-full" />
              ))}
            </div>
            <div className="ml-auto flex items-center gap-2 max-[760px]:ml-0 max-[760px]:w-full">
              <Skeleton className="h-[34px] w-[104px] shrink-0" />
              <Skeleton className="h-[34px] w-[280px] max-[760px]:w-auto max-[760px]:flex-1" />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <Skeleton className="h-9 w-28" />
            <Skeleton className="h-5 w-14" />
          </div>
        </div>
        <div className="flex flex-col gap-3 max-[760px]:gap-2.5">
          {Array.from({ length: PAGE_SIZE }, (_, index) => (
            <PostCardSkeleton key={index} hasThumbOnMobile={index % 2 === 0} />
          ))}
        </div>
        <div aria-hidden="true" className="mt-5">
          <Skeleton className="mx-auto h-9 w-64" />
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
  const page = Number(searchParams.get('page')) || 1;
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
  } = usePostList({
    page,
    size: PAGE_SIZE,
    bbsCd,
    sort,
    keyword,
    mineYn: mine,
  });

  /** 기본값(최신순)과 빈 값은 URL에 남기지 않는다. 검색어는 ?q=, 내 글만 보기는 ?mine=1 */
  const setQuery = ({ keyword: nextKeyword, mine: nextMine, ...rest }) => {
    const next = { ...rest, q: nextKeyword, mine: nextMine ? '1' : '' };
    setSearchParams(
      Object.fromEntries(
        Object.entries(next).filter(([key, value]) =>
          key === 'sort' ? value === 'hot' : value,
        ),
      ),
    );
  };

  /** 탭·정렬·검색어·내 글만 보기가 바뀌면 첫 쪽부터 */
  const handleBoardChange = (nextBoard) =>
    setQuery({ board: nextBoard, sort, keyword, mine });

  const handleSortChange = (nextSort) =>
    setQuery({ board, sort: nextSort, keyword, mine });

  const handleSearch = (nextKeyword) =>
    setQuery({ board, sort, keyword: nextKeyword, mine });

  const handleMineChange = (nextMine) =>
    setQuery({ board, sort, keyword, mine: nextMine });

  const handlePageChange = (nextPage) =>
    setQuery({
      board,
      sort,
      keyword,
      mine,
      page: nextPage > 1 ? nextPage : '',
    });

  let body;
  if (isPending) {
    body = <PostListSkeleton />;
  } else if (isError) {
    body = (
      <div className={POST_LIST_GRID}>
        <p
          role="alert"
          className="min-w-0 text-[#566465] max-[1100px]:col-span-full"
        >
          게시글을 불러오지 못했어요. 잠시 뒤 다시 시도해 주세요
        </p>
        <StoryRail action={writeAction} />
      </div>
    );
  } else {
    body = (
      <PostList
        key={keyword}
        posts={posts}
        board={board}
        sort={sort}
        keyword={keyword}
        mine={mine}
        onBoardChange={handleBoardChange}
        onSortChange={handleSortChange}
        onMineChange={handleMineChange}
        onSearch={handleSearch}
        onPageChange={handlePageChange}
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
      contentClassName="min-[1101px]:pt-[7px]"
    >
      {body}
    </SubPageLayout>
  );
}
