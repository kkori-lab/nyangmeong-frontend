import { useEffect, useRef, useState } from 'react';
import Icon from '@/components/Icon';
import Modal from '@/components/Modal';
import { BTN_PRIMARY, BTN_SECONDARY } from '@/components/buttonStyles';
import { showToast } from '@/components/toastStore';
import { useSaveHealthWidgets } from '../queries';
import { findWidgetItem } from './widgetItems';

const ARROW_BUTTON =
  'grid size-8 place-items-center rounded-full text-subtle hover:enabled:bg-surface-3 hover:enabled:text-ink disabled:cursor-not-allowed disabled:text-line-strong';

/**
 * [위젯 순서 변경 모달] 대시보드 카드 순서를 바꿈 (※신규 정책)
 * - 끌어서 놓기(브라우저 기본 드래그)와 카드마다 [위로]·[아래로] 버튼(키보드·터치용). 맨 위 [위로]·맨 아래 [아래로]는 막힘
 * - AI 건강분석 리포트는 맨 앞 고정이라 옮기는 대상이 아님
 * - [저장]은 순서 저장, [취소]·×·Esc·배경은 저장 없이 닫음
 * - 순서는 고른 항목 키 배열의 순서 그대로 저장(가짜 저장소, B1 PUT SORT_SEQ 연결 때 API로 교체)
 */
export default function WidgetOrderModal({ mbrSn, savedIds, onClose }) {
  const [orderedIds, setOrderedIds] = useState(savedIds);
  const [draggingId, setDraggingId] = useState(null);
  const [overId, setOverId] = useState(null);
  /** 버튼으로 옮긴 뒤 같은 버튼(막히면 반대쪽)으로 포커스를 돌려줄 대상 */
  const focusTargetRef = useRef(null);
  const buttonRefs = useRef({});
  const saveWidgets = useSaveHealthWidgets();

  useEffect(() => {
    const target = focusTargetRef.current;
    if (!target) return;
    focusTargetRef.current = null;
    const { id, dir } = target;
    const index = orderedIds.indexOf(id);
    const isBlocked =
      dir === 'up' ? index === 0 : index === orderedIds.length - 1;
    const nextDir = isBlocked ? (dir === 'up' ? 'down' : 'up') : dir;
    buttonRefs.current[`${id}-${nextDir}`]?.focus();
  }, [orderedIds]);

  const moveTo = (id, toIndex) => {
    const fromIndex = orderedIds.indexOf(id);
    if (fromIndex === -1 || fromIndex === toIndex) return;
    const next = orderedIds.filter((item) => item !== id);
    next.splice(toIndex, 0, id);
    setOrderedIds(next);
  };

  const moveBy = (id, delta) => {
    moveTo(id, orderedIds.indexOf(id) + delta);
    focusTargetRef.current = { id, dir: delta < 0 ? 'up' : 'down' };
  };

  const endDrag = () => {
    setDraggingId(null);
    setOverId(null);
  };

  const handleDrop = (event, id) => {
    event.preventDefault();
    if (draggingId && draggingId !== id)
      moveTo(draggingId, orderedIds.indexOf(id));
    endDrag();
  };

  const save = () => {
    if (saveWidgets.isPending) return;
    saveWidgets.mutate(
      { mbrSn, widgetIds: orderedIds },
      {
        onSuccess: () => {
          showToast('카드 순서를 저장했어요');
          onClose();
        },
      },
    );
  };

  const footer = (
    <>
      <button
        type="button"
        className={`${BTN_SECONDARY} min-w-20`}
        onClick={onClose}
      >
        취소
      </button>
      <button
        type="button"
        disabled={saveWidgets.isPending}
        className={`${BTN_PRIMARY} min-w-20`}
        onClick={save}
      >
        저장
      </button>
    </>
  );

  return (
    <Modal
      title="위젯 순서 변경"
      footer={footer}
      width={560}
      isPending={saveWidgets.isPending}
      onClose={onClose}
    >
      <div className="flex flex-col gap-4">
        <p className="text-muted">
          끌어서 놓거나 [위로]·[아래로]로 카드 순서를 바꿔요
        </p>
        <ol className="flex flex-col gap-2">
          <li className="flex h-10 items-center gap-2 rounded-box border border-line bg-surface-2 px-3">
            <Icon name="push_pin" className="text-lg text-subtle" />
            <Icon name="auto_awesome" className="text-lg text-brand-500" />
            <span className="min-w-0 flex-1 truncate font-semibold text-ink">
              AI 건강분석 리포트
            </span>
            <span className="text-sm whitespace-nowrap text-subtle">
              맨 앞 고정
            </span>
          </li>
          {orderedIds.map((id, index) => {
            const item = findWidgetItem(id);
            const isDragging = id === draggingId;
            const isOver = id === overId && draggingId !== null && !isDragging;
            return (
              <li
                key={id}
                draggable
                onDragStart={(event) => {
                  event.dataTransfer.effectAllowed = 'move';
                  event.dataTransfer.setData('text/plain', id);
                  setDraggingId(id);
                }}
                onDragOver={(event) => {
                  if (draggingId === null) return;
                  event.preventDefault();
                  setOverId(id);
                }}
                onDrop={(event) => handleDrop(event, id)}
                onDragEnd={endDrag}
                className={`flex h-10 items-center gap-2 rounded-box border px-3 ${
                  isDragging
                    ? 'border-line-strong bg-surface-2'
                    : isOver
                      ? 'border-brand-500 bg-white'
                      : 'border-line bg-white'
                }`}
              >
                <Icon
                  name="drag_indicator"
                  className="cursor-grab text-lg text-subtle"
                />
                <span className="w-6 text-sm text-subtle">{index + 1}</span>
                <Icon name={item.icon} className="text-lg text-brand-500" />
                <span className="min-w-0 flex-1 truncate font-semibold text-ink">
                  {item.nm}
                </span>
                <button
                  type="button"
                  ref={(node) => {
                    buttonRefs.current[`${id}-up`] = node;
                  }}
                  aria-label={`${item.nm} 위로`}
                  disabled={index === 0}
                  className={ARROW_BUTTON}
                  onClick={() => moveBy(id, -1)}
                >
                  <Icon name="keyboard_arrow_up" className="text-lg" />
                </button>
                <button
                  type="button"
                  ref={(node) => {
                    buttonRefs.current[`${id}-down`] = node;
                  }}
                  aria-label={`${item.nm} 아래로`}
                  disabled={index === orderedIds.length - 1}
                  className={ARROW_BUTTON}
                  onClick={() => moveBy(id, 1)}
                >
                  <Icon name="keyboard_arrow_down" className="text-lg" />
                </button>
              </li>
            );
          })}
        </ol>
      </div>
    </Modal>
  );
}
