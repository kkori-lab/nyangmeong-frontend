import { Check, Lock } from 'lucide-react';
import AuthCard from '../shared/AuthCard';
import AuthField from '../shared/AuthField';
import AuthHeading from '../shared/AuthHeading';
import AuthNotice from '../shared/AuthNotice';
import { OUTLINE_BTN, PRIMARY_BTN, TEXT_LINK } from '../shared/authStyles';
import { PASSWORD_MESSAGES as MSG } from './passwordMessages';
import usePasswordReset from './usePasswordReset';

export default function PasswordResetForm({
  isVerified,
  grant,
  onGoLogin,
  onRetryAuth,
}) {
  const form = usePasswordReset(grant);
  const target = form.guideTarget;

  if (form.isDone) {
    return (
      <AuthCard>
        <AuthHeading
          title="비밀번호가 변경되었습니다"
          subtitle="새 비밀번호로 다시 로그인해 주세요."
        />
        <div className="mx-auto grid size-16 place-items-center rounded-full bg-tone-green-bg text-tone-green-fg">
          <Check className="size-8" />
        </div>
        <button
          type="button"
          onClick={onGoLogin}
          className={`${PRIMARY_BTN} mt-8`}
        >
          로그인 화면으로
        </button>
      </AuthCard>
    );
  }

  if (!isVerified || form.isExpired) {
    return (
      <AuthCard>
        <AuthHeading
          title="비밀번호 재설정"
          subtitle="다시 본인확인 후 비밀번호를 변경할 수 있어요."
        />
        <AuthNotice type="error" message={MSG.needVerify} hasGuide />
        <div className="flex flex-col gap-3">
          <button type="button" onClick={onRetryAuth} className={PRIMARY_BTN}>
            이메일 인증 다시 하기
          </button>
          <button type="button" onClick={onGoLogin} className={OUTLINE_BTN}>
            로그인으로
          </button>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard>
      <AuthHeading
        title="비밀번호 재설정"
        subtitle={
          <>
            본인확인이 완료되었습니다.
            <br />새 비밀번호를 입력해 주세요.
          </>
        }
      />
      {form.notice && (
        <AuthNotice
          type={form.notice.type}
          message={form.notice.message}
          hasGuide={target === 'notice'}
        />
      )}
      <form noValidate onSubmit={form.submit} className="flex flex-col gap-5">
        <AuthField
          id="reset-password"
          icon={Lock}
          label="새 비밀번호"
          type="password"
          value={form.password}
          onChange={form.changePassword}
          placeholder="비밀번호 입력"
          autoComplete="new-password"
          error={form.passwordError}
          help={MSG.pwHelp}
          hasGuide={target === 'password'}
        />
        <AuthField
          id="reset-confirm"
          icon={Lock}
          label="새 비밀번호 확인"
          type="password"
          value={form.confirm}
          onChange={form.changeConfirm}
          onBlur={form.blurConfirm}
          placeholder="비밀번호 다시 입력"
          autoComplete="new-password"
          error={form.confirmError}
          success={form.confirmSuccess}
          hasGuide={target === 'confirm'}
        />
        <button
          type="submit"
          disabled={!form.canSubmit || form.isPending}
          className={`${PRIMARY_BTN} mt-3`}
        >
          비밀번호 재설정
        </button>
      </form>
      <div className="mt-6 flex justify-center">
        <button
          type="button"
          onClick={() => form.cancel(onGoLogin)}
          className={TEXT_LINK}
        >
          취소
        </button>
      </div>
    </AuthCard>
  );
}
