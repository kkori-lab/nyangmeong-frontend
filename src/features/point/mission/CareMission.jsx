import {
  ChevronLeft,
  ChevronRight,
  CircleCheckBig,
  Info,
  PawPrint,
} from 'lucide-react';
import { useState } from 'react';
import Badge from '@/components/Badge';
import {
  BTN_PRIMARY,
  FILTER_CHIP,
  FILTER_CHIP_ON,
} from '@/components/buttonStyles';
import LoadError from '@/components/LoadError';
import ProgressBar from '@/components/ProgressBar';
import SkeletonCard from '@/components/SkeletonCard';
import { parseYmd, toYmd } from '@/utils/formatDate';
import { useCareMissions } from '../queries';
import {
  formatPoint,
  getPercent,
  sumGiven,
  sumScore,
} from '../shared/pointFormat';
import { CARD, CARD_HEAD, CARD_TITLE, NAV_BUTTON } from '../shared/pointStyles';

const shiftYmd = (ymd, delta) => {
  const date = parseYmd(ymd);
  date.setDate(date.getDate() + delta);
  return toYmd(date);
};

/** 주양육 동물이 없을 때 케어미션 영역을 대신하는 등록 유도 */
function MissionEmpty({ onRegister }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-14 text-center">
      <div className="mb-4 flex text-line-strong">
        <PawPrint className="size-7" aria-hidden="true" />
      </div>
      <p className="text-lg font-medium text-heading">
        반려동물을 등록하면 케어미션을 받을 수 있어요
      </p>
      <p className="mt-2 text-base text-muted">
        케어미션은 주양육자로 등록한 반려동물에게만 주어져요
      </p>
      <div className="mt-8">
        <button type="button" onClick={onRegister} className={BTN_PRIMARY}>
          반려동물 등록하기
        </button>
      </div>
    </div>
  );
}

/** 그 동물의 미션이 그날 0건일 때. 카드 안이라 박스 없이 문구만 */
function MissionNone() {
  return (
    <p className="py-10 text-center text-base font-normal text-muted">
      이 날은 출제된 미션이 없어요
    </p>
  );
}

/** 그 동물의 미션을 못 받았을 때 */
function MissionError({ onRetry }) {
  return (
    <LoadError
      message="미션을 불러오지 못했어요"
      onRetry={onRetry}
      className="py-12"
    />
  );
}

function MissionPanel({ pet, isToday }) {
  const doneList = pet.missions.filter((mission) => mission.cmptnYn);
  const restList = pet.missions.filter((mission) => !mission.cmptnYn);
  const percent = getPercent(doneList.length, pet.missions.length);

  return (
    <div>
      <div className="rounded-box bg-surface-2 px-5 pt-6 pb-4">
        <div className="flex items-baseline justify-between">
          <b className="text-[28px] leading-[1.2]">
            {doneList.length}
            <small className="text-base font-semibold text-muted">
              {' '}
              / {pet.missions.length} 완료
            </small>
          </b>
          <span className="text-lg font-bold text-brand-600">{percent}%</span>
        </div>
        <ProgressBar
          value={percent}
          label={`${pet.petNm} 진행률`}
          className="mt-3"
        />
        <p className="mt-3 flex flex-wrap gap-2 text-sm text-muted">
          <span>
            {isToday ? '오늘 획득' : '이날 획득'}{' '}
            <b className="text-brand-600 tabular-nums">
              +{formatPoint(sumGiven(pet.missions))}
            </b>
          </span>
          {isToday && (
            <>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">
                남은 미션 {restList.length}개 (+
                {formatPoint(sumScore(restList))})
              </span>
            </>
          )}
        </p>
      </div>
      <ul className="mt-2">
        {pet.missions.map((mission) => {
          const isDone = mission.cmptnYn;
          return (
            <li
              key={mission.dayMsnSn}
              className={`flex min-h-14 items-center gap-3 border-t border-line-soft first:border-t-0 ${isDone ? 'text-ink' : 'text-muted'}`}
            >
              <span className="min-w-0 flex-1 font-semibold">
                {mission.msnNm}
              </span>
              <span
                className={`text-sm font-medium tabular-nums ${isDone ? 'text-brand-600' : 'text-subtle'}`}
              >
                +{formatPoint(mission.scorPnt)}
              </span>
              <Badge
                tone={isDone ? 'green' : 'gray'}
                className="min-w-16 justify-center"
              >
                {isDone ? '완료' : '미완료'}
              </Badge>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** todayYmd: 날짜 이동의 오른쪽 끝(미래는 조회하지 않음). ownPets: 주양육 동물 [{ petSn, petNm }], 불러오는 중이면 null */
/** isPetsError·onRetryPets: 내 반려동물 조회가 실패했을 때 */
/** initialPetSn: 처음 고를 반려동물(메인 바로가기 ?petSn=). 주양육 동물이 아니거나 없으면 첫 동물 */
export default function CareMission({
  todayYmd,
  ownPets,
  isPetsError,
  onRetryPets,
  onRegister,
  initialPetSn,
}) {
  const [ymd, setYmd] = useState(todayYmd);
  const [selectedPetSn, setSelectedPetSn] = useState(initialPetSn);
  const { data, retry } = useCareMissions(ymd, ownPets ?? []);

  if (!ownPets && isPetsError)
    return (
      <section
        id="care-mission"
        aria-labelledby="care-mission-title"
        className={`${CARD} scroll-mt-20`}
      >
        <div className={CARD_HEAD}>
          <h2 id="care-mission-title" className={CARD_TITLE}>
            <CircleCheckBig
              className="size-5 text-brand-500"
              aria-hidden="true"
            />
            케어미션
          </h2>
        </div>
        <MissionError onRetry={onRetryPets} />
      </section>
    );

  if (!ownPets || !data)
    return (
      <div aria-busy="true">
        <SkeletonCard className="h-[927px] min-[1100px]:h-[839px]" />
      </div>
    );

  const pets = data.pets;
  const pet = pets.find((item) => item.petSn === selectedPetSn) ?? pets[0];
  const hasOwnPets = ownPets.length > 0;
  const isToday = ymd === todayYmd;

  return (
    <section
      id="care-mission"
      aria-labelledby="care-mission-title"
      className={`${CARD} scroll-mt-20 ${hasOwnPets ? '' : 'flex flex-col'}`}
    >
      <div className={CARD_HEAD}>
        <h2 id="care-mission-title" className={CARD_TITLE}>
          <CircleCheckBig
            className="size-5 text-brand-500"
            aria-hidden="true"
          />
          {isToday ? '오늘의 케어미션' : '케어미션'}
        </h2>
        {hasOwnPets && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setYmd(shiftYmd(ymd, -1))}
              aria-label="이전 날짜"
              className={NAV_BUTTON}
            >
              <ChevronLeft className="size-5" />
            </button>
            <b>{ymd}</b>
            {isToday && <Badge tone="brand">오늘</Badge>}
            <button
              type="button"
              onClick={() => setYmd(shiftYmd(ymd, 1))}
              disabled={ymd >= todayYmd}
              aria-label="다음 날짜"
              className={NAV_BUTTON}
            >
              <ChevronRight className="size-5" />
            </button>
          </div>
        )}
      </div>
      {!hasOwnPets ? (
        <MissionEmpty onRegister={onRegister} />
      ) : (
        <div className="px-6 pt-5 pb-6">
          <div
            role="group"
            aria-label="반려동물 선택"
            className="mb-4 flex flex-wrap gap-2"
          >
            {pets.map((item) => {
              const isSelected = item.petSn === pet.petSn;
              const missions = item.missions ?? [];
              const doneCount = missions.filter(
                (mission) => mission.cmptnYn,
              ).length;
              return (
                <button
                  key={item.petSn}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => setSelectedPetSn(item.petSn)}
                  className={isSelected ? FILTER_CHIP_ON : FILTER_CHIP}
                >
                  {item.petNm}
                  <span
                    className={isSelected ? 'text-brand-500' : 'text-subtle'}
                  >
                    {item.missions ? `${doneCount}/${missions.length}` : '!'}
                  </span>
                </button>
              );
            })}
          </div>
          {!pet.missions ? (
            <MissionError onRetry={() => retry(pet.petSn)} />
          ) : pet.missions.length === 0 ? (
            <MissionNone />
          ) : (
            <MissionPanel pet={pet} isToday={isToday} />
          )}
          {isToday && (
            <p className="mt-2 flex items-center gap-2 text-sm text-subtle">
              <Info className="size-4 shrink-0" aria-hidden="true" />
              미완료 미션은 자정에 진행률만큼 정산돼요
            </p>
          )}
        </div>
      )}
    </section>
  );
}
