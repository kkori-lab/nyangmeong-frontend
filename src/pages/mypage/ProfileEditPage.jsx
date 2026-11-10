import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BTN_PRIMARY } from '@/components/buttonStyles';
import EmptyResult from '@/components/EmptyResult';
import SkeletonCard from '@/components/SkeletonCard';
import PasswordConfirm from '@/features/member/profile/PasswordConfirm';
import ProfileEditForm from '@/features/member/profile/ProfileEditForm';
import { useMyProfile } from '@/features/member/queries';
import { JOIN_PATH_EMAIL } from '@/features/member/shared/snsCodes';
import SubPageLayout from '@/layouts/SubPageLayout';
import { PATHS } from '@/routes/paths';

export default function ProfileEditPage() {
  const navigate = useNavigate();
  const { data: profile, isError, refetch } = useMyProfile();
  const [isVerified, setIsVerified] = useState(false);
  // 서버가 SNS 전용 회원(비밀번호 없음)이라고 답한 경우
  const [isSnsOnly, setIsSnsOnly] = useState(false);

  // 소셜 로그인 회원은 비밀번호가 없어 본인 확인을 건너뛴다
  const needsVerify =
    profile &&
    profile.joinPathCd === JOIN_PATH_EMAIL &&
    !isVerified &&
    !isSnsOnly;

  return (
    <SubPageLayout
      section="mypage"
      pixel={false}
      description="프로필 사진, 닉네임, 연락처 등 내 계정 정보를 관리해요"
    >
      {isError && !profile && (
        <EmptyResult title="회원 정보를 불러오지 못했어요">
          <button
            type="button"
            onClick={() => refetch()}
            className={BTN_PRIMARY}
          >
            다시 시도
          </button>
        </EmptyResult>
      )}
      {/* 가입 경로를 모르는 동안은 본인 확인 카드 크기로 자리를 잡는다 */}
      {!profile && !isError && (
        <div aria-busy="true">
          <SkeletonCard className="mx-auto h-[320px] w-full max-w-[520px]" />
        </div>
      )}
      {needsVerify && (
        <PasswordConfirm
          onVerified={() => setIsVerified(true)}
          // 서버가 SNS 전용 회원이라고 하면 본인 확인 없이 6-3으로 바꾼다
          onSnsOnly={() => setIsSnsOnly(true)}
        />
      )}
      {profile && !needsVerify && (
        <ProfileEditForm
          profile={profile}
          hidePassword={isSnsOnly}
          onWithdraw={() => navigate(PATHS.MYPAGE_WITHDRAW)}
        />
      )}
    </SubPageLayout>
  );
}
