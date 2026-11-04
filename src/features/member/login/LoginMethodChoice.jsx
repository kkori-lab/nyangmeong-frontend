import { Mail } from 'lucide-react';
import AuthCard from '../shared/AuthCard';
import AuthHeading from '../shared/AuthHeading';
import AuthNotice from '../shared/AuthNotice';
import { LOGIN_MESSAGES as MSG } from './loginMessages';
import SnsLoginButtons from './SnsLoginButtons';

export default function LoginMethodChoice({
  onBack,
  onSelectEmail,
  onSignup,
  isJoined,
  snsNotice,
  isSnsPending,
}) {
  return (
    <AuthCard onBack={onBack}>
      <AuthHeading title="로그인" subtitle="가입한 방법으로 로그인해 주세요." />
      {isJoined && (
        <AuthNotice
          type="ok"
          message="회원가입이 완료되었습니다. 가입한 방법으로 다시 로그인해 주세요."
        />
      )}
      {isSnsPending && <AuthNotice type="info" message={MSG.snsPending} />}
      {snsNotice && (
        <AuthNotice
          type={snsNotice.type}
          message={snsNotice.message}
          hasGuide
        />
      )}
      <SnsLoginButtons disabled={isSnsPending} />
      <div className="my-6 flex items-center gap-4 text-subtle before:h-px before:flex-1 before:bg-line after:h-px after:flex-1 after:bg-line">
        또는
      </div>
      <button
        type="button"
        onClick={onSelectEmail}
        className="inline-flex h-[50px] w-full items-center justify-center gap-1.5 rounded-xl bg-brand-500 text-[15px] font-bold text-white transition hover:-translate-y-px hover:bg-brand-600"
      >
        <Mail className="size-5" />
        이메일로 로그인하기
      </button>
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
