import BoardPagination from '@/components/BoardPagination';
import { isForbiddenError } from '@/utils/isForbiddenError';
import CharacterJobTable from './CharacterJobTable';
import { CHAR_JOB_STTS, CHAR_JOB_STTS_FAIL } from './processingLabels';
import ProcessingListError from './ProcessingListError';
import ProcessingSkeleton from './ProcessingSkeleton';
import ProcessingStatCards from './ProcessingStatCards';
import { useAdminCharacterJobs } from './queries';

const PAGE_SIZE = 20;

/**
 * [캐릭터 생성 현황 탭]
 * - 상태 카드를 누르면 그 상태로 목록 거름, 전체 카드로 풀기
 * - params는 URL 쿼리, 바꾸면 onParamsChange
 */
export default function CharacterJobPanel({
  params,
  onParamsChange,
  renderForbidden,
}) {
  const page = Number(params.page) || 1;
  const jobSttsCd = params.jobSttsCd ?? '';

  const jobs = useAdminCharacterJobs({
    ...(jobSttsCd && { jobSttsCd }),
    page,
    size: PAGE_SIZE,
  });

  /** 상태 선택: 같은 카드를 다시 누르면 전체 */
  const handleSelectStatus = (nextSttsCd) =>
    onParamsChange(nextSttsCd ? { jobSttsCd: nextSttsCd } : {});
  const handlePageChange = (nextPage) =>
    onParamsChange({ ...(jobSttsCd && { jobSttsCd }), page: nextPage });

  if (jobs.isPending) {
    return (
      <ProcessingSkeleton
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
    jobs.data.sttsCnts.find((item) => item.jobSttsCd === sttsCd)?.cnt ?? 0;
  const total = jobs.data.sttsCnts.reduce((sum, item) => sum + item.cnt, 0);

  return (
    <>
      <ProcessingStatCards
        className="min-[761px]:grid-cols-5"
        items={[
          {
            key: 'all',
            label: '전체',
            value: total,
            isSelected: !jobSttsCd,
            onSelect: () => handleSelectStatus(''),
          },
          ...CHAR_JOB_STTS.map(({ comCd, comCdNm }) => ({
            key: comCd,
            label: comCdNm,
            value: countOf(comCd),
            isDanger: comCd === CHAR_JOB_STTS_FAIL && countOf(comCd) > 0,
            isSelected: jobSttsCd === comCd,
            onSelect: () =>
              handleSelectStatus(jobSttsCd === comCd ? '' : comCd),
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
