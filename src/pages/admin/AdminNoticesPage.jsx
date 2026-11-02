import {
  generatePath,
  Link,
  useNavigate,
  useSearchParams,
} from 'react-router-dom';
import BoardPagination from '@/components/BoardPagination';
import { BTN_PRIMARY, BTN_SECONDARY } from '@/components/buttonStyles';
import Skeleton from '@/components/Skeleton';
import SkeletonCard from '@/components/SkeletonCard';
import NoticeSearch from '@/features/adminNotice/NoticeSearch';
import NoticeTable from '@/features/adminNotice/NoticeTable';
import { useAdminNotices } from '@/features/adminNotice/queries';
import { PATHS } from '@/routes/paths';
import { isForbiddenError } from '@/utils/isForbiddenError';
import AdminForbidden from './AdminForbidden';

const PAGE_SIZE = 20;

/** 검색 줄 + 표 20행 + 쪽 번호 자리 */
function NoticeListSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true">
      <Skeleton className="h-10 w-full max-[760px]:h-[136px]" />
      <SkeletonCard className="h-[1025px]" />
      <Skeleton className="mx-auto h-9 w-64" />
    </div>
  );
}

/**
 * [공지사항]
 * - 고정 공지 먼저, 그다음 최신순. 제목 검색은 ?keyword=
 * - 행 클릭 -> 공지 수정, [공지 등록] -> 등록
 */
export default function AdminNoticesPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const page = Number(searchParams.get('page')) || 1;
  const keyword = searchParams.get('keyword') ?? '';
  const keywordParams = keyword ? { keyword } : {};

  const notices = useAdminNotices({ ...keywordParams, page, size: PAGE_SIZE });

  const handleRetry = () => notices.refetch();
  const handleSearch = (nextKeyword) =>
    setSearchParams(nextKeyword ? { keyword: nextKeyword } : {});
  const handlePageChange = (nextPage) =>
    setSearchParams({ ...keywordParams, page: nextPage });
  const handleSelect = (ntcMttrSn) =>
    navigate(generatePath(PATHS.ADMIN_NOTICE_EDIT, { ntcMttrSn }));

  /** 본문: 로딩 / 403 / 그 밖의 오류 / 빈 목록 / 목록 */
  const renderBody = () => {
    if (notices.isPending) return <NoticeListSkeleton />;
    if (isForbiddenError(notices.error)) {
      return <AdminForbidden message={notices.error.message} />;
    }

    const renderList = () => {
      if (notices.isError) {
        return (
          <div role="alert" className="flex flex-col items-center gap-3 py-16">
            <p className="text-base text-subtle">
              공지 목록을 불러오지 못했어요.
            </p>
            <button
              type="button"
              className={BTN_SECONDARY}
              onClick={handleRetry}
            >
              다시 시도
            </button>
          </div>
        );
      }
      if (notices.data.content.length === 0) {
        return (
          <p className="rounded-[14px] border border-line bg-white py-16 text-center text-base text-subtle">
            {keyword ? '조건에 맞는 공지가 없어요' : '등록된 공지가 없어요'}
          </p>
        );
      }
      return (
        <>
          <NoticeTable notices={notices.data.content} onSelect={handleSelect} />
          <p className="mt-3 mb-2 text-sm text-subtle">
            총 {notices.data.totalElements.toLocaleString()}건 · {PAGE_SIZE}
            건씩
          </p>
          <BoardPagination
            page={page}
            totalPages={notices.data.totalPages}
            onChange={handlePageChange}
          />
        </>
      );
    };

    return (
      <>
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <NoticeSearch
            key={keyword}
            keyword={keyword}
            onSearch={handleSearch}
          />
          <Link
            to={PATHS.ADMIN_NOTICE_NEW}
            className={`${BTN_PRIMARY} max-[760px]:w-full`}
          >
            공지 등록
          </Link>
        </div>
        {renderList()}
      </>
    );
  };

  return (
    <div className="mx-auto max-w-[1200px]">
      <h1 className="mb-5 text-2xl font-bold text-ink">공지사항</h1>
      {renderBody()}
    </div>
  );
}
