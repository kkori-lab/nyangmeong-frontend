import { useId } from 'react';
import useElementWidth from '@/hooks/useElementWidth';

/** 색은 시안 nyangmung-chart.css 값을 색 토큰으로 */
const COLORS = {
  brand: 'var(--color-brand-500)',
  brandInk: 'var(--color-brand-600)',
  brandLine: 'var(--color-brand-100)',
  ok: 'var(--color-ok)',
  danger: 'var(--color-danger)',
  area: 'color-mix(in srgb, var(--color-ok) 18%, white)',
  range: 'color-mix(in srgb, var(--color-ok) 45%, white)',
  lineSoft: 'var(--color-line-soft)',
  line: 'var(--color-line)',
  subtle: 'var(--color-subtle)',
  white: 'white',
};

/** 단조 3차 보간의 점별 기울기 */
const getSlopes = (points) => {
  const count = points.length;
  const diffs = [];
  for (let i = 0; i < count - 1; i += 1) {
    diffs.push(
      (points[i + 1][1] - points[i][1]) / (points[i + 1][0] - points[i][0]),
    );
  }
  const slopes = [diffs[0]];
  for (let i = 1; i < count - 1; i += 1) {
    slopes.push(
      diffs[i - 1] * diffs[i] <= 0 ? 0 : (diffs[i - 1] + diffs[i]) / 2,
    );
  }
  slopes.push(diffs[count - 2]);
  return slopes;
};

/** 구간 i → i+1의 곡선 경로. 점이 2개면 직선 */
const getSegmentPath = (points, slopes, i) => {
  const [x0, y0] = points[i];
  const [x1, y1] = points[i + 1];
  if (points.length === 2) return `M${x0} ${y0}L${x1} ${y1}`;
  const handle = (x1 - x0) / 3;
  return `M${x0} ${y0}C${x0 + handle} ${y0 + slopes[i] * handle} ${x1 - handle} ${y1 - slopes[i + 1] * handle} ${x1} ${y1}`;
};

/** 전체 곡선 경로 */
const getCurvePath = (points, slopes) => {
  if (points.length < 3) {
    return `M${points.map(([x, y]) => `${x} ${y}`).join('L')}`;
  }
  let path = `M${points[0][0]} ${points[0][1]}`;
  for (let i = 0; i < points.length - 1; i += 1) {
    path += getSegmentPath(points, slopes, i).replace(/^M[^C]*/, '');
  }
  return path;
};

/**
 * [곡선 선그래프] 공용 선 그래프(UI 체크리스트 68, 건강 일지 차트가 기준)
 * - 시안 nyangmung-chart.js의 곡선 차트와 같은 모양: 곡선 + 연한 그라데이션, 범위는 점선 + 왼쪽 눈금(최대·최소), 최근 값은 말풍선
 * - points: [{ label, value }] 1개 이상(1개면 가운데 점 하나), band: [최소, 최대], goal: 목표, formatValue: 말풍선 값, formatTag: 범위 라벨 값
 * - bandLabelSide: 'left'(기본, 오른쪽 라벨 없이 왼쪽 눈금을 최대·최소로) / 'right'(오른쪽 최대·최소 라벨)
 * - 왼쪽 라벨 자리 폭은 가장 긴 왼쪽 라벨 글자 폭 + 14에 맞추고 최소 80(세 자리 값도 잘리지 않게)
 * - activeIndex: 말풍선을 띄울 점(points의 순번). 없으면 마지막 점, null이면 말풍선 없이 점만
 * - 말풍선은 점 위, 자리가 없으면 점 아래(꼬리는 위로, 세로 점선은 말풍선 아래부터). 점 아래가 날짜 줄에 닿으면 맨 위쪽에 붙임
 * - isLeftColumn: 최대·목표·최소을 모두 왼쪽 한 열의 라벨로 두고 오른쪽 라벨은 없앤다(모바일 건강기록 변화). bandLabelSide보다 우선
 * - labelFill: 아래 날짜 글자 색. 기본은 subtle(지속 관찰 PC는 placeholder 토큰, 추가 요청)
 * - isEdgeToEdge: 범위·목표 라벨이 없는 그래프에서 좌우 라벨 자리를 비우지 않고 폭 전체를 씀(지속 관찰, 추가 요청)
 * - labelEvery: 아래 날짜 글자 간격(마지막 점부터 n칸마다). 기본 1은 모든 점(점이 많은 관리자 일별 그래프용)
 */
export default function LineChart({
  points,
  band,
  goal,
  formatValue = String,
  formatTag = String,
  bandLabelSide = 'left',
  isLeftColumn = false,
  activeIndex,
  height,
  ariaLabel,
  labelFill = COLORS.subtle,
  isEdgeToEdge = false,
  labelEvery = 1,
}) {
  const [ref, width] = useElementWidth();

  return (
    <div ref={ref} className="w-full">
      {width > 0 && (
        <Chart
          width={width}
          height={height ?? (width < 600 ? 230 : 260)}
          points={points}
          band={band}
          goal={goal}
          formatValue={formatValue}
          formatTag={formatTag}
          bandLabelSide={bandLabelSide}
          isLeftColumn={isLeftColumn}
          activeIndex={activeIndex}
          ariaLabel={ariaLabel}
          labelFill={labelFill}
          isEdgeToEdge={isEdgeToEdge}
          labelEvery={labelEvery}
        />
      )}
    </div>
  );
}

/** 말풍선이 SVG 가장자리에서 떨어질 최소 거리(테두리 1.5의 반 + 여유) */
const TIP_INSET = 2;

/** 왼쪽 한 열 라벨(글자 14) 사이 최소 간격 */
const LABEL_GAP = 24;

/** 왼쪽 라벨 자리: 최소 폭, 라벨과 그래프 사이 간격(text x = left - 10), 글자 끝 여유 */
const LEFT_LABEL_MIN = 80;
const LEFT_LABEL_GAP = 10;
const LEFT_LABEL_SPARE = 4;

let measureContext;
/** 라벨 글자 폭(글자 14, 화면 글꼴). 잴 수 없으면 글자 수로 어림 */
const measureLabel = (text) => {
  if (typeof document !== 'undefined') {
    measureContext ??= document.createElement('canvas').getContext('2d');
  }
  if (!measureContext) return text.length * 9;
  const { fontFamily } = getComputedStyle(document.body);
  measureContext.font = `14px ${fontFamily}`;
  return measureContext.measureText(text).width;
};

function Chart({
  width,
  height,
  points,
  band,
  goal,
  formatValue,
  formatTag,
  bandLabelSide,
  isLeftColumn,
  activeIndex,
  ariaLabel,
  labelFill,
  isEdgeToEdge,
  labelEvery,
}) {
  const gradientId = useId();
  const isBandLeft = bandLabelSide === 'left' || isLeftColumn;
  // 왼쪽에 실제로 그리는 라벨: 범위(최대·최소)와 왼쪽 한 열일 때의 목표
  const leftLabels = isBandLeft
    ? [
        ...(band
          ? [`최대 ${formatTag(band[1])}`, `최소 ${formatTag(band[0])}`]
          : []),
        ...(isLeftColumn && goal != null ? [`목표 ${formatTag(goal)}`] : []),
      ]
    : [];
  // 왼쪽 라벨 자리는 가장 긴 라벨 글자 폭에 맞춤(최소 80). 라벨이 없으면 예전 고정값
  const leftLabelWidth =
    leftLabels.length > 0
      ? Math.max(
          LEFT_LABEL_MIN,
          Math.ceil(
            Math.max(...leftLabels.map(measureLabel)) +
              LEFT_LABEL_GAP +
              LEFT_LABEL_SPARE,
          ),
        )
      : null;
  const values = points.map((point) => point.value);
  const count = values.length;
  const isSmall = width < 600;
  const hasTag =
    !isLeftColumn && ((band != null && !isBandLeft) || goal != null);
  // 범위·목표 라벨이 없으면 좌우 라벨 자리 없이 12만 남김
  const hasGuide = band != null || goal != null;
  const left = isEdgeToEdge
    ? 0
    : !hasGuide
      ? 12
      : isBandLeft
        ? (leftLabelWidth ?? (isSmall ? 64 : 80))
        : isSmall
          ? 40
          : 56;
  // 왼쪽 라벨일 때는 마지막 날짜 글자가 잘리지 않게 오른쪽을 조금 남김
  const right = isEdgeToEdge
    ? 0
    : !hasGuide
      ? 12
      : hasTag
        ? isSmall
          ? 76
          : 92
        : isBandLeft
          ? isSmall
            ? 28
            : 32
          : isSmall
            ? 12
            : 24;
  const top = 16;
  const bottom = 34;
  const pad = isSmall ? 16 : 28;

  const refs = [...values, ...(band ?? []), ...(goal != null ? [goal] : [])];
  const minRef = Math.min(...refs);
  const maxRef = Math.max(...refs);
  const margin = (maxRef - minRef) * (band ? 0.3 : 0.6) || 1;
  const min = minRef - margin;
  const max = maxRef + margin;

  const getX = (i) =>
    count === 1
      ? (left + width - right) / 2
      : left + pad + (i * (width - left - right - 2 * pad)) / (count - 1);
  const getY = (value) =>
    top + ((max - value) * (height - top - bottom)) / (max - min);
  const isOut = (value) => band != null && (value < band[0] || value > band[1]);

  const coords = values.map((value, i) => [getX(i), getY(value)]);
  const slopes = getSlopes(coords);
  const curve = getCurvePath(coords, slopes);
  const [lastX] = coords[count - 1];
  /** 말풍선을 띄울 점: activeIndex가 없거나 범위 밖이면 마지막 점, null이면 띄우지 않음(-1) */
  const hasTip = activeIndex !== null;
  const tipIndex = !hasTip
    ? -1
    : activeIndex !== undefined && activeIndex >= 0 && activeIndex < count
      ? activeIndex
      : count - 1;
  const [tipPointX, tipPointY] = hasTip ? coords[tipIndex] : [0, 0];
  const tipValue = hasTip ? values[tipIndex] : 0;
  const tipLabel = hasTip ? formatValue(tipValue) : '';
  const tipWidth = Math.max(52, tipLabel.length * 9 + 24);
  /** 말풍선 가로 범위: 기존 라벨 자리 기준이되 SVG 밖으로는 나가지 않게(테두리 두께만큼 안쪽, 추가 요청) */
  const tipMinX = Math.max(left, TIP_INSET) + tipWidth / 2;
  const tipMaxX = Math.min(width - right + 4, width - TIP_INSET) - tipWidth / 2;
  const tipX = Math.min(Math.max(tipPointX, tipMinX), tipMaxX);
  // 말풍선은 점 위, 위에 자리가 없으면 점 아래(꼬리는 위로).
  // 점 아래로 내리면 날짜 줄에 닿을 때는 맨 위쪽에 붙임(꼬리는 아래로, 추가-10)
  const hasRoomAbove = tipPointY - 48 >= TIP_INSET;
  const isBelowOnDates = tipPointY + 18 + 30 > height - bottom;
  const isTipBelow = !hasRoomAbove && !isBelowOnDates;
  const tipY = hasRoomAbove
    ? tipPointY - 48
    : isTipBelow
      ? tipPointY + 18
      : TIP_INSET;
  const guideStartY = isTipBelow ? tipY + 30 : tipPointY + 10;
  const tagWidth = right - 12;

  /** 왼쪽 한 열: 값이 가까워 라벨이 겹치면 아래로 밀어 LABEL_GAP 간격 확보 */
  const labelYs = {};
  if (isLeftColumn) {
    const items = [];
    if (band)
      items.push(
        { key: 'upper', y: getY(band[1]) },
        { key: 'lower', y: getY(band[0]) },
      );
    if (goal != null) items.push({ key: 'goal', y: getY(goal) });
    items.sort((a, b) => a.y - b.y);
    items.forEach((item, i) => {
      if (i > 0) item.y = Math.max(item.y, items[i - 1].y + LABEL_GAP);
      labelYs[item.key] = item.y;
    });
  }

  const rangeLine = (value, text, isGoal, hasLabel = true) => (
    <g key={text}>
      <path
        d={`M${left} ${getY(value)}H${width - right}`}
        fill="none"
        stroke={isGoal ? COLORS.brand : COLORS.range}
        strokeWidth="1.5"
        strokeDasharray={isGoal ? '2 4' : '6 5'}
      />
      {hasLabel && (
        <>
          <rect
            x={width - right + 8}
            y={getY(value) - 11}
            width={tagWidth}
            height={22}
            rx={11}
            fill={COLORS.white}
            stroke={COLORS.line}
          />
          <text
            x={width - right + 8 + tagWidth / 2}
            y={getY(value) + 5}
            textAnchor="middle"
            fontSize="13"
            fontWeight="600"
            fill={isGoal ? COLORS.brandInk : COLORS.ok}
          >
            {text}
          </text>
        </>
      )}
    </g>
  );

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      role="img"
      aria-label={ariaLabel}
      className="block h-auto"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={COLORS.area} stopOpacity="0.7" />
          <stop offset="1" stopColor={COLORS.area} stopOpacity="0" />
        </linearGradient>
      </defs>

      {band &&
        [band[1], band[0]].map((value) => (
          <g key={value}>
            <path
              d={`M${left} ${getY(value)}H${width - right}`}
              stroke={COLORS.lineSoft}
              strokeWidth="1"
            />
            <text
              x={left - 10}
              y={
                (isLeftColumn
                  ? labelYs[value === band[1] ? 'upper' : 'lower']
                  : getY(value)) + 5
              }
              textAnchor="end"
              fontSize="14"
              fill={COLORS.subtle}
            >
              {isBandLeft
                ? `${value === band[1] ? '최대' : '최소'} ${formatTag(value)}`
                : formatTag(value)}
            </text>
          </g>
        ))}
      <path
        d={`M${left} ${height - bottom}H${width - right}`}
        stroke={COLORS.line}
        strokeWidth="1"
      />

      {band &&
        rangeLine(band[1], `최대 ${formatTag(band[1])}`, false, !isBandLeft)}
      {band &&
        rangeLine(band[0], `최소 ${formatTag(band[0])}`, false, !isBandLeft)}
      {goal != null &&
        rangeLine(goal, `목표 ${formatTag(goal)}`, true, !isLeftColumn)}
      {isLeftColumn && goal != null && (
        <text
          x={left - 10}
          y={labelYs.goal + 5}
          textAnchor="end"
          fontSize="14"
          fill={COLORS.brandInk}
        >
          {`목표 ${formatTag(goal)}`}
        </text>
      )}

      <path
        d={`${curve}L${lastX} ${height - bottom}L${coords[0][0]} ${height - bottom}Z`}
        fill={`url(#${gradientId})`}
      />
      <path
        d={curve}
        fill="none"
        stroke={COLORS.brand}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {band &&
        values
          .slice(0, -1)
          .map((value, i) =>
            isOut(value) || isOut(values[i + 1]) ? (
              <path
                key={points[i].label + i}
                d={getSegmentPath(coords, slopes, i)}
                fill="none"
                stroke={COLORS.danger}
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ) : null,
          )}

      {hasTip && guideStartY < height - bottom && (
        <path
          d={`M${tipPointX} ${guideStartY}V${height - bottom}`}
          stroke={COLORS.brandLine}
          strokeWidth="1.5"
          strokeDasharray="4 4"
        />
      )}
      {coords.map(([x, y], i) =>
        i === tipIndex ? null : (
          <circle
            key={points[i].label + i}
            cx={x}
            cy={y}
            r="4.5"
            fill={COLORS.white}
            stroke={isOut(values[i]) ? COLORS.danger : COLORS.brand}
            strokeWidth="2.5"
          />
        ),
      )}
      {hasTip && (
        <>
          <circle
            cx={tipPointX}
            cy={tipPointY}
            r="11"
            fill={COLORS.brand}
            opacity="0.15"
          />
          <circle
            cx={tipPointX}
            cy={tipPointY}
            r="6"
            fill={isOut(tipValue) ? COLORS.danger : COLORS.brand}
            stroke={COLORS.white}
            strokeWidth="3"
          />

          <g style={{ filter: 'drop-shadow(0 4px 8px rgba(30,74,76,.14))' }}>
            <rect
              x={tipX - tipWidth / 2}
              y={tipY}
              width={tipWidth}
              height={30}
              rx={15}
              fill={COLORS.white}
              stroke={COLORS.brand}
              strokeWidth="1.5"
            />
            <path
              d={
                isTipBelow
                  ? `M${tipPointX - 5} ${tipY}L${tipPointX} ${tipY - 6}L${tipPointX + 5} ${tipY}Z`
                  : `M${tipPointX - 5} ${tipY + 30}L${tipPointX} ${tipY + 36}L${tipPointX + 5} ${tipY + 30}Z`
              }
              fill={COLORS.brand}
            />
            <text
              x={tipX}
              y={tipY + 20}
              textAnchor="middle"
              fontSize="15"
              fontWeight="700"
              fill={COLORS.brandInk}
            >
              {tipLabel}
            </text>
          </g>
        </>
      )}

      {points.map((point, i) =>
        (count - 1 - i) % labelEvery !== 0 ? null : (
          <text
            key={point.label + i}
            x={coords[i][0]}
            y={height - 8}
            textAnchor="middle"
            fontSize="14"
            fill={labelFill}
          >
            {point.label}
          </text>
        ),
      )}
    </svg>
  );
}
