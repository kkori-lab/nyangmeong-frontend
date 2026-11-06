import { useState } from 'react';
import { ChevronLeft, ChevronRight, GripVertical } from 'lucide-react';
import BarChart from '@/components/BarChart';
import CurveChart from '@/components/CurveChart';
import { PATHS } from '@/routes/paths';
import { formatMonthDayDot } from '@/utils/formatDate';
import HealthWidget, { WidgetEmpty, WidgetFrame } from './HealthWidget';
import { WIDGET, applyGridOrder, isGridWidget } from './widgetCodes';

const DIARY_LINK = {
  text: '기록이 없어요',
  linkText: '건강 일지에 기록하기',
  to: PATHS.HEALTH_DIARY,
};
const LAB_LINK = {
  text: '검사 기록이 없어요',
  linkText: '검사 결과 등록하기',
  to: `${PATHS.HEALTH_DIARY}#hlt002-exam`,
};

const toNumber = (value) => (value == null ? null : Number(value));

const joinSeries = (values, labels, unit) =>
  values.map((v, i) => `${labels[i]} ${v}${unit}`).join(', ');

/** 식사량·음수량·산책: 오늘 일 합계 / 직전 기록일 대비 / 기록 있는 최근 5일 막대 */
const DAILY_SUM = {
  [WIDGET.MEAL]: { key: 'meal', unit: 'g', chartName: '식사량' },
  [WIDGET.WATER]: { key: 'water', unit: 'ml', chartName: '음수량' },
  [WIDGET.WALK]: { key: 'walk', unit: '분', chartName: '산책 시간' },
};

const TITLE = {
  [WIDGET.WEIGHT]: '체중',
  [WIDGET.MEAL]: '식사량',
  [WIDGET.WATER]: '음수량',
  [WIDGET.WALK]: '산책',
  [WIDGET.LAB]: '혈액검사 · CREA',
  [WIDGET.AI_REPORT]: 'AI 건강분석 리포트',
};

function WeightCard({ weight, frameProps }) {
  if (!weight) {
    return (
      <WidgetFrame {...frameProps} period="최근 5건">
        <WidgetEmpty {...DIARY_LINK} />
      </WidgetFrame>
    );
  }
  const values = weight.points.map((point) => toNumber(point.rcdNvl));
  const labels = weight.points.map((point) => formatMonthDayDot(point.rcdDt));

  return (
    <HealthWidget
      {...frameProps}
      period="최근 5건"
      value={toNumber(weight.latestNvl)}
      unit="kg"
      delta={toNumber(weight.prevDiff)}
      deltaLabel="직전 기록 대비"
      deltaUnit="kg"
    >
      {values.length > 0 && (
        <CurveChart
          values={values}
          labels={labels}
          formatValue={(v) => `${v}kg`}
          label={`체중 꺾은선 그래프 · ${joinSeries(values, labels, 'kg')}`}
        />
      )}
    </HealthWidget>
  );
}

function DailySumCard({ code, indicators, frameProps }) {
  const { key, unit, chartName } = DAILY_SUM[code];
  const indicator = indicators[key];
  if (!indicator) {
    return (
      <WidgetFrame {...frameProps} period="최근 5일">
        <WidgetEmpty {...DIARY_LINK} />
      </WidgetFrame>
    );
  }
  const todaySum = toNumber(indicator.todaySum);
  const values = indicator.points.map((point) => toNumber(point.sumNvl));
  const labels = indicator.points.map((point) =>
    formatMonthDayDot(point.rcdYmd),
  );

  return (
    <HealthWidget
      {...frameProps}
      period="최근 5일"
      value={todaySum ?? '오늘 기록 없음'}
      unit={todaySum == null ? null : `${unit} / 오늘 합계`}
      delta={toNumber(indicator.prevDiff)}
      deltaLabel="직전 기록일 대비"
      deltaUnit={unit}
    >
      {values.length > 0 && (
        <BarChart
          values={values}
          labels={labels}
          label={`${chartName} 일 합계 막대그래프 · ${joinSeries(values, labels, unit)} · 점선은 평균`}
        />
      )}
    </HealthWidget>
  );
}

function LabCard({ creatinine, frameProps }) {
  if (!creatinine) {
    return (
      <WidgetFrame {...frameProps} period="최근 5회">
        <WidgetEmpty {...LAB_LINK} />
      </WidgetFrame>
    );
  }
  const unitNm = creatinine.unitNm ?? '';
  const values = creatinine.points.map((point) => toNumber(point.rsltNvl));
  const labels = creatinine.points.map((point) =>
    formatMonthDayDot(point.schdlDt),
  );
  const low = toNumber(creatinine.refLlmtNvl);
  const high = toNumber(creatinine.refUplmtNvl);
  const band = low != null && high != null ? [low, high] : undefined;
  const bandText = band ? ` · 참고범위 ${low}~${high} 점선 표시` : '';

  return (
    <HealthWidget
      {...frameProps}
      period="최근 5회"
      value={toNumber(creatinine.latestNvl)}
      unit={unitNm}
      delta={toNumber(creatinine.prevDiff)}
      deltaLabel="지난 검사 대비"
      deltaUnit=""
    >
      {values.length > 0 && (
        <CurveChart
          values={values}
          labels={labels}
          band={band}
          label={`CREA 수치 꺾은선 그래프${bandText} · ${joinSeries(values, labels, '')} ${unitNm}`}
        />
      )}
    </HealthWidget>
  );
}

/** AI 건강분석 리포트(MANC0007): 명세 미결이라 자리만 지킨다 */
function AiReportCard({ frameProps }) {
  return (
    <WidgetFrame {...frameProps}>
      <p className="mt-4 text-[22px] leading-tight font-bold">준비 중이에요</p>
      <p className="mt-2 text-sm text-muted">
        최근 기록을 바탕으로 한 건강 코멘트를 곧 보여 드릴게요
      </p>
    </WidgetFrame>
  );
}

function WidgetCard({ code, indicators, frameProps }) {
  if (code === WIDGET.WEIGHT)
    return <WeightCard weight={indicators.weight} frameProps={frameProps} />;
  if (code === WIDGET.LAB)
    return (
      <LabCard creatinine={indicators.creatinine} frameProps={frameProps} />
    );
  if (code === WIDGET.AI_REPORT)
    return <AiReportCard frameProps={frameProps} />;
  return (
    <DailySumCard code={code} indicators={indicators} frameProps={frameProps} />
  );
}

/** 순서 편집 중 카드 제목 줄의 손잡이·앞뒤 이동 버튼 */
function OrderToolbar({ title, isFirst, isLast, onMove }) {
  const buttonClass =
    'grid size-8 place-items-center rounded-md border border-line text-ink-2 hover:border-brand-500 hover:text-brand-600 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-line disabled:hover:text-ink-2';

  return (
    <span className="flex shrink-0 items-center gap-1">
      <GripVertical
        className="size-5 cursor-grab text-subtle"
        aria-hidden="true"
      />
      <button
        type="button"
        className={buttonClass}
        disabled={isFirst}
        onClick={() => onMove(-1)}
        aria-label={`${title} 앞으로`}
      >
        <ChevronLeft className="size-4.5" aria-hidden="true" />
      </button>
      <button
        type="button"
        className={buttonClass}
        disabled={isLast}
        onClick={() => onMove(1)}
        aria-label={`${title} 뒤로`}
      >
        <ChevronRight className="size-4.5" aria-hidden="true" />
      </button>
    </span>
  );
}

const moveItem = (list, from, to) => {
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
};

/**
 * [건강 지표 위젯] FN-MAN-006·007
 * - widgetCodes: 서버 순서(7개 전부, 토탈 케어리스트 MANC0006 포함). 위젯 영역은 MANC0006을 뺀 6칸
 * - [순서 편집] → 끌어 놓기 또는 앞뒤 버튼으로 옮기고 [저장]이면 onSave(7개 전부). 케어리스트는 자기 자리 그대로
 * - [취소]·저장 실패면 편집 전 순서
 * - indicators가 없으면(불러오는 중) 카드 자리만
 */
export default function IndicatorWidgets({
  widgetCodes,
  indicators,
  petSn,
  motion,
  isSaving,
  onSave,
}) {
  const [draft, setDraft] = useState(null);
  const [dragCode, setDragCode] = useState(null);
  const isEditing = draft != null;
  const allCodes = draft ?? widgetCodes;
  const gridCodes = allCodes.filter(isGridWidget);

  const moveTo = (from, to) => {
    if (to < 0 || to >= gridCodes.length || from === to) return;
    setDraft(applyGridOrder(allCodes, moveItem(gridCodes, from, to)));
  };

  const cancel = () => {
    setDraft(null);
    setDragCode(null);
  };

  const save = () => {
    if (draft.every((code, index) => code === widgetCodes[index])) {
      cancel();
      return;
    }
    onSave(draft, { onSettled: cancel });
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-end gap-2">
        {isEditing ? (
          <>
            <p className="mr-auto self-center text-sm text-muted">
              카드를 끌어 놓거나 화살표로 순서를 바꿔 주세요
            </p>
            <button
              type="button"
              onClick={cancel}
              disabled={isSaving}
              className="h-9 rounded-md border border-line px-4 text-sm font-semibold text-ink-2 hover:border-line-strong disabled:opacity-50"
            >
              취소
            </button>
            <button
              type="button"
              onClick={save}
              disabled={isSaving}
              className="h-9 rounded-md bg-brand-500 px-4 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50"
            >
              {isSaving ? '저장 중' : '저장'}
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => setDraft(widgetCodes)}
            disabled={widgetCodes.length === 0}
            className="h-9 rounded-md border border-line px-4 text-sm font-semibold text-ink-2 hover:border-brand-500 hover:text-brand-600 disabled:opacity-50"
          >
            순서 편집
          </button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-5 max-[1100px]:grid-cols-2 max-[700px]:grid-cols-1">
        {gridCodes.map((code, index) => {
          const title = TITLE[code];
          const dragProps = isEditing
            ? {
                draggable: true,
                onDragStart: (event) => {
                  event.dataTransfer.effectAllowed = 'move';
                  setDragCode(code);
                },
                onDragOver: (event) => event.preventDefault(),
                onDrop: (event) => {
                  event.preventDefault();
                  if (dragCode) moveTo(gridCodes.indexOf(dragCode), index);
                  setDragCode(null);
                },
                onDragEnd: () => setDragCode(null),
                style: dragCode === code ? { opacity: 0.5 } : undefined,
              }
            : {};
          const frameProps = {
            title,
            motion: motion(index),
            toolbar: isEditing ? (
              <OrderToolbar
                title={title}
                isFirst={index === 0}
                isLast={index === gridCodes.length - 1}
                onMove={(step) => moveTo(index, index + step)}
              />
            ) : undefined,
            ...dragProps,
          };

          if (!indicators && code !== WIDGET.AI_REPORT) {
            return (
              <WidgetFrame key={`${code}-${petSn}`} {...frameProps}>
                <div
                  aria-hidden="true"
                  className="mt-4 h-40 animate-pulse rounded-md bg-[#e9eded]"
                />
              </WidgetFrame>
            );
          }
          return (
            <WidgetCard
              key={`${code}-${petSn}`}
              code={code}
              indicators={indicators}
              frameProps={frameProps}
            />
          );
        })}
      </div>
    </div>
  );
}
