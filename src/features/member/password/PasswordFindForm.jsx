import { Mail, ShieldCheck } from 'lucide-react';
import AuthActions from '../shared/AuthActions';
import AuthBody from '../shared/AuthBody';
import AuthCard from '../shared/AuthCard';
import AuthField from '../shared/AuthField';
import AuthHeading from '../shared/AuthHeading';
import AuthNotice from '../shared/AuthNotice';
import {
  TEXT_LINK,
  SIDE_BTN,
  AUTH_BTN_PRIMARY,
  AUTH_BTN_SECONDARY,
} from '../shared/authStyles';
import { resendLabel } from '../shared/emailCert';
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
  const notice = form.notice && (
    <AuthNotice type={form.notice.type} message={form.notice.message} />
  );

  if (form.step === 'sns') {
    return (
      <AuthCard onBack={form.editEmail}>
        <AuthHeading
          title="비밀번호 찾기"
          subtitle="SNS 계정은 가입한 서비스에서 로그인해 주세요."
        />
        <AuthBody>
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
            SNS 계정의 비밀번호는 가입한 SNS에서 찾아 주세요.
          </p>
        </AuthBody>
        <AuthActions>
          <button
            type="button"
            onClick={onGoLogin}
            className={`${AUTH_BTN_PRIMARY} w-full`}
          >
            로그인으로
          </button>
        </AuthActions>
      </AuthCard>
    );
  }

  if (form.step === 'code') {
    return (
      <AuthCard spacing="sparse" onBack={form.editEmail}>
        <AuthHeading
          title="비밀번호 찾기"
          subtitle="본인확인을 하면 가입한 로그인 방법을 알려 드립니다."
        />
        <form
          noValidate
          onSubmit={form.submitCode}
          className="flex grow flex-col"
        >
          <AuthBody className="max-[760px]:pt-8">
            {!form.isCodeLocked && notice}
            {/* 인증할 이메일은 읽기 전용 칸으로 보이고, 바꾸려면 [이메일 변경] */}
            <AuthField
              id="find-email-fixed"
              icon={Mail}
              label="아이디(이메일)"
              value={form.email}
              onChange={() => {}}
              readOnly
              autoComplete="username"
              action={
                <button
                  type="button"
                  onClick={form.editEmail}
                  className={SIDE_BTN}
                >
                  이메일 변경
                </button>
              }
            />
            {/** 오답 안내: 이메일 칸 바로 아래 */}
            {form.isCodeLocked && notice}
            <div className="mt-5 flex flex-col gap-8">
              {!form.isCodeLocked && (
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
                  endAdornment={
                    <span className="font-semibold text-danger tabular-nums">
                      {form.countdown.text}
                    </span>
                  }
                />
              )}
              {form.notice?.isWithdrawn && (
                <button
                  type="button"
                  onClick={() => onRecover(form.email)}
                  className={`${AUTH_BTN_SECONDARY} w-full`}
                >
                  재가입 복구 절차
                </button>
              )}
            </div>
          </AuthBody>
          <AuthActions className="flex gap-3">
            <button
              type="button"
              onClick={form.resend}
              disabled={form.isPending || form.resendSeconds > 0}
              className={
                form.isCodeLocked
                  ? `${AUTH_BTN_PRIMARY} w-full flex-1`
                  : `${AUTH_BTN_SECONDARY} w-full flex-1`
              }
            >
              {resendLabel(form.resendSeconds)}
            </button>
            {!form.isCodeLocked && (
              <button
                type="submit"
                disabled={form.isPending}
                className={`${AUTH_BTN_PRIMARY} w-full flex-1`}
              >
                인증번호 확인
              </button>
            )}
          </AuthActions>
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
    <AuthCard spacing="sparse" onBack={onBackToLogin}>
      <AuthHeading
        title="비밀번호 찾기"
        subtitle="이메일로 본인확인을 한 뒤 새 비밀번호를 설정합니다."
      />
      {notice}
      <form
        noValidate
        onSubmit={form.submitEmail}
        className="flex grow flex-col"
      >
        <AuthBody className="max-[760px]:pt-8">
          <AuthField
            id="find-email"
            icon={Mail}
            label="아이디(이메일)"
            value={form.email}
            onChange={form.changeEmail}
            placeholder="예: care@example.com"
            autoComplete="username"
            inputMode="email"
            error={form.errors.email}
          />
        </AuthBody>
        <AuthActions>
          <button
            type="submit"
            disabled={form.isPending}
            className={`${AUTH_BTN_PRIMARY} w-full`}
          >
            인증번호 보내기
          </button>
        </AuthActions>
      </form>
      <div className="mt-6 flex justify-center">
        <button type="button" onClick={onBackToLogin} className={TEXT_LINK}>
          로그인으로
        </button>
      </div>
    </AuthCard>
  );
}
