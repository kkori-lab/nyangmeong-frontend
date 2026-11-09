import { Lock } from 'lucide-react';
import { formatPhone, normalizePhone } from '../shared/validate';
import { PRIMARY_BTN } from '../shared/authStyles';
import AuthField from '../shared/AuthField';
import SignupSummary from './SignupSummary';
import { SIGNUP_MESSAGES as MSG } from './signupMessages';

export default function PasswordStep({ form }) {
  const target = form.guideTarget;
  return (
    <form
      noValidate
      onSubmit={form.submitJoin}
      className="flex flex-col gap-4 max-md:gap-5"
    >
      <AuthField
        id="signup-password"
        icon={Lock}
        label="비밀번호"
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
        id="signup-confirm"
        icon={Lock}
        label="비밀번호 확인"
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
      <SignupSummary
        rows={[
          ['이메일 · 인증 완료', form.email],
          [
            '휴대전화번호 · 중복확인 완료',
            formatPhone(normalizePhone(form.phone)),
          ],
        ]}
      />
      <p className="text-sm leading-5 text-muted">
        가입 후 기본 닉네임을 원하는 닉네임으로 설정할 수 있어요.
      </p>
      <button
        type="submit"
        disabled={!form.canJoin || form.isJoining}
        className={`${PRIMARY_BTN} mt-1 max-md:mt-3`}
      >
        회원가입
      </button>
    </form>
  );
}
