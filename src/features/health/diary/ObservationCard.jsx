import { useState } from 'react';
import Badge from '@/components/Badge';
import Card from '@/components/Card';
import Icon from '@/components/Icon';
import Modal from '@/components/Modal';
import SkeletonCard from '@/components/SkeletonCard';
import {
  BTN_DANGER,
  BTN_PRIMARY,
  BTN_SECONDARY,
} from '@/components/buttonStyles';
import useMediaQuery from '@/hooks/useMediaQuery';
import { formatMonthDayDot } from '@/utils/formatDate';
import {
  useDeleteObservationRound,
  useEndObservation,
  useObservations,
} from '../queries';
import EmptyBox from './EmptyBox';
import ObservationDetail from './ObservationDetail';
import {
  ObservationMobileDetail,
  ObservationMobileList,
} from './ObservationMobile';
import ObservationModal from './ObservationModal';
import { formatPart, getItemValueText } from './observationUtils';

/**
 * [지속 관찰 카드]
 * - 왼쪽 관찰 항목 목록, 오른쪽 선택한 항목의 회차별 사진·크기 변화·회차 상세 (FN-HLT-002-15~19)
 * - 관찰 기록 등록 모달 A(항목 등록)·B(회차 추가)·E(회차 수정)와 회차 삭제·사진 원본 보기
 * - 760px 이하는 목록 → 상세 화면(ObservationMobile). 연 항목은 페이지가 주소 ?obsv=로 넘겨 준다(openItmSn·onOpenItem·onCloseItem)
 */
export default function ObservationCard({
  petSn,
  openItmSn = null,
  onOpenItem,
  onCloseItem,
}) {
  const { data, isPending } = useObservations(petSn);
  const isPc = useMediaQuery('(min-width: 761px)');
  const [selection, setSelection] = useState({ itmSn: null, rndSn: null });
  const [modal, setModal] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [photoPath, setPhotoPath] = useState(null);
  const deleteRound = useDeleteObservationRound();
  const endObservation = useEndObservation();

  const items = data?.content ?? [];
  const activeCount = items.filter((item) => item.obsvEndYmd === null).length;
  /** 760px 이하에서 상세 화면으로 연 항목(주소의 ?obsv=). 없거나 지워졌으면 목록 화면 */
  const openItem = isPc
    ? null
    : (items.find((item) => item.obsvItmSn === openItmSn) ?? null);
  const selectedItem =
    openItem ??
    items.find((item) => item.obsvItmSn === selection.itmSn) ??
    items[0];
  const foundIndex = selectedItem
    ? selectedItem.rounds.findIndex(
        (round) => round.obsvRndSn === selection.rndSn,
      )
    : -1;
  /** 고른 회차가 없으면 최신 회차 */
  const selectedIndex =
    foundIndex >= 0 ? foundIndex : (selectedItem?.rounds.length ?? 1) - 1;

  const handleSaved = ({ obsvItmSn, obsvRndSn }) =>
    setSelection({ itmSn: obsvItmSn, rndSn: obsvRndSn });

  const handleDelete = () =>
    deleteRound.mutate(deleteTarget.obsvRndSn, {
      onSuccess: () => {
        setDeleteTarget(null);
        /** 항목이 남으면 같은 항목을 유지하고 마지막 회차를 고름, 항목까지 지워지면 첫 항목 */
        setSelection({
          itmSn: deleteTarget.isOnlyRound ? null : deleteTarget.obsvItmSn,
          rndSn: null,
        });
        /** 모바일 상세에서 항목까지 지워지면 목록 화면으로 */
        if (deleteTarget.isOnlyRound && openItem) onCloseItem();
      },
    });

  const registerButton = (className, label = '관찰 항목 등록') => (
    <button
      type="button"
      className={className}
      onClick={() => setModal({ mode: 'A' })}
    >
      {label}
    </button>
  );

  if (isPending) {
    return (
      <div aria-busy="true" className="min-w-0">
        <SkeletonCard className="h-[943px] max-[760px]:h-[1423px]" />
      </div>
    );
  }

  const emptyBox = (
    <EmptyBox
      icon="favorite"
      title="관찰 중인 항목이 없어요"
      description="피부·눈·상처처럼 계속 지켜볼 곳을 사진으로 남기고 변화를 비교해요"
      action={registerButton(`${BTN_SECONDARY} mt-2 h-8! px-3!`)}
    />
  );

  /** PC 상세와 모바일 상세가 같이 쓰는 회차 동작 */
  const detailProps = selectedItem && {
    item: selectedItem,
    selectedIndex,
    onSelectRound: (rndSn) =>
      setSelection({ itmSn: selectedItem.obsvItmSn, rndSn }),
    onEditRound: (round) => setModal({ mode: 'E', round }),
    onDeleteRound: (round) =>
      setDeleteTarget({
        obsvRndSn: round.obsvRndSn,
        obsvItmSn: selectedItem.obsvItmSn,
        obsvItmNm: selectedItem.obsvItmNm,
        isOnlyRound: selectedItem.rounds.length === 1,
      }),
    onAddRound: () => setModal({ mode: 'B' }),
    onEnd: () => endObservation.mutate(selectedItem.obsvItmSn),
    onViewPhoto: setPhotoPath,
  };

  const dialogs = (
    <>
      {modal && (
        <ObservationModal
          mode={modal.mode}
          petSn={petSn}
          item={modal.mode === 'A' ? null : selectedItem}
          round={modal.round ?? null}
          onSaved={handleSaved}
          onClose={() => setModal(null)}
        />
      )}

      {deleteTarget && (
        <Modal
          isConfirm
          title="이 회차를 삭제할까요?"
          description={
            deleteTarget.isOnlyRound
              ? `마지막 기록이라 '${deleteTarget.obsvItmNm}' 항목도 함께 삭제돼요`
              : '남은 회차는 관찰일 순으로 1회차부터 다시 번호를 매겨요'
          }
          isPending={deleteRound.isPending}
          onClose={() => setDeleteTarget(null)}
          footer={
            <>
              <button
                type="button"
                className={BTN_SECONDARY}
                disabled={deleteRound.isPending}
                onClick={() => setDeleteTarget(null)}
              >
                취소
              </button>
              <button
                type="button"
                className={BTN_DANGER}
                disabled={deleteRound.isPending}
                onClick={handleDelete}
              >
                삭제하기
              </button>
            </>
          }
        />
      )}

      {photoPath && (
        <Modal
          title="사진 원본"
          onClose={() => setPhotoPath(null)}
          footer={
            <button
              type="button"
              className={BTN_PRIMARY}
              onClick={() => setPhotoPath(null)}
            >
              닫기
            </button>
          }
        >
          <img src={photoPath} alt="" className="w-full rounded-[10px]" />
        </Modal>
      )}
    </>
  );

  /** 760px 이하: 목록 화면 → 항목을 누르면 상세 화면(브라우저 뒤로 가기로 목록) */
  if (!isPc) {
    return (
      <Card
        title="지속 관찰"
        className="min-w-0"
        action={
          !openItem &&
          items.length > 0 &&
          registerButton(`${BTN_PRIMARY} h-8! px-3!`, '+ 등록')
        }
      >
        {items.length === 0 ? (
          emptyBox
        ) : openItem ? (
          <ObservationMobileDetail {...detailProps} onBack={onCloseItem} />
        ) : (
          <>
            <p className="mb-1 text-sm/[1.6] text-subtle tabular-nums">
              관찰중 {activeCount}건 · 종료 {items.length - activeCount}건
            </p>
            <ObservationMobileList items={items} onOpen={onOpenItem} />
          </>
        )}
        {dialogs}
      </Card>
    );
  }

  return (
    <Card
      title="지속 관찰"
      sub={`관찰중 ${activeCount}건 · 종료 ${items.length - activeCount}건`}
      className="min-w-0"
      action={items.length > 0 && registerButton(`${BTN_PRIMARY} h-8! px-3!`)}
    >
      {items.length === 0 ? (
        emptyBox
      ) : (
        <>
          <p className="mb-4 text-muted">
            피부·눈·상처 등 지속적으로 확인할 항목을 기록하고 변화를 비교해요
          </p>
          <div className="grid gap-5 min-[1101px]:grid-cols-[242px_minmax(0,1fr)]">
            <div
              role="group"
              aria-label="관찰 항목 목록"
              className="flex flex-col"
            >
              {items.map((item) => (
                <ItemButton
                  key={item.obsvItmSn}
                  item={item}
                  isSelected={item.obsvItmSn === selectedItem.obsvItmSn}
                  onSelect={() =>
                    setSelection({ itmSn: item.obsvItmSn, rndSn: null })
                  }
                />
              ))}
            </div>
            <div className="min-w-0 min-[1101px]:border-l min-[1101px]:border-line-soft min-[1101px]:pl-6">
              <ObservationDetail
                key={selectedItem.obsvItmSn}
                {...detailProps}
              />
            </div>
          </div>
        </>
      )}
      {dialogs}
    </Card>
  );
}

function ItemButton({ item, isSelected, onSelect }) {
  const isEnded = item.obsvEndYmd !== null;
  const valueText = getItemValueText(item);
  const lastRound = item.rounds[item.rounds.length - 1];
  const photo = item.rounds.find((round) => round.photoPath)?.photoPath;

  return (
    <button
      type="button"
      aria-pressed={isSelected}
      className={`flex w-full items-center gap-3 border-b px-2 py-3 text-left ${
        isSelected
          ? 'border-brand-100 bg-brand-50'
          : 'border-line-soft hover:bg-surface-2'
      } ${isEnded ? 'opacity-55' : ''}`}
      onClick={onSelect}
    >
      <span className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-[6px] bg-surface-3 text-line-strong">
        {photo ? (
          <img src={photo} alt="" className="size-full object-cover" />
        ) : (
          <Icon name="image" />
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className={`block ${isSelected ? 'text-brand-600' : 'text-ink'}`}>
          {item.obsvItmNm}
        </span>
        <span className="block text-sm/[1.6] text-subtle">
          {formatPart(item)}
        </span>
        {valueText && (
          <span className="block text-sm/[1.6] text-ink-2 tabular-nums">
            {valueText}
          </span>
        )}
      </span>
      {isEnded ? (
        <Badge tone="gray">종료</Badge>
      ) : (
        <Badge tone="outline" className="tabular-nums">
          {formatMonthDayDot(lastRound.obsvYmd)}
        </Badge>
      )}
    </button>
  );
}
