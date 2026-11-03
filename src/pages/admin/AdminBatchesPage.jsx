import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import BoardPagination from '@/components/BoardPagination';
import { BTN_SECONDARY } from '@/components/buttonStyles';
import ConfirmModal from '@/components/ConfirmModal';
import Skeleton from '@/components/Skeleton';
import SkeletonCard from '@/components/SkeletonCard';
import BatchHistoryTable from '@/features/batch/BatchHistoryTable';
import BatchTable from '@/features/batch/BatchTable';
import {
  useBatches,
  useBatchHistory,
  useRunBatch,
} from '@/features/batch/queries';
import { isForbiddenError } from '@/utils/isForbiddenError';
import AdminForbidden from './AdminForbidden';

const PAGE_SIZE = 20;

/** 실행 이력 표 20행 + 쪽 번호 자리: 행 수는 응답 전에 알 수 없어 한 쪽이 다 찬 높이(잰 값)를 씀 */
function HistorySkeleton() {
  return (
    <div className="space-y-4" aria-busy="true">
      <SkeletonCard className="h-[1026px]" />
      <Skeleton className="mx-auto h-9 w-64" />
    </div>
  );
}

/** 배치 표 6행 + 고른 배치의 이력 자리 */
function BatchesSkeleton({ hasHistory }) {
  return (
    <div className="space-y-8" aria-busy="true">
      <SkeletonCard className="h-[436px]" />
      {hasHistory && <HistorySkeleton />}
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

export default function AdminBatchesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [runTarget, setRunTarget] = useState(null);

  const selectedBtchSeCd = searchParams.get('batch');
  const page = Number(searchParams.get('page')) || 1;

  const batches = useBatches();
  const run = useRunBatch();
  const selectedBatch = batches.data?.find(
    ({ btchSeCd }) => btchSeCd === selectedBtchSeCd,
  );
  const history = useBatchHistory(
    selectedBatch?.btchSeCd,
    { page, size: PAGE_SIZE },
    { isAnyRunning: batches.isAnyRunning },
  );

  /** 다른 쿼리는 두고 배치·쪽만 변경 */
  const changeSearchParams = (btchSeCd, nextPage) => {
    const next = new URLSearchParams(searchParams);
    next.set('batch', btchSeCd);
    if (nextPage > 1) next.set('page', nextPage);
    else next.delete('page');
    setSearchParams(next);
  };

  const handleSelect = (btchSeCd) => changeSearchParams(btchSeCd, 1);
  const handlePageChange = (nextPage) =>
    changeSearchParams(selectedBtchSeCd, nextPage);
  const handleRunCancel = () => {
    run.reset();
    setRunTarget(null);
  };
  const handleRunConfirm = () =>
    run.mutate(runTarget.btchSeCd, {
      onSuccess: () => {
        handleSelect(runTarget.btchSeCd);
        setRunTarget(null);
      },
    });

  /** 실행 이력: 로딩 / 오류 / 빈 목록 / 표 */
  const renderHistory = () => {
    if (history.isPending) return <HistorySkeleton />;
    if (history.isError) {
      return (
        <LoadError
          message="실행 이력을 불러오지 못했어요."
          onRetry={() => history.refetch()}
        />
      );
    }
    if (history.data.content.length === 0) {
      return <EmptyMessage>실행 이력이 없어요.</EmptyMessage>;
    }
    return (
      <>
        <BatchHistoryTable histories={history.data.content} />
        <p className="mt-3 mb-2 text-sm text-subtle">
          총 {history.data.totalElements.toLocaleString()}건 · {PAGE_SIZE}건씩
        </p>
        <BoardPagination
          page={page}
          totalPages={history.data.totalPages}
          onChange={handlePageChange}
        />
      </>
    );
  };

  /** 본문: 로딩 / 403 / 그 밖의 오류 / 빈 목록 / 목록 */
  const renderBody = () => {
    if (batches.isPending) {
      return <BatchesSkeleton hasHistory={Boolean(selectedBtchSeCd)} />;
    }
    if (isForbiddenError(batches.error)) {
      return <AdminForbidden message={batches.error.message} />;
    }
    if (batches.isError) {
      return (
        <LoadError
          message="배치 현황을 불러오지 못했어요."
          onRetry={() => batches.refetch()}
        />
      );
    }
    if (batches.data.length === 0) {
      return <EmptyMessage>배치가 없어요.</EmptyMessage>;
    }
    return (
      <>
        <BatchTable
          batches={batches.data}
          selectedBtchSeCd={selectedBtchSeCd}
          onSelect={handleSelect}
          onRun={setRunTarget}
        />
        {selectedBatch && (
          <section className="mt-8">
            <h2 className="mb-3 text-lg font-bold text-ink">
              {selectedBatch.btchNm} 실행 이력
            </h2>
            {renderHistory()}
          </section>
        )}
      </>
    );
  };

  return (
    <div className="mx-auto max-w-[1200px]">
      <h1 className="mb-5 text-2xl font-bold text-ink">배치 현황</h1>
      {renderBody()}
      {runTarget && (
        <ConfirmModal
          title={`${runTarget.btchNm} 수동 실행`}
          description="지금 배치를 실행할까요?"
          confirmLabel="실행"
          errorMessage={run.error?.message}
          isPending={run.isPending}
          onConfirm={handleRunConfirm}
          onCancel={handleRunCancel}
        />
      )}
    </div>
  );
}
