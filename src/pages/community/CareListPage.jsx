import { useSearchParams } from 'react-router-dom';
import {
  PET_FILTERS,
  PET_SE_BY_FILTER,
  REGION_OPTIONS,
  SIZE_BY_FILTER,
  SIZE_FILTERS,
  STATUS_TABS,
  STTS_BY_TAB,
  DONG_BY_REGION,
  hasDong,
} from '@/features/community/careCodes';
import { useCareList } from '@/features/community/careQueries';
import CareList from '@/features/community/care/CareList';
import SubPageLayout from '@/layouts/SubPageLayout';
import { PATHS } from '@/routes/paths';

const PAGE_SIZE = 10;
const DESCRIPTION = '가까운 이웃과 산책 · 돌봄을 부탁하고 도와줘요';
const YMD_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** URL 값이 허용 목록에 없으면 기본값('')으로 */
const pick = (value, options) =>
  options.some((option) => option.value === value) ? value : '';

const pickDate = (value) => (YMD_PATTERN.test(value ?? '') ? value : '');

export default function CareListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get('page')) || 1;
  const stts = pick(searchParams.get('stts'), STATUS_TABS);
  const mine = searchParams.get('mine') === '1';
  const region = pick(searchParams.get('rgn'), REGION_OPTIONS);
  const dongParam = searchParams.get('dong') ?? '';
  const dong =
    hasDong(region) && DONG_BY_REGION[region].includes(dongParam)
      ? dongParam
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
    mineOnly: mine,
    sggNm: region,
    emdNm: dong,
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
    body = <p className="text-muted">불러오는 중이에요</p>;
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
      contentClassName="min-[1101px]:pt-[7px]"
    >
      {body}
    </SubPageLayout>
  );
}
