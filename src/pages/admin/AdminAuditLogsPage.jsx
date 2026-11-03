import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import BoardPagination from '@/components/BoardPagination';
import { BTN_SECONDARY } from '@/components/buttonStyles';
import Skeleton from '@/components/Skeleton';
import SkeletonCard from '@/components/SkeletonCard';
import AuditLogDetailModal from '@/features/audit/AuditLogDetailModal';
import AuditLogFilter from '@/features/audit/AuditLogFilter';
import AuditLogTable from '@/features/audit/AuditLogTable';
import {
  useAuditLogAdmins,
  useAuditLogs,
  useAuditTaskTypes,
} from '@/features/audit/queries';
import { isForbiddenError } from '@/utils/isForbiddenError';
import AdminForbidden from './AdminForbidden';

const PAGE_SIZE = 20;

/** 필터 칸 이름 */
const FILTER_NAMES = ['mbrSn', 'taskTypeCd', 'trgtTblNm', 'bgngYmd', 'endYmd'];

/** 값이 있는 칸만 남긴 객체 */
const pickFilled = (filter) =>
  Object.fromEntries(Object.entries(filter).filter(([, value]) => value));

/** 필터 줄 + 표 20행 + 쪽 번호 자리 */
function AuditLogSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true">
      <Skeleton className="h-10 w-full max-w-[860px] max-[760px]:h-[276px]" />
      <SkeletonCard className="h-[960px]" />
      <Skeleton className="mx-auto h-9 w-64" />
    </div>
  );
}

export default function AdminAuditLogsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedSn, setSelectedSn] = useState(null);

  const page = Number(searchParams.get('page')) || 1;
  const filter = Object.fromEntries(
    FILTER_NAMES.map((name) => [name, searchParams.get(name) ?? '']),
  );

  const logs = useAuditLogs({
    ...pickFilled(filter),
    page,
    size: PAGE_SIZE,
  });
  const admins = useAuditLogAdmins();
  const taskTypes = useAuditTaskTypes();

  const handleRetry = () => logs.refetch();
  const handleSearch = (nextFilter) => setSearchParams(pickFilled(nextFilter));
  const handlePageChange = (nextPage) =>
    setSearchParams({ ...pickFilled(filter), page: nextPage });
  const handleDetailClose = () => setSelectedSn(null);

  /** 본문: 로딩 / 403 / 그 밖의 오류 / 목록 */
  const renderBody = () => {
    if (logs.isPending || admins.isPending || taskTypes.isPending) {
      return <AuditLogSkeleton />;
    }
    if (isForbiddenError(logs.error)) {
      return <AdminForbidden message={logs.error.message} />;
    }
    return (
      <>
        <AuditLogFilter
          key={JSON.stringify(filter)}
          filter={filter}
          admins={admins.data}
          taskTypes={taskTypes.data}
          onSearch={handleSearch}
        />
        {logs.isError ? (
          <div role="alert" className="flex flex-col items-center gap-3 py-16">
            <p className="text-base text-subtle">
              감사 로그를 불러오지 못했어요.
            </p>
            <button
              type="button"
              className={BTN_SECONDARY}
              onClick={handleRetry}
            >
              다시 시도
            </button>
          </div>
        ) : logs.data.content.length === 0 ? (
          <p className="rounded-[14px] border border-line bg-white py-16 text-center text-base text-subtle">
            감사 로그가 없어요.
          </p>
        ) : (
          <>
            <AuditLogTable
              logs={logs.data.content}
              taskTypes={taskTypes.data}
              onSelect={setSelectedSn}
            />
            <p className="mt-3 mb-2 text-sm text-subtle">
              총 {logs.data.totalElements.toLocaleString()}건 · {PAGE_SIZE}건씩
            </p>
            <BoardPagination
              page={page}
              totalPages={logs.data.totalPages}
              onChange={handlePageChange}
            />
          </>
        )}
      </>
    );
  };

  return (
    <div className="mx-auto max-w-[1200px]">
      <h1 className="mb-5 text-2xl font-bold text-ink">감사 로그</h1>
      {renderBody()}
      {selectedSn !== null && (
        <AuditLogDetailModal
          mngrTaskLogSn={selectedSn}
          onClose={handleDetailClose}
        />
      )}
    </div>
  );
}
