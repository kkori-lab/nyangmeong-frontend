import { useSearchParams } from 'react-router-dom';
import BoardPagination from '@/components/BoardPagination';
import { BTN_SECONDARY } from '@/components/buttonStyles';
import Skeleton from '@/components/Skeleton';
import SkeletonCard from '@/components/SkeletonCard';
import NotificationLogFilter from '@/features/adminNotificationLog/NotificationLogFilter';
import NotificationLogTable from '@/features/adminNotificationLog/NotificationLogTable';
import {
  useAdminNotificationLogs,
  useNotificationChannels,
  useNotificationTypes,
  useSendingResults,
} from '@/features/adminNotificationLog/queries';
import { isForbiddenError } from '@/utils/isForbiddenError';
import AdminForbidden from './AdminForbidden';

const PAGE_SIZE = 20;

/** 필터 칸 이름(URL 쿼리와 같다) */
const FILTER_NAMES = [
  'bgngYmd',
  'endYmd',
  'notiChnlCd',
  'notiTypeCd',
  'sndngRsltCd',
];

/** 값이 있는 칸만 남긴 객체 */
const pickFilled = (filter) =>
  Object.fromEntries(Object.entries(filter).filter(([, value]) => value));

/** 필터 줄 + 표 20행 + 쪽 번호 자리 */
function NotificationLogSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true">
      <Skeleton className="h-10 w-full max-w-[900px] max-[760px]:h-[276px]" />
      <SkeletonCard className="h-[960px]" />
      <Skeleton className="mx-auto h-9 w-64" />
    </div>
  );
}

export default function AdminNotificationLogsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const page = Number(searchParams.get('page')) || 1;
  const filter = Object.fromEntries(
    FILTER_NAMES.map((name) => [name, searchParams.get(name) ?? '']),
  );

  const logs = useAdminNotificationLogs({
    ...pickFilled(filter),
    page,
    size: PAGE_SIZE,
  });
  const channels = useNotificationChannels();
  const types = useNotificationTypes();
  const results = useSendingResults();

  const handleRetry = () => logs.refetch();
  const handleSearch = (nextFilter) => setSearchParams(pickFilled(nextFilter));
  const handlePageChange = (nextPage) =>
    setSearchParams({ ...pickFilled(filter), page: nextPage });

  /** 본문: 로딩 / 403 / 입력값 오류(서버 문구) / 그 밖의 오류 / 목록 */
  const renderBody = () => {
    if (
      logs.isPending ||
      channels.isPending ||
      types.isPending ||
      results.isPending
    ) {
      return <NotificationLogSkeleton />;
    }
    if (isForbiddenError(logs.error)) {
      return <AdminForbidden message={logs.error.message} />;
    }
    return (
      <>
        <NotificationLogFilter
          key={JSON.stringify(filter)}
          filter={filter}
          channels={channels.data}
          types={types.data}
          results={results.data}
          onSearch={handleSearch}
        />
        {logs.error?.code === 'INVALID_INPUT_VALUE' ? (
          <p role="alert" className="py-16 text-center text-base text-danger">
            {logs.error.message}
          </p>
        ) : logs.isError ? (
          <div role="alert" className="flex flex-col items-center gap-3 py-16">
            <p className="text-base text-subtle">
              발송 이력을 불러오지 못했어요.
            </p>
            <button
              type="button"
              className={BTN_SECONDARY}
              onClick={handleRetry}
            >
              다시 시도
            </button>
          </div>
        ) : logs.data.content.length === 0 ? (
          <p className="rounded-[14px] border border-line bg-white py-16 text-center text-base text-subtle">
            발송 이력이 없어요
          </p>
        ) : (
          <>
            <NotificationLogTable
              logs={logs.data.content}
              channels={channels.data}
              types={types.data}
              results={results.data}
            />
            <p className="mt-3 mb-2 text-sm text-subtle">
              총 {logs.data.totalElements.toLocaleString()}건 · {PAGE_SIZE}건씩
            </p>
            <BoardPagination
              page={page}
              totalPages={logs.data.totalPages}
              onChange={handlePageChange}
            />
          </>
        )}
      </>
    );
  };

  return (
    <div className="mx-auto max-w-[1200px]">
      <h1 className="mb-5 text-2xl font-bold text-ink">발송 이력</h1>
      {renderBody()}
    </div>
  );
}
