import Modal from '@/components/Modal';
import { BTN_DANGER, BTN_SECONDARY } from '@/components/buttonStyles';
import { showToast } from '@/components/toastStore';
import { useRejectInvitation } from '../queries';

/** 초대 거절 확인 팝업 */
export default function InvitationRejectDialog({ invitation, onClose }) {
  const rejectInvitation = useRejectInvitation();

  const handleReject = () =>
    rejectInvitation.mutate(invitation.jntBrupInvtnSn, {
      onSuccess: onClose,
      onError: (error) => {
        onClose();
        showToast(error.message);
      },
    });

  return (
    <Modal
      isConfirm
      title="초대를 거절할까요?"
      description={`거절하면 이 초대는 사라져요. 다시 참여하려면 ${invitation.sndrMbrNcnm}님께 초대를 다시 받아야 해요.`}
      isPending={rejectInvitation.isPending}
      onClose={onClose}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={rejectInvitation.isPending}
            className={BTN_SECONDARY}
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleReject}
            disabled={rejectInvitation.isPending}
            className={BTN_DANGER}
          >
            거절
          </button>
        </>
      }
    />
  );
}
