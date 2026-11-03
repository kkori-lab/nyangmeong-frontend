import { useState } from 'react';
import { Link } from 'react-router-dom';
import aiCharacter from '@/assets/ai-character.png';
import BarChart from '@/components/BarChart';
import CurveChart from '@/components/CurveChart';
import Reveal from '@/components/Reveal';
import AiReportCard from '@/features/dashboard/AiReportCard';
import {
  ASOF_TEXT,
  LAB_LABELS,
  LAB_RANGE,
  WEEK_LABELS,
  getDashboardSample,
} from '@/features/dashboard/dashboardSample';
import HealthSummary from '@/features/dashboard/HealthSummary';
import HealthWidget from '@/features/dashboard/HealthWidget';
import HeroAsk from '@/features/dashboard/HeroAsk';
import MissionList from '@/features/dashboard/MissionList';
import PetFace from '@/components/PetFace';
import PetProfileCard from '@/features/pet/PetProfileCard';
import { getVrtyName } from '@/utils/petFormat';
import { usePets } from '@/features/pet/queries';
import { PATHS } from '@/routes/paths';

const WEEK_PERIOD = '최근 5주';
const WEEK_DELTA = '지난주 대비';

const joinSeries = (series, labels, unit) =>
  series.map((v, i) => `${labels[i]} ${v}${unit}`).join(', ');

const HERO_PANEL =
  'rounded-card border border-white/16 bg-[rgba(9,32,34,0.28)] transition-colors duration-150 hover:bg-[rgba(9,32,34,0.42)]';

function PetChip({ pet, isSelected, onSelect }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={isSelected}
      onClick={() => onSelect(pet)}
      className={`inline-flex h-10 items-center gap-2 rounded-full border py-0 pr-3.5 pl-[5px] font-semibold whitespace-nowrap ${
        isSelected
          ? 'border-accent-300 bg-accent-300 text-accent-ink'
          : 'border-white/26 bg-white/12 text-white hover:border-white/50'
      }`}
    >
      <span
        className={`grid size-[30px] place-items-center overflow-hidden rounded-full border border-line ${
          isSelected ? 'bg-accent-ink/10' : 'bg-white/18'
        }`}
      >
        <PetFace
          petSn={pet.petSn}
          petSeCd={pet.petSeCd}
          isError={pet.bscCharSbstYn}
          className="size-full object-cover"
          iconClassName="size-[18px]"
        />
      </span>
      {pet.petNm}
    </button>
  );
}

export default function MainPage() {
  const { data: pets = [] } = usePets();
  const [selectedPetSn, setSelectedPetSn] = useState(null);
  const [hasSwitched, setHasSwitched] = useState(false);

  const representativePet = pets.find((pet) => pet.rprsYn === 'Y') ?? pets[0];
  const selectedIndex = Math.max(
    pets.findIndex((pet) => pet.petSn === selectedPetSn),
    0,
  );
  const selectedPet = pets[selectedIndex];
  const sample = getDashboardSample(selectedIndex);
  const { weight, meal, water, walk, lab } = sample.widgets;

  const selectPet = (next) => {
    if (next.petSn === selectedPet?.petSn) return;
    setSelectedPetSn(next.petSn);
    setHasSwitched(true);
  };
  const motion = (index) =>
    hasSwitched
      ? { isInstant: true, popDelay: (index % 6) * 40 }
      : { delay: (index % 3) * 80 };

  return (
    <div className="flex flex-col gap-7 pb-10">
      <section
        aria-labelledby="main-title"
        className="flex flex-col items-center gap-4 px-8 pt-10 pb-20 text-center max-[700px]:px-5 max-[700px]:pt-8 max-[700px]:pb-[72px]"
      >
        <h1 id="main-title" className="sr-only">
          냥멍케어 메인 AI 매니저
        </h1>
        <div className="flex flex-col items-center gap-2">
          <img
            src={aiCharacter}
            alt=""
            width={135}
            height={121}
            className="block w-[135px] animate-[man-float_5s_ease-in-out_infinite] drop-shadow-[0_8px_10px_rgba(26,50,52,0.12)] motion-reduce:animate-none max-[700px]:w-[120px]"
          />
          {representativePet && (
            <p className="text-muted">
              <b className="text-ink">{representativePet.petNm}</b>
              {getVrtyName(representativePet) &&
                ` (${getVrtyName(representativePet)})`}
            </p>
          )}
        </div>
        <HeroAsk petNm={representativePet?.petNm ?? '우리 아이'} />
      </section>

      {selectedPet ? (
        <>
          <Reveal
            as="section"
            aria-label="반려동물 프로필"
            className="relative isolate overflow-hidden rounded-modal bg-brand-500 px-10 pt-9 pb-8 text-white before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(rgba(255,255,255,0.22)_1px,transparent_1px)] before:bg-[size:20px_20px] before:[mask-image:linear-gradient(105deg,transparent_35%,#000_75%)] before:content-[''] max-[760px]:px-5 max-[760px]:py-6 *:relative *:z-[1]"
          >
            {pets.length > 1 && (
              <div
                role="radiogroup"
                aria-label="반려동물 선택"
                className="mb-7 flex flex-wrap gap-2"
              >
                {pets.map((pet) => (
                  <PetChip
                    key={pet.petSn}
                    pet={pet}
                    isSelected={pet.petSn === selectedPet.petSn}
                    onSelect={selectPet}
                  />
                ))}
              </div>
            )}
            <div className="grid gap-4 min-[1281px]:grid-cols-[minmax(280px,340px)_minmax(0,1fr)]">
              <div className={HERO_PANEL}>
                <PetProfileCard pet={selectedPet} />
              </div>
              <div className={`${HERO_PANEL} overflow-hidden`}>
                <HealthSummary exam={sample.exam} lab={lab} rx={sample.rx} />
              </div>
            </div>
          </Reveal>

          <div className="mt-5 flex flex-col gap-5">
            <Reveal className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-[22px] leading-[1.35] font-bold tracking-[-0.02em]">
                건강기록 통합대시보드
              </h2>
              <p className="text-sm text-muted tabular-nums">{ASOF_TEXT}</p>
            </Reveal>
            <div className="grid grid-cols-3 gap-5 max-[1100px]:grid-cols-2 max-[700px]:grid-cols-1">
              <AiReportCard
                key={`ai-${selectedPet.petSn}`}
                petNm={selectedPet.petNm}
                report={sample.report}
                motion={motion(0)}
              />
              <HealthWidget
                key={`weight-${selectedPet.petSn}`}
                motion={motion(1)}
                title="체중"
                period={WEEK_PERIOD}
                value={weight.value}
                unit="kg"
                delta={weight.delta}
                deltaLabel={WEEK_DELTA}
                deltaUnit="kg"
              >
                <CurveChart
                  values={weight.series}
                  labels={WEEK_LABELS}
                  formatValue={(v) => `${v}kg`}
                  label={`체중 변화 곡선 그래프 · ${joinSeries(weight.series, WEEK_LABELS, 'kg')}`}
                />
              </HealthWidget>
              <HealthWidget
                key={`meal-${selectedPet.petSn}`}
                motion={motion(2)}
                title="식사량"
                period={WEEK_PERIOD}
                value={meal.value}
                unit="g / 1일"
                delta={meal.delta}
                deltaLabel={WEEK_DELTA}
                deltaUnit="g"
              >
                <CurveChart
                  values={meal.series}
                  labels={WEEK_LABELS}
                  formatValue={(v) => `${v}g`}
                  label={`식사량 변화 곡선 그래프 · ${joinSeries(meal.series, WEEK_LABELS, 'g')}`}
                />
              </HealthWidget>
              <HealthWidget
                key={`water-${selectedPet.petSn}`}
                motion={motion(3)}
                title="음수량"
                period={WEEK_PERIOD}
                value={water.value}
                unit="ml / 1일"
                delta={water.delta}
                deltaLabel={WEEK_DELTA}
                deltaUnit="ml"
              >
                <CurveChart
                  values={water.series}
                  labels={WEEK_LABELS}
                  formatValue={(v) => `${v}ml`}
                  label={`음수량 변화 곡선 그래프 · ${joinSeries(water.series, WEEK_LABELS, 'ml')}`}
                />
              </HealthWidget>
              <HealthWidget
                key={`walk-${selectedPet.petSn}`}
                motion={motion(4)}
                title="산책"
                period={WEEK_PERIOD}
                value={walk.value}
                unit="분 / 1일"
                delta={walk.delta}
                deltaLabel={WEEK_DELTA}
                deltaUnit="분"
              >
                <BarChart
                  values={walk.series}
                  labels={WEEK_LABELS}
                  label={`산책 시간 막대그래프 · ${joinSeries(walk.series, WEEK_LABELS, '분')} · 점선은 평균`}
                />
              </HealthWidget>
              <HealthWidget
                key={`lab-${selectedPet.petSn}`}
                motion={motion(5)}
                title="혈액검사 · CREA"
                period="최근 5회"
                value={lab.value}
                unit="mg/dL"
                delta={lab.delta}
                deltaLabel="지난 검사 대비"
                deltaUnit=""
              >
                <CurveChart
                  values={lab.series}
                  labels={LAB_LABELS}
                  band={LAB_RANGE}
                  label={`CREA 수치 변화 곡선 그래프 · 참고범위 ${LAB_RANGE[0]}~${LAB_RANGE[1]} 점선 표시 · ${joinSeries(lab.series, LAB_LABELS, '')} mg/dL`}
                />
              </HealthWidget>
            </div>
          </div>

          <MissionList missions={sample.missions} />

          <Reveal as="p" className="mt-8 flex justify-center">
            <Link
              to={PATHS.HEALTH}
              className="inline-flex h-[46px] items-center rounded-md bg-brand-500 px-8 font-semibold text-white hover:bg-brand-600"
            >
              통합대시보드 전체 보기
            </Link>
          </Reveal>
        </>
      ) : (
        <p className="text-center text-muted">
          등록된 반려동물이 없어요.{' '}
          <Link
            to={PATHS.MYPAGE_PETS}
            className="font-semibold text-brand-600 underline"
          >
            반려동물 등록하기
          </Link>
        </p>
      )}
    </div>
  );
}
