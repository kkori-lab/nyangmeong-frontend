import { useState } from 'react';
import { generatePath, useNavigate, useSearchParams } from 'react-router-dom';
import BoardPagination from '@/components/BoardPagination';
import { BTN_PRIMARY, BTN_SECONDARY } from '@/components/buttonStyles';
import Skeleton from '@/components/Skeleton';
import SkeletonCard from '@/components/SkeletonCard';
import { useAdminSuspensions } from '@/features/adminMember/queries';
import ReleaseModal from '@/features/adminMember/ReleaseModal';
import SuspendModal from '@/features/adminMember/SuspendModal';
import SuspensionFilter from '@/features/adminMember/SuspensionFilter';
import SuspensionTable from '@/features/adminMember/SuspensionTable';
import { PATHS } from '@/routes/paths';
import { isForbiddenError } from '@/utils/isForbiddenError';
import AdminForbidden from './AdminForbidden';

const PAGE_SIZE = 20;

/** 값이 있는 칸만 남긴 객체 */
const pickFilled = (filter) =>
  Object.fromEntries(Object.entries(filter).filter(([, value]) => value));

/** 필터 줄 + 표 20행 + 쪽 번호 자리 */
function SuspensionListSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true">
      <Skeleton className="h-10 w-full max-[760px]:h-[184px]" />
      <SkeletonCard className="h-[1008px]" />
      <Skeleton className="mx-auto h-9 w-64" />
    </div>
  );
}

export default function AdminMemberSuspensionsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isSuspendOpen, setIsSuspendOpen] = useState(false);
  const [releaseTarget, setReleaseTarget] = useState(null);

  const page = Number(searchParams.get('page')) || 1;
  const filter = {
    q: searchParams.get('q') ?? '',
    type: searchParams.get('type') ?? '',
  };

  const suspensions = useAdminSuspensions({
    ...pickFilled(filter),
    page,
    size: PAGE_SIZE,
  });

  /** 쪽의 마지막 행이 사라지면 앞쪽으로 */
  const isPageEmptied =
    page > 1 &&
    !suspensions.isPlaceholderData &&
    suspensions.data?.content.length === 0 &&
    suspensions.data.totalElements > 0;

  const handleRetry = () => suspensions.refetch();
  const handleSearch = (nextFilter) => setSearchParams(pickFilled(nextFilter));
  const handlePageChange = (nextPage) =>
    setSearchParams({ ...pickFilled(filter), page: nextPage });
  const handleSelect = (mbrSn) =>
    navigate(generatePath(PATHS.ADMIN_MEMBER_DETAIL, { mbrSn }));
  const handleSuspendOpen = () => setIsSuspendOpen(true);
  const handleSuspendClose = () => setIsSuspendOpen(false);
  const handleReleaseClose = () => setReleaseTarget(null);

  /** 본문: 로딩 / 403 / 그 밖의 오류 / 목록 */
  const renderBody = () => {
    if (suspensions.isPending) return <SuspensionListSkeleton />;
    if (isForbiddenError(suspensions.error)) {
      return <AdminForbidden message={suspensions.error.message} />;
    }
    return (
      <>
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <SuspensionFilter
            key={JSON.stringify(filter)}
            filter={filter}
            onSearch={handleSearch}
          />
          <button
            type="button"
            className={`${BTN_PRIMARY} max-[760px]:w-full`}
            onClick={handleSuspendOpen}
          >
            회원 정지
          </button>
        </div>
        {suspensions.isError ? (
          <div role="alert" className="flex flex-col items-center gap-3 py-16">
            <p className="text-base text-subtle">
              정지 회원 목록을 불러오지 못했어요.
            </p>
            <button
              type="button"
              className={BTN_SECONDARY}
              onClick={handleRetry}
            >
              다시 시도
            </button>
          </div>
        ) : isPageEmptied ? (
          <div className="flex flex-col items-center gap-3 py-16">
            <p className="text-base text-subtle">이 쪽에 남은 회원이 없어요</p>
            <button
              type="button"
              className={BTN_SECONDARY}
              onClick={() => handlePageChange(suspensions.data.totalPages)}
            >
              마지막 쪽으로
            </button>
          </div>
        ) : suspensions.data.content.length === 0 ? (
          <p className="rounded-[14px] border border-line bg-white py-16 text-center text-base text-subtle">
            정지 중인 회원이 없어요
          </p>
        ) : (
          <>
            <SuspensionTable
              suspensions={suspensions.data.content}
              onSelect={handleSelect}
              onRelease={setReleaseTarget}
            />
            <p className="mt-3 mb-2 text-sm text-subtle">
              총 {suspensions.data.totalElements.toLocaleString()}건 ·{' '}
              {PAGE_SIZE}건씩
            </p>
            <BoardPagination
              page={page}
              totalPages={suspensions.data.totalPages}
              onChange={handlePageChange}
            />
          </>
        )}
      </>
    );
  };

  return (
    <div className="mx-auto max-w-[1200px]">
      <h1 className="mb-5 text-2xl font-bold text-ink">회원 제재</h1>
      {renderBody()}
      {isSuspendOpen && <SuspendModal onClose={handleSuspendClose} />}
      {releaseTarget && (
        <ReleaseModal member={releaseTarget} onClose={handleReleaseClose} />
      )}
    </div>
  );
}
