import { useLocation, useNavigate } from 'react-router-dom';
import PageSkeleton from '@/components/PageSkeleton';
import Skeleton from '@/components/Skeleton';
import SkeletonCard from '@/components/SkeletonCard';
import { useAiModal } from '@/context/aiModal';
import { useChatModal } from '@/context/chatModal';
import WithdrawFlow from '@/features/member/withdraw/WithdrawFlow';
import { usePets } from '@/features/pet/queries';
import { closeChatWindow } from '@/hooks/useChatWindow';
import SubPageLayout from '@/layouts/SubPageLayout';
import { PATHS } from '@/routes/paths';
import { toLoginPath } from '@/utils/loginRedirect';

/** 로딩 자리: 유의사항·반려동물·확인 체크 카드와 버튼 줄(실측 1440px 176/153/60/50, 390px 248/201/85/108) */
function WithdrawSkeleton() {
  return (
    <PageSkeleton>
      <div className="flex flex-col gap-4">
        <SkeletonCard className="h-[176px] max-md:h-[248px]" />
        <SkeletonCard className="h-[153px] max-md:h-[201px]" />
        <SkeletonCard className="h-[60px] max-md:h-[85px]" />
        <div
          aria-hidden="true"
          className="mt-2 flex gap-2 max-md:flex-col-reverse"
        >
          <Skeleton className="h-[50px] rounded-full md:flex-1" />
          <Skeleton className="h-[50px] rounded-full md:flex-1" />
        </div>
      </div>
    </PageSkeleton>
  );
}

/** 회원탈퇴(SCR-ACC-020): 반려동물 수(pet)와 탈퇴 흐름(member) 조립 */
export default function WithdrawPage() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { data: pets, isPending, isError: isPetsError } = usePets();
  const { close: closeChatModal } = useChatModal();
  const { close: closeAiModal } = useAiModal();

  /** 탈퇴 완료: 열린 창·모달 닫고 완료 화면으로(로그인 캐시는 완료 화면이 비움) */
  const handleWithdrawn = () => {
    closeChatWindow();
    closeChatModal();
    closeAiModal();
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
        {isPending ? (
          <WithdrawSkeleton />
        ) : (
          <WithdrawFlow
            pets={pets}
            isPetsError={isPetsError}
            onCancel={() => navigate(PATHS.MYPAGE_PROFILE)}
            onClose={() => navigate(PATHS.HOME)}
            onWithdrawn={handleWithdrawn}
            onLoggedOut={() =>
              navigate(toLoginPath(pathname), { replace: true })
            }
          />
        )}
      </div>
    </SubPageLayout>
  );
}
