import { useEffect } from 'react';
import { FileX } from 'lucide-react';
import {
  generatePath,
  Link,
  Navigate,
  useNavigate,
  useParams,
} from 'react-router-dom';
import { showToast } from '@/components/toastStore';
import EmptyResult from '@/components/EmptyResult';
import PostForm from '@/features/community/PostForm';
import { usePost, useUpdatePost } from '@/features/community/queries';
import useLeaveGuard from '@/features/community/useLeaveGuard';
import SubPageLayout from '@/layouts/SubPageLayout';
import { PATHS } from '@/routes/paths';
import SkeletonCard from '@/components/SkeletonCard';

/** 로딩 자리: 폼 카드 + 오른쪽 작성 안내 레일(실제 수정 화면과 같은 배치·높이) */
function PostEditSkeleton() {
  return (
    <div
      aria-busy="true"
      className="grid grid-cols-[minmax(0,1fr)_280px] items-start gap-8 max-[1100px]:grid-cols-1 max-[1100px]:gap-10"
    >
      <SkeletonCard className="h-[944px] max-[760px]:h-[939px]" />
      <SkeletonCard className="h-[360px]" />
    </div>
  );
}

export default function PostEditPage() {
  const navigate = useNavigate();
  const pstSn = Number(useParams().pstSn);
  const { data: post, isPending, isError } = usePost(pstSn);
  const update = useUpdatePost();
  const { setDirty, onLeave, leaveModal } = useLeaveGuard();
  const detailPath = generatePath(PATHS.COMMUNITY_POST_DETAIL, { pstSn });
  /** 본인 글이 아니면 안내 후 상세로 이동 */
  const isDenied = Boolean(post) && !post.owner;

  useEffect(() => {
    if (isDenied) showToast('수정 권한이 없어요');
  }, [isDenied]);

  if (isDenied) return <Navigate to={detailPath} replace />;

  const handleSubmit = (values) =>
    update.mutate(
      { pstSn, ...values },
      { onSuccess: () => navigate(detailPath) },
    );

  let body;
  if (isPending) {
    body = <PostEditSkeleton />;
  } else if (isError) {
    body = (
      <div role="alert">
        <EmptyResult
          icon={<FileX size={32} aria-hidden="true" />}
          title="게시글을 찾지 못했어요"
          description="삭제되었거나 주소가 잘못되었을 수 있어요"
        >
          <Link
            to={PATHS.COMMUNITY}
            className="inline-flex h-9 items-center rounded-md border border-line bg-white px-3 text-sm font-medium text-ink hover:bg-surface-2"
          >
            펫이야기 목록으로
          </Link>
        </EmptyResult>
      </div>
    );
  } else {
    body = (
      <PostForm
        key={pstSn}
        mode="edit"
        initial={post}
        cancelTo={detailPath}
        isPending={update.isPending}
        errorMessage={
          update.isError &&
          '게시글을 저장하지 못했어요. 잠시 뒤 다시 시도해 주세요'
        }
        onSubmit={handleSubmit}
        onLeave={onLeave}
        onDirtyChange={setDirty}
      />
    );
  }

  /** 수정 화면은 「목록으로」 없음 */
  return (
    <SubPageLayout
      section="community"
      menu={PATHS.COMMUNITY}
      title="펫이야기 글 수정"
      back={false}
      onLeave={onLeave}
    >
      {body}
      {leaveModal}
    </SubPageLayout>
  );
}
