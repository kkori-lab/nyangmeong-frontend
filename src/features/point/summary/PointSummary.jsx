import { CircleCheckBig, ShoppingBag, TrendingUp } from 'lucide-react';
import { BTN_PRIMARY, BTN_SECONDARY } from '@/components/buttonStyles';
import { formatDate } from '@/utils/formatDate';
import { getCurrentYm } from '@/utils/yearMonth';
import { useCareMissions, usePointBalance, usePointHistory } from '../queries';
import { formatSignedPoint, getPercent } from '../shared/pointFormat';

const STAT =
  'flex min-w-0 flex-col gap-1.5 border-t border-line-soft px-5 py-[18px] text-left first:border-t-0 hover:bg-surface-2 md:border-t-0 md:border-l md:first:border-l-0 max-[760px]:gap-0.5 max-[760px]:border-t-0 max-[760px]:border-l max-[760px]:px-2.5 max-[760px]:py-3 max-[760px]:first:border-l-0';

function Stat({ icon, label, value, unit, sub, onClick }) {
  return (
    <button type="button" onClick={onClick} className={STAT}>
      <span className="flex items-center gap-1.5 text-muted max-[760px]:text-xs max-[760px]:whitespace-nowrap [&>svg]:max-[760px]:hidden">
        {icon}
        {label}
      </span>
      <span className="text-[30px] leading-[1.1] font-bold tracking-[-0.02em] text-brand-600 max-[760px]:text-lg">
        {value}
        <small className="ml-0.5 text-base font-semibold text-muted">
          {unit}
        </small>
      </span>
      <span className="text-muted max-[760px]:text-xs">{sub}</span>
    </button>
  );
}

/** 화면 이동은 페이지에서 정해 전달 */
export default function PointSummary({
  todayYmd,
  onScrollTo,
  onGoHealth,
  onGoCharacter,
}) {
  const { data: balance } = usePointBalance();
  const { data: history } = usePointHistory(getCurrentYm());
  const { data: missions } = useCareMissions(todayYmd);

  if (!balance || !history || !missions) return null;

  const allMissions = missions.pets.flatMap((pet) => pet.missions);
  const doneCount = allMissions.filter(
    (mission) => mission.cmplYn === 'Y',
  ).length;

  return (
    <section
      aria-label="포인트 관리 / 케어미션 요약"
      className="rounded-card border border-brand-100 bg-brand-50 p-5 md:p-8"
    >
      <p className="mb-3 flex items-center justify-end gap-2 text-muted">
        <span className="size-2 rounded-full bg-brand-500" aria-hidden="true" />
        {formatDate(todayYmd)} 기준
      </p>
      <div className="grid gap-4 lg:grid-cols-[minmax(280px,340px)_minmax(0,1fr)]">
        <div className="flex items-center gap-5 rounded-modal border border-brand-100 bg-white px-6 py-5">
          <span className="grid size-14 shrink-0 place-items-center rounded-card bg-warn-soft text-warn">
            <b className="text-3xl leading-none" aria-hidden="true">
              P
            </b>
          </span>
          <div>
            <p className="text-muted">보유 포인트</p>
            <p className="mt-1 text-[32px] leading-[1.2] font-bold text-brand-600">
              {balance.pntBal.toLocaleString()}
              <small className="ml-1 text-base text-brand-500">P</small>
            </p>
          </div>
        </div>
        <div className="grid overflow-hidden rounded-modal border border-brand-100 bg-white max-[760px]:grid-cols-3 md:grid-cols-3">
          <Stat
            icon={<TrendingUp className="size-4" aria-hidden="true" />}
            label="이번 달 적립"
            value={formatSignedPoint(history.earnTotAmt).slice(0, -1)}
            unit="P"
            sub={`적립 ${history.earnCnt}건`}
            onClick={() => onScrollTo('point-history')}
          />
          <Stat
            icon={<ShoppingBag className="size-4" aria-hidden="true" />}
            label="이번 달 사용"
            value={formatSignedPoint(history.useTotAmt).slice(0, -1)}
            unit="P"
            sub={`아이템 구매 ${history.useCnt}건`}
            onClick={() => onScrollTo('point-history')}
          />
          <Stat
            icon={<CircleCheckBig className="size-4" aria-hidden="true" />}
            label="오늘 미션"
            value={doneCount}
            unit={`/ ${allMissions.length}`}
            sub={`${missions.pets.length}마리 · ${getPercent(doneCount, allMissions.length)}% 완료`}
            onClick={() => onScrollTo('care-mission')}
          />
        </div>
      </div>
      <div className="mt-[18px] flex flex-wrap justify-end gap-2">
        <button type="button" onClick={onGoHealth} className={BTN_SECONDARY}>
          건강 일지
        </button>
        <button
          type="button"
          onClick={onGoCharacter}
          className={`${BTN_PRIMARY} max-[760px]:hidden`}
        >
          캐릭터 꾸미기
        </button>
      </div>
    </section>
  );
}
