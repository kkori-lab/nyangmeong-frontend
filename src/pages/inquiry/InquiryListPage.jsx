import { Navigate, useSearchParams } from 'react-router-dom';
import PageSkeleton from '@/components/PageSkeleton';
import Skeleton from '@/components/Skeleton';
import SkeletonCard from '@/components/SkeletonCard';
import { INQUIRY_STATUS } from '@/features/inquiry/api';
import InquiryList from '@/features/inquiry/InquiryList';
import { useInquiries } from '@/features/inquiry/queries';
import { PATHS } from '@/routes/paths';

const PAGE_SIZE = 10;
const STATUS_VALUES = Object.values(INQUIRY_STATUS);

export default function InquiryListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get('page')) || 1;
  const statusParam = searchParams.get('status');
  const status = STATUS_VALUES.includes(statusParam) ? statusParam : '';
  const {
    data: inquiries,
    isPending,
    isFetching,
    isError,
  } = useInquiries({ page, size: PAGE_SIZE, status });
  /** 서버 목록은 필터와 관계없는 전체 건수를 주지 않는다: 필터가 켜졌을 때만 필터 없이 1건을 따로 물어 전체 건수(totalElements)를 얻는다 */
  const {
    data: allInquiries,
    isFetching: isAllFetching,
    isError: isAllError,
  } = useInquiries(
    { page: 1, size: 1, status: '' },
    { enabled: status !== '' },
  );

  /** 상태가 바뀌면 첫 쪽부터 */
  const handleStatusChange = (nextStatus) =>
    setSearchParams(nextStatus ? { status: nextStatus } : {});

  const handlePageChange = (nextPage) =>
    setSearchParams({ ...(status && { status }), page: nextPage });

  if (isPending) return <InquiryListSkeleton />;
  if (isError || isAllError) {
    return (
      <p role="alert" className="text-[#566465]">
        문의를 불러오지 못했어요. 잠시 뒤 다시 시도해 주세요
      </p>
    );
  }

  /** 문의 이력이 없으면 목록을 건너뛰고 작성 화면이 첫 화면 */
  const total = status ? allInquiries?.totalElements : inquiries.totalElements;
  if (total === 0) {
    /** 다시 가져오는 중에는 캐시에 남은 옛 0건으로 판단하지 않는다 */
    if (isFetching || isAllFetching) return <InquiryListSkeleton />;
    return <Navigate to={PATHS.INQUIRY_NEW} replace />;
  }

  return (
    <InquiryList
      inquiries={inquiries}
      status={status}
      onStatusChange={handleStatusChange}
      onPageChange={handlePageChange}
    />
  );
}

/** 로딩 자리: 상태 탭 + 목록 카드 + 쪽 번호 */
function InquiryListSkeleton() {
  return (
    <PageSkeleton>
      <div
        aria-hidden="true"
        className="flex min-h-[72px] items-center justify-between gap-3"
      >
        <div className="flex gap-6">
          {[0, 1, 2].map((index) => (
            <Skeleton key={index} className="h-6 w-16" />
          ))}
        </div>
        <Skeleton className="h-11 w-28" />
      </div>
      <SkeletonCard className="h-[699px] max-[760px]:h-[1130px]" />
      <Skeleton className="mx-auto mt-7 h-9 w-64" />
    </PageSkeleton>
  );
}
