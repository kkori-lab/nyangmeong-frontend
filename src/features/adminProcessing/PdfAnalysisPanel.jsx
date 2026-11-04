import BoardPagination from '@/components/BoardPagination';
import { isForbiddenError } from '@/utils/isForbiddenError';
import PdfFailureTable from './PdfFailureTable';
import ProcessingFilter from './ProcessingFilter';
import ProcessingListError from './ProcessingListError';
import ProcessingSkeleton from './ProcessingSkeleton';
import ProcessingStatCards from './ProcessingStatCards';
import { useAdminPdfAnalyses } from './queries';

const PAGE_SIZE = 20;

/** 필터 칸 이름(URL 쿼리와 같다) */
const FILTER_NAMES = ['fromYmd', 'toYmd'];

/** 값이 있는 칸만 남긴 객체 */
const pickFilled = (filter) =>
  Object.fromEntries(Object.entries(filter).filter(([, value]) => value));

/**
 * [검사결과지 분석 현황 탭]
 * - 기간 기준 요청·성공·시간 초과·API 오류 건수 + 실패 목록
 * - params는 URL 쿼리, 바꾸면 onParamsChange
 */
export default function PdfAnalysisPanel({
  params,
  onParamsChange,
  renderForbidden,
}) {
  const page = Number(params.page) || 1;
  const filter = Object.fromEntries(
    FILTER_NAMES.map((name) => [name, params[name] ?? '']),
  );

  const analyses = useAdminPdfAnalyses({
    ...pickFilled(filter),
    page,
    size: PAGE_SIZE,
  });

  const handleSearch = (nextFilter) => onParamsChange(pickFilled(nextFilter));
  const handlePageChange = (nextPage) =>
    onParamsChange({ ...pickFilled(filter), page: nextPage });

  if (analyses.isPending) {
    return (
      <ProcessingSkeleton
        filterClass="h-10 w-full max-w-[420px] max-[760px]:h-[88px]"
        cardCount={4}
        cardGridClass="min-[761px]:grid-cols-4"
        cardClass="h-[84px]"
        tableClass="h-[486px]"
      />
    );
  }
  if (isForbiddenError(analyses.error)) {
    return renderForbidden(analyses.error);
  }

  const summary = analyses.data?.summary;

  return (
    <>
      <ProcessingFilter
        key={JSON.stringify(filter)}
        filter={filter}
        onSearch={handleSearch}
      />
      {analyses.isError ? (
        <ProcessingListError
          message="검사결과지 분석 현황을 불러오지 못했어요."
          onRetry={() => analyses.refetch()}
        />
      ) : (
        <>
          <ProcessingStatCards
            className="min-[761px]:grid-cols-4"
            items={[
              { key: 'tot', label: '요청', value: summary.totCnt },
              { key: 'scs', label: '성공', value: summary.scsCnt },
              {
                key: 'tmot',
                label: '시간 초과',
                value: summary.tmotCnt,
                isDanger: summary.tmotCnt > 0,
              },
              {
                key: 'err',
                label: 'API 오류',
                value: summary.errCnt,
                isDanger: summary.errCnt > 0,
              },
            ]}
          />
          {analyses.data.content.length === 0 ? (
            <p className="rounded-[14px] border border-line bg-white py-16 text-center text-base text-subtle">
              분석 실패가 없어요
            </p>
          ) : (
            <>
              <PdfFailureTable failures={analyses.data.content} />
              <p className="mt-3 mb-2 text-sm text-subtle">
                실패 {analyses.data.totalElements.toLocaleString()}건 ·{' '}
                {PAGE_SIZE}건씩
              </p>
              <BoardPagination
                page={page}
                totalPages={analyses.data.totalPages}
                onChange={handlePageChange}
              />
            </>
          )}
        </>
      )}
    </>
  );
}
