import { useSearchParams } from 'react-router-dom';
import BoardPagination from '@/components/BoardPagination';
import { BTN_SECONDARY } from '@/components/buttonStyles';
import Skeleton from '@/components/Skeleton';
import SkeletonCard from '@/components/SkeletonCard';
import CareMatchDetailModal from '@/features/adminCommunity/CareMatchDetailModal';
import CareRecruitTable from '@/features/adminCommunity/CareRecruitTable';
import { RCRT_STATUS_TABS } from '@/features/adminCommunity/careMatchLabels';
import { useAdminCareRecruits } from '@/features/adminCommunity/queries';
import { isForbiddenError } from '@/utils/isForbiddenError';
import AdminForbidden from './AdminForbidden';

const PAGE_SIZE = 20;

/** 표 20행 + 쪽 번호 자리 */
function CareRecruitSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true">
      <SkeletonCard className="h-[960px] max-[760px]:h-[1400px]" />
      <Skeleton className="mx-auto h-9 w-64" />
    </div>
  );
}

/**
 * [펫돌봄 거래]
 * - ?rcrtSn=<모집글 번호>로 들어오면 그 매칭 상세 모달을 연다(1:1 문의 분쟁 대응)
 */
export default function AdminCareMatchesPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const page = Number(searchParams.get('page')) || 1;
  const status = searchParams.get('rcrtSttsCd') ?? '';
  const selectedSn = searchParams.get('rcrtSn');

  const recruits = useAdminCareRecruits({
    ...(status && { rcrtSttsCd: status }),
    page,
    size: PAGE_SIZE,
  });

  /** 목록 조건은 두고 모달 번호만 바꾼다 */
  const setSelectedSn = (petPrtcRcrtSn) =>
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (petPrtcRcrtSn == null) next.delete('rcrtSn');
      else next.set('rcrtSn', petPrtcRcrtSn);
      return next;
    });
  const handleStatusChange = (nextStatus) =>
    setSearchParams(nextStatus ? { rcrtSttsCd: nextStatus } : {});
  const handlePageChange = (nextPage) =>
    setSearchParams({
      ...(status && { rcrtSttsCd: status }),
      page: nextPage,
    });

  /** 목록: 로딩 / 그 밖의 오류 / 빈 결과 / 목록 */
  const renderList = () => {
    if (recruits.isPending) return <CareRecruitSkeleton />;
    if (recruits.isError) {
      return (
        <div role="alert" className="flex flex-col items-center gap-3 py-16">
          <p className="text-base text-subtle">
            펫돌봄 모집글을 불러오지 못했어요.
          </p>
          <button
            type="button"
            className={BTN_SECONDARY}
            onClick={() => recruits.refetch()}
          >
            다시 시도
          </button>
        </div>
      );
    }
    if (recruits.data.content.length === 0) {
      return (
        <p className="rounded-[14px] border border-line bg-white py-16 text-center text-base text-subtle">
          펫돌봄 모집글이 없어요
        </p>
      );
    }
    return (
      <>
        <CareRecruitTable
          recruits={recruits.data.content}
          onSelect={setSelectedSn}
        />
        <p className="mt-3 mb-2 text-sm text-subtle">
          총 {recruits.data.totalElements.toLocaleString()}건 · {PAGE_SIZE}건씩
        </p>
        <BoardPagination
          page={page}
          totalPages={recruits.data.totalPages}
          onChange={handlePageChange}
        />
      </>
    );
  };

  if (isForbiddenError(recruits.error)) {
    return (
      <div className="mx-auto max-w-[1200px]">
        <h1 className="mb-5 text-2xl font-bold text-ink">펫돌봄 거래</h1>
        <AdminForbidden message={recruits.error.message} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1200px]">
      <h1 className="mb-5 text-2xl font-bold text-ink">펫돌봄 거래</h1>
      <div
        role="tablist"
        aria-label="모집 상태"
        className="mb-4 flex gap-1 overflow-x-auto shadow-[inset_0_-1px_0_var(--color-line)] [scrollbar-width:none]"
      >
        {RCRT_STATUS_TABS.map(({ value, label }) => {
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
      {selectedSn && (
        <CareMatchDetailModal
          key={selectedSn}
          petPrtcRcrtSn={selectedSn}
          onClose={() => setSelectedSn(null)}
        />
      )}
    </div>
  );
}
