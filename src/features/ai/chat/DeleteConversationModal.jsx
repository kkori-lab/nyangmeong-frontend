import ConfirmModal from '@/components/ConfirmModal';
import { useDeleteConversation } from '../queries';

/** 대화 삭제 확인: 대화 헤더 [삭제]와 사이드바 ⋮ [삭제]가 같이 씀 */
export default function DeleteConversationModal({
  aiCnvrsRoomSn,
  onDeleted,
  onClose,
}) {
  const deleteConversation = useDeleteConversation();

  const handleConfirm = () => {
    deleteConversation.mutate(aiCnvrsRoomSn, {
      onSuccess: () => onDeleted(aiCnvrsRoomSn),
    });
  };

  const handleCancel = () => {
    deleteConversation.reset();
    onClose();
  };

  return (
    <ConfirmModal
      title="이 대화를 삭제할까요?"
      description="삭제한 대화와 메시지는 되돌릴 수 없어요."
      confirmLabel="삭제하기"
      errorMessage={
        deleteConversation.isError
          ? '삭제하지 못했어요. 잠시 뒤 다시 시도해 주세요'
          : undefined
      }
      isPending={deleteConversation.isPending}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    />
  );
}
