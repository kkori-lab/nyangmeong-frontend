import { useEffect, useRef, useState } from 'react';
import LoadError from '@/components/LoadError';
import Skeleton from '@/components/Skeleton';
import Card from '@/components/Card';
import {
  BTN_SECONDARY,
  FILTER_CHIP,
  FILTER_CHIP_ON,
} from '@/components/buttonStyles';
import useMediaQuery from '@/hooks/useMediaQuery';
import {
  WEEKDAYS,
  formatMonthDayDot,
  getHmOf,
  getTodayYmd,
  getWeekdayIndex,
} from '@/utils/formatDate';
import {
  RECORD_TYPES,
  STOOL,
  WALK,
  WEIGHT,
  findRecordType,
  findStoolState,
} from '../diaryTypes';
import { DAILY_ITEMS, keepWidgetOrder } from '../dashboard/widgetItems';
import { useDailyTrend, usePetDetail } from '../queries';
import { round2 } from '../numberFormat';
import BarChart from '@/components/BarChart';
import EmptyResult from '@/components/EmptyResult';
import Icon from '@/components/Icon';
import LineChart from '@/components/LineChart';
import {
  RECENT_RECORD_COUNT,
  STOOL_TREND_DAYS,
  formatAmount,
  getStoolDays,
  getTrendPoints,
} from './recordUtils';

/** 산책 막대 그래프 높이: 꺾은선 그래프(LineChart 기본값)와 같게 그래프 폭 600 미만 230, 이상 260 */
const getLineChartHeight = (width) => (width < 600 ? 230 : 260);

/** 배변 상태 원의 테두리·글자 / 바탕 색. 키는 diaryTypes STOOL_STATES 코드 (※신규 정책, 2026-11-26) */
const STOOL_TONES = {
  HLTC0019: 'border-brand-500 bg-brand-50 text-brand-500', // 정상
  HLTC0020: 'border-tone-amber-fg bg-tone-amber-bg text-tone-amber-fg', // 딱딱함
  HLTC0021: 'border-tone-violet-fg bg-tone-violet-bg text-tone-violet-fg', // 무름
  HLTC0022: 'border-tone-rose-fg bg-tone-rose-bg text-tone-rose-fg', // 설사
  HLTC0023: 'border-tone-blue-fg bg-tone-blue-bg text-tone-blue-fg', // 변비
};

/**
 * [건강기록 변화 카드]
 * - 지표 탭 5종 단일 선택, 최근 5건 기준 그래프 (FN-HLT-002-09·10)
 * - 0건·1건은 그래프 대신 안내. 1건 회색 상자는 카드 남은 높이를 채우고 내용은 세로 가운데
 *   (1100px 이상은 그리드가 오늘의 기록 카드와 높이를 맞추고, 미만은 쌓여서 내용 높이만큼)
 * - 배변 상태 탭: 그래프 대신 오늘 포함 최근 7일 원형 배지 띠(왼쪽 6일 전 → 오른쪽 오늘), 카드 sub 「최근 7일」.
 *   판단 없이 추이만, 정상 범위 미표시(SCR-HLT-002 그래프 원칙). 원 안은 그날 마지막 기록 상태, 상태별 색 5종,
 *   원 아래 날짜와 한 줄(1건 시각, 2건 이상 상태를 기록 순서대로). 7일 0건이면 빈 안내, 1건이어도 띠 (※신규 정책, 2026-11-26)
 * - 760px 이하: 지표 탭이 한 줄 가로 밀기이고 줄 끝에 걸쳐 잘린 탭은 반투명, 체중 그래프의 최대·목표·최소은 왼쪽 한 열
 * - initialTypeCd: 처음 고를 지표(대시보드 카드 「기록하기 ›」, ※신규 정책). 5종이 아니거나 없으면 체중
 * - 지표 탭은 [대시보드 편집]·[항목 편집]에서 켠 매일 기록만, 대시보드 카드 순서로. widgetIds가 null(고른 적 없음)이면 5종 모두 (※신규 정책, 2026-11-14)
 *   고른 탭이 꺼지면(또는 처음 고를 지표가 꺼져 있으면) 첫 탭을 고름
 */
export default function DailyTrendCard({
  pet,
  widgetIds,
  onAddRecord,
  initialTypeCd,
}) {
  const [pickedTypeCd, setTypeCd] = useState(() =>
    RECORD_TYPES.some((item) => item.cd === initialTypeCd)
      ? initialTypeCd
      : WEIGHT,
  );
  const shownTypes =
    widgetIds == null
      ? RECORD_TYPES
      : keepWidgetOrder(widgetIds)
          .map((id) => DAILY_ITEMS.find((item) => item.id === id)?.typeCd)
          .filter((cd) => cd != null)
          .map(findRecordType);
  const typeCd = shownTypes.some((item) => item.cd === pickedTypeCd)
    ? pickedTypeCd
    : (shownTypes[0]?.cd ?? WEIGHT);
  const shownKey = shownTypes.map((item) => item.cd).join();
  const type = findRecordType(typeCd);
  const trend = useDailyTrend(pet.petSn, typeCd);
  /** 목표체중은 목록(GET /pets)에 없어 상세로 받는다. 실패하거나 오기 전이면 목표선 없이 그린다 */
  const { data: petDetail } = usePetDetail(pet.petSn, typeCd === WEIGHT);
  const isPc = useMediaQuery('(width >= 760px)');
  const rowRef = useRef(null);
  /** 줄 끝에 걸쳐 일부만 보이는 탭(모바일 가로 밀기) */
  const [clipped, setClipped] = useState([]);

  useEffect(() => {
    const row = rowRef.current;
    if (!row) return undefined;
    const update = () => {
      const rowRect = row.getBoundingClientRect();
      setClipped(
        [...row.children].map((chip) => {
          const rect = chip.getBoundingClientRect();
          const visible =
            Math.min(rect.right, rowRect.right) -
            Math.max(rect.left, rowRect.left);
          return visible > 0 && visible < rect.width - 1;
        }),
      );
    };
    update();
    row.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      row.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
    /** 탭 수·순서가 바뀌면 잘림을 다시 잼 */
  }, [shownKey]);

  return (
    <Card
      title="건강기록 변화"
      sub={
        <span className="text-sm">
          {typeCd === STOOL
            ? `최근 ${STOOL_TREND_DAYS}일`
            : `최근 ${RECENT_RECORD_COUNT}건`}
        </span>
      }
      className="min-w-0"
      bodyClassName="flex flex-col"
    >
      <div
        ref={rowRef}
        role="radiogroup"
        aria-label="지표 선택"
        className="mb-4 flex gap-2 overflow-x-auto [scrollbar-width:none] min-[760px]:flex-wrap min-[760px]:overflow-visible [&::-webkit-scrollbar]:hidden"
      >
        {shownTypes.map((item, index) => {
          const isSelected = item.cd === typeCd;
          return (
            <button
              key={item.cd}
              type="button"
              role="radio"
              aria-checked={isSelected}
              className={`${isSelected ? FILTER_CHIP_ON : FILTER_CHIP} transition-opacity ${
                clipped[index] ? 'opacity-50' : ''
              }`}
              onClick={() => setTypeCd(item.cd)}
            >
              {item.tabNm}
            </button>
          );
        })}
      </div>

      <TrendBody
        pet={pet}
        goalBdwg={petDetail?.goalBdwg}
        trend={trend}
        type={type}
        isPc={isPc}
        onAddRecord={onAddRecord}
      />
    </Card>
  );
}

function TrendBody({ pet, goalBdwg, trend, type, isPc, onAddRecord }) {
  const emptyBox = (
    <EmptyResult
      isCompact
      icon={<Icon name="monitoring" className="text-[28px] text-line-strong" />}
      title={`아직 ${type.nm} 기록이 없어요`}
      description="오늘 기록을 남기면 변화가 그래프로 보여요"
    >
      {
        <button
          type="button"
          className={BTN_SECONDARY}
          onClick={() => onAddRecord(type.cd)}
        >
          오늘 기록 추가
        </button>
      }
    </EmptyResult>
  );

  if (trend.isPending) {
    return (
      <div aria-busy="true" className="@container">
        {/* 산책 막대·꺾은선 그래프 높이(그래프 칸 폭 600 이상 260, 미만 230)에 맞춤. 화면 폭이 아니라 칸 폭 기준 */}
        <Skeleton className="h-[260px] @max-[600px]:h-[230px]" />
      </div>
    );
  }
  if (trend.isError) {
    return (
      <LoadError
        message="기록을 불러오지 못했어요. 잠시 뒤 다시 시도해 주세요"
        onRetry={() => trend.refetch()}
      />
    );
  }
  const records = trend.data;

  if (type.cd === STOOL) {
    const days = getStoolDays(records, getTodayYmd());
    if (days.every((day) => day.items.length === 0)) return emptyBox;
    return <StoolStrip days={days} />;
  }

  const { recordCount, points } = getTrendPoints(records, type.cd);
  if (recordCount === 0) return emptyBox;
  if (points.length === 1) {
    return (
      <OneRecord
        ymd={points[0].ymd}
        value={formatAmount(type.cd, points[0].value)}
      />
    );
  }

  const chartPoints = points.map((point) => ({
    label: formatMonthDayDot(point.ymd),
    value: point.value,
  }));
  const summary = points
    .map((point) => formatAmount(type.cd, point.value))
    .join(' → ');

  if (type.cd === WALK) {
    return (
      <BarChart
        points={chartPoints}
        formatValue={(value) => formatAmount(WALK, value)}
        ariaLabel={`산책 시간 막대그래프 · ${summary} · 점선은 하루 평균`}
        height={getLineChartHeight}
      />
    );
  }

  const isWeight = type.cd === WEIGHT;
  return (
    <LineChart
      points={chartPoints}
      band={
        isWeight && pet.minBdwg != null && pet.maxBdwg != null
          ? [pet.minBdwg, pet.maxBdwg]
          : undefined
      }
      goal={isWeight ? goalBdwg : undefined}
      formatValue={(value) => formatAmount(type.cd, value)}
      formatTag={round2}
      isLeftColumn={!isPc}
      ariaLabel={`${type.nm} 변화 선그래프 · ${summary}`}
    />
  );
}

function OneRecord({ ymd, value }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-1 rounded-[10px] bg-surface-2 px-4 py-6">
      <span className="text-sm/[1.6] text-subtle tabular-nums">
        {formatMonthDayDot(ymd)} 기록
      </span>
      <span className="text-lg font-bold text-ink tabular-nums">{value}</span>
      <span className="text-sm/[1.6] text-subtle">
        기록이 2개 이상 쌓이면 그래프로 보여요
      </span>
    </div>
  );
}

/** 그날 마지막 기록의 상태 */
const lastStateOf = (day) =>
  findStoolState(day.items[day.items.length - 1].crsdSttsCd);

/** 원 아래 한 줄: 1건이면 시각, 2건 이상이면 상태를 기록 순서대로, 0건이면 비움 */
const daySubText = (day) => {
  if (day.items.length === 0) return '';
  if (day.items.length === 1) return getHmOf(day.items[0].rcdDt);
  return day.items
    .map((record) => findStoolState(record.crsdSttsCd).nm)
    .join(' · ');
};

/**
 * [배변 상태 7일 띠] (※신규 정책, 2026-11-26)
 * - days: getStoolDays 결과(오래된 날 → 오늘 7개). 원들 뒤 가로선 하나로 이음
 * - 원: 그날 마지막 기록 상태명과 상태별 색. 기록 없는 날은 흰 바탕·line 테두리·「-」
 * - 760px 미만: 원·글자를 줄이고 날짜는 요일 없이 「11.26」만
 * - 띠 전체를 한 번에 읽도록 role="img" + aria-label 요약
 */
function StoolStrip({ days }) {
  const ariaLabel = `최근 ${STOOL_TREND_DAYS}일 배변 상태 · ${days
    .map(
      (day) =>
        `${formatMonthDayDot(day.ymd)} ${day.items.length > 0 ? lastStateOf(day).nm : '기록 없음'}`,
    )
    .join(', ')}`;

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex flex-1 flex-col justify-center">
        <div role="img" aria-label={ariaLabel} className="relative">
          {/* 첫 원 가운데 ~ 마지막 원 가운데(칸 폭 1/14 안쪽). 높이는 원 반지름 */}
          <span
            aria-hidden="true"
            className="absolute top-5 right-[calc(100%/14)] left-[calc(100%/14)] h-px bg-line min-[760px]:top-7"
          />
          <ol aria-hidden="true" className="relative grid grid-cols-7">
            {days.map((day) => {
              const hasRecord = day.items.length > 0;
              const state = hasRecord ? lastStateOf(day) : null;
              return (
                <li
                  key={day.ymd}
                  className="flex min-w-0 flex-col items-center gap-1.5 px-0.5 text-center"
                >
                  <span
                    className={`flex size-10 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold min-[760px]:size-14 min-[760px]:text-sm ${
                      hasRecord
                        ? STOOL_TONES[state.cd]
                        : 'border-line bg-white text-line-strong'
                    }`}
                  >
                    {hasRecord ? state.nm : '-'}
                  </span>
                  <span className="text-xs font-semibold text-ink tabular-nums min-[760px]:text-sm">
                    {formatMonthDayDot(day.ymd)}
                    <span className="max-[760px]:hidden">
                      {` (${WEEKDAYS[getWeekdayIndex(day.ymd)]})`}
                    </span>
                  </span>
                  <span className="min-h-4 text-xs break-keep text-subtle tabular-nums min-[760px]:text-sm">
                    {daySubText(day)}
                  </span>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
      <p className="text-sm text-subtle">원 안은 그날 마지막 기록</p>
    </div>
  );
}
