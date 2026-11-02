import { useState } from 'react';
import { generatePath, useNavigate, useSearchParams } from 'react-router-dom';
import BoardPagination from '@/components/BoardPagination';
import { BTN_SECONDARY } from '@/components/buttonStyles';
import Skeleton from '@/components/Skeleton';
import SkeletonCard from '@/components/SkeletonCard';
import AutoBlindTable from '@/features/adminReport/AutoBlindTable';
import {
  useAdminReports,
  useAutoBlindReports,
} from '@/features/adminReport/queries';
import ReportFilter from '@/features/adminReport/ReportFilter';
import { REPORT_STATUS_OPTIONS } from '@/features/adminReport/reportLabels';
import ReportRestoreModal from '@/features/adminReport/ReportRestoreModal';
import ReportTable from '@/features/adminReport/ReportTable';
import { PATHS } from '@/routes/paths';
import { isForbiddenError } from '@/utils/isForbiddenError';
import AdminForbidden from './AdminForbidden';

const PAGE_SIZE = 20;

/** 자동 블라인드 탭 값 */
const TAB_AUTO_BLIND = 'auto';

const TABS = [
  { key: '', label: '전체' },
  ...REPORT_STATUS_OPTIONS.map(({ value, label }) => ({ key: value, label })),
  { key: TAB_AUTO_BLIND, label: '자동 블라인드' },
];

/** 필터 칸 이름 */
const FILTER_NAMES = [
  'dclrRsnCd',
  'targetType',
  'autoBlindYn',
  'bgngYmd',
  'endYmd',
];

/** 값이 있는 칸만 남긴 객체 */
const pickFilled = (filter) =>
  Object.fromEntries(Object.entries(filter).filter(([, value]) => value));

/** 필터 줄 + 표 20행 + 쪽 번호 자리 */
function ReportListSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true">
      <Skeleton className="h-10 w-full max-[760px]:h-[280px]" />
      <SkeletonCard className="h-[1025px]" />
      <Skeleton className="mx-auto h-9 w-64" />
    </div>
  );
}

/** 표 + 쪽 번호 자리 */
function AutoBlindSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true">
      <SkeletonCard className="h-[230px]" />
    </div>
  );
}

/** 조회 오류: 다시 시도 */
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

/** 목록 빈 문구 */
function EmptyList({ children }) {
  return (
    <p className="rounded-[14px] border border-line bg-white py-16 text-center text-base text-subtle">
      {children}
    </p>
  );
}

/** 신고 목록 탭 */
function ReportsTab({ status }) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const page = Number(searchParams.get('page')) || 1;
  const filter = Object.fromEntries(
    FILTER_NAMES.map((name) => [name, searchParams.get(name) ?? '']),
  );

  const reports = useAdminReports({
    ...pickFilled({ ...filter, status }),
    page,
    size: PAGE_SIZE,
  });

  const handleRetry = () => reports.refetch();
  const handleSearch = (nextFilter) =>
    setSearchParams(pickFilled({ status, ...nextFilter }));
  const handlePageChange = (nextPage) =>
    setSearchParams({ ...pickFilled({ status, ...filter }), page: nextPage });
  const handleSelect = (dclrSn) =>
    navigate(generatePath(PATHS.ADMIN_REPORT_DETAIL, { dclrSn }));

  if (reports.isPending) return <ReportListSkeleton />;
  if (isForbiddenError(reports.error)) {
    return <AdminForbidden message={reports.error.message} />;
  }

  /** 입력값 오류는 서버 문구, 그 밖의 오류는 다시 시도 */
  const renderList = () => {
    if (reports.error?.code === 'INVALID_INPUT_VALUE') {
      return (
        <p role="alert" className="py-16 text-center text-base text-danger">
          {reports.error.message}
        </p>
      );
    }
    if (reports.isError) {
      return (
        <LoadError
          message="신고 목록을 불러오지 못했어요."
          onRetry={handleRetry}
        />
      );
    }
    if (reports.data.content.length === 0) {
      return <EmptyList>조건에 맞는 신고가 없어요</EmptyList>;
    }
    return (
      <>
        <ReportTable reports={reports.data.content} onSelect={handleSelect} />
        <p className="mt-3 mb-2 text-sm text-subtle">
          총 {reports.data.totalElements.toLocaleString()}건 · {PAGE_SIZE}건씩
        </p>
        <BoardPagination
          page={page}
          totalPages={reports.data.totalPages}
          onChange={handlePageChange}
        />
      </>
    );
  };

  return (
    <>
      <ReportFilter
        key={JSON.stringify(filter)}
        filter={filter}
        onSearch={handleSearch}
      />
      {renderList()}
    </>
  );
}

/** 자동 블라인드 탭 */
function AutoBlindTab() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [restoreTarget, setRestoreTarget] = useState(null);

  const page = Number(searchParams.get('page')) || 1;
  const reports = useAutoBlindReports({ page, size: PAGE_SIZE });

  const handleRetry = () => reports.refetch();
  const handlePageChange = (nextPage) =>
    setSearchParams({ tab: TAB_AUTO_BLIND, page: nextPage });
  const handleSelect = (dclrSn) =>
    navigate(generatePath(PATHS.ADMIN_REPORT_DETAIL, { dclrSn }));
  const handleRestoreClose = () => setRestoreTarget(null);

  if (reports.isPending) return <AutoBlindSkeleton />;
  if (isForbiddenError(reports.error)) {
    return <AdminForbidden message={reports.error.message} />;
  }
  if (reports.isError) {
    return (
      <LoadError
        message="자동 블라인드 목록을 불러오지 못했어요."
        onRetry={handleRetry}
      />
    );
  }
  if (reports.data.content.length === 0) {
    return <EmptyList>자동 블라인드된 대상이 없어요</EmptyList>;
  }

  return (
    <>
      <AutoBlindTable
        reports={reports.data.content}
        onSelect={handleSelect}
        onRestore={setRestoreTarget}
      />
      <p className="mt-3 mb-2 text-sm text-subtle">
        총 {reports.data.totalElements.toLocaleString()}건 · {PAGE_SIZE}건씩
      </p>
      <BoardPagination
        page={page}
        totalPages={reports.data.totalPages}
        onChange={handlePageChange}
      />
      {restoreTarget && (
        <ReportRestoreModal
          report={restoreTarget}
          onClose={handleRestoreClose}
        />
      )}
    </>
  );
}

/**
 * [신고 처리]
 * - 상태 탭은 ?status=, 자동 블라인드 탭은 ?tab=auto
 * - 탭을 바꾸면 필터와 쪽 번호 초기화
 */
export default function AdminReportsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const status = searchParams.get('status') ?? '';
  const isAutoBlind = searchParams.get('tab') === TAB_AUTO_BLIND;
  const selectedTab = isAutoBlind ? TAB_AUTO_BLIND : status;

  const handleTabSelect = (nextTab) => {
    if (nextTab === TAB_AUTO_BLIND) {
      setSearchParams({ tab: TAB_AUTO_BLIND });
      return;
    }
    setSearchParams(pickFilled({ status: nextTab }));
  };

  return (
    <div className="mx-auto max-w-[1200px]">
      <h1 className="mb-5 text-2xl font-bold text-ink">신고 처리</h1>
      <div
        role="tablist"
        aria-label="신고 처리 상태"
        className="mb-4 flex gap-1 overflow-x-auto shadow-[inset_0_-1px_0_var(--color-line)] [scrollbar-width:none]"
      >
        {TABS.map(({ key, label }) => {
          const isSelected = key === selectedTab;
          return (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={isSelected}
              className={`relative h-12 shrink-0 px-4 text-base whitespace-nowrap ${
                isSelected
                  ? 'font-bold text-brand-900 after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:bg-brand-900'
                  : 'font-semibold text-subtle hover:text-ink'
              }`}
              onClick={() => handleTabSelect(key)}
            >
              {label}
            </button>
          );
        })}
      </div>
      <div role="tabpanel">
        {isAutoBlind ? <AutoBlindTab /> : <ReportsTab status={status} />}
      </div>
    </div>
  );
}
