import { useState } from 'react';
import Card from '@/components/Card';
import Icon from '@/components/Icon';
import SkeletonCard from '@/components/SkeletonCard';
import { getTodayYmd } from '@/utils/formatDate';
import ConfirmModal from '@/components/ConfirmModal';
import CareItemModal from './CareItemModal';
import CareRecordList from './CareRecordList';
import CareTile from './CareTile';
import { CARE_ZONE } from './careDue';
import {
  useCancelCareRecord,
  useCancelLastDose,
  useCareItems,
  useCheckCareItem,
  useDeleteCareItem,
} from './queries';

// 640px 미만에서 구역마다 처음 보여 주는 칸 수
const MOBILE_VISIBLE_COUNT = 3;

// 토탈 케어리스트 카드(FN-HLT-003-12·13). 건강기록 공통 반려동물 카드에서 고른 반려동물(petSn) 기준이다. 제목은 「토탈 케어리스트」
export default function CareList({ petSn }) {
  const { data, isPending, isError, error, refetch } = useCareItems(petSn);
  const [isAdding, setIsAdding] = useState(false);
  // 수정 중인 항목, 삭제 확인 중인 항목
  const [editingItem, setEditingItem] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);
  // 640px 미만에서 펼친 구역. 반려동물별 키라 반려동물을 바꾸면 다시 접힌다
  const [expandedZones, setExpandedZones] = useState([]);
  const checkCareItem = useCheckCareItem();
  const cancelLastDose = useCancelLastDose();
  const cancelCareRecord = useCancelCareRecord();
  const deleteCareItem = useDeleteCareItem();

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

  // 1024px 이상: 앞 절반은 왼쪽 열, 나머지는 오른쪽 열에 세로로 채우고, 같은 줄의 두 칸은 높이가 같다.
  // 개수가 홀수면 오른쪽 마지막 빈 자리에도 밑줄을 그어 두 열의 끝을 맞춘다. 640~1023px은 1열 (※신규 정책)
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
          className="grid gap-y-2 pt-3 lg:grid-flow-col lg:grid-cols-2 lg:grid-rows-[repeat(var(--care-rows),auto)] lg:gap-x-8 sm:gap-y-0 sm:pt-0"
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
              onEdit={setEditingItem}
              onDelete={setDeletingItem}
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
              className="border-b border-[#edf1f1] max-lg:hidden"
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
        // 760px 이하에서는 완료 개수를 숨기고 [제목] … [＋] 한 줄로 둔다
        sub={
          <span className="max-[760px]:hidden">
            오늘 {doneCount}/{careItems.length} 완료
          </span>
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
        {renderZone(
          CARE_ZONE.REGULAR,
          '정기관리',
          regularItems,
          '심장사상충 예방·구충제는 검진상세에서 반복 예방을 등록하면 여기에 추가돼요',
        )}
        {renderZone(CARE_ZONE.DAILY, '일상관리', dailyItems, null, 'mt-8')}

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
      {editingItem && (
        <CareItemModal
          petSn={petSn}
          item={editingItem}
          onClose={() => setEditingItem(null)}
        />
      )}
      {deletingItem && (
        <ConfirmModal
          title="관리 항목 삭제"
          description={`${deletingItem.careArtclNm}을(를) 삭제할까요? 완료 기록도 함께 사라져요`}
          confirmLabel="삭제"
          isPending={deleteCareItem.isPending}
          errorMessage={deleteCareItem.error?.message}
          onCancel={() => {
            deleteCareItem.reset();
            setDeletingItem(null);
          }}
          onConfirm={() =>
            deleteCareItem.mutate(
              { petSn, careArtclSn: deletingItem.careArtclSn },
              { onSuccess: () => setDeletingItem(null) },
            )
          }
        />
      )}
    </>
  );
}
