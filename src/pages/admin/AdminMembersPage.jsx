import { generatePath, useNavigate, useSearchParams } from 'react-router-dom';
import BoardPagination from '@/components/BoardPagination';
import { BTN_SECONDARY } from '@/components/buttonStyles';
import Skeleton from '@/components/Skeleton';
import SkeletonCard from '@/components/SkeletonCard';
import MemberFilter from '@/features/adminMember/MemberFilter';
import MemberTable from '@/features/adminMember/MemberTable';
import { useAdminMembers } from '@/features/adminMember/queries';
import { PATHS } from '@/routes/paths';
import { isForbiddenError } from '@/utils/isForbiddenError';
import AdminForbidden from './AdminForbidden';

const PAGE_SIZE = 20;

/** 필터 칸 이름 */
const FILTER_NAMES = ['q', 'status', 'joinPath', 'role', 'bgngYmd', 'endYmd'];

/** 값이 있는 칸만 남긴 객체 */
const pickFilled = (filter) =>
  Object.fromEntries(Object.entries(filter).filter(([, value]) => value));

/** 필터 줄 + 표 20행 + 쪽 번호 자리 */
function MemberListSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true">
      <Skeleton className="h-10 w-full max-[760px]:h-[280px]" />
      <SkeletonCard className="h-[1008px]" />
      <Skeleton className="mx-auto h-9 w-64" />
    </div>
  );
}

export default function AdminMembersPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const page = Number(searchParams.get('page')) || 1;
  const filter = Object.fromEntries(
    FILTER_NAMES.map((name) => [name, searchParams.get(name) ?? '']),
  );

  const members = useAdminMembers({
    ...pickFilled(filter),
    page,
    size: PAGE_SIZE,
  });

  const handleRetry = () => members.refetch();
  const handleSearch = (nextFilter) => setSearchParams(pickFilled(nextFilter));
  const handlePageChange = (nextPage) =>
    setSearchParams({ ...pickFilled(filter), page: nextPage });
  const handleSelect = (mbrSn) =>
    navigate(generatePath(PATHS.ADMIN_MEMBER_DETAIL, { mbrSn }));

  /** 본문: 로딩 / 403 / 그 밖의 오류 / 목록 */
  const renderBody = () => {
    if (members.isPending) return <MemberListSkeleton />;
    if (isForbiddenError(members.error)) {
      return <AdminForbidden message={members.error.message} />;
    }
    return (
      <>
        <MemberFilter
          key={JSON.stringify(filter)}
          filter={filter}
          onSearch={handleSearch}
        />
        {members.isError ? (
          <div role="alert" className="flex flex-col items-center gap-3 py-16">
            <p className="text-base text-subtle">
              회원 목록을 불러오지 못했어요.
            </p>
            <button
              type="button"
              className={BTN_SECONDARY}
              onClick={handleRetry}
            >
              다시 시도
            </button>
          </div>
        ) : members.data.content.length === 0 ? (
          <p className="rounded-[14px] border border-line bg-white py-16 text-center text-base text-subtle">
            조건에 맞는 회원이 없어요
          </p>
        ) : (
          <>
            <MemberTable
              members={members.data.content}
              onSelect={handleSelect}
            />
            <p className="mt-3 mb-2 text-sm text-subtle">
              총 {members.data.totalElements.toLocaleString()}건 · {PAGE_SIZE}
              건씩
            </p>
            <BoardPagination
              page={page}
              totalPages={members.data.totalPages}
              onChange={handlePageChange}
            />
          </>
        )}
      </>
    );
  };

  return (
    <div className="mx-auto max-w-[1200px]">
      <h1 className="mb-5 text-2xl font-bold text-ink">회원 목록</h1>
      {renderBody()}
    </div>
  );
}
