import { useSearchParams } from 'react-router-dom';
import SkeletonCard from '@/components/SkeletonCard';
import HealthDashboard, {
  DashboardSkeleton,
} from '@/features/health/dashboard/HealthDashboard';
import { useHealthSummary } from '@/features/health/queries';
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
  contentClassName: 'gap-7 tabular-nums antialiased min-[1101px]:pt-6',
};

/**
 * [종합 건강기록 SCR-HLT-011]
 * - 히어로 + 고른 기록 대시보드만(묶음 탭 4개는 없앰, ※신규 정책). 처음이면 튜토리얼 모달, 0마리면 모달 없이 공통 카드의 등록 안내만
 * - ?inspection=<검사 항목>이면 대시보드 검사 수치 카드를 그 항목으로 시작(검진상세 [추이 보기]에서 들어옴)
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

/** 공용 페이지 틀 + 공통 반려동물 카드(1101px 이상 사이드 메뉴 아래, 1100px 이하 본문 맨 위 알약) (※신규 정책) */
function HealthLayout({ children }) {
  return (
    <SubPageLayout
      {...LAYOUT_PROPS}
      sideBottom={<PetSwitcher variant="card" />}
    >
      <PetSwitcher variant="pill" />
      {children}
    </SubPageLayout>
  );
}

function HealthSummaryContent({ mbrSn }) {
  const [searchParams] = useSearchParams();
  const {
    pet: selectedPet,
    isPending: isPetsPending,
    isError: isPetsError,
  } = useSelectedPet();
  const { data: summary, isError: isSummaryError } = useHealthSummary(
    selectedPet?.petSn ?? null,
  );

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
        <p role="alert" className="text-muted">
          건강기록을 불러오지 못했어요. 잠시 뒤 다시 시도해 주세요
        </p>
      </HealthLayout>
    );
  }
  /** 0마리: 공통 카드가 점선 박스로 등록을 안내 */
  if (!selectedPet) return <HealthLayout />;
  if (!summary) {
    return (
      <HealthLayout>
        <SummarySkeleton />
      </HealthLayout>
    );
  }

  return (
    <HealthLayout>
      <SummaryBanner pet={selectedPet} summary={summary} />
      <HealthDashboard
        mbrSn={mbrSn}
        pet={selectedPet}
        summary={summary}
        initialInspection={searchParams.get('inspection')}
      />
    </HealthLayout>
  );
}

/** 로딩 자리: 배너 + 대시보드 */
function SummarySkeleton() {
  return (
    <div aria-busy="true" className="flex flex-col gap-7">
      <SkeletonCard className="h-52 max-sm:h-96" />
      <DashboardSkeleton />
    </div>
  );
}
