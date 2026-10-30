import { Check, ChevronRight, Mail, Phone, ShieldCheck } from 'lucide-react';
import StepMotion from '@/components/StepMotion';
import AuthCard from '../shared/AuthCard';
import AuthCheckBox from '../shared/AuthCheckBox';
import AuthField from '../shared/AuthField';
import AuthHeading from '../shared/AuthHeading';
import AuthNotice from '../shared/AuthNotice';
import { OUTLINE_BTN, PRIMARY_BTN, SIDE_BTN } from '../shared/authStyles';
import SignupSummary from '../signup/SignupSummary';
import { SIGNUP_MESSAGES as SIGNUP } from '../signup/signupMessages';
import { RECOVERY_MESSAGES as MSG } from './recoveryMessages';
import RecoveryTermsModal from './RecoveryTermsModal';
import useRecovery from './useRecovery';

/** 별도 전문이 없는 확인 항목(만 14세 이상 등 연령 확인)은 내용보기를 두지 않는다. 지금 서버 약관(SERVICE·PRIVACY·LOCATION·MARKETING)에는 없다 */
const hasTermsView = (trmsFixIdntfKey) => !/AGE/i.test(trmsFixIdntfKey);

const CONFIRM_BTN =
  '!border-transparent !bg-brand-50 !text-brand-600 hover:enabled:!bg-brand-100 disabled:!bg-surface-3 disabled:!text-line-strong';

// 1단계. 복구할 이메일을 읽기 전용으로 보이고 인증번호로 본인을 확인한다
function VerifyStep({ form }) {
  const target = form.guideTarget;
  return (
    <form noValidate onSubmit={form.submitVerify}>
      <div className="flex flex-col gap-5">
        <AuthField
          id="recovery-email"
          icon={Mail}
          label="복구할 이메일"
          value={form.email}
          onChange={() => {}}
          readOnly
          autoComplete="username"
          error={form.errors.email}
          help={MSG.emailHelp}
          hasGuide={target === 'email'}
          action={
            <button
              type="button"
              onClick={form.sendCode}
              disabled={form.isSending}
              className={SIDE_BTN}
            >
              {form.isSent ? '다시 보내기' : '인증번호 보내기'}
            </button>
          }
        />
        {form.isSent && (
          <AuthField
            id="recovery-code"
            icon={ShieldCheck}
            label="인증번호"
            value={form.code}
            onChange={form.changeCode}
            placeholder="숫자 6자리 입력"
            autoComplete="one-time-code"
            inputMode="numeric"
            maxLength={6}
            error={form.errors.code}
            help={MSG.sent}
            hasGuide={target === 'code'}
            endAdornment={
              <span className="font-semibold text-danger tabular-nums">
                {form.countdown.text}
              </span>
            }
            action={
              <button
                type="submit"
                disabled={form.isVerifying}
                className={`${SIDE_BTN} ${CONFIRM_BTN}`}
              >
                인증 확인
              </button>
            }
          />
        )}
      </div>
    </form>
  );
}

// 2단계. 본인확인된 기존 회원 정보를 보이고, 빠진 약관·번호를 받은 뒤 사용자가 직접 복구한다
function ConfirmStep({ form }) {
  const { info } = form;
  return (
    <>
      <SignupSummary
        rows={[
          ['복구할 이메일', info.acntEml],
          ['기존 닉네임', info.mbrNcnm],
          [
            '복구 가능 기간',
            form.remainDays > 0 ? `${form.remainDays}일 남음` : '오늘까지',
          ],
        ]}
      />
      <p className="mt-3 text-sm leading-5 text-muted">
        회원정보·반려동물·건강기록·픽셀캐릭터가 복구됩니다. 새 계정을 만들지
        않고 기존 정보를 되살립니다.
      </p>
      <div className="mt-5 flex flex-col gap-5">
        {info.missingTrms.length > 0 && (
          <div>
            {info.missingTrms.map(
              ({ trmsSn, trmsFixIdntfKey, trmsTtl, esntlAgreYn }) => (
                <div
                  key={trmsSn}
                  className="flex min-h-10 items-center px-4 text-ink-2"
                >
                  <AuthCheckBox
                    checked={Boolean(form.agreed[trmsSn])}
                    onChange={() => form.toggleAgree(trmsSn)}
                  >
                    <span>
                      <em
                        className={`mr-1.5 font-semibold not-italic ${
                          esntlAgreYn ? 'text-brand-600' : 'text-subtle'
                        }`}
                      >
                        {esntlAgreYn ? '[필수]' : '[선택]'}
                      </em>
                      {trmsTtl}
                    </span>
                  </AuthCheckBox>
                  {hasTermsView(trmsFixIdntfKey) && (
                    <button
                      type="button"
                      onClick={() => form.openTerms(trmsSn)}
                      aria-label={`${trmsTtl} 내용보기`}
                      className="grid place-items-center text-subtle hover:text-ink"
                    >
                      <ChevronRight className="size-4" />
                    </button>
                  )}
                </div>
              ),
            )}
          </div>
        )}
        {form.hasStoredPhone ? (
          <SignupSummary
            rows={[['휴대전화번호 · 기존 번호 유지', info.maskedMblTelno]]}
          />
        ) : (
          <AuthField
            id="recovery-phone"
            icon={Phone}
            label="휴대전화번호"
            value={form.phone}
            onChange={form.changePhone}
            placeholder="01012345678"
            autoComplete="tel"
            inputMode="tel"
            error={form.errors.phone}
            success={form.isPhoneChecked ? SIGNUP.phoneAvailable : ''}
            help={form.phone ? SIGNUP.phoneNeedCheck : SIGNUP.phoneHelp}
            hasGuide={form.guideTarget === 'phone'}
            action={
              <button
                type="button"
                onClick={form.submitPhoneCheck}
                disabled={form.isPhoneChecking}
                className={SIDE_BTN}
              >
                중복확인
              </button>
            }
          />
        )}
      </div>
      <button
        type="button"
        onClick={form.submitRecover}
        disabled={!form.canRecover || form.isRecovering}
        className={`${PRIMARY_BTN} mt-8`}
      >
        기존 정보 복구
      </button>
    </>
  );
}

// 재가입 복구(탈퇴 후 보관 기간 안의 회원). 본인확인 → 복구 확인 → 복구 완료.
// 복구해도 로그인하지 않으므로 완료 뒤 로그인 방법 선택으로 보낸다
export default function RecoveryForm({
  email,
  onCancel,
  onGoLogin,
  onRestartSignup,
}) {
  const form = useRecovery(email, { onCancel });

  // 완료 화면은 폼 칸 전체 높이를 써서 체크 표시를 가운데, 버튼을 맨 아래에 둔다
  if (form.step === 'complete') {
    return (
      <section className="flex w-full flex-1 flex-col">
        <StepMotion stepKey="complete-head" direction={form.direction}>
          <AuthHeading title={MSG.done} subtitle={MSG.doneHelp} />
        </StepMotion>
        <div className="grid flex-1 place-items-center py-10">
          <StepMotion stepKey="complete-mark" direction={form.direction}>
            <div className="grid size-16 place-items-center rounded-full bg-tone-green-bg text-tone-green-fg">
              <Check className="size-8" />
            </div>
          </StepMotion>
        </div>
        <StepMotion stepKey="complete-action" direction={form.direction}>
          <button type="button" onClick={onGoLogin} className={PRIMARY_BTN}>
            로그인 방법 선택으로
          </button>
        </StepMotion>
      </section>
    );
  }

  const isConfirm = form.step === 'confirm';
  return (
    <AuthCard>
      <StepMotion stepKey={`${form.step}-head`} direction={form.direction}>
        <AuthHeading
          title={isConfirm ? '기존 정보 복구 확인' : '기존 정보 복구 본인확인'}
          subtitle={
            isConfirm
              ? '본인확인 후 사용자가 직접 복구를 선택합니다.'
              : '탈퇴 후 30일 이내 · 이메일 입력만으로 복구하지 않습니다.'
          }
        />
      </StepMotion>
      <StepMotion stepKey={form.step} direction={form.direction}>
        {form.notice && (
          <>
            <AuthNotice
              type={form.notice.type}
              message={form.notice.message}
              hasGuide={form.guideTarget === 'notice'}
            />
            {form.notice.isExpired && (
              <button
                type="button"
                onClick={onRestartSignup}
                className={`${OUTLINE_BTN} -mt-2 mb-6`}
              >
                새로 회원가입하기
              </button>
            )}
          </>
        )}
        {isConfirm ? <ConfirmStep form={form} /> : <VerifyStep form={form} />}
        <button
          type="button"
          onClick={form.cancel}
          disabled={form.isRecovering}
          className={`${OUTLINE_BTN} ${isConfirm ? 'mt-3' : 'mt-8'}`}
        >
          취소
        </button>
      </StepMotion>
      {form.termsView && (
        <RecoveryTermsModal trmsSn={form.termsView} onClose={form.closeTerms} />
      )}
    </AuthCard>
  );
}
