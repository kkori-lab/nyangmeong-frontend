import { useSearchParams } from 'react-router-dom';
import {
  PET_SE_BY_FILTER,
  STTS_BY_TAB,
  STATUS_TABS,
  PET_FILTERS,
  PERIOD_FILTERS,
  WTNS_PRD_BY_PERIOD,
} from '@/features/community/missingCodes';
import { useMissingList } from '@/features/community/missingQueries';
import MissingList from '@/features/community/missing/MissingList';
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
      className="overflow-hidden rounded-[14px] border border-[#e2e7e7] bg-white"
    >
      <Skeleton className="aspect-[4/3] w-full rounded-none" />
      <div className="px-[18px] pt-4 pb-[18px]">
        <Skeleton className="h-5 w-14 rounded-full" />
        <Skeleton className="mt-3 h-5 w-4/5" />
        <Skeleton className="mt-3.5 h-3.5 w-full" />
        <Skeleton className="mt-2 h-3.5 w-3/5" />
      </div>
    </div>
  );
}

/** 로딩 자리: 탭·검색 줄 + 필터(회색 박스) + 카드 한 쪽 개수(3칸) + 오른쪽 레일(실제 목록과 같은 배치) */
function MissingListSkeleton() {
  return (
    <div
      aria-busy="true"
      className="grid grid-cols-[minmax(0,1fr)_280px] items-start gap-x-8 gap-y-4 max-[1100px]:grid-cols-1 max-[1100px]:gap-y-10"
    >
      <div
        aria-hidden="true"
        className="col-span-full flex min-w-0 flex-col gap-4"
      >
        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-input-line px-4 pt-6 pb-3 max-[760px]:flex-col max-[760px]:items-stretch">
          <div className="flex gap-8 pb-1">
            {Array.from({ length: 3 }, (_, index) => (
              <Skeleton key={index} className="h-5 w-20" />
            ))}
          </div>
          <Skeleton className="h-10 w-[300px] max-[760px]:w-full" />
        </div>
        <Skeleton className="h-[202px] rounded-[14px] max-[760px]:hidden" />
        <Skeleton className="hidden h-10 max-[760px]:block" />
      </div>
      <div className="flex min-w-0 flex-col gap-4">
        <ul className="grid grid-cols-3 gap-4 max-[1100px]:grid-cols-2 max-[560px]:grid-cols-1">
          {Array.from({ length: PAGE_SIZE }, (_, index) => (
            <li key={index}>
              <MissingCardSkeleton />
            </li>
          ))}
        </ul>
        <div aria-hidden="true" className="flex flex-col gap-4">
          <Skeleton className="ml-auto h-10 w-28" />
          <Skeleton className="mx-auto h-9 w-64" />
        </div>
      </div>
      <div
        aria-hidden="true"
        className="flex h-[420px] flex-col gap-4 rounded-[14px] border border-[#e2e7e7] bg-white p-[22px] max-[1100px]:h-[600px]"
      >
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-3.5 w-full" />
        <Skeleton className="h-3.5 w-11/12" />
        <Skeleton className="h-3.5 w-3/4" />
      </div>
    </div>
  );
}

export default function MissingListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get('page')) || 1;
  const stts = pick(searchParams.get('stts'), STATUS_TABS);
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
  const keyword = searchParams.get('q') ?? '';
  const mine = searchParams.get('mine') === '1';
  const filters = { stts, mine, region, dong, pet, period, keyword };

  const {
    data: posts,
    isPending,
    isError,
  } = useMissingList({
    page,
    size: PAGE_SIZE,
    lostTpofSttsCd: STTS_BY_TAB[stts] ?? '',
    rgnSn: dong || region,
    petSeCd: PET_SE_BY_FILTER[pet] ?? '',
    wtnsPrd: WTNS_PRD_BY_PERIOD[period] ?? '',
    keyword,
    mineYn: mine,
  });

  /** 빈 값은 URL에 남기지 않는다. 조건이 바뀌면 첫 쪽부터 */
  const setQuery = (next) => {
    const merged = { ...filters, ...next };
    setSearchParams(
      Object.fromEntries(
        Object.entries({
          stts: merged.stts,
          mine: merged.mine ? '1' : '',
          rgn: merged.region,
          dong: merged.dong,
          pet: merged.pet,
          period: merged.period,
          q: merged.keyword,
          page: merged.page > 1 ? merged.page : '',
        }).filter(([, value]) => value),
      ),
    );
  };

  let body;
  if (isPending) {
    body = <MissingListSkeleton />;
  } else if (isError) {
    body = (
      <p role="alert" className="text-muted">
        게시글을 불러오지 못했어요. 잠시 뒤 다시 시도해 주세요
      </p>
    );
  } else {
    body = (
      <MissingList
        key={keyword}
        posts={posts}
        filters={filters}
        onChange={(next) => setQuery({ ...next, page: 1 })}
        onReset={() => setSearchParams({})}
        onPageChange={(nextPage) => setQuery({ page: nextPage })}
      />
    );
  }

  return (
    <SubPageLayout
      section="community"
      menu={PATHS.COMMUNITY_MISSING}
      description={DESCRIPTION}
      contentClassName="min-[1101px]:pt-[7px]"
    >
      {body}
    </SubPageLayout>
  );
}
