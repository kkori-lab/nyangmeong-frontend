import { useEffect, useRef, useState } from 'react';
import Card from '@/components/Card';
import { BTN_SECONDARY } from '@/components/buttonStyles';
import useMediaQuery from '@/hooks/useMediaQuery';
import { formatMonthDayDot, getYmdOf } from '@/utils/formatDate';
import {
  RECORD_TYPES,
  STOOL,
  WALK,
  WEIGHT,
  findRecordType,
  findStoolState,
} from '../diaryTypes';
import { useDailyTrend, usePetDetail } from '../queries';
import BarChart from './BarChart';
import CountBars from './CountBars';
import EmptyBox from './EmptyBox';
import LineChart from './LineChart';
import {
  RECENT_RECORD_COUNT,
  formatAmount,
  getStoolCounts,
  getTrendPoints,
  pickType,
} from './recordUtils';

/**
 * [건강기록 변화 카드]
 * - 지표 탭 5종 단일 선택, 최근 5개 기록 기준 그래프 (FN-HLT-002-09·10)
 * - 0건·1건은 그래프 대신 안내
 * - 760px 이하: 지표 탭이 한 줄 가로 밀기이고 줄 끝에 걸쳐 잘린 탭은 반투명, 체중 그래프의 상한·목표·하한은 왼쪽 한 열
 * - initialTypeCd: 처음 고를 지표(대시보드 카드 [더보기], ※신규 정책). 5종이 아니거나 없으면 체중
 */
export default function DailyTrendCard({ pet, onAddRecord, initialTypeCd }) {
  const [typeCd, setTypeCd] = useState(() =>
    RECORD_TYPES.some((item) => item.cd === initialTypeCd)
      ? initialTypeCd
      : WEIGHT,
  );
  const type = findRecordType(typeCd);
  const trend = useDailyTrend(pet.petSn, typeCd);
  /** 목표체중은 목록(GET /pets)에 없어 상세로 받는다. 실패하거나 오기 전이면 목표선 없이 그린다 */
  const { data: petDetail } = usePetDetail(pet.petSn, typeCd === WEIGHT);
  const isPc = useMediaQuery('(min-width: 761px)');
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
  }, []);

  return (
    <Card
      title="건강기록 변화"
      sub={<span className="text-sm">최근 {RECENT_RECORD_COUNT}개 기록</span>}
      className="min-w-0"
    >
      <div
        ref={rowRef}
        role="radiogroup"
        aria-label="지표 선택"
        className="mb-4 flex gap-2 overflow-x-auto [scrollbar-width:none] min-[761px]:flex-wrap min-[761px]:overflow-visible [&::-webkit-scrollbar]:hidden"
      >
        {RECORD_TYPES.map((item, index) => {
          const isSelected = item.cd === typeCd;
          return (
            <button
              key={item.cd}
              type="button"
              role="radio"
              aria-checked={isSelected}
              className={`inline-flex h-9 shrink-0 items-center rounded-full border px-3.5 transition-opacity ${
                clipped[index] ? 'opacity-50' : ''
              } ${
                isSelected
                  ? 'border-transparent bg-brand-50 text-brand-500'
                  : 'border-line bg-white text-ink-2 hover:border-line-strong hover:text-ink'
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
    <EmptyBox
      icon="monitoring"
      title={`아직 ${type.nm} 기록이 없어요`}
      description="오늘 기록을 남기면 변화가 그래프로 보여요"
      action={
        <button
          type="button"
          className={`${BTN_SECONDARY} mt-2 h-8! px-3!`}
          onClick={() => onAddRecord(type.cd)}
        >
          오늘 기록추가
        </button>
      }
    />
  );

  if (trend.isPending) {
    return (
      <p className="py-16 text-center text-sm text-muted" aria-busy="true">
        기록을 불러오는 중이에요
      </p>
    );
  }
  if (trend.isError) {
    return (
      <p role="alert" className="py-16 text-center text-sm text-muted">
        기록을 불러오지 못했어요. 잠시 뒤 다시 시도해 주세요
      </p>
    );
  }
  const records = trend.data;

  if (type.cd === STOOL) {
    const { recordCount, counts } = getStoolCounts(records);
    if (recordCount === 0) return emptyBox;
    if (recordCount === 1) {
      const [only] = pickType(records, STOOL);
      return (
        <OneRecord
          ymd={getYmdOf(only.rcdDt)}
          value={findStoolState(only.crsdSttsCd).nm}
        />
      );
    }
    return <CountBars counts={counts} total={recordCount} />;
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
      formatTag={(value) => value.toFixed(1)}
      isLeftColumn={!isPc}
      ariaLabel={`${type.nm} 변화 선그래프 · ${summary}`}
    />
  );
}

function OneRecord({ ymd, value }) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-[10px] bg-surface-2 px-4 py-6">
      <span className="text-sm/[1.6] text-subtle tabular-nums">
        {formatMonthDayDot(ymd)} 기록
      </span>
      <span className="text-lg/[1.6] font-bold text-ink tabular-nums">
        {value}
      </span>
      <span className="text-sm/[1.6] text-subtle">
        기록이 2개 이상 쌓이면 그래프로 보여요
      </span>
    </div>
  );
}
