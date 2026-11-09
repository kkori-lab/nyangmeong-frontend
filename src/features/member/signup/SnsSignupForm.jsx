import { Phone } from 'lucide-react';
import AuthCard from '../shared/AuthCard';
import AuthField from '../shared/AuthField';
import AuthHeading from '../shared/AuthHeading';
import AuthNotice from '../shared/AuthNotice';
import { PRIMARY_BTN, SIDE_BTN } from '../shared/authStyles';
import { SNS_NAME } from '../shared/snsCodes';
import TermsModal from '../shared/TermsModal';
import { SignupComplete } from './SignupForm';
import { SIGNUP_MESSAGES as MSG } from './signupMessages';
import { TermsChecklist } from './TermsStep';
import useSnsSignup from './useSnsSignup';

// SNS 신규 가입 확인(화면설계서 화면 17). 번호를 받았어도 서비스 필수 동의와 최종 가입은 여기서 직접 받는다.
// 뒤로가기는 가입 진행값을 버리고 로그인 방법 선택으로, 가입 확인 시간이 지나면 SNS 로그인부터 다시 한다
export default function SnsSignupForm({ snsSignup, onCancel, onGoLogin }) {
  const form = useSnsSignup({ snsSignup });

  if (form.step === 'complete') {
    return <SignupComplete form={form} onGoLogin={onGoLogin} />;
  }

  return (
    <AuthCard onBack={onCancel}>
      <AuthHeading
        title="가입 정보를 확인해 주세요"
        subtitle="냥멍케어 이용에 필요한 동의를 확인해 주세요."
        spacing="step"
      />
      {form.notice && (
        <AuthNotice
          type={form.notice.type}
          message={form.notice.message}
          hasGuide={form.guideTarget === 'notice'}
        />
      )}
      <form onSubmit={form.submitJoin} noValidate>
        <div className="rounded-box bg-surface-2 p-4 leading-6 text-ink-2">
          <div className="flex justify-between gap-3">
            <span className="text-muted">가입 계정 확인</span>
            <strong className="min-w-0 truncate font-semibold text-ink">
              {SNS_NAME[form.snsOffrCd]} · {form.acntEml}
            </strong>
          </div>
          <p className="mt-1 text-sm text-muted">
            SNS와 이메일은 변경할 수 없습니다.
          </p>
        </div>
        <div className="mt-5">
          <AuthField
            id="sns-signup-phone"
            icon={Phone}
            label="휴대전화번호"
            value={form.phone}
            onChange={form.changePhone}
            placeholder="01012345678"
            autoComplete="tel"
            inputMode="tel"
            readOnly={form.isPhoneProvided}
            error={form.errors.phone}
            success={form.isPhoneChecked ? MSG.phoneAvailable : ''}
            help={
              form.isPhoneProvided
                ? MSG.snsPhoneProvided
                : form.phone
                  ? MSG.phoneNeedCheck
                  : MSG.snsPhoneMissing
            }
            hasGuide={form.guideTarget === 'phone'}
            action={
              !form.isPhoneProvided && (
                <button
                  type="button"
                  onClick={form.submitPhoneCheck}
                  disabled={!form.phone.trim() || form.isPhoneChecking}
                  className={SIDE_BTN}
                >
                  중복확인
                </button>
              )
            }
          />
        </div>
        <div className="mt-6">
          <TermsChecklist form={form} lockedSn={form.lockedSn} />
        </div>
        <p className="mt-2 text-sm leading-5 text-muted">
          필수 동의·연령 확인과 휴대전화번호 중복확인을 마치면 가입할 수
          있습니다. 휴대전화번호는 가입 정보 관리와 중복확인에만 씁니다.
        </p>
        {form.isExpired ? (
          <button
            type="button"
            onClick={onCancel}
            className={`${PRIMARY_BTN} mt-5`}
          >
            로그인 방법 선택으로
          </button>
        ) : (
          <button
            type="submit"
            disabled={!form.canJoin || form.isJoining}
            className={`${PRIMARY_BTN} mt-5`}
          >
            회원가입 완료
          </button>
        )}
      </form>
      {form.termsView && (
        <TermsModal trmsSn={form.termsView} onClose={form.closeTerms} />
      )}
    </AuthCard>
  );
}
