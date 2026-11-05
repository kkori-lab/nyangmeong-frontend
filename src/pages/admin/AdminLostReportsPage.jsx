import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import BoardPagination from '@/components/BoardPagination';
import { BTN_SECONDARY } from '@/components/buttonStyles';
import Skeleton from '@/components/Skeleton';
import SkeletonCard from '@/components/SkeletonCard';
import LostReportDetailModal from '@/features/adminCommunity/LostReportDetailModal';
import LostReportTable from '@/features/adminCommunity/LostReportTable';
import { LOST_STATUS_TABS } from '@/features/adminCommunity/lostReportLabels';
import { useAdminLostReports } from '@/features/adminCommunity/queries';
import { isForbiddenError } from '@/utils/isForbiddenError';
import AdminForbidden from './AdminForbidden';

const PAGE_SIZE = 20;

/** 표 20행 + 쪽 번호 자리 */
function LostReportSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true">
      <SkeletonCard className="h-[960px] max-[760px]:h-[1400px]" />
      <Skeleton className="mx-auto h-9 w-64" />
    </div>
  );
}

export default function AdminLostReportsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedSn, setSelectedSn] = useState(null);

  const page = Number(searchParams.get('page')) || 1;
  const status = searchParams.get('lostTpofSttsCd') ?? '';

  const reports = useAdminLostReports({
    ...(status && { lostTpofSttsCd: status }),
    page,
    size: PAGE_SIZE,
  });

  const handleStatusChange = (nextStatus) =>
    setSearchParams(nextStatus ? { lostTpofSttsCd: nextStatus } : {});
  const handlePageChange = (nextPage) =>
    setSearchParams({
      ...(status && { lostTpofSttsCd: status }),
      page: nextPage,
    });

  /** 목록: 로딩 / 403 / 그 밖의 오류 / 빈 결과 / 목록 */
  const renderList = () => {
    if (reports.isPending) return <LostReportSkeleton />;
    if (reports.isError) {
      return (
        <div role="alert" className="flex flex-col items-center gap-3 py-16">
          <p className="text-base text-subtle">
            {reports.error?.message || '실종제보를 불러오지 못했어요.'}
          </p>
          <button
            type="button"
            className={BTN_SECONDARY}
            onClick={() => reports.refetch()}
          >
            다시 시도
          </button>
        </div>
      );
    }
    if (reports.data.content.length === 0) {
      return (
        <p className="rounded-[14px] border border-line bg-white py-16 text-center text-base text-subtle">
          실종제보가 없어요
        </p>
      );
    }
    return (
      <>
        <LostReportTable
          reports={reports.data.content}
          onSelect={setSelectedSn}
        />
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

  if (isForbiddenError(reports.error)) {
    return (
      <div className="mx-auto max-w-[1200px]">
        <h1 className="mb-5 text-2xl font-bold text-ink">실종제보</h1>
        <AdminForbidden message={reports.error.message} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1200px]">
      <h1 className="mb-5 text-2xl font-bold text-ink">실종제보</h1>
      <div
        role="tablist"
        aria-label="실종제보 상태"
        className="mb-4 flex gap-1 overflow-x-auto shadow-[inset_0_-1px_0_var(--color-line)] [scrollbar-width:none]"
      >
        {LOST_STATUS_TABS.map(({ value, label }) => {
          const isSelected = value === status;
          return (
            <button
              key={label}
              type="button"
              role="tab"
              aria-selected={isSelected}
              className={`relative h-12 shrink-0 px-4 text-base whitespace-nowrap max-[760px]:px-2 ${
                isSelected
                  ? 'font-bold text-brand-900 after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:bg-brand-900 max-[760px]:after:inset-x-1'
                  : 'font-semibold text-subtle hover:text-ink'
              }`}
              onClick={() => handleStatusChange(value)}
            >
              {label}
            </button>
          );
        })}
      </div>
      <div role="tabpanel">{renderList()}</div>
      {selectedSn != null && (
        <LostReportDetailModal
          lostTpofSn={selectedSn}
          onClose={() => setSelectedSn(null)}
        />
      )}
    </div>
  );
}
