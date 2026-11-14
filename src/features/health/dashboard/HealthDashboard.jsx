import { useEffect, useRef, useState } from 'react';
import { showToast } from '@/components/toastStore';
import Skeleton from '@/components/Skeleton';
import SkeletonCard from '@/components/SkeletonCard';
import { formatDate, getTodayYmd } from '@/utils/formatDate';
import CareItemMenu from '../CareItemMenu';
import {
  useCareItems,
  useCheckups,
  useHealthIndicators,
  useHealthWidgets,
  useRecentStools,
} from '../queries';
import { AiReportCard } from './DashboardCard';
import WidgetCard from './WidgetCard';
import WidgetTutorialModal from './WidgetTutorialModal';
import {
  findWidgetItem,
  keepWidgetOrder,
  MOBILE_HIDDEN_IDS,
} from './widgetItems';

/** 지표 API를 쓰는 항목 */
const INDICATOR_IDS = ['weight', 'meal', 'water', 'walk'];
/** 검진기록 카드 줄 수 */
const CHECKUP_COUNT = 5;

/** 1101px 이상 3열, 그 아래 2열(640px 미만은 요약 타일 2열) */
const GRID_CLASS =
  'grid grid-cols-3 gap-5 max-[1100px]:grid-cols-2 max-sm:gap-3';

/**
 * [건강 대시보드] 종합 건강기록 히어로 아래 (※신규 정책, 흐름도 D1~D10)
 * - 고른 항목은 회원 단위(반려동물을 새로 등록해도 같은 선택). 저장한 적이 없으면 튜토리얼을 연다(D1·D2)
 * - 고른 항목을 불러오는 중이거나 실패하면 튜토리얼을 열지 않음. 저장 여부는 서버(savedYn)라 브라우저가 달라도 같음
 * - 카드 순서는 저장한 순서 그대로(⋮ 메뉴 「기록 항목 편집」 미리보기에서 끌어 바꿈, D8 4묶음 고정은 버림), AI 건강분석 리포트는 항상 맨 앞(D9)
 * - initialInspection: 검사 수치 카드 처음 항목(?inspection=, 검진상세 [추이 보기])
 * - 640px 미만: AI 띠 + 요약 타일 2열, 기준일은 요약 띠에만 (※신규 정책)
 */
export default function HealthDashboard({
  mbrSn,
  pet,
  summary,
  initialInspection,
}) {
  const widgets = useHealthWidgets(mbrSn);
  /** null: 닫힘 / 'tutorial' / 'edit' */
  const [modalMode, setModalMode] = useState(null);
  /** 이 화면에서 튜토리얼을 한 번 닫았으면 저장 실패여도 다시 열지 않음 */
  const [isTutorialDone, setIsTutorialDone] = useState(false);

  const savedIds = widgets.data ? keepWidgetOrder(widgets.data) : null;
  const isTutorialNeeded =
    widgets.isSuccess && widgets.data === null && !isTutorialDone;
  const openMode = modalMode ?? (isTutorialNeeded ? 'tutorial' : null);

  /** 검진상세 [추이 보기]로 왔는데 검사 수치 카드가 없으면 한 번 안내. 저장된 선택은 바꾸지 않음 (※신규 정책, 추가-5) */
  const isInspectionHidden =
    initialInspection != null &&
    widgets.data != null &&
    !widgets.data.includes('insp');
  const hasNotifiedRef = useRef(false);
  useEffect(() => {
    if (!isInspectionHidden || hasNotifiedRef.current) return;
    hasNotifiedRef.current = true;
    showToast('[기록 항목 편집]에서 검사 수치를 켜면 추이를 볼 수 있어요');
  }, [isInspectionHidden]);

  const shownIds = savedIds ?? [];
  const isShown = (id) => shownIds.includes(id);
  const indicators = useHealthIndicators(
    INDICATOR_IDS.some(isShown) ? pet.petSn : null,
  );
  const stools = useRecentStools(pet.petSn, isShown('poop'));
  const checkups = useCheckups({
    petSn: isShown('ckup') ? pet.petSn : null,
    size: CHECKUP_COUNT,
  });
  const care = useCareItems(isShown('care') ? pet.petSn : null);

  /** 항목별 조회 상태: 불러오는 중이면 true */
  const isItemPending = (id) => {
    if (INDICATOR_IDS.includes(id)) return indicators.isPending;
    if (id === 'poop') return stools.isPending;
    if (id === 'ckup') return checkups.isPending;
    if (id === 'care') return care.isPending;
    return false;
  };
  const sources = {
    petSn: pet.petSn,
    petNm: pet.petNm,
    summary,
    indicators: indicators.data,
    stools: stools.data,
    checkups: checkups.data?.content,
    care: care.data,
    initialInspection,
  };

  const closeModal = () => {
    setModalMode(null);
    setIsTutorialDone(true);
  };

  if (widgets.isPending) return <DashboardSkeleton />;

  return (
    <section
      aria-labelledby="hlt011-dashboard"
      className="flex flex-col gap-4 max-sm:mt-8"
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <h2
            id="hlt011-dashboard"
            className="text-[22px] leading-[1.35] font-bold tracking-[-0.02em] text-ink"
          >
            {pet.petNm}의 건강 대시보드
          </h2>
          <p className="mt-1 text-muted">
            고른 기록만 보여요
            <span className="max-sm:hidden">
              {' '}
              · 기준일{' '}
              {formatDate(getTodayYmd(), { weekday: true, weekdayGap: '' })}
            </span>
          </p>
        </div>
        {savedIds && (
          <CareItemMenu
            label="대시보드 메뉴"
            leadingItems={[
              { label: '기록 항목 편집', onSelect: () => setModalMode('edit') },
            ]}
          />
        )}
      </div>

      {widgets.isError ? (
        <p role="alert" className="text-muted">
          기록 항목을 불러오지 못했어요. 잠시 뒤 다시 시도해 주세요
        </p>
      ) : (
        <div className={GRID_CLASS}>
          <AiReportCard key={pet.petSn} pet={pet} />
          {shownIds.map((id) =>
            isItemPending(id) ? (
              <SkeletonCard
                key={id}
                className={`h-[260px] max-sm:h-28 ${MOBILE_HIDDEN_IDS.includes(id) ? 'max-sm:hidden' : ''}`}
              />
            ) : (
              <WidgetCard
                key={`${id}-${pet.petSn}`}
                item={findWidgetItem(id)}
                sources={sources}
              />
            ),
          )}
        </div>
      )}

      {(openMode === 'tutorial' || openMode === 'edit') && (
        <WidgetTutorialModal
          mode={openMode}
          mbrSn={mbrSn}
          petNm={pet.petNm}
          savedIds={shownIds}
          onClose={closeModal}
        />
      )}
    </section>
  );
}

/** 고른 항목을 불러오는 동안: 머리 + 카드 한 줄(640px 미만 AI 띠 + 타일 2칸) */
export function DashboardSkeleton() {
  return (
    <div aria-busy="true" className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-7 w-56" />
        <Skeleton className="h-5 w-72 max-w-full" />
      </div>
      <div className={GRID_CLASS}>
        <SkeletonCard className="col-span-2 h-16 sm:hidden" />
        <SkeletonCard className="h-[260px] max-sm:h-28" />
        <SkeletonCard className="h-[260px] max-sm:h-28" />
        <SkeletonCard className="h-[260px] max-[1100px]:hidden" />
      </div>
    </div>
  );
}
