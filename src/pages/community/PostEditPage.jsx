import { useEffect } from 'react';
import {
  generatePath,
  Link,
  Navigate,
  useNavigate,
  useParams,
} from 'react-router-dom';
import { showToast } from '@/components/toastStore';
import PostForm from '@/features/community/PostForm';
import { usePost, useUpdatePost } from '@/features/community/queries';
import useLeaveGuard from '@/features/community/useLeaveGuard';
import SubPageLayout from '@/layouts/SubPageLayout';
import { PATHS } from '@/routes/paths';

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
    body = <p className="text-[#566465]">불러오는 중이에요</p>;
  } else if (isError) {
    body = (
      <div role="alert" className="flex flex-col items-start gap-3">
        <p className="text-[#566465]">게시글을 찾지 못했어요</p>
        <Link
          to={PATHS.COMMUNITY}
          className="text-base font-medium text-[#285a5c] hover:underline"
        >
          펫이야기 목록으로
        </Link>
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

  /** 글쓰기·글수정은 둘 다 title="글쓰기"(사람 결정) */
  return (
    <SubPageLayout
      section="community"
      menu={PATHS.COMMUNITY}
      title="글쓰기"
      back={false}
      onLeave={onLeave}
    >
      {body}
      {leaveModal}
    </SubPageLayout>
  );
}
