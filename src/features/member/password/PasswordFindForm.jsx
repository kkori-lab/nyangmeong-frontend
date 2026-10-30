import { Mail, ShieldCheck } from 'lucide-react';
import AuthCard from '../shared/AuthCard';
import AuthField from '../shared/AuthField';
import AuthHeading from '../shared/AuthHeading';
import AuthNotice from '../shared/AuthNotice';
import { OUTLINE_BTN, PRIMARY_BTN, TEXT_LINK } from '../shared/authStyles';
import { SNS_NAME } from '../shared/snsCodes';
import { PASSWORD_MESSAGES as MSG } from './passwordMessages';
import usePasswordFind from './usePasswordFind';

const SUMMARY = 'rounded-box bg-surface-2 p-4 leading-6 text-ink-2';

export default function PasswordFindForm({
  onVerified,
  onBackToLogin,
  onGoLogin,
  onRecover,
}) {
  const form = usePasswordFind(onVerified);
  const target = form.guideTarget;
  const notice = form.notice && (
    <AuthNotice
      type={form.notice.type}
      message={form.notice.message}
      hasGuide={target === 'notice'}
    />
  );

  if (form.step === 'sns') {
    return (
      <AuthCard>
        <AuthHeading
          title="비밀번호 찾기"
          subtitle="SNS 계정은 가입한 서비스에서 로그인해 주세요."
        />
        <AuthNotice type="info" message={MSG.snsAccount} />
        <div className={`${SUMMARY} flex justify-between gap-3`}>
          <span className="text-muted">연결된 로그인 방법</span>
          <strong className="font-semibold text-ink">
            {form.snsOffrCds.map((code) => SNS_NAME[code] ?? code).join(', ')}
          </strong>
        </div>
        <p className="mt-3 text-sm leading-5 text-muted">
          냥멍케어에서 설정한 비밀번호가 없습니다.
          <br />
          SNS 비밀번호 찾기는 해당 제공자에서 진행해 주세요.
        </p>
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

  if (form.step === 'code') {
    return (
      <AuthCard>
        <AuthHeading
          title="비밀번호 찾기"
          subtitle="본인확인 후 사용 가능한 로그인 방법을 확인해요."
        />
        {notice}
        <div className={`${SUMMARY} flex justify-between gap-3`}>
          <span className="text-muted">인증할 이메일</span>
          <strong className="min-w-0 truncate font-semibold text-ink">
            {form.email}
          </strong>
        </div>
        <div className="mt-3 flex justify-end">
          <button type="button" onClick={form.editEmail} className={TEXT_LINK}>
            이메일 다시 입력
          </button>
        </div>
        <form
          noValidate
          onSubmit={form.submitCode}
          className="mt-5 flex flex-col gap-8"
        >
          <AuthField
            id="find-code"
            icon={ShieldCheck}
            label="인증번호"
            value={form.code}
            onChange={form.changeCode}
            placeholder="숫자 6자리 입력"
            autoComplete="one-time-code"
            inputMode="numeric"
            maxLength={6}
            error={form.errors.code}
            help={form.isSent ? MSG.sent : ''}
            hasGuide={target === 'code'}
            endAdornment={
              <span className="font-semibold text-danger tabular-nums">
                {form.countdown.text}
              </span>
            }
          />
          {form.notice?.isWithdrawn && (
            <button
              type="button"
              onClick={() => onRecover(form.email)}
              className={OUTLINE_BTN}
            >
              재가입 복구 절차
            </button>
          )}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={form.resend}
              disabled={form.isPending}
              className={`${OUTLINE_BTN} basis-[120px]`}
            >
              다시 보내기
            </button>
            <button
              type="submit"
              disabled={form.isPending}
              className={`${PRIMARY_BTN} flex-1`}
            >
              인증번호 확인
            </button>
          </div>
        </form>
        <div className="mt-6 flex justify-center">
          <button type="button" onClick={onBackToLogin} className={TEXT_LINK}>
            로그인으로
          </button>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard>
      <AuthHeading
        title="비밀번호 찾기"
        subtitle="이메일로 본인확인 후 새 비밀번호를 설정해요."
      />
      {notice}
      <form
        noValidate
        onSubmit={form.submitEmail}
        className="flex flex-col gap-8"
      >
        <AuthField
          id="find-email"
          icon={Mail}
          label="이메일 아이디"
          value={form.email}
          onChange={form.changeEmail}
          placeholder="예: care@example.com"
          autoComplete="username"
          inputMode="email"
          error={form.errors.email}
          hasGuide={target === 'email'}
        />
        <button type="submit" disabled={form.isPending} className={PRIMARY_BTN}>
          인증번호 보내기
        </button>
      </form>
      <div className="mt-6 flex justify-center">
        <button type="button" onClick={onBackToLogin} className={TEXT_LINK}>
          로그인으로
        </button>
      </div>
    </AuthCard>
  );
}
