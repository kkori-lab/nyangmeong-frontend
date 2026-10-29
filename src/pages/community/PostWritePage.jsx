import { generatePath, useNavigate } from 'react-router-dom';
import PostForm from '@/features/community/PostForm';
import { BBS_INFO } from '@/features/community/postCodes';
import { useCreatePost } from '@/features/community/queries';
import useLeaveGuard from '@/features/community/useLeaveGuard';
import SubPageLayout from '@/layouts/SubPageLayout';
import { PATHS } from '@/routes/paths';

const INITIAL = { bbsCd: BBS_INFO, pstTtl: '', pstCn: '', imgs: [] };

export default function PostWritePage() {
  const navigate = useNavigate();
  const { mutate, isPending, isError } = useCreatePost();
  const { setDirty, onLeave, leaveModal } = useLeaveGuard();

  const handleSubmit = (values) =>
    mutate(values, {
      onSuccess: ({ pstSn }) =>
        navigate(generatePath(PATHS.COMMUNITY_POST_DETAIL, { pstSn })),
    });

  /** 「목록으로」는 폼 아래 줄에 있어 머리의 ‹ 목록으로(back)는 끈다 */
  return (
    <SubPageLayout
      section="community"
      menu={PATHS.COMMUNITY}
      title="글쓰기"
      back={false}
      onLeave={onLeave}
    >
      <PostForm
        mode="write"
        initial={INITIAL}
        cancelTo={PATHS.COMMUNITY}
        isPending={isPending}
        errorMessage={
          isError && '게시글을 등록하지 못했어요. 잠시 뒤 다시 시도해 주세요'
        }
        onSubmit={handleSubmit}
        onLeave={onLeave}
        onDirtyChange={setDirty}
      />
      {leaveModal}
    </SubPageLayout>
  );
}
