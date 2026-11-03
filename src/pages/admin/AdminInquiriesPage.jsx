import { generatePath, useNavigate, useSearchParams } from 'react-router-dom';
import BoardPagination from '@/components/BoardPagination';
import { BTN_SECONDARY } from '@/components/buttonStyles';
import Skeleton from '@/components/Skeleton';
import SkeletonCard from '@/components/SkeletonCard';
import InquiryFilter from '@/features/adminInquiry/InquiryFilter';
import { INQUIRY_STATUS_OPTIONS } from '@/features/adminInquiry/inquiryLabels';
import InquiryTable from '@/features/adminInquiry/InquiryTable';
import { useAdminInquiries } from '@/features/adminInquiry/queries';
import { PATHS } from '@/routes/paths';
import { isForbiddenError } from '@/utils/isForbiddenError';
import AdminForbidden from './AdminForbidden';

const PAGE_SIZE = 20;

const TABS = [
  { key: '', label: '전체' },
  ...INQUIRY_STATUS_OPTIONS.map(({ value, label }) => ({ key: value, label })),
];

/** 필터 칸 이름(상태 탭은 따로) */
const FILTER_NAMES = [
  'inqryTypeCd',
  'inqryCtgr',
  'bgngYmd',
  'endYmd',
  'inclDelYn',
];

/** 값이 있는 칸만 남긴 객체 */
const pickFilled = (filter) =>
  Object.fromEntries(Object.entries(filter).filter(([, value]) => value));

/** 필터 줄 + 표 20행 + 쪽 번호 자리 */
function InquiryListSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true">
      <Skeleton className="h-10 w-full max-[760px]:h-[232px]" />
      <SkeletonCard className="h-[1025px]" />
      <Skeleton className="mx-auto h-9 w-64" />
    </div>
  );
}

/**
 * [1:1 문의]
 * - 상태 탭은 ?inqryPrcsSttsCd=, 필터·쪽 번호도 쿼리에 둬 상세에서 돌아와도 유지
 * - 탭이나 필터를 바꾸면 1쪽으로
 */
export default function AdminInquiriesPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const status = searchParams.get('inqryPrcsSttsCd') ?? '';
  const page = Number(searchParams.get('page')) || 1;
  const filter = Object.fromEntries(
    FILTER_NAMES.map((name) => [name, searchParams.get(name) ?? '']),
  );

  const inquiries = useAdminInquiries({
    ...pickFilled({ ...filter, inqryPrcsSttsCd: status }),
    page,
    size: PAGE_SIZE,
  });

  const handleRetry = () => inquiries.refetch();
  const handleTabSelect = (nextStatus) =>
    setSearchParams(pickFilled({ ...filter, inqryPrcsSttsCd: nextStatus }));
  const handleSearch = (nextFilter) =>
    setSearchParams(pickFilled({ ...nextFilter, inqryPrcsSttsCd: status }));
  const handlePageChange = (nextPage) =>
    setSearchParams({
      ...pickFilled({ ...filter, inqryPrcsSttsCd: status }),
      page: nextPage,
    });
  /** 상세의 [목록으로]가 지금 필터로 돌아오도록 쿼리를 넘긴다 */
  const handleSelect = (otoInqrySn) =>
    navigate(generatePath(PATHS.ADMIN_INQUIRY_DETAIL, { otoInqrySn }), {
      state: { listSearch: `?${searchParams.toString()}` },
    });

  /** 입력값 오류는 서버 문구, 그 밖의 오류는 다시 시도 */
  const renderList = () => {
    if (inquiries.error?.code === 'INVALID_INPUT_VALUE') {
      return (
        <p role="alert" className="py-16 text-center text-base text-danger">
          {inquiries.error.message}
        </p>
      );
    }
    if (inquiries.isError) {
      return (
        <div role="alert" className="flex flex-col items-center gap-3 py-16">
          <p className="text-base text-subtle">
            문의 목록을 불러오지 못했어요.
          </p>
          <button type="button" className={BTN_SECONDARY} onClick={handleRetry}>
            다시 시도
          </button>
        </div>
      );
    }
    if (inquiries.data.content.length === 0) {
      return (
        <p className="rounded-[14px] border border-line bg-white py-16 text-center text-base text-subtle">
          조건에 맞는 문의가 없어요
        </p>
      );
    }
    return (
      <>
        <InquiryTable
          inquiries={inquiries.data.content}
          onSelect={handleSelect}
        />
        <p className="mt-3 mb-2 text-sm text-subtle">
          총 {inquiries.data.totalElements.toLocaleString()}건 · {PAGE_SIZE}
          건씩
        </p>
        <BoardPagination
          page={page}
          totalPages={inquiries.data.totalPages}
          onChange={handlePageChange}
        />
      </>
    );
  };

  const renderBody = () => {
    if (inquiries.isPending) return <InquiryListSkeleton />;
    if (isForbiddenError(inquiries.error)) {
      return <AdminForbidden message={inquiries.error.message} />;
    }
    return (
      <>
        <InquiryFilter
          key={JSON.stringify(filter)}
          filter={filter}
          onSearch={handleSearch}
        />
        {renderList()}
      </>
    );
  };

  return (
    <div className="mx-auto max-w-[1200px]">
      <h1 className="mb-5 text-2xl font-bold text-ink">1:1 문의</h1>
      <div
        role="tablist"
        aria-label="문의 처리 상태"
        className="mb-4 flex gap-1 overflow-x-auto shadow-[inset_0_-1px_0_var(--color-line)] [scrollbar-width:none]"
      >
        {TABS.map(({ key, label }) => {
          const isSelected = key === status;
          return (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={isSelected}
              className={`relative h-12 shrink-0 px-4 text-base whitespace-nowrap ${
                isSelected
                  ? 'font-bold text-brand-900 after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:bg-brand-900'
                  : 'font-semibold text-subtle hover:text-ink'
              }`}
              onClick={() => handleTabSelect(key)}
            >
              {label}
            </button>
          );
        })}
      </div>
      <div role="tabpanel">{renderBody()}</div>
    </div>
  );
}
