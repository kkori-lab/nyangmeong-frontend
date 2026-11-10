import BoardPagination from '@/components/BoardPagination';
import { isForbiddenError } from '@/utils/isForbiddenError';
import CharacterJobTable from './CharacterJobTable';
import { CHAR_JOB_STTS, CHAR_JOB_STTS_FAIL } from './processingLabels';
import ProcessingFilter from './ProcessingFilter';
import ProcessingListError from './ProcessingListError';
import ProcessingSkeleton from './ProcessingSkeleton';
import ProcessingStatCards from './ProcessingStatCards';
import { useAdminCharacterJobs } from './queries';

const PAGE_SIZE = 20;

/** 필터 칸 이름(URL 쿼리와 같다) */
const FILTER_NAMES = ['fromYmd', 'toYmd', 'crtJobSttsCd'];

/** 값이 있는 칸만 남긴 객체 */
const pickFilled = (filter) =>
  Object.fromEntries(Object.entries(filter).filter(([, value]) => value));

/**
 * [캐릭터 생성 현황 탭]
 * - 기간·상태 필터([조회]로 적용) + 읽기 전용 건수 카드 + 목록
 * - 기간(fromYmd·toYmd)은 백엔드가 아직 받지 않음 -> 받게 되면 그대로 동작
 * - params는 URL 쿼리, 바꾸면 onParamsChange
 */
export default function CharacterJobPanel({
  params,
  onParamsChange,
  renderForbidden,
}) {
  const page = Number(params.page) || 1;
  const filter = Object.fromEntries(
    FILTER_NAMES.map((name) => [name, params[name] ?? '']),
  );

  const jobs = useAdminCharacterJobs({
    ...pickFilled(filter),
    page,
    size: PAGE_SIZE,
  });

  const handleSearch = (nextFilter) => onParamsChange(pickFilled(nextFilter));
  const handlePageChange = (nextPage) =>
    onParamsChange({ ...pickFilled(filter), page: nextPage });

  if (jobs.isPending) {
    return (
      <ProcessingSkeleton
        filterClass="h-10 w-full max-w-[620px] max-[760px]:h-[136px]"
        cardCount={5}
        cardGridClass="min-[761px]:grid-cols-5"
        cardClass="h-[84px]"
        tableClass="h-[1025px]"
      />
    );
  }
  if (isForbiddenError(jobs.error)) {
    return renderForbidden(jobs.error);
  }
  if (jobs.isError) {
    return (
      <ProcessingListError
        message="캐릭터 생성 현황을 불러오지 못했어요."
        onRetry={() => jobs.refetch()}
      />
    );
  }

  const countOf = (sttsCd) =>
    jobs.data.sttsCnts.find((item) => item.crtJobSttsCd === sttsCd)?.cnt ?? 0;
  const total = jobs.data.sttsCnts.reduce((sum, item) => sum + item.cnt, 0);

  return (
    <>
      <ProcessingFilter
        key={JSON.stringify(filter)}
        filter={filter}
        selects={[
          { name: 'crtJobSttsCd', label: '상태', codes: CHAR_JOB_STTS },
        ]}
        onSearch={handleSearch}
      />
      <ProcessingStatCards
        className="min-[761px]:grid-cols-5"
        items={[
          { key: 'all', label: '전체', value: total },
          ...CHAR_JOB_STTS.map(({ comCd, comCdNm }) => ({
            key: comCd,
            label: comCdNm,
            value: countOf(comCd),
            isDanger: comCd === CHAR_JOB_STTS_FAIL && countOf(comCd) > 0,
          })),
        ]}
      />
      {jobs.data.content.length === 0 ? (
        <p className="rounded-[14px] border border-line bg-white py-16 text-center text-base text-subtle">
          캐릭터 생성 작업이 없어요
        </p>
      ) : (
        <>
          <CharacterJobTable jobs={jobs.data.content} />
          <p className="mt-3 mb-2 text-sm text-subtle">
            총 {jobs.data.totalElements.toLocaleString()}건 · {PAGE_SIZE}건씩
          </p>
          <BoardPagination
            page={page}
            totalPages={jobs.data.totalPages}
            onChange={handlePageChange}
          />
        </>
      )}
    </>
  );
}
