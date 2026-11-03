import { generatePath, useNavigate, useSearchParams } from 'react-router-dom';
import BoardPagination from '@/components/BoardPagination';
import { BTN_SECONDARY } from '@/components/buttonStyles';
import Skeleton from '@/components/Skeleton';
import SkeletonCard from '@/components/SkeletonCard';
import CommentFilter from '@/features/adminCommunity/CommentFilter';
import CommentTable from '@/features/adminCommunity/CommentTable';
import PostFilter from '@/features/adminCommunity/PostFilter';
import PostTable from '@/features/adminCommunity/PostTable';
import { useAdminPosts } from '@/features/adminCommunity/queries';
import { PATHS } from '@/routes/paths';
import { isForbiddenError } from '@/utils/isForbiddenError';
import AdminForbidden from './AdminForbidden';

const PAGE_SIZE = 20;

const TABS = [
  { key: 'posts', label: '게시글' },
  { key: 'comments', label: '댓글' },
];

/** 필터 칸 이름 */
const FILTER_NAMES = ['q', 'bbsCd', 'status', 'bgngYmd', 'endYmd'];

/** 값이 있는 칸만 남긴 객체 */
const pickFilled = (filter) =>
  Object.fromEntries(Object.entries(filter).filter(([, value]) => value));

/** 필터 줄 + 표 20행 + 쪽 번호 자리 */
function PostListSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true">
      <Skeleton className="h-10 w-full max-[760px]:h-[232px]" />
      <SkeletonCard className="h-[1025px]" />
      <Skeleton className="mx-auto h-9 w-64" />
    </div>
  );
}

/** 게시글 탭 */
function PostsTab() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const page = Number(searchParams.get('page')) || 1;
  const filter = Object.fromEntries(
    FILTER_NAMES.map((name) => [name, searchParams.get(name) ?? '']),
  );

  const posts = useAdminPosts({ ...pickFilled(filter), page, size: PAGE_SIZE });

  const handleRetry = () => posts.refetch();
  const handleSearch = (nextFilter) => setSearchParams(pickFilled(nextFilter));
  const handlePageChange = (nextPage) =>
    setSearchParams({ ...pickFilled(filter), page: nextPage });
  const handleSelect = (pstSn) =>
    navigate(generatePath(PATHS.ADMIN_POST_DETAIL, { pstSn }));

  if (posts.isPending) return <PostListSkeleton />;
  if (isForbiddenError(posts.error)) {
    return <AdminForbidden message={posts.error.message} />;
  }

  /** 입력값 오류는 서버 문구, 그 밖의 오류는 다시 시도 */
  const renderList = () => {
    if (posts.error?.code === 'INVALID_INPUT_VALUE') {
      return (
        <p role="alert" className="py-16 text-center text-base text-danger">
          {posts.error.message}
        </p>
      );
    }
    if (posts.isError) {
      return (
        <div role="alert" className="flex flex-col items-center gap-3 py-16">
          <p className="text-base text-subtle">
            게시글 목록을 불러오지 못했어요.
          </p>
          <button type="button" className={BTN_SECONDARY} onClick={handleRetry}>
            다시 시도
          </button>
        </div>
      );
    }
    if (posts.data.content.length === 0) {
      return (
        <p className="rounded-[14px] border border-line bg-white py-16 text-center text-base text-subtle">
          조건에 맞는 게시글이 없어요
        </p>
      );
    }
    return (
      <>
        <PostTable posts={posts.data.content} onSelect={handleSelect} />
        <p className="mt-3 mb-2 text-sm text-subtle">
          총 {posts.data.totalElements.toLocaleString()}건 · {PAGE_SIZE}건씩
        </p>
        <BoardPagination
          page={page}
          totalPages={posts.data.totalPages}
          onChange={handlePageChange}
        />
      </>
    );
  };

  return (
    <>
      <PostFilter
        key={JSON.stringify(filter)}
        filter={filter}
        onSearch={handleSearch}
      />
      {renderList()}
    </>
  );
}

/** 댓글 탭 */
function CommentsTab() {
  const [searchParams, setSearchParams] = useSearchParams();

  const page = Number(searchParams.get('page')) || 1;
  const q = searchParams.get('q') ?? '';

  const handleSearch = (nextQ) =>
    setSearchParams(pickFilled({ tab: 'comments', q: nextQ }));
  const handlePageChange = (nextPage) =>
    setSearchParams(pickFilled({ tab: 'comments', q, page: nextPage }));

  return (
    <>
      <CommentFilter key={q} q={q} onSearch={handleSearch} />
      <CommentTable
        params={{ ...pickFilled({ q }), page, size: PAGE_SIZE }}
        onPageChange={handlePageChange}
      />
    </>
  );
}

/**
 * [게시글·댓글]
 * - 탭은 ?tab=comments, 첫 탭은 게시글
 * - 탭을 바꾸면 필터와 쪽 번호 초기화
 */
export default function AdminPostsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const tab = searchParams.get('tab') === 'comments' ? 'comments' : 'posts';

  const handleTabSelect = (nextTab) =>
    setSearchParams(nextTab === 'comments' ? { tab: nextTab } : {});

  return (
    <div className="mx-auto max-w-[1200px]">
      <h1 className="mb-5 text-2xl font-bold text-ink">게시글·댓글</h1>
      <div
        role="tablist"
        aria-label="게시글·댓글"
        className="mb-4 flex gap-1 overflow-x-auto shadow-[inset_0_-1px_0_var(--color-line)] [scrollbar-width:none]"
      >
        {TABS.map(({ key, label }) => {
          const isSelected = key === tab;
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
      <div role="tabpanel">
        {tab === 'comments' ? <CommentsTab /> : <PostsTab />}
      </div>
    </div>
  );
}
