import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import RecoveryForm from '@/features/member/recovery/RecoveryForm';
import SignupForm from '@/features/member/signup/SignupForm';
import { PATHS } from '@/routes/paths';

// 가입 화면. 탈퇴 후 보관 기간 안의 이메일이면(가입 발송이 거절되거나 비밀번호 찾기에서 넘어오면) 재가입 복구 화면으로 바뀐다.
// 복구할 이메일만 넘어오고, 복구 확인 권한은 복구 화면 안에서만 다룬다
export default function SignupPage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [pickedEmail, setPickedEmail] = useState('');
  const recoveryEmail = pickedEmail || state?.recoveryEmail || '';

  const goLogin = () => {
    setPickedEmail('');
    navigate(PATHS.LOGIN);
  };

  if (recoveryEmail) {
    return (
      <RecoveryForm
        email={recoveryEmail}
        onCancel={goLogin}
        onGoLogin={goLogin}
        onRestartSignup={() => {
          setPickedEmail('');
          navigate(PATHS.SIGNUP, { replace: true, state: null });
        }}
      />
    );
  }

  return (
    <SignupForm
      onBackToLogin={() => navigate(PATHS.LOGIN)}
      onGoLogin={() => navigate(`${PATHS.LOGIN}?joined=1`)}
      onRecover={setPickedEmail}
    />
  );
}
