import StepMotion from '@/components/StepMotion';
import AuthCard from '../shared/AuthCard';
import AuthHeading from '../shared/AuthHeading';
import AuthNotice from '../shared/AuthNotice';
import { PRIMARY_BTN, TEXT_LINK } from '../shared/authStyles';
import TermsModal from '../shared/TermsModal';
import EmailStep from './EmailStep';
import NicknameModal from './NicknameModal';
import PasswordStep from './PasswordStep';
import PhoneStep from './PhoneStep';
import SignupStepper from './SignupStepper';
import TermsStep from './TermsStep';
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
    // 이메일 입력칸을 이메일 로그인의 아이디 칸과 같은 높이에 둔다(추가-8)
    spacing: 'stepEmail',
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
    <AuthCard>
      <StepMotion stepKey="complete" direction={form.direction}>
        <AuthHeading
          title="회원가입이 완료되었습니다"
          subtitle="가입한 계정으로 로그인해 주세요."
        />
        <div className="rounded-box bg-surface-2 px-5 py-6 text-center">
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
        <button
          type="button"
          onClick={onGoLogin}
          className={`${PRIMARY_BTN} mt-8`}
        >
          로그인 화면으로
        </button>
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

  const { no, title, subtitle, Body, spacing = 'step' } = STEPS[form.step];
  return (
    <AuthCard onBack={form.goBack}>
      <StepMotion stepKey={`${form.step}-head`} direction={form.direction}>
        <AuthHeading title={title} subtitle={subtitle} spacing={spacing} />
      </StepMotion>
      <SignupStepper current={no} />
      <StepMotion stepKey={form.step} direction={form.direction}>
        {form.notice && !(form.step === 'email' && form.isCodeLocked) && (
          <AuthNotice
            type={form.notice.type}
            message={form.notice.message}
            hasGuide={form.guideTarget === 'notice'}
          />
        )}
        <Body form={form} />
      </StepMotion>
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
      {form.termsView && (
        <TermsModal trmsSn={form.termsView} onClose={form.closeTerms} />
      )}
    </AuthCard>
  );
}
