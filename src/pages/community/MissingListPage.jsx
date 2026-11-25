import { Pencil } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { BTN_PRIMARY } from '@/components/buttonStyles';
import LoadError from '@/components/LoadError';
import { LIST_RAIL_COLS } from '@/constants/listLayout';
import {
  PET_SE_BY_FILTER,
  PET_FILTERS,
  PERIOD_FILTERS,
  STATUS_FILTERS,
  STTS_BY_FILTER,
  WTNS_PRD_BY_PERIOD,
} from '@/features/community/missingCodes';
import {
  useMissingInfiniteList,
  useMissingList,
} from '@/features/community/missingQueries';
import MissingList from '@/features/community/missing/MissingList';
import MissingGuideButton from '@/features/community/missing/MissingGuideButton';
import useMediaQuery from '@/hooks/useMediaQuery';
import SubPageLayout from '@/layouts/SubPageLayout';
import { PATHS } from '@/routes/paths';
import Skeleton from '@/components/Skeleton';

const PAGE_SIZE = 12;
const DESCRIPTION =
  '잃어버린 반려동물을 함께 찾아요. 비슷한 아이를 보셨다면 댓글로 알려 주세요';

/** URL 값이 허용 목록에 없으면 기본값('')으로 */
const pick = (value, options) =>
  options.some((option) => option.value === value) ? value : '';

/** 로딩 자리: 카드 안쪽도 실제 카드 모양(위 4:3 이미지 · 아래 글줄)으로 그린다 */
function MissingCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="overflow-hidden rounded-[14px] border border-line bg-white"
    >
      <Skeleton className="aspect-[4/3] w-full rounded-none" />
      <div className="px-4 pt-4 pb-4">
        <Skeleton className="h-5 w-14 rounded-full" />
        <Skeleton className="mt-3 h-5 w-4/5" />
        <Skeleton className="mt-4 h-3.5 w-full" />
        <Skeleton className="mt-2 h-3.5 w-3/5" />
      </div>
    </div>
  );
}

/** 로딩 자리: 왼쪽(필터 2열 + 건수 줄 + 카드 한 쪽 개수 3칸 + 쪽 번호)과 오른쪽 레일(실제 목록과 같은 배치) */
function MissingListSkeleton() {
  return (
    <div
      aria-busy="true"
      className={`grid ${LIST_RAIL_COLS} items-start gap-x-8 gap-y-10 max-[1100px]:grid-cols-1`}
    >
      <div className="flex min-w-0 flex-col gap-5">
        <div
          aria-hidden="true"
          className="rounded-card border border-line bg-white p-5 grid grid-cols-2 gap-x-9 gap-y-5 max-[760px]:grid-cols-1 max-[760px]:gap-y-4"
        >
          <Skeleton className="h-16" />
          <Skeleton className="h-16 max-[760px]:hidden" />
          <Skeleton className="h-16 max-[760px]:hidden" />
          <Skeleton className="h-16 max-[760px]:hidden" />
          <Skeleton className="hidden h-10 max-[760px]:block" />
        </div>
        <div>
          <Skeleton className="h-9 w-full" />
        </div>
        <ul className="grid grid-cols-3 gap-4 max-[1100px]:grid-cols-2 max-[560px]:grid-cols-1">
          {Array.from({ length: PAGE_SIZE }, (_, index) => (
            <li key={index}>
              <MissingCardSkeleton />
            </li>
          ))}
        </ul>
        {/* 760px 이상은 쪽 번호가 있다(모바일은 무한 스크롤이라 없음) */}
        <div aria-hidden="true" className="mt-7 hidden min-[760px]:block">
          <Skeleton className="mx-auto h-9 w-64" />
        </div>
      </div>
      <div
        aria-hidden="true"
        className="flex h-[420px] flex-col gap-4 rounded-[14px] border border-line bg-white p-6 max-[1100px]:h-[600px]"
      >
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-3.5 w-full" />
        <Skeleton className="h-3.5 w-11/12" />
        <Skeleton className="h-3.5 w-3/4" />
      </div>
    </div>
  );
}

/** 오른쪽 레일 맨 위 등록 버튼 */
const writeAction = (
  <Link
    to={PATHS.COMMUNITY_MISSING_NEW}
    className={`${BTN_PRIMARY} w-full text-base`}
  >
    <Pencil size={16} aria-hidden="true" />
    실종 신고 등록
  </Link>
);

export default function MissingListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  /** 지역은 지역 번호(rgnSn). 숫자가 아니면 전체 */
  const region = /^\d+$/.test(searchParams.get('rgn') ?? '')
    ? searchParams.get('rgn')
    : '';
  const dong =
    region && /^\d+$/.test(searchParams.get('dong') ?? '')
      ? searchParams.get('dong')
      : '';
  const pet = pick(searchParams.get('pet'), PET_FILTERS);
  const period = pick(searchParams.get('period'), PERIOD_FILTERS);
  const status = pick(searchParams.get('stts'), STATUS_FILTERS);
  const keyword = searchParams.get('q') ?? '';
  const mine = searchParams.get('mine') === '1';
  const filters = { mine, region, dong, pet, period, status, keyword };

  /** 760px 미만(모바일)은 무한 스크롤, 그 밖은 ?page= 쪽 번호. 쓰는 쪽만 요청한다 */
  const isMobile = useMediaQuery('(width < 760px)');
  const page = Number(searchParams.get('page')) || 1;
  const listParams = {
    size: PAGE_SIZE,
    rgnSn: dong || region,
    lostTpofSttsCd: STTS_BY_FILTER[status] ?? '',
    petSeCd: PET_SE_BY_FILTER[pet] ?? '',
    wtnsPrd: WTNS_PRD_BY_PERIOD[period] ?? '',
    keyword,
    mineYn: mine,
  };
  const infinite = useMissingInfiniteList(listParams, { enabled: isMobile });
  const paged = useMissingList({ ...listParams, page }, { enabled: !isMobile });
  const {
    data: posts,
    isPending,
    isError,
    refetch,
  } = isMobile ? infinite : paged;

  /** 빈 값은 URL에 남기지 않는다. 조건이 바뀌면 목록을 처음부터 다시 받는다 */
  const setQuery = (next) => {
    /** 검색어만 바뀌면(입력 중 자동 검색) 뒤로 가기 기록을 쌓지 않고 바꿔 끼운다 */
    const keywordOnly = Object.keys(next).join() === 'keyword';
    const merged = { ...filters, ...next };
    setSearchParams(
      Object.fromEntries(
        Object.entries({
          mine: merged.mine ? '1' : '',
          rgn: merged.region,
          dong: merged.dong,
          pet: merged.pet,
          period: merged.period,
          stts: merged.status,
          q: merged.keyword,
          page: merged.page,
        }).filter(([, value]) => value),
      ),
      { replace: keywordOnly },
    );
  };

  /** 조건이 바뀌면 page가 빠져 1쪽부터 */
  const handlePageChange = (nextPage) =>
    setQuery({ page: nextPage > 1 ? String(nextPage) : '' });

  let body;
  if (isPending) {
    body = <MissingListSkeleton />;
  } else if (isError) {
    body = (
      <LoadError
        message="게시글을 불러오지 못했어요. 잠시 뒤 다시 시도해 주세요"
        onRetry={() => refetch()}
      />
    );
  } else {
    body = (
      <MissingList
        posts={posts}
        filters={filters}
        onChange={setQuery}
        onReset={() => setSearchParams({})}
        isMobile={isMobile}
        page={page}
        onPageChange={handlePageChange}
        hasNext={Boolean(infinite.hasNextPage)}
        isFetchingNext={infinite.isFetchingNextPage}
        onLoadMore={infinite.fetchNextPage}
        action={writeAction}
      />
    );
  }

  return (
    <SubPageLayout
      section="community"
      menu={PATHS.COMMUNITY_MISSING}
      description={DESCRIPTION}
      sideBottom={<MissingGuideButton />}
    >
      {body}
    </SubPageLayout>
  );
}
