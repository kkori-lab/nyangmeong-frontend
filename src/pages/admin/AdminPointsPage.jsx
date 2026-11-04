import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import BoardPagination from '@/components/BoardPagination';
import { BTN_PRIMARY, BTN_SECONDARY } from '@/components/buttonStyles';
import Skeleton from '@/components/Skeleton';
import SkeletonCard from '@/components/SkeletonCard';
import PointAdjustModal from '@/features/adminPoint/PointAdjustModal';
import PointLedgerFilter from '@/features/adminPoint/PointLedgerFilter';
import PointLedgerTable from '@/features/adminPoint/PointLedgerTable';
import {
  useAdminPointLedgers,
  useAdminPointMember,
  usePointDealTypes,
} from '@/features/adminPoint/queries';
import { isForbiddenError } from '@/utils/isForbiddenError';
import AdminForbidden from './AdminForbidden';

const PAGE_SIZE = 20;

/** 필터 칸 이름(URL 쿼리와 같다) */
const FILTER_NAMES = ['mbrSn', 'mbrNcnm', 'pntDlngTypeCd', 'fromDt', 'toDt'];

/** 값이 있는 칸만 남긴 객체 */
const pickFilled = (filter) =>
  Object.fromEntries(Object.entries(filter).filter(([, value]) => value));

/** 필터 줄 + 표 20행 + 쪽 번호 자리 */
function PointLedgerSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true">
      <Skeleton className="h-10 w-full max-w-[860px] max-[760px]:h-[208px]" />
      <SkeletonCard className="h-[960px]" />
      <Skeleton className="mx-auto h-9 w-64" />
    </div>
  );
}

/**
 * [포인트]
 * - 원장 조회(FN-ADM-072-01): 필터는 URL 쿼리, 회원 상세 [포인트 조정]에서 오면 ?mbrSn=으로 그 회원이 걸린다
 * - [포인트 조정] -> 조정 모달(FN-ADM-072-02), ?mbrSn=이면 그 회원을 미리 고른다
 */
export default function AdminPointsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isAdjusting, setIsAdjusting] = useState(false);

  const page = Number(searchParams.get('page')) || 1;
  const filter = Object.fromEntries(
    FILTER_NAMES.map((name) => [name, searchParams.get(name) ?? '']),
  );
  const mbrSn = Number(filter.mbrSn) || null;

  const ledgers = useAdminPointLedgers({
    ...pickFilled(filter),
    page,
    size: PAGE_SIZE,
  });
  const dealTypes = usePointDealTypes();
  const member = useAdminPointMember(mbrSn);

  const handleRetry = () => ledgers.refetch();
  const handleSearch = (nextFilter) => setSearchParams(pickFilled(nextFilter));
  const handlePageChange = (nextPage) =>
    setSearchParams({ ...pickFilled(filter), page: nextPage });

  /** 본문: 로딩 / 403 / 그 밖의 오류 / 목록 */
  const renderBody = () => {
    if (ledgers.isPending || dealTypes.isPending) {
      return <PointLedgerSkeleton />;
    }
    if (isForbiddenError(ledgers.error)) {
      return <AdminForbidden message={ledgers.error.message} />;
    }
    return (
      <>
        <PointLedgerFilter
          key={JSON.stringify(filter)}
          filter={filter}
          dealTypes={dealTypes.data}
          memberName={member.data?.mbrNcnm}
          onSearch={handleSearch}
        />
        {ledgers.isError ? (
          <div role="alert" className="flex flex-col items-center gap-3 py-16">
            <p className="text-base text-subtle">
              포인트 원장을 불러오지 못했어요.
            </p>
            <button
              type="button"
              className={BTN_SECONDARY}
              onClick={handleRetry}
            >
              다시 시도
            </button>
          </div>
        ) : ledgers.data.content.length === 0 ? (
          <p className="rounded-[14px] border border-line bg-white py-16 text-center text-base text-subtle">
            조건에 맞는 포인트 거래가 없어요
          </p>
        ) : (
          <>
            <PointLedgerTable ledgers={ledgers.data.content} />
            <p className="mt-3 mb-2 text-sm text-subtle">
              총 {ledgers.data.totalElements.toLocaleString()}건 · {PAGE_SIZE}
              건씩
            </p>
            <BoardPagination
              page={page}
              totalPages={ledgers.data.totalPages}
              onChange={handlePageChange}
            />
          </>
        )}
      </>
    );
  };

  /** ?mbrSn= 회원을 미리 고른다(이름을 못 받았으면 고르지 않음) */
  const initialMember =
    mbrSn && member.data ? { mbrSn, mbrNcnm: member.data.mbrNcnm } : null;

  return (
    <div className="mx-auto max-w-[1200px]">
      <div className="mb-5 flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-ink">포인트</h1>
        <button
          type="button"
          className={BTN_PRIMARY}
          onClick={() => setIsAdjusting(true)}
        >
          포인트 조정
        </button>
      </div>
      {renderBody()}
      {isAdjusting && (
        <PointAdjustModal
          initialMember={initialMember}
          onClose={() => setIsAdjusting(false)}
        />
      )}
    </div>
  );
}
