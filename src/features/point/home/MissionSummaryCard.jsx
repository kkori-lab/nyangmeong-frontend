import StatLink from '@/components/StatLink';
import { PATHS } from '@/routes/paths';
import { usePointBalance } from '../queries';
import { getPercent } from '../shared/pointFormat';

/** 오늘 미션 달성률은 포인트 요약(주양육 동물 전체)의 완료/전체로 낸다 */
export default function MissionSummaryCard() {
  const { data: point, isError } = usePointBalance();

  const percent = point
    ? getPercent(point.todayCmptnMsnCnt, point.todayMsnCnt)
    : null;

  return (
    <StatLink
      to={PATHS.MYPAGE_POINTS}
      label="오늘의 케어미션"
      value={percent}
      unit="% 완료"
      emphasis
      note={isError ? '불러오지 못했어요' : undefined}
      footer={
        <span
          role="progressbar"
          aria-valuenow={percent ?? 0}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="오늘의 케어미션 달성률"
          className="block h-2 overflow-hidden rounded-full bg-brand-50"
        >
          <i
            className="block h-full rounded-full bg-brand-500"
            style={{ width: `${percent ?? 0}%` }}
          />
        </span>
      }
    />
  );
}
