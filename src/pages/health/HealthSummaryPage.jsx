import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import LoadError from '@/components/LoadError';
import SkeletonCard from '@/components/SkeletonCard';
import HealthDashboard, {
  DashboardSkeleton,
} from '@/features/health/dashboard/HealthDashboard';
import NoPetDashboard from '@/features/health/dashboard/NoPetDashboard';
import {
  useHealthSummary,
  usePrefetchHealthDashboard,
} from '@/features/health/queries';
import PetSwitcher from '@/features/health/shared/PetSwitcher';
import SelectedPetProvider from '@/features/health/shared/SelectedPetProvider';
import { useSelectedPet } from '@/features/health/shared/selectedPet';
import SummaryBanner from '@/features/health/summary/SummaryBanner';
import { useMe } from '@/features/member/queries';
import SubPageLayout from '@/layouts/SubPageLayout';

/** 공용 페이지 머리·사이드 메뉴 설정 */
const LAYOUT_PROPS = {
  section: 'health',
  description: '우리 아이의 지금까지의 건강 이력을 한눈에 확인할 수 있어요',
  contentClassName: 'gap-7 tabular-nums antialiased min-[1100px]:pt-6',
};

/** 0마리 [반려동물 등록] 뒤 돌아올 때 붙이는 표시: 있으면 튜토리얼을 엶 (※신규 정책) */
const TUTORIAL_PARAM = 'tutorial';

/**
 * [종합 건강기록 SCR-HLT-011]
 * - 히어로 + 고른 기록 대시보드만(묶음 탭 4개는 없앰, ※신규 정책). 처음이면 튜토리얼 모달
 * - 0마리면 대시보드 자리에 등록 안내 + [반려동물 등록]. 등록하고 돌아오면(?tutorial=1) 튜토리얼 모달을 엶 (※신규 정책)
 * - 사이드 아이 말풍선 「건강기록 둘러보기」 3장 「대시보드 편집 바로 열기 ›」는 대시보드 편집 모달을 엶 (※신규 정책)
 * - ?inspection= (검진상세 [추이 보기])은 취소해 읽지 않음 (※신규 정책 취소, 2026-11-23)
 * - 반려동물은 건강기록 공통 반려동물 카드(shared/PetSwitcher)의 선택을 따른다. ?petSn=<반려동물 번호>로 들어오면 그 아이로 시작하고 주소에서 지운다 (※신규 정책)
 */
export default function HealthSummaryPage() {
  const { data: me } = useMe();
  return (
    <SelectedPetProvider mbrSn={me?.mbrSn}>
      <HealthSummaryContent mbrSn={me?.mbrSn} />
    </SelectedPetProvider>
  );
}

/**
 * 공용 페이지 틀 + 공통 반려동물 카드(1100px 이상 사이드 메뉴 아래, 1100px 미만 본문 맨 위 알약) (※신규 정책)
 * - isNoPet: 0마리면 대시보드 자리 등록 안내와 겹치지 않게 반려동물 카드를 그리지 않음(이 화면만, ※신규 정책)
 * - onOpenDashboardEdit: 대시보드가 있을 때만 넘겨 둘러보기 3장 링크를 보임
 */
function HealthLayout({ onOpenDashboardEdit, isNoPet = false, children }) {
  return (
    <SubPageLayout
      {...LAYOUT_PROPS}
      sideBottom={
        isNoPet ? null : (
          <PetSwitcher
            variant="card"
            onOpenDashboardEdit={onOpenDashboardEdit}
          />
        )
      }
    >
      {!isNoPet && (
        <PetSwitcher variant="pill" onOpenDashboardEdit={onOpenDashboardEdit} />
      )}
      {children}
    </SubPageLayout>
  );
}

function HealthSummaryContent({ mbrSn }) {
  const [searchParams] = useSearchParams();
  const { pathname, hash } = useLocation();
  const navigate = useNavigate();
  /** 튜토리얼을 열라는 요청: 대시보드가 튜토리얼 1단계를 열고 닫을 때 끔. 등록하고 돌아왔으면 처음부터 켬 */
  const [isTutorialRequested, setIsTutorialRequested] = useState(() =>
    searchParams.has(TUTORIAL_PARAM),
  );
  /** 둘러보기에서 대시보드 편집을 열라는 요청: 대시보드가 편집 모달을 닫을 때 끔 (※신규 정책) */
  const [isEditRequested, setIsEditRequested] = useState(false);
  /** ?tutorial=은 읽은 뒤 지움. SelectedPetProvider가 ?petSn=을 먼저 지운 뒤에 지워야 두 주소 바꾸기가 겹치지 않음 */
  useEffect(() => {
    if (!searchParams.has(TUTORIAL_PARAM) || searchParams.has('petSn')) return;
    const next = new URLSearchParams(searchParams);
    next.delete(TUTORIAL_PARAM);
    const search = next.toString();
    navigate(
      { pathname, search: search ? `?${search}` : '', hash },
      { replace: true },
    );
  }, [searchParams, pathname, hash, navigate]);
  const {
    pet: selectedPet,
    isPending: isPetsPending,
    isError: isPetsError,
    refetch: refetchPets,
  } = useSelectedPet();
  const {
    data: summary,
    isError: isSummaryError,
    refetch: refetchSummary,
  } = useHealthSummary(selectedPet?.petSn ?? null);
  usePrefetchHealthDashboard({ petSn: selectedPet?.petSn ?? null, mbrSn });
  /** 요약은 프로필을 받지 않음: 목록 값(selectedPet)을 붙여 마이페이지에서 고친 값이 바로 보이게 */
  const summaryWithPet =
    summary && selectedPet ? { ...summary, pet: selectedPet } : summary;

  if (isPetsPending) {
    return (
      <HealthLayout>
        <SummarySkeleton />
      </HealthLayout>
    );
  }
  if (isPetsError || isSummaryError) {
    return (
      <HealthLayout>
        <LoadError
          message="건강기록을 불러오지 못했어요. 잠시 뒤 다시 시도해 주세요"
          onRetry={() => (isPetsError ? refetchPets() : refetchSummary())}
        />
      </HealthLayout>
    );
  }
  if (!selectedPet) {
    return (
      <HealthLayout isNoPet>
        <NoPetDashboard returnTo={`${pathname}?${TUTORIAL_PARAM}=1`} />
      </HealthLayout>
    );
  }
  if (!summary) {
    return (
      <HealthLayout>
        <SummarySkeleton />
      </HealthLayout>
    );
  }

  return (
    <HealthLayout onOpenDashboardEdit={() => setIsEditRequested(true)}>
      <SummaryBanner pet={selectedPet} summary={summaryWithPet} />
      <HealthDashboard
        mbrSn={mbrSn}
        pet={selectedPet}
        summary={summaryWithPet}
        isTutorialRequested={isTutorialRequested}
        onTutorialClose={() => setIsTutorialRequested(false)}
        isEditRequested={isEditRequested}
        onEditClose={() => setIsEditRequested(false)}
      />
    </HealthLayout>
  );
}

/** 로딩 자리: 배너 + 대시보드 */
function SummarySkeleton() {
  return (
    <div aria-busy="true" className="flex flex-col gap-7">
      <SkeletonCard className="h-52 max-[760px]:h-96" />
      <DashboardSkeleton />
    </div>
  );
}
