import { useEffect, useState } from 'react';

/** 진행 막대 갱신 간격과 차오르는 속도(약 6초에 63%, 15초에 약 85%) */
const PROGRESS_TICK_MS = 100;
const PROGRESS_TIME_CONSTANT_MS = 6000;

/** 진행 막대: 90%를 향해 점점 느려지며 차오름, 응답 시간을 알 수 없어 100%는 완료 때만 */
export default function AnalyzeProgress({ label = '영수증 분석 진행' }) {
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    const startedAt = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - startedAt;
      setPercent(90 * (1 - Math.exp(-elapsed / PROGRESS_TIME_CONSTANT_MS)));
    }, PROGRESS_TICK_MS);
    return () => clearInterval(timer);
  }, []);

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(percent)}
      className="h-1.5 w-full overflow-hidden rounded-full bg-surface-3"
    >
      <div
        className="h-full rounded-full bg-brand-500 transition-[width] duration-200 ease-linear"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
