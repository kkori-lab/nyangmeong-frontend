import { Link, useSearchParams } from 'react-router-dom';
import BoardPagination from '@/components/BoardPagination';
import { BTN_SECONDARY } from '@/components/buttonStyles';
import Skeleton from '@/components/Skeleton';
import SkeletonCard from '@/components/SkeletonCard';
import { useAdminWithdrawnMembers } from '@/features/adminMember/queries';
import WithdrawnTable from '@/features/adminMember/WithdrawnTable';
import { BATCH_SE } from '@/features/batch/batchLabels';
import { PATHS } from '@/routes/paths';
import { isForbiddenError } from '@/utils/isForbiddenError';
import AdminForbidden from './AdminForbidden';

const PAGE_SIZE = 20;

/** 표 20행 + 쪽 번호 자리 */
function WithdrawnListSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true">
      <SkeletonCard className="h-[1025px]" />
      <Skeleton className="mx-auto h-9 w-64" />
    </div>
  );
}

export default function AdminMembersWithdrawnPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get('page')) || 1;

  const withdrawn = useAdminWithdrawnMembers({ page, size: PAGE_SIZE });

  const handleRetry = () => withdrawn.refetch();
  const handlePageChange = (nextPage) => setSearchParams({ page: nextPage });

  /** 본문: 로딩 / 403 / 그 밖의 오류 / 목록 */
  const renderBody = () => {
    if (withdrawn.isPending) return <WithdrawnListSkeleton />;
    if (isForbiddenError(withdrawn.error)) {
      return <AdminForbidden message={withdrawn.error.message} />;
    }
    if (withdrawn.isError) {
      return (
        <div role="alert" className="flex flex-col items-center gap-3 py-16">
          <p className="text-base text-subtle">
            탈퇴 회원 목록을 불러오지 못했어요.
          </p>
          <button type="button" className={BTN_SECONDARY} onClick={handleRetry}>
            다시 시도
          </button>
        </div>
      );
    }
    if (withdrawn.data.content.length === 0) {
      return (
        <p className="rounded-[14px] border border-line bg-white py-16 text-center text-base text-subtle">
          보관 중인 탈퇴 회원이 없어요
        </p>
      );
    }
    return (
      <>
        <WithdrawnTable members={withdrawn.data.content} />
        <p className="mt-3 mb-2 text-sm text-subtle">
          총 {withdrawn.data.totalElements.toLocaleString()}건 · {PAGE_SIZE}건씩
        </p>
        <BoardPagination
          page={page}
          totalPages={withdrawn.data.totalPages}
          onChange={handlePageChange}
        />
      </>
    );
  };

  return (
    <div className="mx-auto max-w-[1200px]">
      <h1 className="mb-5 text-2xl font-bold text-ink">탈퇴 회원</h1>
      {renderBody()}
      <p className="mt-4 text-sm text-subtle">
        파기는 매일 배치가 처리해요. 결과는 배치 현황에서 볼 수 있어요.{' '}
        <Link
          to={`${PATHS.ADMIN_BATCHES}?batch=${BATCH_SE.MEMBER_PURGE}`}
          className="font-semibold text-brand-900 hover:underline"
        >
          배치 현황
        </Link>
      </p>
    </div>
  );
}
