import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import PageSkeleton from '@/components/PageSkeleton';
import Skeleton from '@/components/Skeleton';
import SkeletonCard from '@/components/SkeletonCard';
import { useHealthSummary } from '@/features/health/queries';
import PetSwitcher from '@/features/health/shared/PetSwitcher';
import SelectedPetProvider from '@/features/health/shared/SelectedPetProvider';
import { useSelectedPet } from '@/features/health/shared/selectedPet';
import { useMe } from '@/features/member/queries';
import AttachmentStrip from '@/features/health/summary/AttachmentStrip';
import ConditionCard from '@/features/health/summary/ConditionCard';
import LabSection from '@/features/health/summary/LabSection';
import ObservationSummaryCard from '@/features/health/summary/ObservationSummaryCard';
import PrescriptionHistoryCard from '@/features/health/summary/PrescriptionHistoryCard';
import PreventionHistoryCard from '@/features/health/summary/PreventionHistoryCard';
import SummaryHero from '@/features/health/summary/SummaryHero';
import SummaryTabs from '@/features/health/summary/SummaryTabs';
import { SectionHead } from '@/features/health/summary/SummaryParts';
import TimelineCard from '@/features/health/summary/TimelineCard';
import SubPageLayout from '@/layouts/SubPageLayout';

const ANCHORS = [
  { id: 'hlt011-hist', label: '진료 · 예방 이력' },
  { id: 'hlt011-lab', label: '검사 · 수치' },
  { id: 'hlt011-rx', label: '처방 · 투약' },
  { id: 'hlt011-obs', label: '관찰 기록 · 첨부 자료' },
];

/** 공용 페이지 머리·사이드 메뉴 설정 */
const LAYOUT_PROPS = {
  section: 'health',
  description: '우리 아이의 지금까지의 건강 이력을 한눈에 확인할 수 있어요',
  contentClassName: 'gap-7 tabular-nums antialiased min-[1101px]:pt-6',
};

/**
 * [종합 건강기록 SCR-HLT-011]
 * - 반려동물별 기록을 모아 보여 주는 조회 전용 화면. 등록·수정·삭제는 원천 화면(SCR-HLT-002·003·005)에서만
 * - ?inspection=<검사 항목>이면 검사 수치 추이를 그 항목으로 시작(검진상세에서 들어옴)
 * - 반려동물은 건강기록 공통 반려동물 카드(shared/PetSwitcher)의 선택을 따른다. ?petSn=<반려동물 번호>로 들어오면 그 아이로 시작하고 주소에서 지운다 (※신규 정책)
 */
export default function HealthSummaryPage() {
  const { data: me } = useMe();
  return (
    <SelectedPetProvider mbrSn={me?.mbrSn}>
      <HealthSummaryContent />
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

function HealthSummaryContent() {
  const [searchParams] = useSearchParams();
  /** 검진상세에서 ?inspection=으로 들어오면 검사 · 수치 묶음부터 */
  const [sectionId, setSectionId] = useState(
    searchParams.get('inspection') ? 'hlt011-lab' : ANCHORS[0].id,
  );
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
  // 0마리: 공통 카드가 점선 박스로 등록을 안내한다
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
      <SummaryHero pet={selectedPet} summary={summary} />
      <SummaryTabs
        items={ANCHORS}
        activeId={sectionId}
        onSelect={setSectionId}
      />

      {sectionId === 'hlt011-hist' && (
        <Panel id="hlt011-hist">
          <SectionHead
            title="진료 · 예방 이력"
            description="병원 방문과 접종·검진 기록을 시간순으로 모았어요"
          />
          {/* 태블릿은 타임라인 | 예방·정기검진, 알레르기·기저질환은 아래 전체 폭 (추가 요청) */}
          <div className="grid items-stretch gap-5 min-[761px]:grid-cols-2">
            <TimelineCard timeline={summary.timeline} />
            <div className="flex flex-col gap-5 min-[761px]:max-[1100px]:contents min-[761px]:max-[1100px]:[&>*:last-child]:col-span-2">
              <PreventionHistoryCard prevention={summary.prevention} />
              <ConditionCard pet={summary.pet} />
            </div>
          </div>
        </Panel>
      )}

      {sectionId === 'hlt011-lab' && (
        <Panel id="hlt011-lab">
          <SectionHead
            title="검사 · 수치"
            description="최근 혈액검사 결과와 항목별 변화를 확인해요"
          />
          <LabSection
            key={`lab-${selectedPet.petSn}`}
            lab={summary.lab}
            trends={summary.trends}
            initialItemNm={searchParams.get('inspection')}
          />
        </Panel>
      )}

      {sectionId === 'hlt011-rx' && (
        <Panel id="hlt011-rx">
          <SectionHead
            title="처방 · 투약"
            description="검진상세에 등록한 처방약을 복용 중인 것부터 보여줘요"
          />
          <PrescriptionHistoryCard prescriptions={summary.prescriptions} />
        </Panel>
      )}

      {sectionId === 'hlt011-obs' && (
        <Panel id="hlt011-obs">
          <SectionHead
            title="관찰 기록 · 첨부 자료"
            description="계속 지켜보는 부위의 변화와 병원 서류를 함께 확인해요"
          />
          <ObservationSummaryCard
            key={`obs-${selectedPet.petSn}`}
            petSn={selectedPet.petSn}
            observations={summary.observations}
          />
          <AttachmentStrip
            petSn={selectedPet.petSn}
            attachments={summary.attachments}
          />
        </Panel>
      )}
    </HealthLayout>
  );
}

/** 로딩 자리: 히어로 + 탭 + 첫 묶음(진료 · 예방 이력) 카드 배치 */
function SummarySkeleton() {
  return (
    <PageSkeleton
      top={<SkeletonCard className="h-[290px] max-[760px]:h-[848px]" />}
      tabs={ANCHORS.length}
    >
      <div aria-hidden="true" className="flex flex-col gap-2">
        <Skeleton className="h-6 w-36" />
        <Skeleton className="h-4 w-72 max-w-full" />
      </div>
      <div className="grid gap-5 min-[1101px]:grid-cols-2">
        <SkeletonCard className="h-[650px] max-[760px]:h-[666px]" />
        <div className="flex flex-col gap-5">
          <SkeletonCard className="h-[365px] max-[760px]:h-[587px]" />
          <SkeletonCard className="h-[265px]" />
        </div>
      </div>
    </PageSkeleton>
  );
}

/** 선택된 묶음 하나. 안쪽 간격은 페이지 본문(`LAYOUT_PROPS`의 `gap-7`)과 같음 */
function Panel({ id, children }) {
  return (
    <div
      role="tabpanel"
      id={id}
      aria-labelledby={`${id}-tab`}
      className="flex flex-col gap-7"
    >
      {children}
    </div>
  );
}
