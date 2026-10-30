import { useState } from 'react';
import { generatePath, useNavigate } from 'react-router-dom';
import Modal from '@/components/Modal';
import { BTN_PRIMARY } from '@/components/buttonStyles';
import MissingForm from '@/features/community/missing/MissingForm';
import { EMPTY_FORM } from '@/features/community/missing/missingUtils';
import { useCreateMissing } from '@/features/community/missingQueries';
import useLeaveGuard from '@/features/community/useLeaveGuard';
import SubPageLayout from '@/layouts/SubPageLayout';
import { PATHS } from '@/routes/paths';

export default function MissingWritePage() {
  const navigate = useNavigate();
  const { mutate, isPending, isError, error } = useCreateMissing();
  const { setDirty, onLeave, leaveModal } = useLeaveGuard();
  const [createdSn, setCreatedSn] = useState(null);

  const handleSubmit = (values) =>
    mutate(values, {
      onSuccess: ({ lostTpofSn }) => {
        setDirty(false);
        setCreatedSn(lostTpofSn);
      },
    });

  /** 「목록으로」는 폼 아래 줄에 있어 머리의 ‹ 목록으로(back)는 끔 */
  return (
    <SubPageLayout
      section="community"
      menu={PATHS.COMMUNITY_MISSING}
      title="글쓰기"
      back={false}
      onLeave={onLeave}
    >
      <MissingForm
        mode="write"
        initial={EMPTY_FORM}
        cancelTo={PATHS.COMMUNITY_MISSING}
        isPending={isPending}
        errorMessage={isError && error.message}
        onSubmit={handleSubmit}
        onLeave={onLeave}
        onDirtyChange={setDirty}
      />
      {leaveModal}
      {createdSn && (
        /** [확인]으로만 닫힘: 배경 클릭·ESC로는 닫히지 않아 안내 필수 확인 */
        <Modal
          isConfirm
          title="등록이 완료됐어요"
          onClose={() => {}}
          footer={
            <button
              type="button"
              autoFocus
              className={BTN_PRIMARY}
              onClick={() =>
                navigate(
                  generatePath(PATHS.COMMUNITY_MISSING_DETAIL, {
                    lostTpofSn: createdSn,
                  }),
                )
              }
            >
              확인
            </button>
          }
        >
          <div className="mt-2 flex flex-col gap-1.5 text-muted">
            <p>
              아이를 찾으면 게시글에서{' '}
              <b className="text-ink">&apos;찾았어요&apos;</b>를 눌러 주세요.
            </p>
            <p>
              &apos;찾았어요&apos;를 누르면 본문 · 사진 · 연락처 · 위치 · 댓글이
              다른 사용자에게 공개되지 않아요.
            </p>
          </div>
        </Modal>
      )}
    </SubPageLayout>
  );
}
