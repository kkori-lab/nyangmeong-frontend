import { useSearchParams } from 'react-router-dom';
import BoardPagination from '@/components/BoardPagination';
import { BTN_SECONDARY } from '@/components/buttonStyles';
import Skeleton from '@/components/Skeleton';
import SkeletonCard from '@/components/SkeletonCard';
import ApiFailureTable from '@/features/apiUsage/ApiFailureTable';
import ApiTokenChart from '@/features/apiUsage/ApiTokenChart';
import ApiUsageDailyTable from '@/features/apiUsage/ApiUsageDailyTable';
import ApiUsageFilter from '@/features/apiUsage/ApiUsageFilter';
import ApiUsageTable from '@/features/apiUsage/ApiUsageTable';
import { getApiTypeName } from '@/features/apiUsage/apiUsageLabels';
import {
  useApiFailures,
  useApiTokens,
  useApiUsage,
  useApiUsageDaily,
} from '@/features/apiUsage/queries';
import { addDays, getTodayYmd } from '@/utils/formatDate';
import { isForbiddenError } from '@/utils/isForbiddenError';
import AdminForbidden from './AdminForbidden';

const PAGE_SIZE = 20;
/** 기본 기간: 오늘 포함 7일 */
const DEFAULT_RANGE_DAYS = 7;

/** 값이 있는 칸만 남긴 객체 */
const pickFilled = (filter) =>
  Object.fromEntries(Object.entries(filter).filter(([, value]) => value));

/** 필터 줄 + 사용량 7행 + 그래프 + 실패 목록 20행 + 쪽 번호 자리 */
function ApiUsageSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true">
      <Skeleton className="h-10 w-full max-w-[640px] max-[760px]:h-[148px]" />
      <SkeletonCard className="h-[390px]" />
      <SkeletonCard className="h-[300px]" />
      <SkeletonCard className="h-[1030px]" />
      <Skeleton className="mx-auto h-9 w-64" />
    </div>
  );
}

/** 조회 실패 안내 */
function LoadError({ message, onRetry }) {
  return (
    <div role="alert" className="flex flex-col items-center gap-3 py-16">
      <p className="text-base text-subtle">{message}</p>
      <button type="button" className={BTN_SECONDARY} onClick={onRetry}>
        다시 시도
      </button>
    </div>
  );
}

/** 빈 목록 안내 */
function EmptyMessage({ children }) {
  return (
    <p className="rounded-[14px] border border-line bg-white py-16 text-center text-base text-subtle">
      {children}
    </p>
  );
}

export default function AdminExternalApiUsagePage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const today = getTodayYmd();
  const filter = {
    from: searchParams.get('from') ?? addDays(today, 1 - DEFAULT_RANGE_DAYS),
    to: searchParams.get('to') ?? today,
    type: searchParams.get('type') ?? '',
  };
  const selectedCd = searchParams.get('detail');
  const page = Number(searchParams.get('page')) || 1;

  const params = {
    bgngYmd: filter.from,
    endYmd: filter.to,
    extlApiSeCd: filter.type,
  };
  const usage = useApiUsage(params);
  const tokens = useApiTokens(params);
  const failures = useApiFailures({ ...params, page, size: PAGE_SIZE });
  const selectedUsage = usage.data?.find(
    ({ extlApiSeCd }) => extlApiSeCd === selectedCd,
  );
  const daily = useApiUsageDaily(selectedUsage?.extlApiSeCd, params);

  /** 다른 쿼리는 두고 칸 하나만 변경 */
  const changeSearchParam = (name, value) => {
    const next = new URLSearchParams(searchParams);
    next.set(name, value);
    setSearchParams(next);
  };

  const handleSearch = (nextFilter) => setSearchParams(pickFilled(nextFilter));
  const handleSelect = (extlApiSeCd) =>
    changeSearchParam('detail', extlApiSeCd);
  const handlePageChange = (nextPage) => changeSearchParam('page', nextPage);

  /** 일별 표: 로딩 / 오류 / 표 */
  const renderDaily = () => {
    if (daily.isPending) return <SkeletonCard className="h-[390px]" />;
    if (daily.isError) {
      return (
        <LoadError
          message="일별 사용량을 불러오지 못했어요."
          onRetry={() => daily.refetch()}
        />
      );
    }
    return <ApiUsageDailyTable days={daily.data} />;
  };

  /** 사용량: 오류 / 빈 목록 / 표 */
  const renderUsage = () => {
    if (usage.isError) {
      return (
        <LoadError
          message="사용량을 불러오지 못했어요."
          onRetry={() => usage.refetch()}
        />
      );
    }
    if (usage.data.length === 0) {
      return <EmptyMessage>호출 기록이 없어요.</EmptyMessage>;
    }
    return (
      <ApiUsageTable
        usages={usage.data}
        selectedCd={selectedCd}
        onSelect={handleSelect}
      />
    );
  };

  /** AI 토큰: 오류 / 빈 목록 / 그래프 */
  const renderTokens = () => {
    if (tokens.isError) {
      return (
        <LoadError
          message="AI 토큰을 불러오지 못했어요."
          onRetry={() => tokens.refetch()}
        />
      );
    }
    if (tokens.data.length === 0) {
      return <EmptyMessage>AI 호출 기록이 없어요.</EmptyMessage>;
    }
    return <ApiTokenChart tokens={tokens.data} />;
  };

  /** 실패 목록: 오류 / 빈 목록 / 표 */
  const renderFailures = () => {
    if (failures.isError) {
      return (
        <LoadError
          message="실패 목록을 불러오지 못했어요."
          onRetry={() => failures.refetch()}
        />
      );
    }
    if (failures.data.content.length === 0) {
      return <EmptyMessage>실패한 호출이 없어요.</EmptyMessage>;
    }
    return (
      <>
        <ApiFailureTable failures={failures.data.content} />
        <p className="mt-3 mb-2 text-sm text-subtle">
          총 {failures.data.totalElements.toLocaleString()}건 · {PAGE_SIZE}건씩
        </p>
        <BoardPagination
          page={page}
          totalPages={failures.data.totalPages}
          onChange={handlePageChange}
        />
      </>
    );
  };

  /** 본문: 로딩 / 403 / 구역별 내용 */
  const renderBody = () => {
    if (usage.isPending || tokens.isPending || failures.isPending) {
      return <ApiUsageSkeleton />;
    }
    if (isForbiddenError(usage.error)) {
      return <AdminForbidden message={usage.error.message} />;
    }
    return (
      <>
        <ApiUsageFilter
          key={JSON.stringify(filter)}
          filter={filter}
          onSearch={handleSearch}
        />
        {renderUsage()}
        {selectedUsage && (
          <section className="mt-8">
            <h2 className="mb-3 text-lg font-bold text-ink">
              {getApiTypeName(selectedUsage.extlApiSeCd)} 일별
            </h2>
            {renderDaily()}
          </section>
        )}
        <section className="mt-8">
          <h2 className="mb-3 text-lg font-bold text-ink">AI 토큰</h2>
          {renderTokens()}
        </section>
        <section className="mt-8">
          <h2 className="mb-3 text-lg font-bold text-ink">실패 목록</h2>
          {renderFailures()}
        </section>
      </>
    );
  };

  return (
    <div className="mx-auto max-w-[1200px]">
      <h1 className="mb-5 text-2xl font-bold text-ink">외부 API 사용량</h1>
      {renderBody()}
    </div>
  );
}
