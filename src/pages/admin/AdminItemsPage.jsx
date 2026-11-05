import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BTN_PRIMARY, BTN_SECONDARY } from '@/components/buttonStyles';
import Skeleton from '@/components/Skeleton';
import SkeletonCard from '@/components/SkeletonCard';
import { showToast } from '@/components/toastStore';
import ItemBakeStatus from '@/features/adminItem/ItemBakeStatus';
import ItemFormModal from '@/features/adminItem/ItemFormModal';
import ItemPartTabs from '@/features/adminItem/ItemPartTabs';
import ItemTable from '@/features/adminItem/ItemTable';
import {
  useAdminItems,
  useItemParts,
  useSaveAdminItemOrder,
} from '@/features/adminItem/queries';
import { canBakeItem, useItemBake } from '@/features/adminItem/useItemBake';
import { isForbiddenError } from '@/utils/isForbiddenError';
import AdminForbidden from './AdminForbidden';

/** 등록 모달을 연 상태 */
const NEW_ITEM = 'new';

/** 부위 탭 + 버튼 줄 + 표(머리 줄 + 12행) */
function ItemListSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true">
      <Skeleton className="h-12 w-full" />
      <Skeleton className="ml-auto h-10 w-[260px] max-[760px]:h-[96px] max-[760px]:w-full" />
      <SkeletonCard className="h-[820px] max-[760px]:h-[740px]" />
    </div>
  );
}

/** 배열에서 index 자리를 한 칸 옮긴 새 배열 */
const moveItem = (items, index, direction) => {
  const next = [...items];
  const target = index + direction;
  [next[index], next[target]] = [next[target], next[index]];
  return next;
};

/**
 * [아이템]
 * - 부위 탭은 ?itemRegnCd=, 행 클릭 -> 수정 모달, [아이템 등록] -> 등록 모달
 * - [순서 바꾸기]는 부위 탭에서만: 상점 순서가 부위 안 정렬 순서라서
 * - 순서 편집 중에는 행 클릭·탭 이동·등록 막음, [저장]하면 서버 순서로, [취소]하면 처음 순서로
 * - 전체 굽기: 등록 성공 뒤 굽기 대상이면 바로 시작, 행 [굽기]로 끊긴 굽기 이어 하기. 표 위 진행 줄
 */
export default function AdminItemsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  /** 열린 모달: null(닫힘), NEW_ITEM(등록), 아이템 행(수정) */
  const [editing, setEditing] = useState(null);
  /** 순서 편집 중인 목록: null이면 보기 */
  const [orderedItems, setOrderedItems] = useState(null);

  const itemRegnCd = searchParams.get('itemRegnCd') ?? '';
  const parts = useItemParts();
  const items = useAdminItems(itemRegnCd ? { itemRegnCd } : {});
  const saveOrder = useSaveAdminItemOrder();
  const itemBake = useItemBake();
  const isBaking =
    itemBake.bake?.status === 'running' || itemBake.bake?.status === 'stopping';
  const isOrdering = orderedItems != null;

  const handleRetry = () => {
    if (parts.isError) parts.refetch();
    items.refetch();
  };
  const handlePartSelect = (nextPart) =>
    setSearchParams(nextPart ? { itemRegnCd: nextPart } : {});
  const handleOrderStart = () => {
    saveOrder.reset();
    setOrderedItems(items.data);
  };
  const handleOrderCancel = () => setOrderedItems(null);
  const handleMove = (index, direction) =>
    setOrderedItems((current) => moveItem(current, index, direction));
  const handleOrderSave = () => {
    saveOrder.mutate(
      {
        itemRegnCd,
        itemSns: orderedItems.map((item) => item.itemSn),
      },
      {
        onSuccess: () => {
          showToast('순서를 저장했어요');
          setOrderedItems(null);
        },
      },
    );
  };

  /** 편집 중 화면의 순서 번호는 바뀐 자리대로 */
  const shownItems = isOrdering
    ? orderedItems.map((item, index) => ({ ...item, sortSeq: index + 1 }))
    : items.data;

  /** 버튼 줄: 보기면 [순서 바꾸기]·[아이템 등록], 편집이면 [취소]·[저장] */
  const renderActions = () => {
    if (isOrdering) {
      return (
        <div className="mb-4 flex flex-wrap items-center justify-end gap-2">
          {saveOrder.isError && (
            <p role="alert" className="mr-auto text-sm text-danger">
              {saveOrder.error.message}
            </p>
          )}
          <button
            type="button"
            className={BTN_SECONDARY}
            disabled={saveOrder.isPending}
            onClick={handleOrderCancel}
          >
            취소
          </button>
          <button
            type="button"
            className={BTN_PRIMARY}
            disabled={saveOrder.isPending}
            onClick={handleOrderSave}
          >
            저장
          </button>
        </div>
      );
    }
    const canOrder =
      Boolean(itemRegnCd) && !items.isPlaceholderData && items.data?.length > 1;
    return (
      <div className="mb-4 flex flex-wrap items-center justify-end gap-2">
        {!itemRegnCd && (
          <p className="mr-auto text-sm text-subtle max-[760px]:w-full">
            부위를 고르면 순서를 바꿀 수 있어요
          </p>
        )}
        <button
          type="button"
          className={`${BTN_SECONDARY} max-[760px]:flex-1`}
          disabled={!canOrder || items.isError}
          onClick={handleOrderStart}
        >
          순서 바꾸기
        </button>
        <button
          type="button"
          className={`${BTN_PRIMARY} max-[760px]:flex-1`}
          onClick={() => setEditing(NEW_ITEM)}
        >
          아이템 등록
        </button>
      </div>
    );
  };

  const renderList = () => {
    if (items.isError) {
      return (
        <div role="alert" className="flex flex-col items-center gap-3 py-16">
          <p className="text-base text-subtle">
            아이템 목록을 불러오지 못했어요.
          </p>
          <button type="button" className={BTN_SECONDARY} onClick={handleRetry}>
            다시 시도
          </button>
        </div>
      );
    }
    if (shownItems.length === 0) {
      return (
        <p className="rounded-[14px] border border-line bg-white py-16 text-center text-base text-subtle">
          {itemRegnCd
            ? '이 부위에 등록된 아이템이 없어요'
            : '등록된 아이템이 없어요'}
        </p>
      );
    }
    return (
      <ItemTable
        items={shownItems}
        isOrdering={isOrdering}
        onSelect={setEditing}
        onMove={handleMove}
        onBake={itemBake.start}
        isBaking={isBaking}
      />
    );
  };

  /** 본문: 로딩 / 403 / 부위 오류 / 목록 */
  const renderBody = () => {
    if (items.isPending || parts.isPending) return <ItemListSkeleton />;
    const forbiddenError = [items.error, parts.error].find(isForbiddenError);
    if (forbiddenError) {
      return <AdminForbidden message={forbiddenError.message} />;
    }
    if (parts.isError) {
      return (
        <div role="alert" className="flex flex-col items-center gap-3 py-16">
          <p className="text-base text-subtle">
            아이템 부위를 불러오지 못했어요.
          </p>
          <button type="button" className={BTN_SECONDARY} onClick={handleRetry}>
            다시 시도
          </button>
        </div>
      );
    }
    return (
      <>
        <ItemPartTabs
          parts={parts.data}
          selected={itemRegnCd}
          disabled={isOrdering}
          onSelect={handlePartSelect}
        />
        {itemBake.bake && (
          <ItemBakeStatus
            bake={itemBake.bake}
            onStop={itemBake.stop}
            onDismiss={itemBake.dismiss}
          />
        )}
        {renderActions()}
        <div role="tabpanel">{renderList()}</div>
      </>
    );
  };

  return (
    <div className="mx-auto max-w-[1200px]">
      <h1 className="mb-5 text-2xl font-bold text-ink">아이템</h1>
      {renderBody()}
      {editing != null && parts.isSuccess && (
        <ItemFormModal
          item={editing === NEW_ITEM ? null : editing}
          parts={parts.data}
          onClose={() => setEditing(null)}
          onCreated={(created) => {
            if (canBakeItem(created)) itemBake.start(created);
          }}
        />
      )}
    </div>
  );
}
