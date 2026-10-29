import { generatePath, useNavigate } from 'react-router-dom';
import { showToast } from '@/components/toastStore';
import CareForm from '@/features/community/care/CareForm';
import { EMPTY_FORM } from '@/features/community/care/careUtils';
import { useCreateCare } from '@/features/community/careQueries';
import useLeaveGuard from '@/features/community/useLeaveGuard';
import SubPageLayout from '@/layouts/SubPageLayout';
import { PATHS } from '@/routes/paths';

export default function CareWritePage() {
  const navigate = useNavigate();
  const { mutate, isPending, isError } = useCreateCare();
  const { setDirty, onLeave, leaveModal } = useLeaveGuard();

  /** 등록하면 별도 완료 모달 없이 상세로 이동해 올린 글 바로 확인 */
  const handleSubmit = (values) =>
    mutate(values, {
      onSuccess: ({ petPrtcRcrtSn }) => {
        setDirty(false);
        showToast('돌봄 요청을 등록했어요');
        navigate(
          generatePath(PATHS.COMMUNITY_PETCARE_DETAIL, { petPrtcRcrtSn }),
        );
      },
    });

  /** 「목록으로」는 폼 아래 줄에 있어 머리의 ‹ 목록으로(back)는 끔 */
  return (
    <SubPageLayout
      section="community"
      menu={PATHS.COMMUNITY_PETCARE}
      title="글쓰기"
      back={false}
      onLeave={onLeave}
    >
      <CareForm
        mode="write"
        initial={EMPTY_FORM}
        cancelTo={PATHS.COMMUNITY_PETCARE}
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
