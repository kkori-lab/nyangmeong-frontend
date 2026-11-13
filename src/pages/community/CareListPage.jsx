import { Pencil } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { BTN_PRIMARY } from '@/components/buttonStyles';
import {
  PET_FILTERS,
  PET_SE_BY_FILTER,
  SIZE_BY_FILTER,
  SIZE_FILTERS,
  STATUS_TABS,
  STTS_BY_TAB,
} from '@/features/community/careCodes';
import { useCareList } from '@/features/community/careQueries';
import CareList from '@/features/community/care/CareList';
import SubPageLayout from '@/layouts/SubPageLayout';
import { PATHS } from '@/routes/paths';
import Skeleton from '@/components/Skeleton';

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
    <div
      aria-hidden="true"
      className="grid h-[255px] grid-cols-[minmax(0,1fr)_200px] gap-x-8 gap-y-3.5 rounded-[14px] border border-[#e2e7e7] bg-white px-7 py-6 max-[760px]:h-auto max-[760px]:grid-cols-1 max-[760px]:gap-3 max-[760px]:px-4 max-[760px]:pt-4 max-[760px]:pb-[18px]"
    >
      <div className="min-w-0 max-[760px]:order-2">
        <div className="flex gap-2">
          <Skeleton className="h-[22px] w-14 rounded-full" />
          <Skeleton className="h-[22px] w-14 rounded-full" />
          <Skeleton className="h-[22px] w-[72px] rounded-full" />
        </div>
        <Skeleton className="mt-3 h-[22px] w-2/3" />
        <Skeleton className="mt-3.5 h-3.5 w-full" />
        <Skeleton className="mt-2 h-3.5 w-1/2" />
        <div className="mt-4 flex gap-4">
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="h-3.5 w-28" />
          <Skeleton className="h-3.5 w-20" />
        </div>
      </div>
      <Skeleton
        className={`col-start-2 row-span-2 row-start-1 min-h-[132px] self-stretch rounded-[10px] ${hasThumbOnMobile ? '' : 'max-[760px]:hidden'} max-[760px]:order-1 max-[760px]:col-start-1 max-[760px]:row-span-1 max-[760px]:row-start-auto max-[760px]:aspect-[16/9] max-[760px]:min-h-0`}
      />
      <div className="flex items-center gap-2 border-t border-[#e2e7e7] pt-3.5 max-[760px]:order-3">
        <Skeleton className="size-6 rounded-full" />
        <Skeleton className="h-3.5 w-20" />
        <Skeleton className="h-3.5 w-28" />
      </div>
    </div>
  );
}

/** 로딩 자리: 왼쪽(필터 2열 + 건수 줄 + 카드 한 쪽 개수 + 쪽 번호)과 오른쪽 안내(실제 목록과 같은 배치) */
function CareListSkeleton() {
  return (
    <div
      aria-busy="true"
      className="grid grid-cols-[minmax(0,1fr)_280px] items-start gap-x-8 gap-y-10 border-t border-line pt-6 max-[1101px]:grid-cols-1"
    >
      <div className="flex min-w-0 flex-col gap-5">
        <div
          aria-hidden="true"
          className="grid grid-cols-2 gap-x-9 gap-y-5 max-[760px]:grid-cols-1 max-[760px]:gap-y-4"
        >
          <Skeleton className="hidden h-10 max-[760px]:block" />
          <Skeleton className="h-16 max-[760px]:hidden" />
          <Skeleton className="h-16 max-[760px]:hidden" />
          <Skeleton className="h-16 max-[760px]:hidden" />
          <Skeleton className="h-16 max-[760px]:hidden" />
        </div>
        <div className="border-t border-line pt-4">
          <Skeleton className="h-9 w-full" />
        </div>
        <div className="flex flex-col gap-3">
          {Array.from({ length: PAGE_SIZE }, (_, index) => (
            <CareCardSkeleton key={index} hasThumbOnMobile={index % 2 === 0} />
          ))}
        </div>
        <Skeleton aria-hidden="true" className="mx-auto h-9 w-64" />
      </div>
      <div
        aria-hidden="true"
        className="flex h-[500px] flex-col gap-4 rounded-[14px] border border-[#e2e7e7] bg-white p-[22px] max-[1101px]:h-[477px]"
      >
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-3.5 w-full" />
        <Skeleton className="h-3.5 w-11/12" />
        <Skeleton className="h-3.5 w-3/4" />
      </div>
    </div>
  );
}

export default function CareListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get('page')) || 1;
  const stts = pick(searchParams.get('stts'), STATUS_TABS);
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
  const filters = { stts, mine, region, dong, from, to, pet, size };

  const {
    data: posts,
    isPending,
    isError,
  } = useCareList({
    page,
    size: PAGE_SIZE,
    rcrtSttsCd: STTS_BY_TAB[stts] ?? '',
    mineYn: mine,
    rgnSn: dong || region,
    fromDate: from,
    toDate: to,
    petSeCd: PET_SE_BY_FILTER[pet] ?? '',
    petSizeCd: SIZE_BY_FILTER[size] ?? '',
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
          from: merged.from,
          to: merged.to,
          pet: merged.pet,
          size: merged.size,
          page: merged.page > 1 ? merged.page : '',
        }).filter(([, value]) => value),
      ),
    );
  };

  let body;
  if (isPending) {
    body = <CareListSkeleton />;
  } else if (isError) {
    body = (
      <p role="alert" className="text-muted">
        게시글을 불러오지 못했어요. 잠시 뒤 다시 시도해 주세요
      </p>
    );
  } else {
    body = (
      <CareList
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
      menu={PATHS.COMMUNITY_PETCARE}
      description={DESCRIPTION}
      pixel={false}
      headAction={
        <Link
          to={PATHS.COMMUNITY_PETCARE_NEW}
          className={`${BTN_PRIMARY} h-[34px]! text-sm`}
        >
          <Pencil size={16} aria-hidden="true" />
          돌봄 요청 등록
        </Link>
      }
      contentClassName="min-[1101px]:pt-[7px]"
    >
      {body}
    </SubPageLayout>
  );
}
