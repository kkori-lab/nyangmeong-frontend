import Modal from '@/components/Modal';
import { useTerms } from '../queries';
import { OUTLINE_BTN } from '../shared/authStyles';
import { RECOVERY_MESSAGES as MSG } from './recoveryMessages';

// 복구 확인 화면에서 다시 동의받는 약관의 전문을 서버에서 받아 보여 준다(자르지 않는다)
export default function RecoveryTermsModal({ trmsSn, onClose }) {
  const terms = useTerms(trmsSn);

  return (
    <Modal
      title={terms.data?.trmsTtl ?? '약관'}
      onClose={onClose}
      footer={
        <button type="button" onClick={onClose} className={OUTLINE_BTN}>
          닫기
        </button>
      }
    >
      {terms.isPending && <p className="text-muted">{MSG.termsLoading}</p>}
      {terms.isError && <p className="text-danger">{terms.error.message}</p>}
      {terms.data && (
        <div className="max-h-[50vh] overflow-y-auto leading-6 whitespace-pre-wrap text-ink-2">
          {terms.data.trmsCn || MSG.termsEmpty}
        </div>
      )}
    </Modal>
  );
}
