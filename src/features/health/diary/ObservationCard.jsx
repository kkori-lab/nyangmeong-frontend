import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Badge from '@/components/Badge';
import Card from '@/components/Card';
import Icon from '@/components/Icon';
import Modal from '@/components/Modal';
import Skeleton from '@/components/Skeleton';
import SkeletonCard from '@/components/SkeletonCard';
import {
  BTN_DANGER,
  BTN_PRIMARY,
  BTN_SECONDARY,
} from '@/components/buttonStyles';
import useMediaQuery from '@/hooks/useMediaQuery';
import { formatDate, formatMonthDayDot, getYmdOf } from '@/utils/formatDate';
import {
  useDeleteObservationCycle,
  useEndObservationItem,
  useObservationCycles,
  useObservationItems,
} from '../queries';
import EmptyBox from './EmptyBox';
import ObservationDetail from './ObservationDetail';
import {
  ObservationMobileDetail,
  ObservationMobileList,
} from './ObservationMobile';
import ObservationModal from './ObservationModal';
import ObservationPhoto from './ObservationPhoto';
import {
  formatSize,
  getItemDiffText,
  getItemValueText,
  isEndedItem,
} from './observationUtils';

/**
 * [지속 관찰 카드]
 * - 왼쪽 관찰 항목 목록, 오른쪽 선택한 항목의 회차별 사진·크기 변화·회차 상세 (FN-HLT-002-15~19)
 * - 항목 목록은 한 번에 받고, 회차는 선택한 항목만 받는다(useObservationCycles)
 * - 관찰 기록 등록 모달 A(항목 등록)·B(회차 추가)·E(회차 수정)와 회차 삭제·사진 원본 보기
 * - 760px 이하는 목록 → 상세 화면(ObservationMobile). 연 항목은 페이지가 주소 ?obsv=로 넘겨 준다(openArtclSn·onOpenItem·onCloseItem)
 */
export default function ObservationCard({
  petSn,
  openArtclSn = null,
  onOpenItem,
  onCloseItem,
}) {
  const { data, isPending } = useObservationItems(petSn);
  const isPc = useMediaQuery('(min-width: 761px)');
  const [selection, setSelection] = useState({
    obsrvArtclSn: null,
    obsrvCyclSn: null,
  });
  const [modal, setModal] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [photoTarget, setPhotoTarget] = useState(null);
  const deleteCycle = useDeleteObservationCycle();
  const endItem = useEndObservationItem();

  const items = data ?? [];
  const activeCount = items.filter((item) => !isEndedItem(item)).length;
  /** 760px 이하에서 상세 화면으로 연 항목(주소의 ?obsv=). 없거나 지워졌으면 목록 화면 */
  const openItem = isPc
    ? null
    : (items.find((item) => item.obsrvArtclSn === openArtclSn) ?? null);
  const selectedItem =
    openItem ??
    items.find((item) => item.obsrvArtclSn === selection.obsrvArtclSn) ??
    items[0];
  const { data: cycles } = useObservationCycles(
    petSn,
    selectedItem?.obsrvArtclSn,
  );
  const foundIndex = cycles
    ? cycles.findIndex((cycle) => cycle.obsrvCyclSn === selection.obsrvCyclSn)
    : -1;
  /** 사진 원본 창에서 보는 회차의 순번. PC·모바일 모두 앞뒤로 넘기고 [이 회차 선택]으로 고름 (추가 요청) */
  const photoIndex =
    photoTarget && cycles
      ? cycles.findIndex(
          (cycle) => cycle.obsrvCyclSn === photoTarget.obsrvCyclSn,
        )
      : -1;
  const canPagePhoto = photoIndex >= 0;
  /** 고른 회차가 없으면 최신 회차 */
  const selectedIndex =
    foundIndex >= 0 ? foundIndex : (cycles?.length ?? 1) - 1;

  const handleSaved = ({ obsrvArtclSn, obsrvCyclSn }) =>
    setSelection({ obsrvArtclSn, obsrvCyclSn });

  const handleDelete = () =>
    deleteCycle.mutate(
      {
        petSn,
        obsrvArtclSn: deleteTarget.obsrvArtclSn,
        obsrvCyclSn: deleteTarget.obsrvCyclSn,
      },
      {
        onSuccess: () => {
          setDeleteTarget(null);
          /** 항목이 남으면 같은 항목을 유지하고 마지막 회차를 고름, 항목까지 지워지면 첫 항목 */
          setSelection({
            obsrvArtclSn: deleteTarget.isOnlyCycle
              ? null
              : deleteTarget.obsrvArtclSn,
            obsrvCyclSn: null,
          });
          /** 모바일 상세에서 항목까지 지워지면 목록 화면으로 */
          if (deleteTarget.isOnlyCycle && openItem) onCloseItem();
        },
      },
    );

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

  /**
   * PC 상세와 모바일 상세가 같이 쓰는 회차 동작. 회차를 받기 전에는 없음(자리 표시)
   * - 마지막 회차를 지운 직후 항목 목록을 다시 받기 전까지는 회차가 0개라 자리 표시
   */
  const detailProps = selectedItem &&
    cycles?.length > 0 && {
      petSn,
      item: selectedItem,
      cycles,
      selectedIndex,
      onSelectCycle: (obsrvCyclSn) =>
        setSelection({
          obsrvArtclSn: selectedItem.obsrvArtclSn,
          obsrvCyclSn,
        }),
      onEditCycle: (cycle) => setModal({ mode: 'E', cycle }),
      onDeleteCycle: (cycle) =>
        setDeleteTarget({
          obsrvCyclSn: cycle.obsrvCyclSn,
          obsrvArtclSn: selectedItem.obsrvArtclSn,
          obsrvArtclNm: selectedItem.obsrvArtclNm,
          cyclNo: cycle.cyclNo,
          isOnlyCycle: cycles.length === 1,
        }),
      onAddCycle: () => setModal({ mode: 'B' }),
      onEnd: () =>
        endItem.mutate({ petSn, obsrvArtclSn: selectedItem.obsrvArtclSn }),
      onViewPhoto: setPhotoTarget,
    };

  const detailPlaceholder = (
    <div aria-busy="true">
      <Skeleton className="mb-4 h-8 w-1/2" />
      <Skeleton className="mb-4 h-[104px] w-full rounded-[10px]" />
      <Skeleton className="h-[220px] w-full rounded-[10px]" />
    </div>
  );

  const dialogs = (
    <>
      {modal && (
        <ObservationModal
          mode={modal.mode}
          petSn={petSn}
          item={modal.mode === 'A' ? null : selectedItem}
          cycles={cycles ?? []}
          cycle={modal.cycle ?? null}
          onSaved={handleSaved}
          onClose={() => setModal(null)}
        />
      )}

      {deleteTarget && (
        <Modal
          isConfirm
          // 대상 회차를 제목에, 원래 안내 + 되돌릴 수 없다는 한 줄(위험 색) (추가 요청)
          title={`${deleteTarget.cyclNo}회차 기록을 삭제할까요?`}
          description={
            <>
              <span className="block">
                {deleteTarget.isOnlyCycle
                  ? `마지막 기록이라 '${deleteTarget.obsrvArtclNm}' 항목도 함께 삭제돼요`
                  : '남은 회차는 1회차부터 다시 번호를 매겨요'}
              </span>
              <span className="block text-danger">
                삭제한 기록은 되돌릴 수 없어요.
              </span>
            </>
          }
          isPending={deleteCycle.isPending}
          onClose={() => setDeleteTarget(null)}
          footer={
            <>
              <button
                type="button"
                className={BTN_SECONDARY}
                disabled={deleteCycle.isPending}
                onClick={() => setDeleteTarget(null)}
              >
                취소
              </button>
              <button
                type="button"
                className={BTN_DANGER}
                disabled={deleteCycle.isPending}
                onClick={handleDelete}
              >
                삭제하기
              </button>
            </>
          }
        />
      )}

      {photoTarget && (
        <Modal
          title="사진 원본"
          onClose={() => setPhotoTarget(null)}
          footer={
            <>
              {/* 넘겨 본 회차를 선택 회차로 고를 수 있음 (추가 요청) */}
              {canPagePhoto && (
                <button
                  type="button"
                  className={BTN_SECONDARY}
                  onClick={() => {
                    setSelection({
                      obsrvArtclSn: selectedItem.obsrvArtclSn,
                      obsrvCyclSn: photoTarget.obsrvCyclSn,
                    });
                    setPhotoTarget(null);
                  }}
                >
                  이 회차 선택
                </button>
              )}
              <button
                type="button"
                className={BTN_PRIMARY}
                onClick={() => setPhotoTarget(null)}
              >
                닫기
              </button>
            </>
          }
        >
          <ObservationPhoto
            petSn={petSn}
            obsrvCyclSn={photoTarget.obsrvCyclSn}
            className="w-full rounded-[10px]"
          />
          {/* PC는 회차를 앞뒤로 넘겨 봄 (추가 요청). 모바일은 한 장만 */}
          {canPagePhoto && (
            <div className="mt-3 flex items-center justify-between gap-3">
              <PhotoPageButton
                label="이전 회차"
                isDisabled={photoIndex <= 0}
                onClick={() => setPhotoTarget(cycles[photoIndex - 1])}
              >
                <ChevronLeft className="size-5" aria-hidden="true" />
              </PhotoPageButton>
              <p className="text-sm/[1.6] text-subtle tabular-nums">
                {photoTarget.cyclNo}회차 ·{' '}
                {formatDate(getYmdOf(photoTarget.obsrvDt))} ({photoIndex + 1} /{' '}
                {cycles.length})
              </p>
              <PhotoPageButton
                label="다음 회차"
                isDisabled={photoIndex >= cycles.length - 1}
                onClick={() => setPhotoTarget(cycles[photoIndex + 1])}
              >
                <ChevronRight className="size-5" aria-hidden="true" />
              </PhotoPageButton>
            </div>
          )}
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
          !openItem && registerButton(`${BTN_PRIMARY} h-8! px-3!`, '+ 등록')
        }
      >
        {items.length === 0 ? (
          emptyBox
        ) : openItem ? (
          detailProps ? (
            <ObservationMobileDetail {...detailProps} onBack={onCloseItem} />
          ) : (
            detailPlaceholder
          )
        ) : (
          <>
            <p className="mb-1 text-sm/[1.6] text-subtle tabular-nums">
              관찰중 {activeCount}건 · 종료 {items.length - activeCount}건
            </p>
            <ObservationMobileList
              petSn={petSn}
              items={items}
              onOpen={onOpenItem}
            />
          </>
        )}
        {dialogs}
      </Card>
    );
  }

  return (
    <Card
      title="지속 관찰"
      sub={
        <span className="font-normal text-placeholder">
          관찰중 {activeCount}건 · 종료 {items.length - activeCount}건
        </span>
      }
      className="min-w-0"
      action={registerButton(`${BTN_PRIMARY} h-8! px-3!`)}
    >
      {items.length === 0 ? (
        emptyBox
      ) : (
        <>
          <p className="mb-4 text-placeholder">
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
                  key={item.obsrvArtclSn}
                  item={item}
                  isSelected={item.obsrvArtclSn === selectedItem.obsrvArtclSn}
                  onSelect={() =>
                    setSelection({
                      obsrvArtclSn: item.obsrvArtclSn,
                      obsrvCyclSn: null,
                    })
                  }
                />
              ))}
            </div>
            <div className="min-w-0 min-[1101px]:border-l min-[1101px]:border-line-soft min-[1101px]:pl-6">
              {detailProps ? (
                <ObservationDetail
                  key={selectedItem.obsrvArtclSn}
                  {...detailProps}
                />
              ) : (
                detailPlaceholder
              )}
            </div>
          </div>
        </>
      )}
      {dialogs}
    </Card>
  );
}

/**
 * 왼쪽 관찰 항목 한 줄: 이름 / 최신 크기 + 증감(또는 변화·관찰 기간) / 오른쪽 날짜 (추가 요청)
 * - 사진·위치 글은 오른쪽 상세에만
 */
function ItemButton({ item, isSelected, onSelect }) {
  const isEnded = isEndedItem(item);
  const hasSize = !isEnded && item.lastCycle.obsrvSz != null;
  /** 크기가 있으면 크기만 쓰고 증감은 따로 굵게 그림, 없으면 변화·관찰 기간 */
  const valueText = hasSize
    ? formatSize(item.lastCycle.obsrvSz)
    : getItemValueText(item);
  const diffText = getItemDiffText(item);

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
      <span className="min-w-0 flex-1">
        <span className="block font-bold text-ink">{item.obsrvArtclNm}</span>
        {valueText && (
          <span className="block text-sm/[1.6] text-ink-2 tabular-nums">
            {valueText}
            {diffText && (
              <span className="font-bold text-brand-500"> {diffText}</span>
            )}
          </span>
        )}
      </span>
      {isEnded ? (
        <Badge tone="gray">종료</Badge>
      ) : (
        <span className="shrink-0 text-badge text-placeholder tabular-nums">
          {formatMonthDayDot(getYmdOf(item.lastCycle.obsrvDt))}
        </span>
      )}
    </button>
  );
}

/** 사진 원본 창의 이전·다음 회차 버튼 */
function PhotoPageButton({ label, isDisabled, onClick, children }) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={isDisabled}
      onClick={onClick}
      className="grid size-10 shrink-0 place-items-center rounded-full border border-line bg-white text-ink-2 hover:border-line-strong hover:text-ink disabled:pointer-events-none disabled:opacity-40"
    >
      {children}
    </button>
  );
}
