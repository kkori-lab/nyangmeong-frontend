import { round2 } from '../numberFormat';
import useElementWidth from './useElementWidth';

const PAD = { left: 8, top: 32, bottom: 34 };
/** 막대 높이 기준 최소 상한(분) */
const MIN_MAX_VALUE = 60;

/**
 * [막대 그래프 + 평균 점선]
 * - 시안 hlt-diary.html의 barChart와 같은 모양: 지난 날짜 연하게·마지막 날짜 진하게, 하루 평균 점선
 * - points: [{ label, value }], formatValue: 평균 표기
 */
export default function BarChart({ points, formatValue, ariaLabel }) {
  const [ref, width] = useElementWidth();

  return (
    <div ref={ref} className="w-full">
      {width > 0 && (
        <Chart
          width={width}
          points={points}
          formatValue={formatValue}
          ariaLabel={ariaLabel}
        />
      )}
    </div>
  );
}

function Chart({ width, points, formatValue, ariaLabel }) {
  const count = points.length;
  const height = width < 600 ? 220 : 260;
  const right = width < 600 ? 84 : 104;
  const max = Math.max(
    MIN_MAX_VALUE,
    Math.ceil(Math.max(...points.map((point) => point.value)) / 10) * 10,
  );
  const average = points.reduce((sum, point) => sum + point.value, 0) / count;
  const step = (width - PAD.left - right) / count;
  const barWidth = Math.min(step * 0.56, 56);
  const getY = (value) =>
    PAD.top + ((max - value) * (height - PAD.top - PAD.bottom)) / max;
  const lastIndex = count - 1;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      role="img"
      aria-label={ariaLabel}
      className="block h-auto"
    >
      <path
        d={`M${PAD.left} ${height - PAD.bottom}H${width - right}`}
        stroke="#e2e7e7"
        strokeWidth="1"
      />
      {points.map((point, index) => {
        const centerX = PAD.left + step * index + step / 2;
        return (
          <g key={point.label}>
            <rect
              x={centerX - barWidth / 2}
              y={getY(point.value)}
              width={barWidth}
              height={getY(0) - getY(point.value)}
              rx={4}
              fill={index === lastIndex ? '#285a5c' : '#cde0e0'}
            />
            <text
              x={centerX}
              y={getY(point.value) - 8}
              textAnchor="middle"
              fontSize="14"
              fill="#1a3234"
            >
              {point.value}
            </text>
            {(step >= 44 || index % 2 === lastIndex % 2) && (
              <text
                x={centerX}
                y={height - 8}
                textAnchor="middle"
                fontSize="14"
                fill="#667374"
              >
                {point.label}
              </text>
            )}
          </g>
        );
      })}
      <path
        d={`M${PAD.left} ${getY(average)}H${width - right + 8}`}
        stroke="#285a5c"
        strokeWidth="1.5"
        strokeDasharray="6 4"
      />
      <text
        x={width - right + 14}
        y={getY(average) + 5}
        fontSize="14"
        fill="#1e4a4c"
      >
        평균 {formatValue(round2(average))}
      </text>
    </svg>
  );
}
