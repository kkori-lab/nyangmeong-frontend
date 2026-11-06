import { useState } from 'react';
import { Link } from 'react-router-dom';
import aiCharacter from '@/assets/ai-character.png';
import Reveal from '@/components/Reveal';
import HeroAsk from '@/features/dashboard/HeroAsk';
import IndicatorWidgets from '@/features/dashboard/IndicatorWidgets';
import {
  useDashboardWidgets,
  useHealthIndicators,
  useSaveDashboardWidgets,
} from '@/features/dashboard/queries';
import { WIDGET } from '@/features/dashboard/widgetCodes';
import CarePreview from '@/features/health/CarePreview';
import { useHealthSummary, useMyPets } from '@/features/health/queries';
import SummaryHero from '@/features/health/summary/SummaryHero';
import { useMe } from '@/features/member/queries';
import { useCharacterImage } from '@/hooks/useCharacterImage';
import { PATHS } from '@/routes/paths';
import { formatYmdWeekday } from '@/utils/formatDate';
import { getVrtyName } from '@/utils/petFormat';

/**
 * [메인페이지 SCR-MAN-001]
 * - 비로그인: 히어로(기본 캐릭터 + AI 검색바)만. 위젯·케어리스트 대체 화면은 명세 미결
 * - 로그인: 대표 반려동물 캐릭터 히어로 + 종합 건강기록(HLT-011) 히어로 그대로(SummaryHero, 추가-1) + 건강 지표 위젯 + 토탈 케어리스트
 */
export default function MainPage() {
  const { data: me } = useMe();

  return (
    <div className="flex flex-col gap-7 pb-10">
      {me ? <MemberMain /> : <Hero pet={null} />}
    </div>
  );
}

/**
 * 히어로 (FN-MAN-001)
 * - pet이 있으면 그 캐릭터 전신 + "이름 (품종)" 캡션. 캐릭터 이미지가 없거나 못 받으면 기본 캐릭터
 * - pet이 없으면(비로그인·반려동물 없음) 기본 캐릭터, 캡션 없음
 */
function Hero({ pet }) {
  const characterImage = useCharacterImage(pet?.petSn ?? null, 'full');
  const vrtyName = pet ? getVrtyName(pet) : null;

  return (
    <section
      aria-labelledby="main-title"
      className="flex flex-col items-center gap-4 px-8 pt-10 pb-20 text-center max-[700px]:px-5 max-[700px]:pt-8 max-[700px]:pb-[72px]"
    >
      <h1 id="main-title" className="sr-only">
        냥멍케어 메인 AI 매니저
      </h1>
      <div className="flex flex-col items-center gap-2">
        <img
          src={characterImage ?? aiCharacter}
          alt={characterImage ? `${pet.petNm} 캐릭터` : ''}
          width={135}
          height={121}
          className="block w-[135px] animate-[man-float_5s_ease-in-out_infinite] object-contain drop-shadow-[0_8px_10px_rgba(26,50,52,0.12)] motion-reduce:animate-none max-[700px]:w-[120px]"
        />
        {pet && (
          <p className="text-muted">
            <b className="text-ink">{pet.petNm}</b>
            {vrtyName && ` (${vrtyName})`}
          </p>
        )}
      </div>
      <HeroAsk petNm={pet?.petNm ?? '우리 아이'} />
    </section>
  );
}

function MemberMain() {
  const { data: pets, isPending } = useMyPets();
  const [tabPetSn, setTabPetSn] = useState(null);
  const [hasSwitched, setHasSwitched] = useState(false);

  const representativePet =
    pets?.find((pet) => pet.rprsPetYn) ?? pets?.[0] ?? null;
  const selectedPet =
    pets?.find((pet) => pet.petSn === tabPetSn) ?? pets?.[0] ?? null;

  const selectPet = (petSn) => {
    if (petSn === selectedPet?.petSn) return;
    setTabPetSn(petSn);
    setHasSwitched(true);
  };

  return (
    <>
      <Hero pet={representativePet} />
      {isPending ? null : selectedPet ? (
        <PetDashboard
          pets={pets}
          pet={selectedPet}
          onSelect={selectPet}
          hasSwitched={hasSwitched}
        />
      ) : (
        <p className="text-center text-muted">
          등록된 반려동물이 없어요.{' '}
          <Link
            to={`${PATHS.MYPAGE_PETS}?register=1`}
            className="font-semibold text-brand-600 underline"
          >
            반려동물 등록하기
          </Link>
        </p>
      )}
    </>
  );
}

const formatInquiryTime = (inqDt) => inqDt.slice(11, 19);

/**
 * 선택한 반려동물 기준 대시보드 (FN-MAN-003~007·009)
 * - 탭·프로필·요약 수치는 HLT-011 히어로(SummaryHero)를 그대로 쓴다(추가-1)
 * - 탭을 바꾸면 히어로 요약·지표·케어리스트를 그 반려동물로 다시 부른다. 위젯 순서는 회원 단위라 그대로
 */
function PetDashboard({ pets, pet, onSelect, hasSwitched }) {
  const { data: summary, isError: isSummaryError } = useHealthSummary(
    pet.petSn,
  );
  const { data: indicators } = useHealthIndicators(pet.petSn);
  const { data: widgets, isError: isWidgetsError } = useDashboardWidgets(true);
  // 순서를 못 받으면 기본 순서로 그린다
  const widgetCodes =
    widgets?.map((widget) => widget.dshbdWdgtCd) ??
    (isWidgetsError ? Object.values(WIDGET) : null);
  const saveWidgets = useSaveDashboardWidgets();

  const motion = (index) =>
    hasSwitched
      ? { isInstant: true, popDelay: (index % 6) * 40 }
      : { delay: (index % 3) * 80 };

  return (
    <>
      {summary ? (
        <SummaryHero
          pets={pets}
          pet={pet}
          summary={summary}
          onSelect={onSelect}
        />
      ) : isSummaryError ? (
        <p role="alert" className="text-center text-muted">
          반려동물 정보를 불러오지 못했어요. 잠시 뒤 다시 시도해 주세요
        </p>
      ) : (
        <div
          aria-hidden="true"
          className="h-[280px] animate-pulse rounded-[20px] bg-brand-500/20"
        />
      )}

      <div className="mt-5 flex flex-col gap-5">
        <Reveal className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-[22px] leading-[1.35] font-bold tracking-[-0.02em]">
            건강기록 통합대시보드
          </h2>
          {indicators && (
            <p className="text-sm text-muted tabular-nums">
              기준일 {formatYmdWeekday(indicators.baseYmd)} · 최근 업데이트{' '}
              {formatInquiryTime(indicators.inqDt)}
            </p>
          )}
        </Reveal>
        {widgetCodes ? (
          <IndicatorWidgets
            widgetCodes={widgetCodes}
            indicators={indicators}
            petSn={pet.petSn}
            motion={motion}
            isSaving={saveWidgets.isPending}
            onSave={saveWidgets.mutate}
          />
        ) : (
          <div
            aria-hidden="true"
            className="grid grid-cols-3 gap-5 max-[1100px]:grid-cols-2 max-[700px]:grid-cols-1"
          >
            {Array.from({ length: 6 }, (_, index) => (
              <div
                key={index}
                className="h-64 animate-pulse rounded-card bg-[#e9eded]"
              />
            ))}
          </div>
        )}
      </div>

      <CarePreview key={pet.petSn} petSn={pet.petSn} />

      <Reveal as="p" className="mt-8 flex justify-center">
        <Link
          to={PATHS.HEALTH}
          className="inline-flex h-[46px] items-center rounded-md bg-brand-500 px-8 font-semibold text-white hover:bg-brand-600"
        >
          건강기록 전체 보기
        </Link>
      </Reveal>
    </>
  );
}
