import {
  ChevronLeft,
  ChevronRight,
  CircleCheckBig,
  Info,
  PawPrint,
  RotateCw,
} from 'lucide-react';
import { useState } from 'react';
import { BTN_PRIMARY } from '@/components/buttonStyles';
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

const TAB =
  'inline-flex h-10 items-center gap-2 rounded-full border px-4 font-semibold';

/** 주양육 동물이 없을 때 케어미션 영역을 대신하는 등록 유도 */
function MissionEmpty({ onRegister }) {
  return (
    <div className="flex flex-col items-center px-6 py-16 text-center">
      <span className="grid size-14 place-items-center rounded-full bg-brand-50 text-brand-500">
        <PawPrint className="size-7" aria-hidden="true" />
      </span>
      <p className="mt-4 text-lg font-bold">
        반려동물을 등록하면 케어미션을 받을 수 있어요
      </p>
      <p className="mt-1 text-muted">
        케어미션은 주양육자로 등록한 반려동물에게만 주어져요
      </p>
      <button
        type="button"
        onClick={onRegister}
        className={`${BTN_PRIMARY} mt-4`}
      >
        반려동물 등록하기
      </button>
    </div>
  );
}

/** 그 동물의 미션이 그날 0건일 때 */
function MissionNone() {
  return (
    <p className="py-12 text-center text-subtle">
      이 날은 출제된 미션이 없어요
    </p>
  );
}

/** 그 동물의 미션을 못 받았을 때 */
function MissionError({ onRetry }) {
  return (
    <div className="flex flex-col items-center py-12 text-center">
      <p className="font-bold">미션을 불러오지 못했어요</p>
      <button
        type="button"
        onClick={onRetry}
        className={`${BTN_PRIMARY} mt-4 gap-1.5`}
      >
        <RotateCw className="size-4" aria-hidden="true" />
        다시 시도
      </button>
    </div>
  );
}

function MissionPanel({ pet, isToday }) {
  const doneList = pet.missions.filter((mission) => mission.cmptnYn);
  const restList = pet.missions.filter((mission) => !mission.cmptnYn);
  const percent = getPercent(doneList.length, pet.missions.length);

  return (
    <div>
      <div className="rounded-box bg-surface-2 px-5 pt-[22px] pb-4">
        <div className="flex items-baseline justify-between">
          <b className="text-[32px] leading-[1.2]">
            {doneList.length}
            <small className="text-base font-semibold text-muted">
              {' '}
              / {pet.missions.length} 완료
            </small>
          </b>
          <span className="text-xl font-bold text-brand-600">{percent}%</span>
        </div>
        <div
          role="progressbar"
          aria-label={`${pet.petNm} 진행률`}
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
          className="mt-3 h-2.5 overflow-hidden rounded-full bg-surface-3"
        >
          <div
            className="h-full bg-brand-500"
            style={{ width: `${percent}%` }}
          />
        </div>
        <p className="mt-3 flex flex-wrap gap-2 text-sm text-muted">
          <span>
            {isToday ? '오늘 획득' : '이날 획득'}{' '}
            <b className="text-brand-600 tabular-nums">
              +{formatPoint(sumGiven(pet.missions))}
            </b>
          </span>
          <span aria-hidden="true">·</span>
          <span className="tabular-nums">
            남은 미션 {restList.length}개 (+{formatPoint(sumScore(restList))})
          </span>
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
              <span
                className={`inline-flex h-6 min-w-16 items-center justify-center rounded-full px-2.5 text-badge font-semibold ${isDone ? 'bg-tone-green-bg text-tone-green-fg' : 'bg-tone-gray-bg text-tone-gray-fg'}`}
              >
                {isDone ? '완료' : '미완료'}
              </span>
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
        <SkeletonCard className="h-[927px] lg:h-[839px]" />
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
      className={`${CARD} scroll-mt-20`}
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
            {isToday && (
              <span className="inline-flex h-6 items-center rounded-full bg-brand-50 px-2.5 text-badge font-semibold text-brand-600">
                오늘
              </span>
            )}
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
        <div className="px-[22px] pt-5 pb-[22px]">
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
                  className={`${TAB} ${isSelected ? 'border-brand-500 bg-brand-500 text-white' : 'border-line bg-white hover:border-line-strong'}`}
                >
                  {item.petNm}
                  <span
                    className={`text-sm ${isSelected ? 'text-brand-100' : 'text-subtle'}`}
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
          <p className="mt-2 flex items-center gap-2 text-sm text-subtle">
            <Info className="size-4 shrink-0" aria-hidden="true" />
            미완료 미션은 자정에 진행률만큼 정산돼요
          </p>
        </div>
      )}
    </section>
  );
}
