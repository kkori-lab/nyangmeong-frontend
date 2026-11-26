import { useState } from 'react';
import LoadError from '@/components/LoadError';
import Skeleton from '@/components/Skeleton';
import SkeletonCard from '@/components/SkeletonCard';
import { formatDate, getTodayYmd } from '@/utils/formatDate';
import Icon from '@/components/Icon';
import { BTN_SECONDARY } from '@/components/buttonStyles';
import {
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

/**
 * 열 수는 화면 폭이 아니라 그리드를 감싸는 컨테이너(GRID_WRAP_CLASS) 폭으로 정함(추가-6)
 * - 컨테이너 1000px 이상 3열, 그 미만 2열(760px 미만은 요약 타일 2열·gap-3)
 */
const GRID_WRAP_CLASS = '@container';
const GRID_CLASS =
  'grid grid-cols-3 gap-5 @max-[1000px]:grid-cols-2 max-[760px]:gap-3';

/**
 * [건강 대시보드] 종합 건강기록 히어로 아래 (※신규 정책, 흐름도 D1~D10)
 * - 고른 항목은 회원 단위(반려동물을 새로 등록해도 같은 선택). 저장 여부는 서버(savedYn)라 브라우저가 달라도 같음
 * - 저장한 적이 없을 때 튜토리얼 자동 열림(D1·D2)은 여기서 하지 않고 페이지의 WidgetTutorialGate 한 곳에서만 한다.
 *   건강 일지·케어 캘린더도 같은 Gate를 써서 세 화면 어디서든 첫 진입에 열림 (※신규 정책, 2026-11-26)
 * - 카드 순서는 저장한 순서 그대로([대시보드 편집] 미리보기에서 끌어 바꿈, D8 4묶음 고정은 버림), AI 건강분석 리포트는 항상 맨 앞(D9)
 * - 검진상세 [추이 보기]로 들어와 검사 수치 카드를 그 항목으로 여는 것은 취소 (※신규 정책 취소, 2026-11-23)
 * - 제목 줄 오른쪽 [대시보드 편집]: 편집 모달을 바로 엶(⋮ 메뉴 대신, ※신규 정책)
 * - isTutorialRequested: 부모의 튜토리얼 요청(0마리에서 등록하고 돌아옴). 1단계부터 열고 닫으면 onTutorialClose (※신규 정책)
 *   저장한 적 없는 회원이면 Gate가 열고 닫을 때 요청을 끄므로, 여기서는 이미 고른 항목이 있을 때만 연다(두 번 뜨지 않게, ※신규 정책, 2026-11-26)
 * - 이미 고른 항목이 있는 회원이 튜토리얼을 다시 열면 2단계 처음 체크가 고른 항목이고, 끝까지 가지 않고 닫으면 저장하지 않음(isReplay) (※신규 정책)
 * - isEditRequested: 부모의 편집 모달 요청(둘러보기 「대시보드 편집 바로 열기 ›」). 고른 항목이 있을 때만 열고 닫으면 onEditClose (※신규 정책)
 * - 760px 미만: AI 띠 + 요약 타일 2열, 기준일은 요약 띠에만 (※신규 정책)
 */
export default function HealthDashboard({
  mbrSn,
  pet,
  summary,
  isTutorialRequested = false,
  onTutorialClose,
  isEditRequested = false,
  onEditClose,
}) {
  const widgets = useHealthWidgets(mbrSn);
  /** null: 닫힘 / 'tutorial' / 'edit' */
  const [modalMode, setModalMode] = useState(null);

  const savedIds = widgets.data ? keepWidgetOrder(widgets.data) : null;
  /** 요청은 고른 항목이 있을 때만 받음: 저장한 적 없으면 WidgetTutorialGate가 연다 (※신규 정책, 2026-11-26) */
  const openMode =
    modalMode ??
    (savedIds && isEditRequested
      ? 'edit'
      : savedIds && isTutorialRequested
        ? 'tutorial'
        : null);

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

  /** 항목별 조회 상태: 불러오는 중이면 true */
  const isItemPending = (id) => {
    if (INDICATOR_IDS.includes(id)) return indicators.isPending;
    if (id === 'poop') return stools.isPending;
    if (id === 'ckup') return checkups.isPending;
    return false;
  };
  const sources = {
    petSn: pet.petSn,
    petNm: pet.petNm,
    summary,
    indicators: indicators.data,
    stools: stools.data,
    checkups: checkups.data?.content,
  };

  const closeModal = () => {
    setModalMode(null);
    onTutorialClose?.();
    onEditClose?.();
  };

  if (widgets.isPending) return <DashboardSkeleton />;

  return (
    <section
      aria-labelledby="hlt011-dashboard"
      className="flex flex-col gap-4 max-[760px]:mt-8"
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <h2
            id="hlt011-dashboard"
            className="text-2xl leading-[1.35] font-bold tracking-[-0.02em] text-ink"
          >
            {pet.petNm}의 건강 대시보드
          </h2>
          <p className="mt-1 text-muted">
            고른 기록만 보여요
            <span className="max-[760px]:hidden">
              {' '}
              · 기준일{' '}
              {formatDate(getTodayYmd(), { weekday: true, weekdayGap: '' })}
            </span>
          </p>
        </div>
        {savedIds && (
          <button
            type="button"
            className={BTN_SECONDARY}
            onClick={() => setModalMode('edit')}
          >
            <Icon name="tune" className="text-lg" />
            대시보드 편집
          </button>
        )}
      </div>

      {widgets.isError ? (
        <LoadError
          message="기록 항목을 불러오지 못했어요. 잠시 뒤 다시 시도해 주세요"
          onRetry={() => widgets.refetch()}
        />
      ) : (
        <div className={GRID_WRAP_CLASS}>
          <div className={GRID_CLASS}>
            <AiReportCard key={pet.petSn} pet={pet} />
            {shownIds.map((id) =>
              isItemPending(id) ? (
                <SkeletonCard
                  key={id}
                  className={`h-[300px] max-[760px]:h-28 ${MOBILE_HIDDEN_IDS.includes(id) ? 'max-[760px]:hidden' : ''}`}
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
        </div>
      )}

      {(openMode === 'tutorial' || openMode === 'edit') && (
        <WidgetTutorialModal
          mode={openMode}
          isReplay={openMode === 'tutorial'}
          mbrSn={mbrSn}
          petSn={pet.petSn}
          petNm={pet.petNm}
          savedIds={shownIds}
          onClose={closeModal}
        />
      )}
    </section>
  );
}

/** 고른 항목을 불러오는 동안: 머리 + 카드 한 줄(760px 미만 AI 띠 + 타일 2칸) */
export function DashboardSkeleton() {
  return (
    <div aria-busy="true" className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-7 w-56" />
        <Skeleton className="h-5 w-72 max-w-full" />
      </div>
      <div className={GRID_WRAP_CLASS}>
        <div className={GRID_CLASS}>
          <SkeletonCard className="col-span-2 h-16 min-[760px]:hidden" />
          <SkeletonCard className="h-[300px] max-[760px]:h-28" />
          <SkeletonCard className="h-[300px] max-[760px]:h-28" />
          {/* 셋째 칸은 3열(컨테이너 1000px 이상)일 때만 */}
          <SkeletonCard className="h-[300px] @max-[1000px]:hidden" />
        </div>
      </div>
    </div>
  );
}
