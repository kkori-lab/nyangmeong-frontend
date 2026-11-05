import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import PageSkeleton from '@/components/PageSkeleton';
import Skeleton from '@/components/Skeleton';
import SkeletonCard from '@/components/SkeletonCard';
import { useHealthSummary, useMyPets } from '@/features/health/queries';
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
import { PATHS } from '@/routes/paths';

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
 */
export default function HealthSummaryPage() {
  const [searchParams] = useSearchParams();
  const [tabPetSn, setTabPetSn] = useState(null);
  /** 검진상세에서 ?inspection=으로 들어오면 검사 · 수치 묶음부터 */
  const [sectionId, setSectionId] = useState(
    searchParams.get('inspection') ? 'hlt011-lab' : ANCHORS[0].id,
  );
  const {
    data: pets,
    isPending: isPetsPending,
    isError: isPetsError,
  } = useMyPets();
  const selectedPet =
    pets?.find((pet) => pet.petSn === tabPetSn) ?? pets?.[0] ?? null;
  const { data: summary, isError: isSummaryError } = useHealthSummary(
    selectedPet?.petSn ?? null,
  );

  if (isPetsPending) {
    return (
      <SubPageLayout {...LAYOUT_PROPS}>
        <SummarySkeleton />
      </SubPageLayout>
    );
  }
  if (isPetsError || isSummaryError) {
    return (
      <SubPageLayout {...LAYOUT_PROPS}>
        <p role="alert" className="text-muted">
          건강기록을 불러오지 못했어요. 잠시 뒤 다시 시도해 주세요
        </p>
      </SubPageLayout>
    );
  }
  if (!selectedPet) {
    return (
      <SubPageLayout {...LAYOUT_PROPS}>
        <p className="text-muted">
          등록된 반려동물이 없어요.{' '}
          <Link
            to={`${PATHS.MYPAGE_PETS}?register=1`}
            className="font-semibold text-brand-600 underline underline-offset-3"
          >
            반려동물 등록
          </Link>
        </p>
      </SubPageLayout>
    );
  }
  if (!summary) {
    return (
      <SubPageLayout {...LAYOUT_PROPS}>
        <SummarySkeleton />
      </SubPageLayout>
    );
  }

  return (
    <SubPageLayout {...LAYOUT_PROPS}>
      <SummaryHero
        pets={pets}
        pet={selectedPet}
        summary={summary}
        onSelect={setTabPetSn}
      />
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
    </SubPageLayout>
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
