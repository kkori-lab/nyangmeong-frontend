import { useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import StepMotion from '@/components/StepMotion';
import EmailLoginForm from '@/features/member/login/EmailLoginForm';
import LoginMethodChoice from '@/features/member/login/LoginMethodChoice';
import NicknameModal from '@/features/member/signup/NicknameModal';
import { PATHS } from '@/routes/paths';
import { getRedirectPath } from '@/routes/redirect';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const isEmail = searchParams.get('method') === 'email';
  // 이메일 로그인으로 들어가면 forward, 방법 선택으로 돌아오면 back (전환 모션의 방향)
  const [prevIsEmail, setPrevIsEmail] = useState(isEmail);
  const [direction, setDirection] = useState('forward');
  /** 가입 후 첫 로그인인데 닉네임 설정이 안 끝났으면 서버가 준 닉네임으로 모달을 띄운다 */
  const [reguideNickname, setReguideNickname] = useState(null);
  if (prevIsEmail !== isEmail) {
    setPrevIsEmail(isEmail);
    setDirection(isEmail ? 'forward' : 'back');
  }

  const selectEmail = () =>
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('method', 'email');
      return next;
    });

  const backToChoice = () => {
    if (location.key !== 'default') {
      navigate(-1);
      return;
    }
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete('method');
        return next;
      },
      { replace: true },
    );
  };

  const goAfterLogin = () =>
    navigate(getRedirectPath(location.search), { replace: true });

  const finishLogin = ({ ncnmReguide, mbrNcnm }) => {
    if (ncnmReguide) {
      setReguideNickname(mbrNcnm);
      return;
    }
    goAfterLogin();
  };

  return (
    <>
      <StepMotion stepKey={isEmail ? 'email' : 'choice'} direction={direction}>
        {isEmail ? (
          <EmailLoginForm onBack={backToChoice} onSuccess={finishLogin} />
        ) : (
          <LoginMethodChoice
            onBack={() => navigate(PATHS.HOME)}
            onSelectEmail={selectEmail}
            onSignup={() => navigate(PATHS.SIGNUP)}
            isJoined={searchParams.get('joined') === '1'}
          />
        )}
      </StepMotion>
      {reguideNickname !== null && (
        <NicknameModal
          savedNickname={reguideNickname}
          onSaved={goAfterLogin}
          onClose={goAfterLogin}
        />
      )}
    </>
  );
}
