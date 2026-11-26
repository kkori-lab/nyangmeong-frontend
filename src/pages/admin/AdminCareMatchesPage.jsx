import { useLocation, useSearchParams } from 'react-router-dom';
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
import LoadError from '@/components/LoadError';
import AdminPageFrame from './AdminPageFrame';

const PAGE_SIZE = 20;

/** ?mbrSn=: 양의 정수만 쓰고 나머지는 무시(전체 목록) */
const toMbrSn = (raw) => {
  const value = Number(raw);
  return raw && Number.isInteger(value) && value > 0 ? value : null;
};

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
 * - ?mbrSn=<회원 번호>면 그 회원이 보호자·돌보미로 낀 모집글만 보인다(FN-ADM-042-08). 탭·쪽 이동에도 유지
 */
export default function AdminCareMatchesPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const page = Number(searchParams.get('page')) || 1;
  const status = searchParams.get('rcrtSttsCd') ?? '';
  const selectedSn = searchParams.get('rcrtSn');
  const mbrSn = toMbrSn(searchParams.get('mbrSn'));
  const location = useLocation();
  const memberName = location.state?.mbrNcnm ?? `회원 ${mbrSn}`;

  const recruits = useAdminCareRecruits({
    ...(mbrSn && { mbrSn }),
    ...(status && { rcrtSttsCd: status }),
    page,
    size: PAGE_SIZE,
  });

  /** 목록 조건은 두고 모달 번호만 바꾼다 */
  const setSelectedSn = (petPrtcRcrtSn) =>
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (petPrtcRcrtSn == null) next.delete('rcrtSn');
        else next.set('rcrtSn', petPrtcRcrtSn);
        return next;
      },
      { state: location.state },
    );
  /** 탭·쪽을 바꿔도 회원 조건과 화면에 보일 이름은 남긴다 */
  const keepState = { state: location.state };
  const handleStatusChange = (nextStatus) =>
    setSearchParams(
      {
        ...(mbrSn && { mbrSn }),
        ...(nextStatus && { rcrtSttsCd: nextStatus }),
      },
      keepState,
    );
  const handlePageChange = (nextPage) =>
    setSearchParams(
      {
        ...(mbrSn && { mbrSn }),
        ...(status && { rcrtSttsCd: status }),
        page: nextPage,
      },
      keepState,
    );
  const handleClearMember = () =>
    setSearchParams(status ? { rcrtSttsCd: status } : {});

  /** 목록: 로딩 / 그 밖의 오류 / 빈 결과 / 목록 */
  const renderList = () => {
    if (recruits.isPending) return <CareRecruitSkeleton />;
    if (recruits.isError) {
      return (
        <LoadError
          message={
            recruits.error?.message || '펫돌봄 모집글을 불러오지 못했어요.'
          }
          onRetry={() => recruits.refetch()}
        />
      );
    }
    if (recruits.data.content.length === 0) {
      return (
        <p className="rounded-[14px] border border-line bg-white py-16 text-center text-base text-subtle">
          {mbrSn
            ? '이 회원이 낀 펫돌봄 모집글이 없어요'
            : '펫돌봄 모집글이 없어요'}
        </p>
      );
    }
    return (
      <>
        <CareRecruitTable
          recruits={recruits.data.content}
          onSelect={setSelectedSn}
          viewerMbrSn={mbrSn ?? undefined}
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
      <AdminPageFrame title="펫돌봄 거래">
        <AdminForbidden message={recruits.error.message} />
      </AdminPageFrame>
    );
  }

  return (
    <AdminPageFrame title="펫돌봄 거래">
      {mbrSn && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-[14px] border border-line bg-white px-4 py-3">
          <p className="text-base text-ink-2">
            <span className="font-semibold text-ink">{memberName}</span> 회원이
            보호자·돌보미로 낀 모집글
          </p>
          <button
            type="button"
            className={`${BTN_SECONDARY} text-sm`}
            onClick={handleClearMember}
          >
            전체 보기
          </button>
        </div>
      )}
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
    </AdminPageFrame>
  );
}
