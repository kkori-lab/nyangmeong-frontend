import { useMe } from '../queries';
import useWithdraw from './useWithdraw';
import WithdrawConfirmModal from './WithdrawConfirmModal';
import WithdrawNotice from './WithdrawNotice';
import WithdrawResult from './WithdrawResult';

/** 회원탈퇴 안내 → 문구 모달 → 실행·실패/확인 중. 반려동물 목록(pets)은 페이지가 넘긴다 */
export default function WithdrawFlow({
  pets,
  isPetsError,
  onCancel,
  onClose,
  onWithdrawn,
  onLoggedOut,
}) {
  const { data: me } = useMe();
  const flow = useWithdraw({ onWithdrawn, onLoggedOut });

  if (flow.step !== 'notice') {
    return (
      <WithdrawResult
        step={flow.step}
        isChecking={flow.isCheckingResult}
        onCheck={flow.checkResult}
        onRetry={flow.restart}
        onClose={onClose}
      />
    );
  }

  return (
    <>
      <WithdrawNotice
        pets={pets}
        isPetsError={isPetsError}
        isChecked={flow.isChecked}
        noticeError={flow.noticeError}
        onToggle={flow.toggleCheck}
        onContinue={flow.openModal}
        onCancel={onCancel}
      />
      {flow.isModalOpen && (
        <WithdrawConfirmModal
          me={me}
          phrase={flow.phrase}
          onChange={flow.changePhrase}
          onBlur={flow.blurPhrase}
          error={flow.phraseError}
          success={flow.phraseSuccess}
          isMatch={flow.isMatch}
          isPending={flow.isPending}
          onSubmit={flow.submit}
          onClose={flow.closeModal}
        />
      )}
    </>
  );
}
