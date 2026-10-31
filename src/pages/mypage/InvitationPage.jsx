import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { showToast } from '@/components/toastStore';
import { INVT_STTS } from '@/features/pet/api';
import InvitationAccept from '@/features/pet/invite/InvitationAccept';
import InvitationClosed from '@/features/pet/invite/InvitationClosed';
import { useInvitation } from '@/features/pet/queries';
import { useLogout } from '@/features/member/queries';
import SubPageLayout from '@/layouts/SubPageLayout';
import { PATHS } from '@/routes/paths';

/**
 * [공동양육 초대 수락]
 * - 경로 변수 invitationToken: 백엔드 확정 전 가정 (라우트 연결은 별도 PR)
 * - 보여 줄 화면 판단 순서: ① 만료·처리됨 안내(5-6) → ② 이메일 불일치 안내(5-5) → ③ 수락 화면(5-3)
 * - ①·②에는 시안대로 "목록으로" 링크를 두지 않음(같은 캐시를 InvitationAccept도 사용)
 * - 이메일 불일치 안내의 [초대받은 계정으로 로그인]: 로그아웃한 뒤 이 초대 주소를 복귀 목적지로 넘겨 로그인으로 이동
 */
export default function InvitationPage() {
  const { invitationToken } = useParams();
  const { pathname, search } = useLocation();
  const navigate = useNavigate();
  const logout = useLogout();
  const { data: invitation } = useInvitation(invitationToken);
  const isClosed = invitation && invitation.invtSttsCd !== INVT_STTS.WAIT;

  const handleSwitchAccount = () =>
    logout.mutate(undefined, {
      onSuccess: () =>
        navigate(
          `${PATHS.LOGIN}?redirect=${encodeURIComponent(pathname + search)}`,
        ),
      onError: () =>
        showToast('로그아웃하지 못했어요. 잠시 후 다시 시도해 주세요'),
    });

  return (
    <SubPageLayout
      section="mypage"
      menu={PATHS.MYPAGE_PETS}
      title="초대 수락"
      back={!isClosed && invitation?.emlMtchYn !== 'N'}
    >
      {isClosed ? (
        <InvitationClosed invtSttsCd={invitation.invtSttsCd} />
      ) : (
        <InvitationAccept
          invitationToken={invitationToken}
          onSwitchAccount={handleSwitchAccount}
          isSwitching={logout.isPending}
        />
      )}
    </SubPageLayout>
  );
}
