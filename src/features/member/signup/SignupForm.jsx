import StepMotion from '@/components/StepMotion';
import AuthActions from '../shared/AuthActions';
import AuthCard from '../shared/AuthCard';
import AuthHeading from '../shared/AuthHeading';
import AuthNotice from '../shared/AuthNotice';
import { TEXT_LINK, AUTH_BTN_PRIMARY } from '../shared/authStyles';
import TermsModal from '../shared/TermsModal';
import EmailStep from './EmailStep';
import NicknameModal from './NicknameModal';
import PasswordStep from './PasswordStep';
import PhoneStep from './PhoneStep';
import SignupStepper from './SignupStepper';
import TermsStep from './TermsStep';
import { SIGNUP_MESSAGES as MSG } from './signupMessages';
import useSignup from './useSignup';

const STEPS = {
  terms: {
    no: 1,
    title: '약관에 동의해 주세요',
    subtitle: '회원가입에 필요한 약관을 확인해 주세요.',
    Body: TermsStep,
  },
  email: {
    no: 2,
    title: '이메일을 인증해 주세요',
    subtitle: '인증한 이메일 주소를 로그인 아이디로 사용합니다.',
    Body: EmailStep,
  },
  phone: {
    no: 3,
    title: '휴대전화번호를 입력해 주세요',
    subtitle: '문자 인증 없이 중복 여부만 확인합니다.',
    Body: PhoneStep,
  },
  password: {
    no: 4,
    title: '비밀번호를 설정해 주세요',
    subtitle: '영문과 숫자를 함께 써서 8~64자로 입력해 주세요(공백 제외).',
    Body: PasswordStep,
  },
};

// 가입 완료 화면. 닉네임 모달이 열린 채로 들어오고, 이메일 가입과 SNS 가입이 같이 쓴다.
// form: direction, nickname, isNicknameOpen, openNickname, closeNickname, saveNickname
export function SignupComplete({ form, onGoLogin }) {
  return (
    <AuthCard isCentered={false}>
      <StepMotion
        stepKey="complete"
        direction={form.direction}
        className="flex flex-1 flex-col"
      >
        {/* 제목 묶음은 칸 가운데, 버튼은 맨 아래 */}
        <div className="flex flex-1 flex-col justify-center text-center">
          <AuthHeading
            title="회원가입이 완료되었습니다"
            subtitle="가입한 계정으로 로그인해 주세요."
          />
          <div className="rounded-box bg-surface-2 px-5 py-6">
            <small className="block text-muted">현재 저장된 닉네임</small>
            <strong className="mt-1 block text-2xl font-bold">
              {form.nickname}
            </strong>
            <button
              type="button"
              onClick={form.openNickname}
              className="mt-2 font-semibold text-brand-600 hover:underline hover:underline-offset-[3px]"
            >
              닉네임 설정
            </button>
          </div>
        </div>
        <AuthActions>
          <button
            type="button"
            onClick={onGoLogin}
            className={`${AUTH_BTN_PRIMARY} w-full`}
          >
            로그인으로
          </button>
        </AuthActions>
      </StepMotion>
      {form.isNicknameOpen && (
        <NicknameModal
          savedNickname={form.nickname}
          onSaved={form.saveNickname}
          onClose={form.closeNickname}
        />
      )}
    </AuthCard>
  );
}

// 이메일 가입(약관 → 이메일 인증 → 휴대전화번호 → 비밀번호). 가입은 마지막 단계에서만 일어나고,
// 성공하면 닉네임 설정 모달이 열린 가입 완료 화면으로 간다. 가입만으로 로그인하지 않는다
export default function SignupForm({ onBackToLogin, onGoLogin, onRecover }) {
  const form = useSignup({ onBackToLogin, onRecover });

  if (form.step === 'complete') {
    return <SignupComplete form={form} onGoLogin={onGoLogin} />;
  }

  const { no, title, subtitle, Body } = STEPS[form.step];
  return (
    <AuthCard
      onBack={form.goBack}
      spacing={form.step === 'phone' ? 'sparse' : 'normal'}
    >
      <StepMotion stepKey={`${form.step}-head`} direction={form.direction}>
        <AuthHeading title={title} subtitle={subtitle} />
      </StepMotion>
      <SignupStepper current={no} />
      <StepMotion
        stepKey={form.step}
        direction={form.direction}
        className="flex grow flex-col"
      >
        {form.notice && !(form.step === 'email' && form.isCodeLocked) && (
          <AuthNotice type={form.notice.type} message={form.notice.message} />
        )}
        <Body form={form} />
      </StepMotion>
      {/* 이미 가입된 이메일이면 아래 버튼이 [기존 가입 방법으로 로그인]이 되므로 이 줄은 숨긴다 */}
      {form.errors.email !== MSG.emailDuplicate && (
        <div className="mt-4 flex justify-center gap-2 text-muted">
          이미 회원이신가요?
          <button
            type="button"
            onClick={onBackToLogin}
            className={`font-semibold text-brand-600 ${TEXT_LINK}`}
          >
            로그인
          </button>
        </div>
      )}
      {form.termsView && (
        <TermsModal trmsSn={form.termsView} onClose={form.closeTerms} />
      )}
    </AuthCard>
  );
}
