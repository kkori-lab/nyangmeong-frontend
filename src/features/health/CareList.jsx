import { useState } from 'react';
import LoadError from '@/components/LoadError';
import Card from '@/components/Card';
import Icon from '@/components/Icon';
import SkeletonCard from '@/components/SkeletonCard';
import { BTN_SECONDARY } from '@/components/buttonStyles';
import { getTodayYmd } from '@/utils/formatDate';
import CareManageModal from './CareManageModal';
import CareProgressBox from './CareProgressBox';
import CareRecordList from './CareRecordList';
import CareTile from './CareTile';
import { CARE_ZONE, MIN_CARE_COUNT, getCareCycleName } from './careDue';
import { readTodayKept, writeTodayKept } from './careTodayKept';
import UnderlineTabs from '@/components/UnderlineTabs';
import {
  useCancelCareRecord,
  useCancelLastDose,
  useCareItems,
  useCheckCareItem,
} from './queries';

/** 760px 미만에서 구역마다 처음 보여 주는 칸 수 */
const MOBILE_VISIBLE_COUNT = 3;

/** 1100px 이하에서 두 구역을 전환하는 탭 */
const ZONE_TABS = [
  { id: 'hlt003-care-today', label: '오늘 할 케어' },
  { id: 'hlt003-care-upcoming', label: '다가오는 정기관리' },
];
const EMPTY_TEXTS = {
  'hlt003-care-today': '오늘 할 케어가 없어요',
  'hlt003-care-upcoming': '다가오는 정기관리가 없어요',
};

/**
 * [케어리스트 탭] (FN-HLT-003-12, ※신규 정책)
 * - 「케어리스트」 카드(진행 상자 + 오늘 할 케어·다가오는 정기관리) 아래 「최근 케어 기록」 카드
 * - 구역(※신규 정책): 오늘 할 케어 = 일상관리 전부 + 예정일이 오늘인 정기관리. 체크해도 자리는 그대로(맨 아래로 내리지 않음)
 *   체크한 오늘 예정 정기관리는 서버가 다음 예정일로 바꾸므로 careTodayKept에 기억해 오늘 하루 「오늘 할 케어」에 체크된 채 둠
 *   다가오는 정기관리 = 그 밖의 정기관리(예정일이 지났거나 아직 안 온 것, 미리 한 것). 다음 날부터는 다음 예정일 자리에 보임
 * - 케어리스트에는 고른 항목(indctYn)만. 5개 미만이면 「케어 항목 관리」 모달이 자동으로 열림
 * - mission: 오늘 케어미션 요약(페이지가 조립). undefined는 불러오는 중, null은 없음
 */
export default function CareList({ petSn, petNm, mission }) {
  const { data, isPending, isError, error, refetch } = useCareItems(petSn);
  const [isManaging, setIsManaging] = useState(false);
  const [zoneId, setZoneId] = useState(ZONE_TABS[0].id);
  /** 760px 미만에서 펼친 구역: 반려동물별 키라 반려동물을 바꾸면 다시 접힘 */
  const [expandedZones, setExpandedZones] = useState([]);
  /** 체크해도 오늘 할 케어에 남길 정기관리 항목: 반려동물을 바꾸면 그 반려동물 것을 다시 읽음 */
  const [kept, setKept] = useState(() => ({
    petSn,
    list: readTodayKept(petSn, getTodayYmd()),
  }));
  if (kept.petSn !== petSn)
    setKept({ petSn, list: readTodayKept(petSn, getTodayYmd()) });
  const checkCareItem = useCheckCareItem();
  const cancelLastDose = useCancelLastDose();
  const cancelCareRecord = useCancelCareRecord();

  if (isPending || (!isError && mission === undefined)) {
    return (
      <div aria-busy="true" className="flex flex-col gap-5">
        {/** 불러온 뒤 두 카드의 높이 */}
        <SkeletonCard className="h-[633px] max-[1100px]:h-[697px] max-[760px]:h-[829px]" />
        <SkeletonCard className="h-[291px] max-[760px]:h-[463px]" />
      </div>
    );
  }
  if (isError) {
    return <LoadError message={error.message} onRetry={() => refetch()} />;
  }

  const { careItems, careRecords } = data;
  const todayYmd = getTodayYmd();
  const shownItems = careItems.filter((item) => item.indctYn);
  const regularCycles = new Map(
    careItems
      .filter((item) => item.careZoneCd === CARE_ZONE.REGULAR)
      .map((item) => [item.careArtclSn, getCareCycleName(item)]),
  );

  const findTodayRecord = (item) =>
    careRecords.find(
      (record) =>
        record.careArtclSn === item.careArtclSn && record.cmptnYmd === todayYmd,
    );
  /** 투약 항목은 하루 복용 횟수를 채워야 완료, 나머지는 오늘 완료 기록이 있으면 완료 */
  const isDoneToday = (item) =>
    item.prscSn != null
      ? item.todayCmptnCnt >= item.dayMdcnNmtm
      : findTodayRecord(item) != null;
  const doneCount = shownItems.filter(isDoneToday).length;

  /** 오늘 할 케어: 일상관리 전부 + 예정일이 오늘인 정기관리 + 오늘 체크해 기억해 둔 정기관리 */
  const isTodayItem = (item) =>
    item.careZoneCd !== CARE_ZONE.REGULAR ||
    (item.nxtmPrnmntYmd === todayYmd && !isDoneToday(item)) ||
    (kept.list.includes(item.careArtclSn) && isDoneToday(item));
  /** 구역 안 묶음: 위는 오늘의 미션 항목(todayMsnYn), 아래는 나머지. 체크해도 자리는 그대로 */
  const toGroups = (items) => ({
    missionItems: items.filter((item) => item.todayMsnYn),
    restItems: items.filter((item) => !item.todayMsnYn),
  });
  const zones = {
    'hlt003-care-today': toGroups(shownItems.filter(isTodayItem)),
    /** 다가오는 정기관리: 예정일이 지났거나 아직 안 온 것 + 오늘 완료한 것(다음 예정일 기준), 예정일 빠른 순 */
    'hlt003-care-upcoming': toGroups(
      shownItems
        .filter((item) => !isTodayItem(item))
        .sort((a, b) =>
          (a.nxtmPrnmntYmd ?? '9').localeCompare(b.nxtmPrnmntYmd ?? '9'),
        ),
    ),
  };

  const updateKept = (list) => {
    writeTodayKept(petSn, todayYmd, list);
    setKept({ petSn, list });
  };
  /** 체크(완료) 요청 직전: 지금 오늘 할 케어에 있는 정기관리면 기억 (예정일 전·지난 항목은 기억하지 않음) */
  const rememberIfToday = (item) => {
    if (
      item.careZoneCd === CARE_ZONE.REGULAR &&
      isTodayItem(item) &&
      !kept.list.includes(item.careArtclSn)
    )
      updateKept([...kept.list, item.careArtclSn]);
  };

  /** 줄 클릭: 완료 전이면 체크, 완료한 항목은 오늘 기록 취소. 투약은 횟수를 채운 뒤에는 동작 없음 */
  const handleCheck = (item) => {
    if (item.prscSn != null) {
      if (!isDoneToday(item)) {
        rememberIfToday(item);
        checkCareItem.mutate({ petSn, careArtclSn: item.careArtclSn });
      }
      return;
    }
    const todayRecord = findTodayRecord(item);
    if (todayRecord) {
      updateKept(kept.list.filter((sn) => sn !== item.careArtclSn));
      cancelCareRecord.mutate({
        petSn,
        careCmptnHstrySn: todayRecord.careCmptnHstrySn,
      });
    } else {
      rememberIfToday(item);
      checkCareItem.mutate({ petSn, careArtclSn: item.careArtclSn });
    }
  };

  const closeManage = () => {
    setIsManaging(false);
    refetch();
  };

  const isShort = shownItems.length < MIN_CARE_COUNT;

  return (
    <div className="flex flex-col gap-5">
      <Card
        title="케어리스트"
        action={
          <button
            type="button"
            className={`${BTN_SECONDARY} gap-1.5`}
            onClick={() => setIsManaging(true)}
          >
            <Icon name="tune" className="text-lg" />
            항목 관리
          </button>
        }
      >
        <CareProgressBox
          doneCount={doneCount}
          totalCount={shownItems.length}
          mission={mission}
        />

        <UnderlineTabs
          items={ZONE_TABS}
          activeId={zoneId}
          onSelect={setZoneId}
          label="케어리스트 구역"
          className="mt-4 min-[1100px]:hidden"
        />

        <div className="mt-5 grid gap-x-8 min-[1100px]:grid-cols-2">
          {ZONE_TABS.map((zone) => {
            const { missionItems, restItems } = zones[zone.id];
            const items = [...missionItems, ...restItems];
            const zoneKey = `${petSn}:${zone.id}`;
            const isExpanded = expandedZones.includes(zoneKey);
            const hiddenCount = items.length - MOBILE_VISIBLE_COUNT;
            return (
              <section
                key={zone.id}
                id={zone.id}
                aria-labelledby={`${zone.id}-title`}
                className={`min-w-0 ${zone.id === zoneId ? '' : 'max-[1100px]:hidden'}`}
              >
                <h3
                  id={`${zone.id}-title`}
                  className="flex items-baseline justify-between gap-2 border-b-2 border-line-strong pb-2 font-bold text-ink"
                >
                  {zone.label}
                  <small className="text-sm font-medium text-muted tabular-nums">
                    {items.length}개
                  </small>
                </h3>
                {items.length === 0 ? (
                  <p className="py-4 text-sm text-subtle">
                    {EMPTY_TEXTS[zone.id]}
                  </p>
                ) : (
                  <div className="grid gap-y-2 pt-3 min-[760px]:gap-y-0 min-[760px]:pt-0">
                    {items.map((item, index) => (
                      <CareTile
                        key={item.careArtclSn}
                        item={item}
                        isDone={isDoneToday(item)}
                        className={
                          !isExpanded && index >= MOBILE_VISIBLE_COUNT
                            ? 'max-[760px]:hidden'
                            : ''
                        }
                        onCheck={handleCheck}
                        onCancelLastDose={(target) =>
                          cancelLastDose.mutate({
                            petSn,
                            careArtclSn: target.careArtclSn,
                          })
                        }
                      />
                    ))}
                  </div>
                )}
                {hiddenCount > 0 && (
                  <button
                    type="button"
                    aria-expanded={isExpanded}
                    className="mt-2 flex h-10 w-full items-center justify-center gap-1 rounded-[10px] border border-line bg-white text-sm font-semibold text-ink-2 hover:bg-surface-2 min-[760px]:hidden"
                    onClick={() =>
                      setExpandedZones((prev) =>
                        isExpanded
                          ? prev.filter((key) => key !== zoneKey)
                          : [...prev, zoneKey],
                      )
                    }
                  >
                    {isExpanded ? '접기' : `더보기 (+${hiddenCount})`}
                    <Icon
                      name={isExpanded ? 'expand_less' : 'expand_more'}
                      className="text-lg"
                    />
                  </button>
                )}
              </section>
            );
          })}
        </div>
      </Card>

      <CareRecordList
        key={petSn}
        records={careRecords}
        regularCycles={regularCycles}
        onCancel={(record) =>
          cancelCareRecord.mutate({
            petSn,
            careCmptnHstrySn: record.careCmptnHstrySn,
          })
        }
      />

      {(isManaging || isShort) && (
        <CareManageModal
          key={`manage-${petSn}`}
          petSn={petSn}
          petNm={petNm}
          careItems={careItems}
          isForced={isShort && !isManaging}
          onClose={closeManage}
        />
      )}
    </div>
  );
}
