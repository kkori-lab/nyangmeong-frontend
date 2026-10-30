import { useNavigate } from 'react-router-dom';
import PasswordFindForm from '@/features/member/password/PasswordFindForm';
import { PATHS } from '@/routes/paths';

export default function PasswordFindPage() {
  const navigate = useNavigate();

  return (
    <PasswordFindForm
      onVerified={(state) => navigate(PATHS.PASSWORD_RESET, { state })}
      onBackToLogin={() => navigate(`${PATHS.LOGIN}?method=email`)}
      onGoLogin={() => navigate(PATHS.LOGIN)}
      onRecover={(recoveryEmail) =>
        navigate(PATHS.SIGNUP, { state: { recoveryEmail } })
      }
    />
  );
}
