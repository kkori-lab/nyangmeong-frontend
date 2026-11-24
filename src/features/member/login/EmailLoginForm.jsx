import { Lock, Mail } from 'lucide-react';
import { AUTH_BTN_PRIMARY } from '../shared/authStyles';
import { useNavigate } from 'react-router-dom';
import { PATHS } from '@/routes/paths';
import CaptchaBlock from './CaptchaBlock';
import AuthActions from '../shared/AuthActions';
import AuthBody from '../shared/AuthBody';
import AuthCard from '../shared/AuthCard';
import AuthField from '../shared/AuthField';
import AuthHeading from '../shared/AuthHeading';
import AuthNotice from '../shared/AuthNotice';
import { LOGIN_MESSAGES as MSG } from './loginMessages';
import useEmailLogin from './useEmailLogin';

/** initialValues: 처음 채워 둘 { email, password }(랜딩 팝업의 데모 계정). 없으면 빈 칸 */
export default function EmailLoginForm({
  onBack,
  onSuccess,
  onSignup,
  initialValues,
}) {
  const navigate = useNavigate();
  const form = useEmailLogin(onSuccess, initialValues);

  return (
    <AuthCard onBack={onBack}>
      <AuthHeading
        title="이메일로 로그인하기"
        subtitle="이메일 아이디와 비밀번호를 입력해 주세요."
      />
      {form.notice && (
        <AuthNotice type={form.notice.type} message={form.notice.message} />
      )}
      <form noValidate onSubmit={form.submit} className="flex grow flex-col">
        <AuthBody className="gap-5">
          <AuthField
            id="login-email"
            icon={Mail}
            label="아이디(이메일)"
            value={form.email}
            onChange={form.changeEmail}
            onBlur={form.blurEmail}
            placeholder="이메일 주소 입력"
            autoComplete="username"
            inputMode="email"
            error={form.errors.email}
          />
          <AuthField
            id="login-password"
            icon={Lock}
            label="비밀번호"
            type="password"
            value={form.password}
            onChange={form.changePassword}
            placeholder="비밀번호 입력"
            autoComplete="current-password"
            error={form.errors.password}
          />
          {form.isCaptchaOn && (
            <CaptchaBlock
              image={form.captchaImg}
              isLoading={form.isCaptchaLoading}
              value={form.captchaInput}
              onChange={form.changeCaptcha}
              onRefresh={form.refreshCaptcha}
              error={form.errors.captcha}
            />
          )}
          <div className="-mt-2 flex justify-end">
            <button
              type="button"
              onClick={() => navigate(PATHS.PASSWORD_FIND)}
              className="text-muted hover:underline hover:underline-offset-[3px]"
            >
              비밀번호 찾기
            </button>
          </div>
        </AuthBody>
        <AuthActions>
          <button
            type="submit"
            disabled={!form.isFilled || form.isPending}
            className={`${AUTH_BTN_PRIMARY} w-full`}
          >
            로그인
          </button>
        </AuthActions>
      </form>
      <div className="mt-6 flex justify-center gap-2 text-muted">
        아직 회원이 아니신가요?
        <button
          type="button"
          onClick={onSignup}
          className="font-semibold text-brand-600 hover:underline hover:underline-offset-[3px]"
        >
          회원가입
        </button>
      </div>
    </AuthCard>
  );
}
