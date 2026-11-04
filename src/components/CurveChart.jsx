const W = 480;
const H = 200;
const PAD = { top: 56, bottom: 34, side: 28 };

// 점을 지나는 부드러운 곡선(Catmull-Rom을 베지어로 바꾼 것)
function toCurvePath(points) {
  return points
    .map((p, i) => {
      if (i === 0) return `M${p.x} ${p.y}`;
      const p0 = points[i - 2] ?? points[i - 1];
      const p1 = points[i - 1];
      const p3 = points[i + 1] ?? p;
      const c1x = p1.x + (p.x - p0.x) / 6;
      const c1y = p1.y + (p.y - p0.y) / 6;
      const c2x = p.x - (p3.x - p1.x) / 6;
      const c2y = p.y - (p3.y - p1.y) / 6;
      return `C${c1x} ${c1y} ${c2x} ${c2y} ${p.x} ${p.y}`;
    })
    .join('');
}

// band: 참고범위 [최소, 최대]. 있으면 점선으로 그리고 범위를 벗어난 점은 경고색으로 칠한다
/** labelEvery: 값·날짜 글자 간격(마지막 점부터), 기본 1은 모든 점 */
export default function CurveChart({
  values,
  labels,
  formatValue = String,
  label,
  band,
  labelEvery = 1,
}) {
  let lo = Math.min(...values);
  let hi = Math.max(...values);
  if (band) {
    lo = Math.min(lo, band[0]);
    hi = Math.max(hi, band[1]);
  }
  const span = hi - lo || Math.abs(hi) * 0.1 || 1;
  const min = lo - span * (band ? 0.25 : 0.6);
  const max = hi + span * (band ? 0.35 : 0.9);

  const innerW = W - PAD.side * 2;
  const baseY = H - PAD.bottom;
  const x = (i) =>
    values.length === 1 ? W / 2 : PAD.side + (innerW * i) / (values.length - 1);
  const y = (v) => PAD.top + ((max - v) * (baseY - PAD.top)) / (max - min);
  const points = values.map((v, i) => ({ x: x(i), y: y(v) }));
  const lastIndex = values.length - 1;
  const isOut = (v) => band && (v < band[0] || v > band[1]);
  const hasText = (i) => (lastIndex - i) % labelEvery === 0;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label={label}
      className="block h-auto w-full"
    >
      <path d={`M0 ${baseY}H${W}`} className="stroke-line" fill="none" />
      {band &&
        band.map((v) => (
          <path
            key={v}
            d={`M0 ${y(v)}H${W}`}
            className="stroke-line-strong"
            strokeDasharray="4 4"
            fill="none"
          />
        ))}
      <path
        d={toCurvePath(points)}
        className="stroke-brand-500"
        strokeWidth="2"
        fill="none"
      />
      {values.map((v, i) => (
        <g key={labels[i]}>
          <circle
            cx={points[i].x}
            cy={points[i].y}
            r={i === lastIndex ? 5 : 4}
            strokeWidth="1.5"
            className={`stroke-white ${isOut(v) ? 'fill-danger' : 'fill-brand-500'}`}
          />
          {hasText(i) && (
            <text
              x={points[i].x}
              y={points[i].y - 12}
              textAnchor="middle"
              strokeWidth="4"
              strokeLinejoin="round"
              paintOrder="stroke"
              className={`stroke-white text-sm font-semibold ${isOut(v) ? 'fill-danger' : 'fill-ink'}`}
            >
              {formatValue(v)}
            </text>
          )}
          {hasText(i) && (
            <text
              x={points[i].x}
              y={H - 8}
              textAnchor="middle"
              className="fill-subtle text-sm"
            >
              {labels[i]}
            </text>
          )}
        </g>
      ))}
    </svg>
  );
}
