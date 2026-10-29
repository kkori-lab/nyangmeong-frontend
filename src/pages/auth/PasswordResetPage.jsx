import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PasswordResetForm from '@/features/member/password/PasswordResetForm';
import { PATHS } from '@/routes/paths';

// 인증 화면에서 넘겨받은 재설정 권한이 있고 만료 전일 때만 본인확인된 것으로 본다(주소로 직접 들어오면 없다)
export default function PasswordResetPage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [isVerified] = useState(
    () =>
      Boolean(state?.pswdInitTkn) &&
      Date.parse(state.initAuthrtExpryDt) > Date.now(),
  );

  return (
    <PasswordResetForm
      isVerified={isVerified}
      onGoLogin={() => navigate(PATHS.LOGIN)}
      onRetryAuth={() => navigate(PATHS.PASSWORD_FIND)}
    />
  );
}
