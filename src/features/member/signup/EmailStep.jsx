import { Mail, ShieldCheck } from 'lucide-react';
import { SIDE_BTN, AUTH_BTN_PRIMARY } from '../shared/authStyles';
import AuthActions from '../shared/AuthActions';
import AuthBody from '../shared/AuthBody';
import AuthField from '../shared/AuthField';
import AuthNotice from '../shared/AuthNotice';
import { resendLabel } from '../shared/emailCert';
import { SIGNUP_MESSAGES as MSG } from './signupMessages';

// 이미 가입된 이메일이면 칸 아래 오류·새 버튼을 띄우지 않고, 안내 문구와 [다음] 자리의 내용을 바꾼다
export default function EmailStep({ form }) {
  const isDuplicate = form.errors.email === MSG.emailDuplicate;
  return (
    <>
      <AuthBody className="max-[760px]:pt-8">
        <div className="flex flex-col gap-5">
          <AuthField
            id="signup-email"
            icon={Mail}
            label="아이디(이메일)"
            value={form.email}
            onChange={form.changeEmail}
            placeholder="이메일 주소 입력"
            autoComplete="username"
            inputMode="email"
            error={isDuplicate ? '' : form.errors.email}
            action={
              <button
                type="button"
                onClick={form.submitSend}
                disabled={
                  !form.email.trim() || form.isSending || form.resendSeconds > 0
                }
                className={SIDE_BTN}
              >
                {form.isSent
                  ? resendLabel(form.resendSeconds)
                  : '인증번호 보내기'}
              </button>
            }
          />
          {/** 오답 안내: 이메일 칸 바로 아래 */}
          {form.isCodeLocked && form.notice && (
            <AuthNotice type={form.notice.type} message={form.notice.message} />
          )}
          {form.isSent && !form.isCodeLocked && (
            <AuthField
              id="signup-code"
              icon={ShieldCheck}
              label="인증번호"
              value={form.code}
              onChange={form.changeCode}
              placeholder="숫자 6자리 입력"
              autoComplete="one-time-code"
              inputMode="numeric"
              maxLength={6}
              readOnly={form.isEmailVerified}
              error={form.errors.code}
              success={form.isEmailVerified ? MSG.verified : ''}
              help={
                <>
                  {MSG.sent}
                  <br />
                  {MSG.spamHint}
                </>
              }
              endAdornment={
                !form.isEmailVerified && (
                  <span className="font-semibold text-danger tabular-nums">
                    {form.countdown.text}
                  </span>
                )
              }
              action={
                <button
                  type="button"
                  onClick={form.submitVerify}
                  disabled={
                    !form.code || form.isVerifying || form.isEmailVerified
                  }
                  className={`${SIDE_BTN} !border-transparent !bg-brand-50 !text-brand-600 hover:enabled:!bg-brand-100 disabled:!bg-surface-3 disabled:!text-line-strong`}
                >
                  인증 확인
                </button>
              }
            />
          )}
        </div>
        {isDuplicate ? (
          <p role="alert" className="mt-3 text-sm leading-5 break-keep text-danger">
            {MSG.emailDuplicate}
          </p>
        ) : (
          <p className="mt-3 text-sm leading-5 text-muted">
            {form.isEmailVerified
              ? '다음을 눌러 휴대전화번호를 입력해 주세요.'
              : '이메일 인증이 완료되면 다음으로 넘어갈 수 있습니다.'}
          </p>
        )}
      </AuthBody>
      <AuthActions>
        {isDuplicate ? (
          <button
            type="button"
            onClick={form.goLoginMethods}
            className={`${AUTH_BTN_PRIMARY} w-full`}
          >
            기존 가입 방법으로 로그인
          </button>
        ) : (
          <button
            type="button"
            disabled={!form.isEmailVerified}
            onClick={() => form.goStep('phone')}
            className={`${AUTH_BTN_PRIMARY} w-full`}
          >
            다음
          </button>
        )}
      </AuthActions>
    </>
  );
}
