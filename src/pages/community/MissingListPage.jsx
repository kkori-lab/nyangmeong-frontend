import { Pencil } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { BTN_PRIMARY } from '@/components/buttonStyles';
import {
  PET_SE_BY_FILTER,
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

/** 로딩 자리: 왼쪽(필터 2열 + 건수 줄 + 카드 한 쪽 개수 3칸 + 쪽 번호)과 오른쪽 레일(실제 목록과 같은 배치) */
function MissingListSkeleton() {
  return (
    <div
      aria-busy="true"
      className="grid grid-cols-[minmax(0,1fr)_280px] items-start gap-x-8 gap-y-10 border-t border-line pt-6 max-[1100px]:grid-cols-1"
    >
      <div className="flex min-w-0 flex-col gap-5">
        <div
          aria-hidden="true"
          className="grid grid-cols-2 gap-x-9 gap-y-5 max-[760px]:grid-cols-1 max-[760px]:gap-y-4"
        >
          <Skeleton className="h-16" />
          <Skeleton className="h-16 max-[760px]:hidden" />
          <Skeleton className="h-16 max-[760px]:hidden" />
          <Skeleton className="h-16 max-[760px]:hidden" />
          <Skeleton className="hidden h-10 max-[760px]:block" />
        </div>
        <div className="border-t border-line pt-4">
          <Skeleton className="h-9 w-full" />
        </div>
        <ul className="grid grid-cols-3 gap-4 max-[1100px]:grid-cols-2 max-[560px]:grid-cols-1">
          {Array.from({ length: PAGE_SIZE }, (_, index) => (
            <li key={index}>
              <MissingCardSkeleton />
            </li>
          ))}
        </ul>
        <Skeleton aria-hidden="true" className="mx-auto h-9 w-64" />
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
  const filters = { mine, region, dong, pet, period, keyword };

  const {
    data: posts,
    isPending,
    isError,
  } = useMissingList({
    page,
    size: PAGE_SIZE,
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
      pixel={false}
      headAction={
        <Link
          to={PATHS.COMMUNITY_MISSING_NEW}
          className={`${BTN_PRIMARY} h-[34px]! text-sm`}
        >
          <Pencil size={16} aria-hidden="true" />
          실종 신고 등록
        </Link>
      }
      contentClassName="min-[1101px]:pt-[7px]"
    >
      {body}
    </SubPageLayout>
  );
}
