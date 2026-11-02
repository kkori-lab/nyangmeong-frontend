import { BTN_PRIMARY, BTN_SECONDARY } from '@/components/buttonStyles';
import Modal from '@/components/Modal';
import { useNoticeTargetCount } from './queries';

/**
 * [공지 알림 발송 확인]
 * - 대상 수를 센 뒤에만 [보내기]를 누를 수 있다
 * - 등록이 실패하면 모달을 두고 서버 문구 표시
 */
export default function NoticeSendConfirmModal({
  errorMessage,
  isPending,
  onConfirm,
  onCancel,
}) {
  const targetCount = useNoticeTargetCount();

  const getDescription = () => {
    if (targetCount.isPending) return '알림 대상 수를 세고 있어요';
    if (targetCount.isError) return targetCount.error.message;
    return `회원 ${targetCount.data.trgtCnt.toLocaleString()}명에게 알림을 보내요`;
  };

  return (
    <Modal
      title="공지 알림 발송"
      description={getDescription()}
      isConfirm
      isPending={isPending}
      onClose={onCancel}
      footer={
        <>
          <button
            type="button"
            className={BTN_SECONDARY}
            disabled={isPending}
            onClick={onCancel}
          >
            취소
          </button>
          <button
            type="button"
            className={BTN_PRIMARY}
            disabled={!targetCount.isSuccess || isPending}
            onClick={onConfirm}
          >
            보내기
          </button>
        </>
      }
    >
      {errorMessage && (
        <p role="alert" className="mt-2 text-sm text-danger">
          {errorMessage}
        </p>
      )}
    </Modal>
  );
}
