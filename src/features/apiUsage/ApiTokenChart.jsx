import { formatDate } from '@/utils/formatDate';

/** 일별 막대 영역 높이 */
const CHART_HEIGHT_PX = 180;

const SERIES = [
  { name: 'inptTknCnt', label: '입력', colorClass: 'bg-brand-500' },
  { name: 'otptTknCnt', label: '출력', colorClass: 'bg-brand-100' },
];

/** 막대 높이 비율 */
const getBarRatio = (count, maxCount) =>
  maxCount > 0 ? `${(count / maxCount) * 100}%` : '0%';

/** 하루치 막대의 읽기 문구 */
const getDayLabel = ({ callYmd, inptTknCnt, otptTknCnt }) =>
  `${callYmd} 입력 ${inptTknCnt.toLocaleString()}, 출력 ${otptTknCnt.toLocaleString()}`;

/**
 * [AI 일별 토큰 막대 그래프]
 * - 일별 입력·출력 막대, 기간이 길면 그래프 안에서만 가로 스크롤
 */
export default function ApiTokenChart({ tokens }) {
  const maxCount = Math.max(
    ...tokens.flatMap(({ inptTknCnt, otptTknCnt }) => [inptTknCnt, otptTknCnt]),
  );

  return (
    <div className="rounded-[14px] border border-line bg-white p-4">
      <ul className="mb-3 flex gap-4 text-sm text-subtle">
        {SERIES.map(({ name, label, colorClass }) => (
          <li key={name} className="flex items-center gap-1.5">
            <span className={`size-3 rounded-[2px] ${colorClass}`} />
            {label}
          </li>
        ))}
      </ul>
      <div className="overflow-x-auto">
        <ul className="flex min-w-full items-end gap-3">
          {tokens.map((token) => (
            <li
              key={token.callYmd}
              role="img"
              aria-label={getDayLabel(token)}
              title={getDayLabel(token)}
              className="flex min-w-11 flex-1 flex-col items-center gap-1"
            >
              {/** 막대 높이는 값마다 달라 인라인 지정 */}
              <div
                className="flex w-full items-end justify-center gap-1"
                style={{ height: CHART_HEIGHT_PX }}
              >
                {SERIES.map(({ name, colorClass }) => (
                  <span
                    key={name}
                    className={`w-3 rounded-t-[2px] ${colorClass}`}
                    style={{ height: getBarRatio(token[name], maxCount) }}
                  />
                ))}
              </div>
              <span className="text-xs whitespace-nowrap text-subtle tabular-nums">
                {formatDate(token.callYmd, { hasYear: false, separator: '-' })}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
