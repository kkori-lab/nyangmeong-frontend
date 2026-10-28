import { Lock, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { showToast } from '@/components/toastStore';
import { PATHS } from '@/routes/paths';
import CaptchaBlock from './CaptchaBlock';
import AuthCard from '../shared/AuthCard';
import AuthField from '../shared/AuthField';
import AuthHeading from '../shared/AuthHeading';
import AuthNotice from '../shared/AuthNotice';
import { LOGIN_MESSAGES as MSG } from './loginMessages';
import useEmailLogin from './useEmailLogin';

export default function EmailLoginForm({ onBack, onSuccess }) {
  const navigate = useNavigate();
  const form = useEmailLogin(onSuccess);
  const target = form.guideTarget;

  return (
    <AuthCard onBack={onBack}>
      <AuthHeading
        title="이메일로 로그인하기"
        subtitle="이메일 아이디와 비밀번호를 입력하세요."
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
          id="login-email"
          icon={Mail}
          label="아이디(이메일)"
          value={form.email}
          onChange={form.changeEmail}
          onBlur={form.blurEmail}
          placeholder="이메일 주소를 입력하세요"
          autoComplete="username"
          inputMode="email"
          error={form.errors.email}
          hasGuide={target === 'email'}
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
          hasGuide={target === 'password'}
        />
        {form.isCaptchaOn && (
          <CaptchaBlock
            image={form.captchaImg}
            isLoading={form.isCaptchaLoading}
            value={form.captchaInput}
            onChange={form.changeCaptcha}
            onRefresh={form.refreshCaptcha}
            error={form.errors.captcha}
            hasGuide={target === 'captcha'}
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
        <button
          type="submit"
          disabled={form.isPending}
          className="mt-3 inline-flex h-[50px] w-full items-center justify-center rounded-xl bg-brand-500 text-[15px] font-bold text-white transition hover:enabled:-translate-y-px hover:enabled:bg-brand-600 disabled:cursor-not-allowed disabled:bg-surface-3 disabled:text-line-strong"
        >
          로그인
        </button>
      </form>
      <div className="mt-6 flex justify-center gap-2 text-muted">
        아직 회원이 아니신가요?
        <button
          type="button"
          onClick={() => showToast(MSG.notReady)}
          className="font-semibold text-brand-600 hover:underline hover:underline-offset-[3px]"
        >
          회원가입
        </button>
      </div>
    </AuthCard>
  );
}
