import { BTN_DANGER, BTN_SECONDARY } from '@/components/buttonStyles';
import Modal from '@/components/Modal';
import { showToast } from '@/components/toastStore';
import { useReleaseAdmin } from './queries';

/**
 * [관리자 해제 확인 모달]
 * - 실패하면 서버 문구 표시
 */
export default function ReleaseAdminModal({ admin, onClose }) {
  const release = useReleaseAdmin();

  const handleRelease = () =>
    release.mutate(admin.mbrSn, {
      onSuccess: () => {
        showToast('관리자를 해제했어요');
        onClose();
      },
    });

  return (
    <Modal
      title="관리자 해제"
      isPending={release.isPending}
      onClose={onClose}
      footer={
        <>
          <button
            type="button"
            className={BTN_SECONDARY}
            disabled={release.isPending}
            onClick={onClose}
          >
            취소
          </button>
          <button
            type="button"
            className={BTN_DANGER}
            disabled={release.isPending}
            onClick={handleRelease}
          >
            해제
          </button>
        </>
      }
    >
      <p className="text-base text-ink-2">
        {admin.mbrNcnm} 님을 일반회원으로 되돌릴까요?
      </p>
      {release.isError && (
        <p role="alert" className="mt-2 text-sm text-danger">
          {release.error.message}
        </p>
      )}
    </Modal>
  );
}
