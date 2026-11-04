import { Lock } from 'lucide-react';
import { useId, useState } from 'react';
import { BTN_PRIMARY } from '@/components/buttonStyles';
import { showToast } from '@/components/toastStore';
import { useVerifyPassword } from '../queries';
import { CARD, INPUT } from '../shared/profileStyles';
import { ErrorText } from './FieldMessage';

export default function PasswordConfirm({ onVerified, onSnsOnly }) {
  const inputId = useId();
  const errorId = useId();
  const [pswd, setPswd] = useState('');
  const { mutate, isPending, error, reset } = useVerifyPassword();
  // 비밀번호 불일치만 입력란 아래에 안내하고, 그 밖의 실패는 토스트로 알린다
  const isError = error?.code === 'CURRENT_PASSWORD_MISMATCH';

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!pswd || isPending) return;
    mutate(
      { pswd },
      {
        onSuccess: () => {
          // 입력값은 상태에 남기지 않는다
          setPswd('');
          onVerified();
        },
        onError: (err) => {
          if (err.code === 'SNS_ONLY_MEMBER') onSnsOnly?.();
          else if (err.code !== 'CURRENT_PASSWORD_MISMATCH') {
            showToast('잠시 후 다시 시도해 주세요');
          }
        },
      },
    );
  };

  return (
    <section
      aria-labelledby="pw-confirm-title"
      className={`${CARD} mx-auto flex w-full max-w-[520px] flex-col items-center text-center`}
    >
      <span className="mb-4 grid size-14 place-items-center rounded-full bg-brand-50 text-brand-500">
        <Lock className="size-6" />
      </span>
      <h2 id="pw-confirm-title" className="text-lg font-bold">
        본인 확인
      </h2>
      <p className="mt-1 text-muted">
        회원정보 수정을 위해 비밀번호를 입력해주세요
      </p>
      <form
        onSubmit={handleSubmit}
        className="mt-6 flex w-full flex-col gap-3 text-left"
      >
        <label className="sr-only" htmlFor={inputId}>
          비밀번호
        </label>
        <input
          id={inputId}
          type="password"
          value={pswd}
          autoComplete="current-password"
          placeholder="비밀번호 입력"
          aria-invalid={isError || undefined}
          aria-describedby={isError ? errorId : undefined}
          onChange={(event) => {
            setPswd(event.target.value);
            if (isError) reset();
          }}
          className={INPUT}
        />
        {isError && (
          <ErrorText id={errorId}>비밀번호가 일치하지 않아요</ErrorText>
        )}
        <button
          type="submit"
          disabled={!pswd || isPending}
          className={`${BTN_PRIMARY} mt-2 w-38 self-center`}
        >
          확인
        </button>
      </form>
    </section>
  );
}
