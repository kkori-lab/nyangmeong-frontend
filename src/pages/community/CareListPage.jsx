import { Pencil } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { BTN_PRIMARY } from '@/components/buttonStyles';
import {
  PET_FILTERS,
  PET_SE_BY_FILTER,
  SIZE_BY_FILTER,
  SIZE_FILTERS,
} from '@/features/community/careCodes';
import {
  useCareInfiniteList,
  useCareList,
} from '@/features/community/careQueries';
import CareList from '@/features/community/care/CareList';
import useMediaQuery from '@/hooks/useMediaQuery';
import SubPageLayout from '@/layouts/SubPageLayout';
import { PATHS } from '@/routes/paths';
import LoadError from '@/components/LoadError';
import Skeleton from '@/components/Skeleton';
import { LIST_RAIL_COLS, THUMB_COLS } from '@/constants/listLayout';

const PAGE_SIZE = 10;
const DESCRIPTION = '가까운 이웃과 산책 · 돌봄을 부탁하고 도와줘요';
const YMD_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** URL 값이 허용 목록에 없으면 기본값('')으로 */
const pick = (value, options) =>
  options.some((option) => option.value === value) ? value : '';

const pickDate = (value) => (YMD_PATTERN.test(value ?? '') ? value : '');

/** 로딩 자리: 카드 안쪽도 실제 카드 모양(왼쪽 글 · 정보 줄 · 오른쪽 썸네일)으로 그린다. 모바일은 사진 있는 카드와 없는 카드를 섞는다 */
function CareCardSkeleton({ hasThumbOnMobile }) {
  return (
    <div className="@container">
      <div
        aria-hidden="true"
        className={`grid h-[255px] ${THUMB_COLS} gap-x-8 gap-y-4 rounded-[14px] border border-line bg-white px-7 py-6 max-[760px]:h-auto max-[760px]:grid-cols-1 max-[760px]:gap-3 max-[760px]:px-4 max-[760px]:pt-4 max-[760px]:pb-5 max-[760px]:overflow-hidden`}
      >
        <div className="min-w-0 max-[760px]:order-2">
          <div className="flex gap-2">
            <Skeleton className="h-6 w-14 rounded-full" />
            <Skeleton className="h-6 w-14 rounded-full" />
            <Skeleton className="h-6 w-[72px] rounded-full" />
          </div>
          <Skeleton className="mt-3 h-[22px] w-2/3" />
          <Skeleton className="mt-4 h-3.5 w-full" />
          <Skeleton className="mt-2 h-3.5 w-1/2" />
          <div className="mt-4 flex gap-4">
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="h-3.5 w-28" />
            <Skeleton className="h-3.5 w-20" />
          </div>
        </div>
        <Skeleton
          className={`col-start-2 row-span-2 row-start-1 min-h-[132px] self-stretch rounded-[10px] max-[760px]:-mx-4 max-[760px]:-mt-4 max-[760px]:rounded-none max-[760px]:border-b max-[760px]:border-line ${hasThumbOnMobile ? '' : 'max-[760px]:hidden'} max-[760px]:order-1 max-[760px]:col-start-1 max-[760px]:row-span-1 max-[760px]:row-start-auto max-[760px]:aspect-[16/9] max-[760px]:min-h-0`}
        />
        <div className="flex items-center gap-2 border-t border-line pt-4 max-[760px]:order-3">
          <Skeleton className="size-6 rounded-full" />
          <Skeleton className="h-3.5 w-20" />
          <Skeleton className="h-3.5 w-28" />
        </div>
      </div>
    </div>
  );
}

/** 로딩 자리: 왼쪽(필터 2열 + 건수 줄 + 카드 한 쪽 개수 + 쪽 번호)과 오른쪽 안내(실제 목록과 같은 배치) */
function CareListSkeleton() {
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
          <Skeleton className="hidden h-10 max-[760px]:block" />
          <Skeleton className="h-16 max-[760px]:hidden" />
          <Skeleton className="h-16 max-[760px]:hidden" />
          <Skeleton className="h-16 max-[760px]:hidden" />
          <Skeleton className="h-16 max-[760px]:hidden" />
        </div>
        <div>
          <Skeleton className="h-9 w-full" />
        </div>
        <div className="flex flex-col gap-3">
          {Array.from({ length: PAGE_SIZE }, (_, index) => (
            <CareCardSkeleton key={index} hasThumbOnMobile={index % 2 === 0} />
          ))}
        </div>
        {/* 760px 이상은 쪽 번호가 있다(모바일은 무한 스크롤이라 없음) */}
        <div aria-hidden="true" className="mt-7 hidden min-[760px]:block">
          <Skeleton className="mx-auto h-9 w-64" />
        </div>
      </div>
      <div
        aria-hidden="true"
        className="flex h-[500px] flex-col gap-4 rounded-[14px] border border-line bg-white p-6 max-[1100px]:h-[477px]"
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
    to={PATHS.COMMUNITY_PETCARE_NEW}
    className={`${BTN_PRIMARY} h-10! w-full text-base`}
  >
    <Pencil size={16} aria-hidden="true" />
    돌봄 요청 등록
  </Link>
);

export default function CareListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const mine = searchParams.get('mine') === '1';
  /** 지역은 지역 번호(rgnSn). 숫자가 아니면 전체 */
  const region = /^\d+$/.test(searchParams.get('rgn') ?? '')
    ? searchParams.get('rgn')
    : '';
  const dong =
    region && /^\d+$/.test(searchParams.get('dong') ?? '')
      ? searchParams.get('dong')
      : '';
  const from = pickDate(searchParams.get('from'));
  const to = pickDate(searchParams.get('to'));
  const pet = pick(searchParams.get('pet'), PET_FILTERS);
  /** 고양이는 반려견 크기를 선택 불가 */
  const size =
    pet === 'cat' ? '' : pick(searchParams.get('size'), SIZE_FILTERS);
  const filters = { mine, region, dong, from, to, pet, size };

  /** 760px 미만(모바일)은 무한 스크롤, 그 밖은 ?page= 쪽 번호. 쓰는 쪽만 요청한다 */
  const isMobile = useMediaQuery('(width < 760px)');
  const page = Number(searchParams.get('page')) || 1;
  const listParams = {
    size: PAGE_SIZE,
    mineYn: mine,
    rgnSn: dong || region,
    fromDate: from,
    toDate: to,
    petSeCd: PET_SE_BY_FILTER[pet] ?? '',
    petSizeCd: SIZE_BY_FILTER[size] ?? '',
  };
  const infinite = useCareInfiniteList(listParams, { enabled: isMobile });
  const paged = useCareList({ ...listParams, page }, { enabled: !isMobile });
  const {
    data: posts,
    isPending,
    isError,
    refetch,
  } = isMobile ? infinite : paged;

  /** 빈 값은 URL에 남기지 않는다. 조건이 바뀌면 목록을 처음부터 다시 받는다 */
  const setQuery = (next) => {
    const merged = { ...filters, ...next };
    setSearchParams(
      Object.fromEntries(
        Object.entries({
          mine: merged.mine ? '1' : '',
          rgn: merged.region,
          dong: merged.dong,
          from: merged.from,
          to: merged.to,
          pet: merged.pet,
          size: merged.size,
          page: merged.page,
        }).filter(([, value]) => value),
      ),
    );
  };

  /** 조건이 바뀌면 page가 빠져 1쪽부터 */
  const handlePageChange = (nextPage) =>
    setQuery({ page: nextPage > 1 ? String(nextPage) : '' });

  let body;
  if (isPending) {
    body = <CareListSkeleton />;
  } else if (isError) {
    body = (
      <LoadError
        message="게시글을 불러오지 못했어요. 잠시 뒤 다시 시도해 주세요"
        onRetry={() => refetch()}
      />
    );
  } else {
    body = (
      <CareList
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
      menu={PATHS.COMMUNITY_PETCARE}
      description={DESCRIPTION}
    >
      {body}
    </SubPageLayout>
  );
}
