import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import WithdrawComplete from '@/features/member/withdraw/WithdrawComplete';
import { PATHS } from '@/routes/paths';

/** 회원탈퇴 완료(SCR-ACC-020). 탈퇴 직후 이동으로만 열리고, 바로 열면 랜딩으로 */
export default function WithdrawCompletePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { state } = useLocation();
  const isWithdrawn = Boolean(state?.isWithdrawn);

  /** 로그인 상태와 화면에 남은 개인 데이터 비우기 */
  useEffect(() => {
    if (isWithdrawn) queryClient.clear();
  }, [isWithdrawn, queryClient]);

  if (!isWithdrawn) return <Navigate to={PATHS.HOME} replace />;

  return (
    <WithdrawComplete
      onGoLanding={() => navigate(PATHS.HOME, { replace: true })}
    />
  );
}
