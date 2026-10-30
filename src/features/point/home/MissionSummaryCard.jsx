import { useState } from 'react';
import StatLink from '@/components/StatLink';
import { PATHS } from '@/routes/paths';
import { toYmd } from '@/utils/formatDate';
import { useCareMissions } from '../queries';
import { getPercent } from '../shared/pointFormat';

/** 서버가 주양육 동물의 미션만 주는 것으로 보고 그대로 집계 */
export default function MissionSummaryCard() {
  const [todayYmd] = useState(() => toYmd(new Date()));
  const { data: missions, isError } = useCareMissions(todayYmd);

  const allMissions = missions?.pets.flatMap((pet) => pet.missions);
  const percent = allMissions
    ? getPercent(
        allMissions.filter((mission) => mission.cmplYn === 'Y').length,
        allMissions.length,
      )
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
