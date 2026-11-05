import { useLocation, useNavigate } from 'react-router-dom';
import { useChatModal } from '@/context/chatModal';
import WithdrawFlow from '@/features/member/withdraw/WithdrawFlow';
import { usePets } from '@/features/pet/queries';
import { closeAiWindow } from '@/hooks/useAiWindow';
import { closeChatWindow } from '@/hooks/useChatWindow';
import SubPageLayout from '@/layouts/SubPageLayout';
import { PATHS } from '@/routes/paths';
import { toLoginPath } from '@/utils/loginRedirect';

/** 회원탈퇴(SCR-ACC-020). 반려동물 수(pet)와 탈퇴 흐름(member)을 나란히 조립한다 */
export default function WithdrawPage() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { data: pets, isError: isPetsError } = usePets();
  const { close: closeChatModal } = useChatModal();

  /** 탈퇴 완료: 열린 창을 닫고 완료 화면으로(로그인 캐시는 완료 화면이 비운다) */
  const handleWithdrawn = () => {
    closeAiWindow();
    closeChatWindow();
    closeChatModal();
    navigate(PATHS.WITHDRAW_COMPLETE, {
      replace: true,
      state: { isWithdrawn: true },
    });
  };

  return (
    <SubPageLayout
      section="mypage"
      menu={PATHS.MYPAGE_PROFILE}
      title="회원탈퇴"
      pixel={false}
      description="탈퇴 전에 계정과 반려동물에 미치는 영향을 확인해 주세요."
    >
      <div className="max-w-[640px]">
        <WithdrawFlow
          pets={pets}
          isPetsError={isPetsError}
          onCancel={() => navigate(PATHS.MYPAGE_PROFILE)}
          onClose={() => navigate(PATHS.HOME)}
          onWithdrawn={handleWithdrawn}
          onLoggedOut={() => navigate(toLoginPath(pathname), { replace: true })}
        />
      </div>
    </SubPageLayout>
  );
}
