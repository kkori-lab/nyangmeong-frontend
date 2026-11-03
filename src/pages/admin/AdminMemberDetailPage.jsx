import { useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { BTN_DANGER, BTN_SECONDARY } from '@/components/buttonStyles';
import Skeleton from '@/components/Skeleton';
import SkeletonCard from '@/components/SkeletonCard';
import MemberDetailInfo from '@/features/adminMember/MemberDetailInfo';
import MemberHistoryTab from '@/features/adminMember/MemberHistoryTab';
import {
  ROLE_OPTIONS,
  STATUS_OPTIONS,
} from '@/features/adminMember/memberLabels';
import MemberPetsTab from '@/features/adminMember/MemberPetsTab';
import MemberPointsTab from '@/features/adminMember/MemberPointsTab';
import MemberTermsTab from '@/features/adminMember/MemberTermsTab';
import { useAdminMember } from '@/features/adminMember/queries';
import ReleaseModal from '@/features/adminMember/ReleaseModal';
import SuspendModal from '@/features/adminMember/SuspendModal';
import { PATHS } from '@/routes/paths';
import { isForbiddenError } from '@/utils/isForbiddenError';
import AdminForbidden from './AdminForbidden';

const PAGE_SIZE = 20;

/** 탭: 건강기록·AI 대화·채팅은 두지 않음 */
const TABS = [
  { key: 'pets', label: '반려동물' },
  { key: 'terms', label: '약관 동의' },
  { key: 'points', label: '포인트' },
  { key: 'history', label: '상태 이력' },
];

/** 버튼 줄 + 기본 정보 + 탭 + 표 자리 */
function MemberDetailSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true">
      <Skeleton className="h-10 w-full" />
      <SkeletonCard className="h-[296px]" />
      <Skeleton className="h-12 w-full" />
      <SkeletonCard className="h-[150px]" />
    </div>
  );
}

/**
 * [회원 상세]
 * - 탭은 ?tab=pets|terms|points|history, 첫 탭은 pets
 * - 정상 일반 회원은 [정지], 정지 회원은 [정지 해제], 관리자·탈퇴 회원은 버튼 없음
 * - 상세 응답에 권한이 없는 동안 관리자도 [정지] 표시 -> 서버가 409로 거절
 */
export default function AdminMemberDetailPage() {
  const { mbrSn: mbrSnParam } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [openModal, setOpenModal] = useState(null);

  const mbrSn = Number(mbrSnParam);
  const member = useAdminMember(mbrSn);

  const tabParam = searchParams.get('tab');
  const tab = TABS.some(({ key }) => key === tabParam) ? tabParam : 'pets';
  const page = Number(searchParams.get('page')) || 1;

  const handleTabSelect = (nextTab) => setSearchParams({ tab: nextTab });
  const handlePageChange = (nextPage) =>
    setSearchParams({ tab, page: nextPage });
  const handleModalClose = () => setOpenModal(null);
  const handleRetry = () => member.refetch();

  /** 고른 탭 내용 */
  const renderTab = () => {
    const pageProps = {
      mbrSn,
      page,
      size: PAGE_SIZE,
      onPageChange: handlePageChange,
    };
    if (tab === 'terms') return <MemberTermsTab mbrSn={mbrSn} />;
    if (tab === 'points') return <MemberPointsTab {...pageProps} />;
    if (tab === 'history') return <MemberHistoryTab {...pageProps} />;
    return <MemberPetsTab {...pageProps} />;
  };

  /** 본문: 로딩 / 403 / 없는 회원 / 그 밖의 오류 / 상세 */
  const renderBody = () => {
    if (member.isPending) return <MemberDetailSkeleton />;
    if (isForbiddenError(member.error)) {
      return <AdminForbidden message={member.error.message} />;
    }
    if (member.error?.code === 'MEMBER_NOT_FOUND') {
      return (
        <div
          role="alert"
          className="flex flex-col items-center gap-3 rounded-[14px] border border-line bg-white py-16"
        >
          <p className="text-base text-subtle">회원을 찾을 수 없어요</p>
          <Link to={PATHS.ADMIN_MEMBERS} className={BTN_SECONDARY}>
            목록으로
          </Link>
        </div>
      );
    }
    if (member.isError) {
      return (
        <div role="alert" className="flex flex-col items-center gap-3 py-16">
          <p className="text-base text-subtle">
            회원 정보를 불러오지 못했어요.
          </p>
          <button type="button" className={BTN_SECONDARY} onClick={handleRetry}>
            다시 시도
          </button>
        </div>
      );
    }

    const canSuspend =
      member.data.mbrAuthrtCd !== ROLE_OPTIONS[1].value &&
      member.data.mbrSttsCd === STATUS_OPTIONS[0].value;
    const canRelease = member.data.mbrSttsCd === STATUS_OPTIONS[1].value;

    return (
      <>
        <div className="mb-4 flex items-center justify-between gap-2">
          <Link to={PATHS.ADMIN_MEMBERS} className={BTN_SECONDARY}>
            목록으로
          </Link>
          {canSuspend && (
            <button
              type="button"
              className={BTN_DANGER}
              onClick={() => setOpenModal('suspend')}
            >
              정지
            </button>
          )}
          {canRelease && (
            <button
              type="button"
              className={BTN_SECONDARY}
              onClick={() => setOpenModal('release')}
            >
              정지 해제
            </button>
          )}
        </div>
        <MemberDetailInfo member={member.data} />
        <div
          role="tablist"
          aria-label="회원 상세"
          className="my-4 flex gap-1 overflow-x-auto shadow-[inset_0_-1px_0_var(--color-line)] [scrollbar-width:none]"
        >
          {TABS.map(({ key, label }) => {
            const isSelected = key === tab;
            return (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={isSelected}
                className={`relative h-12 shrink-0 px-4 text-base whitespace-nowrap ${
                  isSelected
                    ? 'font-bold text-brand-900 after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:bg-brand-900'
                    : 'font-semibold text-subtle hover:text-ink'
                }`}
                onClick={() => handleTabSelect(key)}
              >
                {label}
              </button>
            );
          })}
        </div>
        <div role="tabpanel">{renderTab()}</div>
        {openModal === 'suspend' && (
          <SuspendModal member={member.data} onClose={handleModalClose} />
        )}
        {openModal === 'release' && (
          <ReleaseModal member={member.data} onClose={handleModalClose} />
        )}
      </>
    );
  };

  return (
    <div className="mx-auto max-w-[1200px]">
      <h1 className="mb-5 text-2xl font-bold text-ink">회원 상세</h1>
      {renderBody()}
    </div>
  );
}
