import { useState } from 'react';
import { showToast } from '@/components/toastStore';
import PasswordConfirm from '@/features/member/profile/PasswordConfirm';
import ProfileEditForm from '@/features/member/profile/ProfileEditForm';
import { useMyProfile } from '@/features/member/queries';
import { JOIN_PATH_EMAIL } from '@/features/member/shared/snsCodes';
import SubPageLayout from '@/layouts/SubPageLayout';

export default function ProfileEditPage() {
  const { data: profile, isError } = useMyProfile();
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
      {isError && <p className="text-danger">회원 정보를 불러오지 못했어요</p>}
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
          // 회원 탈퇴 화면(SCR-ACC-020, YAY) 경로가 생기면 이동으로 바꾼다
          onWithdraw={() => showToast('준비 중인 기능이에요')}
        />
      )}
    </SubPageLayout>
  );
}
