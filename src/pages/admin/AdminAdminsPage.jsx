import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import BoardPagination from '@/components/BoardPagination';
import { BTN_PRIMARY, BTN_SECONDARY } from '@/components/buttonStyles';
import Skeleton from '@/components/Skeleton';
import SkeletonCard from '@/components/SkeletonCard';
import AdminTable from '@/features/adminMember/AdminTable';
import AppointAdminModal from '@/features/adminMember/AppointAdminModal';
import { useAdmins } from '@/features/adminMember/queries';
import ReleaseAdminModal from '@/features/adminMember/ReleaseAdminModal';
import { useMe } from '@/features/member/queries';
import { isForbiddenError } from '@/utils/isForbiddenError';
import AdminForbidden from './AdminForbidden';

const PAGE_SIZE = 20;

/** 지정 버튼 + 표 자리 */
function AdminListSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true">
      <Skeleton className="ml-auto h-10 w-32" />
      <SkeletonCard className="h-[240px]" />
    </div>
  );
}

export default function AdminAdminsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isAppointOpen, setIsAppointOpen] = useState(false);
  const [releaseTarget, setReleaseTarget] = useState(null);

  const page = Number(searchParams.get('page')) || 1;

  const admins = useAdmins({ page, size: PAGE_SIZE });
  const { data: me } = useMe();

  const handleRetry = () => admins.refetch();
  const handlePageChange = (nextPage) => setSearchParams({ page: nextPage });
  const handleAppointOpen = () => setIsAppointOpen(true);
  const handleAppointClose = () => setIsAppointOpen(false);
  const handleReleaseClose = () => setReleaseTarget(null);

  /** 본문: 로딩 / 403 / 그 밖의 오류 / 없음 / 목록 */
  const renderBody = () => {
    if (admins.isPending) return <AdminListSkeleton />;
    if (isForbiddenError(admins.error)) {
      return <AdminForbidden message={admins.error.message} />;
    }
    if (admins.isError) {
      return (
        <div role="alert" className="flex flex-col items-center gap-3 py-16">
          <p className="text-base text-subtle">
            관리자 목록을 불러오지 못했어요.
          </p>
          <button type="button" className={BTN_SECONDARY} onClick={handleRetry}>
            다시 시도
          </button>
        </div>
      );
    }
    return (
      <>
        <div className="mb-4 flex justify-end">
          <button
            type="button"
            className={`${BTN_PRIMARY} max-[760px]:w-full`}
            onClick={handleAppointOpen}
          >
            관리자 지정
          </button>
        </div>
        {admins.data.content.length === 0 ? (
          <p className="rounded-[14px] border border-line bg-white py-16 text-center text-base text-subtle">
            관리자가 없어요
          </p>
        ) : (
          <>
            <AdminTable
              admins={admins.data.content}
              myMbrSn={me?.mbrSn}
              isLastAdmin={admins.data.totalElements === 1}
              onRelease={setReleaseTarget}
            />
            <p className="mt-3 mb-2 text-sm text-subtle">
              총 {admins.data.totalElements.toLocaleString()}건 · {PAGE_SIZE}
              건씩
            </p>
            <BoardPagination
              page={page}
              totalPages={admins.data.totalPages}
              onChange={handlePageChange}
            />
          </>
        )}
      </>
    );
  };

  return (
    <div className="mx-auto max-w-[1200px]">
      <h1 className="mb-5 text-2xl font-bold text-ink">관리자 계정</h1>
      {renderBody()}
      {isAppointOpen && <AppointAdminModal onClose={handleAppointClose} />}
      {releaseTarget && (
        <ReleaseAdminModal admin={releaseTarget} onClose={handleReleaseClose} />
      )}
    </div>
  );
}
