import { BTN_DANGER, BTN_SECONDARY } from '@/components/buttonStyles';
import Modal from '@/components/Modal';
import AuthField from '../shared/AuthField';
import { WITHDRAW_PHRASE } from './withdrawMessages';

/** 탈퇴 문구 입력 모달 1~5: 대상 계정·문구 안내·입력·취소·탈퇴하기 */
export default function WithdrawConfirmModal({
  me,
  phrase,
  onChange,
  onBlur,
  error,
  success,
  isMatch,
  isPending,
  onSubmit,
  onClose,
}) {
  return (
    <Modal
      title="회원탈퇴 최종 확인"
      isPending={isPending}
      onClose={onClose}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className={BTN_SECONDARY}
          >
            취소
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={!isMatch || isPending}
            className={BTN_DANGER}
          >
            {isPending ? '처리 중…' : '탈퇴하기'}
          </button>
        </>
      }
    >
      <dl className="mb-4 rounded-box bg-surface-2 px-4 py-3">
        <dt className="text-sm text-subtle">탈퇴할 계정</dt>
        <dd className="mt-0.5 font-semibold break-all text-ink">
          {me ? `${me.maskedAcntEml} · ${me.mbrNcnm}` : ''}
        </dd>
      </dl>
      <p className="font-bold text-ink">정말 탈퇴하시겠어요?</p>
      <p className="mt-1 text-sm leading-6 text-muted">
        탈퇴하려면 아래 문구를 그대로 입력해 주세요.
      </p>
      <p className="my-3 rounded-box border border-line px-4 py-3 text-center font-bold text-ink">
        {WITHDRAW_PHRASE}
      </p>
      <p className="mb-4 text-sm text-muted">
        띄어쓰기와 마지막 마침표까지 입력해 주세요.
      </p>
      <AuthField
        id="withdraw-phrase"
        label="확인 문구 입력"
        value={phrase}
        onChange={onChange}
        onBlur={onBlur}
        placeholder="위 문구를 그대로 입력해 주세요"
        autoComplete="off"
        readOnly={isPending}
        error={error}
        success={success}
        help="문구를 정확히 입력하면 탈퇴 버튼이 활성화됩니다."
        hasGuide
      />
    </Modal>
  );
}
