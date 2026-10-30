import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ConfirmModal from '@/components/ConfirmModal';

/**
 * 글쓰기·글수정에서 나갈 때 확인
 * - 폼이 setDirty로 고친 여부를 알리면, onLeave(to)가 고친 게 있을 때만 「작성을 그만둘까요?」 표시
 * - SubPageLayout의 onLeave와 폼의 [목록으로]·[취소]가 공용
 */
export default function useLeaveGuard() {
  const navigate = useNavigate();
  const [isDirty, setDirty] = useState(false);
  const [leaveTo, setLeaveTo] = useState(null);

  const onLeave = useCallback(
    (to) => {
      if (isDirty) setLeaveTo(to);
      else navigate(to);
    },
    [isDirty, navigate],
  );

  const leaveModal = leaveTo && (
    <ConfirmModal
      title="작성을 그만둘까요? 지금까지 쓴 내용은 저장되지 않아요"
      confirmLabel="나가기"
      cancelLabel="계속 쓰기"
      onConfirm={() => navigate(leaveTo)}
      onCancel={() => setLeaveTo(null)}
    />
  );

  return { setDirty, onLeave, leaveModal };
}
