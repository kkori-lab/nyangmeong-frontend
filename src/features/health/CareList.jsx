import { useState } from 'react';
import Card from '@/components/Card';
import DropdownSelect from '@/components/DropdownSelect';
import Icon from '@/components/Icon';
import SkeletonCard from '@/components/SkeletonCard';
import { getTodayYmd } from '@/utils/formatDate';
import CareItemModal from './CareItemModal';
import CareRecordList from './CareRecordList';
import CareTile from './CareTile';
import { CARE_ZONE, MAX_MAIN_CARE } from './careDue';
import {
  useCancelCareRecord,
  useCancelLastDose,
  useCareItems,
  useCheckCareItem,
  useSaveCareMain,
} from './queries';

// 640px 미만에서 구역마다 처음 보여 주는 칸 수
const MOBILE_VISIBLE_COUNT = 3;

// 토탈 케어리스트 카드(FN-HLT-003-12·13). 제목 왼쪽 반려동물 셀렉트(FN-HLT-003-01)에서 고른 반려동물 기준이다
export default function CareList({ petSn, pets, onSelectPet }) {
  const { data, isPending, isError, error, refetch } = useCareItems(petSn);
  const [isAdding, setIsAdding] = useState(false);
  // 640px 미만에서 펼친 구역. 반려동물별 키라 반려동물을 바꾸면 다시 접힌다
  const [expandedZones, setExpandedZones] = useState([]);
  const checkCareItem = useCheckCareItem();
  const cancelLastDose = useCancelLastDose();
  const cancelCareRecord = useCancelCareRecord();
  const saveCareMain = useSaveCareMain();

  if (isPending) {
    return (
      <div aria-busy="true">
        {/* 불러온 뒤 카드 높이(1440px 두 열, 640px 미만은 구역마다 3칸으로 접힌 처음 상태) */}
        <SkeletonCard className="h-[1486px] max-sm:h-[1678px]" />
      </div>
    );
  }
  if (isError) {
    return (
      <div
        role="alert"
        className="flex items-center gap-3 text-sm text-[#566465]"
      >
        {error.message}
        <button type="button" className="underline" onClick={() => refetch()}>
          다시 시도
        </button>
      </div>
    );
  }

  const { careItems, careRecords } = data;
  const todayYmd = getTodayYmd();
  const dailyItems = careItems.filter(
    (item) => item.careZoneCd === CARE_ZONE.DAILY,
  );
  const regularItems = careItems.filter(
    (item) => item.careZoneCd === CARE_ZONE.REGULAR,
  );
  const regularSns = new Set(regularItems.map((item) => item.careArtclSn));
  const mainItems = careItems
    .filter((item) => item.mainExpsrYn)
    .sort((a, b) => a.mainSortSeq - b.mainSortSeq);

  const findTodayRecord = (item) =>
    careRecords.find(
      (record) =>
        record.careArtclSn === item.careArtclSn && record.cmptnYmd === todayYmd,
    );
  // 투약 항목은 하루 복용 횟수를 채워야 완료, 나머지는 오늘 완료 기록이 있으면 완료
  const isDoneToday = (item) =>
    item.prscSn != null
      ? item.todayCmptnCnt >= item.dayMdcnNmtm
      : findTodayRecord(item) != null;
  const doneCount = careItems.filter(isDoneToday).length;

  // 줄 클릭: 완료 전이면 체크, 완료한 항목은 오늘 기록 취소. 투약은 횟수를 채운 뒤에는 아무것도 하지 않는다
  const handleCheck = (item) => {
    if (item.prscSn != null) {
      if (!isDoneToday(item))
        checkCareItem.mutate({ petSn, careArtclSn: item.careArtclSn });
      return;
    }
    const todayRecord = findTodayRecord(item);
    if (todayRecord)
      cancelCareRecord.mutate({
        petSn,
        careCmptnHstrySn: todayRecord.careCmptnHstrySn,
      });
    else checkCareItem.mutate({ petSn, careArtclSn: item.careArtclSn });
  };

  // ★: 켜면 메인 순서 끝에 더하고 끄면 뺀다. 7개째는 서버가 막고 안내 문구를 준다
  const handleToggleMain = (item) => {
    const careArtclSns = item.mainExpsrYn
      ? mainItems
          .filter((main) => main.careArtclSn !== item.careArtclSn)
          .map((main) => main.careArtclSn)
      : [...mainItems.map((main) => main.careArtclSn), item.careArtclSn];
    saveCareMain.mutate({ petSn, careArtclSns });
  };

  // 640px 이상: 앞 절반은 왼쪽 열, 나머지는 오른쪽 열에 세로로 채우고, 같은 줄의 두 칸은 높이가 같다.
  // 개수가 홀수면 오른쪽 마지막 빈 자리에도 밑줄을 그어 두 열의 끝을 맞춘다
  // 640px 미만: 처음 MOBILE_VISIBLE_COUNT칸만 보이고 나머지는 [더보기]로 펼친다
  const renderZone = (zoneCd, label, items, note, className = '') => {
    const rowCount = Math.ceil(items.length / 2);
    const zoneKey = `${petSn}:${zoneCd}`;
    const isExpanded = expandedZones.includes(zoneKey);
    const hiddenCount = items.length - MOBILE_VISIBLE_COUNT;
    const toggleZone = () =>
      setExpandedZones((prev) =>
        isExpanded ? prev.filter((key) => key !== zoneKey) : [...prev, zoneKey],
      );
    return (
      <div className={className}>
        <p className="border-b-2 border-[#b9c4c4] pb-2 text-base font-bold text-[#1a3234]">
          {label}
        </p>
        <div
          className="grid gap-y-2 pt-3 sm:grid-flow-col sm:grid-cols-2 sm:grid-rows-[repeat(var(--care-rows),auto)] sm:gap-x-8 sm:gap-y-0 sm:pt-0"
          style={{ '--care-rows': rowCount }}
        >
          {items.map((item, index) => (
            <CareTile
              key={item.careArtclSn}
              item={item}
              isDone={isDoneToday(item)}
              className={
                !isExpanded && index >= MOBILE_VISIBLE_COUNT
                  ? 'max-sm:hidden'
                  : ''
              }
              onCheck={handleCheck}
              onToggleMain={handleToggleMain}
              onCancelLastDose={(target) =>
                cancelLastDose.mutate({
                  petSn,
                  careArtclSn: target.careArtclSn,
                })
              }
            />
          ))}
          {items.length % 2 === 1 && (
            <div
              aria-hidden="true"
              className="border-b border-[#edf1f1] max-sm:hidden"
            />
          )}
        </div>
        {hiddenCount > 0 && (
          <button
            type="button"
            aria-expanded={isExpanded}
            className="mt-2 flex h-10 w-full items-center justify-center gap-1 rounded-[10px] border border-line bg-white text-sm font-semibold text-ink-2 hover:bg-surface-2 sm:hidden"
            onClick={toggleZone}
          >
            {isExpanded ? '접기' : `더보기 (+${hiddenCount})`}
            <Icon
              name={isExpanded ? 'expand_less' : 'expand_more'}
              className="text-xl"
            />
          </button>
        )}
        {note && (
          <p className="mt-3 rounded-[10px] border border-dashed border-[#b9c4c4] px-4 py-3 text-sm text-[#566465]">
            {note}
          </p>
        )}
      </div>
    );
  };

  return (
    <>
      <Card
        title="토탈 케어리스트"
        // 760px 이하에서는 완료 개수를 숨기고 [셀렉트][제목] … [＋] 한 줄로 둔다
        sub={
          <span className="max-[760px]:hidden">
            오늘 {doneCount}/{careItems.length} 완료
          </span>
        }
        leading={
          pets.length > 1 && (
            <div className="shrink-0">
              <DropdownSelect
                label="반려동물 선택 (토탈 케어리스트)"
                isPill
                value={petSn}
                options={pets.map((pet) => ({
                  value: pet.petSn,
                  label: pet.petNm,
                }))}
                onChange={onSelectPet}
                className="w-[calc(3em+3.75rem)]"
              />
            </div>
          )
        }
        action={
          // 좁은 화면에서는 제목·부제가 잘리지 않게 ＋ 아이콘만 남긴다(날짜 상세 카드와 같음)
          <button
            type="button"
            aria-label="관리 항목 추가"
            className="inline-flex h-8 shrink-0 items-center justify-center rounded-[6px] bg-brand-500 px-3 text-base font-semibold text-white hover:bg-brand-600 max-[760px]:w-8 max-[760px]:px-0"
            onClick={() => setIsAdding(true)}
          >
            <Icon name="add" className="text-xl min-[761px]:hidden" />
            <span className="max-[760px]:hidden">관리 항목 추가</span>
          </button>
        }
      >
        <div className="mb-4 flex flex-wrap items-center gap-2 text-[#566465]">
          <span>★ 표시한 항목이 메인 화면에 보여요</span>
          <span className="ml-auto">
            메인 표시{' '}
            <span className="text-lg font-semibold text-[#1a3234] tabular-nums">
              {mainItems.length}
            </span>{' '}
            / {MAX_MAIN_CARE}
          </span>
        </div>

        {renderZone(
          CARE_ZONE.REGULAR,
          '정기관리(REGULAR)',
          regularItems,
          '심장사상충 예방·구충제는 검진상세에서 반복 예방을 등록하면 여기에 추가돼요',
        )}
        {renderZone(
          CARE_ZONE.DAILY,
          '일상관리(DAILY)',
          dailyItems,
          null,
          'mt-8',
        )}

        <CareRecordList
          key={petSn}
          records={careRecords}
          regularSns={regularSns}
          onCancel={(record) =>
            cancelCareRecord.mutate({
              petSn,
              careCmptnHstrySn: record.careCmptnHstrySn,
            })
          }
        />
      </Card>

      {isAdding && (
        <CareItemModal petSn={petSn} onClose={() => setIsAdding(false)} />
      )}
    </>
  );
}
