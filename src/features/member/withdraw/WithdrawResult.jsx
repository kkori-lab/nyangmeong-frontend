import AiErrorGuide from '@/components/AiErrorGuide';
import AuthNotice from '../shared/AuthNotice';
import { OUTLINE_BTN, PRIMARY_BTN } from '../shared/authStyles';
import { WITHDRAW_MESSAGES as MSG } from './withdrawMessages';

/**
 * 처리 실패(failed)·결과 확인 중(unknown) 1~3.
 * 확인 중에는 실패·완료를 단정하지 않고 [결과 확인]으로 로그인 상태만 다시 본다
 */
export default function WithdrawResult({
  step,
  isChecking,
  onCheck,
  onRetry,
  onClose,
}) {
  const isUnknown = step === 'unknown';

  return (
    <div className="flex flex-col">
      <AuthNotice
        type={isUnknown ? 'warn' : 'error'}
        message={isUnknown ? MSG.checking : MSG.failed}
      />
      <div className="-mt-4 mb-6">
        <AiErrorGuide message={isUnknown ? MSG.checking : MSG.failedGuide} />
      </div>
      <div className="flex gap-2 max-md:flex-col-reverse">
        <button type="button" onClick={onClose} className={OUTLINE_BTN}>
          안내 닫기
        </button>
        {isUnknown ? (
          <button
            type="button"
            onClick={onCheck}
            disabled={isChecking}
            className={PRIMARY_BTN}
          >
            {isChecking ? '확인하는 중…' : '결과 확인'}
          </button>
        ) : (
          <button type="button" onClick={onRetry} className={PRIMARY_BTN}>
            다시 시도
          </button>
        )}
      </div>
    </div>
  );
}
