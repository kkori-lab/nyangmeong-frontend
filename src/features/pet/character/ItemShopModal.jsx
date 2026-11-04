import { X } from 'lucide-react';
import { useState } from 'react';
import Badge from '@/components/Badge';
import Modal from '@/components/Modal';
import { BTN_PRIMARY, BTN_SECONDARY } from '@/components/buttonStyles';
import { showToast } from '@/components/toastStore';
import { usePurchaseItems, useShopItems } from '../queries';
import { ITEM_PART_OPTIONS } from '../shared/petCodes';
import ItemImage from './ItemImage';
import WearPreview from './WearPreview';

const ALL = 'ALL';
const TABS = [{ code: ALL, name: '전체' }, ...ITEM_PART_OPTIONS];
const PART_NAMES = Object.fromEntries(
  ITEM_PART_OPTIONS.map((option) => [option.code, option.name]),
);

const formatPoint = (value) => `${value.toLocaleString()}P`;

const PURCHASE_ERRORS = {
  POINT_NOT_ENOUGH: '포인트가 부족해요',
  ITEM_ALREADY_HELD: '이미 보유한 아이템이 있어요',
  PET_PRIMARY_ONLY: '주양육자만 꾸밀 수 있어요',
};

/**
 * [아이템 상점] (SCR-MYP-011)
 * - cart: 담은 아이템, tryOn: 부위별로 미리보기에 임시 착용한 아이템 (닫으면 둘 다 버려짐)
 * - 보유 판정과 보유 포인트는 상점 응답(현재 꾸미는 캐릭터 기준)을 쓴다
 * - worn: 꾸미기 화면의 현재 착용 { 부위: 보유 아이템 }
 */
export default function ItemShopModal({ pet, worn, onClose }) {
  const {
    data: shop,
    isPending: isShopPending,
    isError: isShopError,
    refetch,
  } = useShopItems(pet.pixelCharSn);
  const { mutate: purchase, isPending } = usePurchaseItems();
  const [part, setPart] = useState(ALL);
  const [cart, setCart] = useState([]);
  const [tryOn, setTryOn] = useState({});
  /** 실패 뒤 재시도에도 같은 값을 보내 중복 결제를 막는다 */
  const [idmptDmndId] = useState(() => crypto.randomUUID());

  const shopItems = shop?.items ?? [];
  const hldPnt = shop?.hldPnt ?? 0;
  /** 구매 도중 이미 보유로 바뀐 아이템은 담기·임시 착용에서 뺀다 */
  const heldSns = new Set(
    shopItems.filter((item) => item.hldYn).map((item) => item.itemSn),
  );
  const cartItems = cart.filter((item) => !heldSns.has(item.itemSn));
  const activeTryOn = Object.fromEntries(
    Object.entries(tryOn).filter(([, item]) => !heldSns.has(item.itemSn)),
  );
  const previewSns = Object.values({ ...worn, ...activeTryOn }).map(
    (item) => item.itemSn,
  );
  const visibleItems =
    part === ALL
      ? shopItems
      : shopItems.filter((item) => item.itemRegnCd === part);
  const total = cartItems.reduce((sum, item) => sum + item.needPnt, 0);
  const isShort = total > hldPnt;

  /** 담지 않은 아이템이면 담고, 담은 아이템이면 미리보기에만 다시 보여 준다(빼지 않음) */
  const pick = (item) => {
    setCart((prev) =>
      prev.some((it) => it.itemSn === item.itemSn) ? prev : [...prev, item],
    );
    setTryOn((prev) => ({ ...prev, [item.itemRegnCd]: item }));
  };

  const remove = (item) => {
    const rest = cart.filter((it) => it.itemSn !== item.itemSn);
    setCart(rest);
    if (tryOn[item.itemRegnCd]?.itemSn !== item.itemSn) return;
    /** 빠진 것이 보이던 아이템이면 같은 부위에 담아 둔 마지막 것으로 */
    const fallback = rest.findLast((it) => it.itemRegnCd === item.itemRegnCd);
    setTryOn((prev) => {
      const next = { ...prev };
      if (fallback) next[item.itemRegnCd] = fallback;
      else delete next[item.itemRegnCd];
      return next;
    });
  };

  /** 미리보기 합성이 실패하면 그 아이템의 담기를 취소하고 마지막으로 성공한 조합으로 되돌린다 */
  const revertTo = (confirmedSns) => {
    const confirmed = new Set(confirmedSns);
    const failed = new Set(
      Object.values(tryOn)
        .filter((item) => !confirmed.has(item.itemSn))
        .map((item) => item.itemSn),
    );
    const rest = cart.filter((item) => !failed.has(item.itemSn));
    setCart(rest);
    setTryOn(
      Object.fromEntries(
        rest
          .filter((item) => confirmed.has(item.itemSn))
          .map((item) => [item.itemRegnCd, item]),
      ),
    );
  };

  const handlePurchase = () => {
    purchase(
      {
        pixelCharSn: pet.pixelCharSn,
        itemSns: cartItems.map((item) => item.itemSn),
        idmptDmndId,
      },
      {
        onSuccess: () => {
          showToast('아이템을 구매했어요. 보관함에서 확인해 보세요');
          onClose();
        },
        onError: (error) =>
          showToast(
            PURCHASE_ERRORS[error.code] ??
              '구매하지 못했어요. 잠시 뒤 다시 시도해 주세요',
          ),
      },
    );
  };

  return (
    <Modal
      title="아이템 상점"
      isLarge
      isPending={isPending}
      onClose={onClose}
      footer={
        <>
          <div>
            <p className="text-muted">
              선택 {cartItems.length}개 · 총{' '}
              <b className="tabular-nums">{formatPoint(total)}</b> · 보유{' '}
              {formatPoint(hldPnt)}
            </p>
            {isShort && (
              <p role="alert" className="text-sm text-danger">
                포인트가 부족해요
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={handlePurchase}
            disabled={
              cartItems.length === 0 || isShort || isPending || isShopPending
            }
            className={BTN_PRIMARY}
          >
            구매하기
          </button>
        </>
      }
    >
      <div className="grid gap-6 px-6 py-5 min-[761px]:min-h-0 min-[761px]:flex-1 min-[761px]:grid-cols-[260px_minmax(0,1fr)] min-[761px]:gap-0 min-[761px]:py-0">
        <div className="flex flex-col gap-3 min-[761px]:min-h-0 min-[761px]:overflow-y-auto min-[761px]:border-r min-[761px]:border-line-soft min-[761px]:p-4">
          <div className="mx-auto w-40 min-[761px]:w-[180px]">
            <WearPreview pet={pet} itemSns={previewSns} onFail={revertTo} />
          </div>
          <button
            type="button"
            onClick={() => setTryOn({})}
            className={`${BTN_SECONDARY} w-full`}
          >
            원래대로
          </button>
          <p className="mt-1 font-bold">담은 아이템 ({cartItems.length})</p>
          {cartItems.length > 0 && (
            <ul className="max-h-[182px] shrink-0 divide-y divide-line-soft overflow-y-auto border-y border-line">
              {cartItems.map((item) => (
                <li
                  key={item.itemSn}
                  className="flex h-9 items-center gap-2 pr-1 pl-1"
                >
                  <button
                    type="button"
                    onClick={() => pick(item)}
                    className="min-w-0 grow text-left"
                  >
                    {item.itemNm}{' '}
                    <span className="text-subtle">
                      · {PART_NAMES[item.itemRegnCd]}
                    </span>
                  </button>
                  <b className="font-semibold tabular-nums">
                    {formatPoint(item.needPnt)}
                  </b>
                  <button
                    type="button"
                    onClick={() => remove(item)}
                    aria-label={`${item.itemNm} 빼기`}
                    className="grid size-8 place-items-center rounded-md text-subtle hover:text-ink"
                  >
                    <X className="size-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="flex min-w-0 flex-col gap-4 min-[761px]:min-h-0 min-[761px]:gap-2 min-[761px]:px-5 min-[761px]:pt-2 min-[761px]:pb-0">
          <div
            role="group"
            aria-label="부위"
            className="flex flex-wrap gap-2 max-[760px]:flex-nowrap max-[760px]:overflow-x-auto max-[760px]:[scrollbar-width:none] max-[760px]:[&::-webkit-scrollbar]:hidden"
          >
            {TABS.map((tab) => (
              <button
                key={tab.code}
                type="button"
                aria-pressed={tab.code === part}
                onClick={() => setPart(tab.code)}
                className={`inline-flex h-9 shrink-0 items-center rounded-full border px-3.5 font-semibold min-[761px]:h-8 ${
                  tab.code === part
                    ? 'border-brand-500 bg-brand-500 text-white'
                    : 'border-line bg-white text-ink-2 hover:border-line-strong'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-3 content-start gap-2 p-[3px] min-[761px]:min-h-0 min-[761px]:flex-1 min-[761px]:grid-cols-4 min-[761px]:overflow-y-auto">
            {isShopError && (
              <p className="col-span-full py-6 text-center text-muted">
                상점을 불러오지 못했어요{' '}
                <button
                  type="button"
                  onClick={() => refetch()}
                  className="font-semibold text-brand-600 underline"
                >
                  다시 시도
                </button>
              </p>
            )}
            {visibleItems.map((item) => {
              const isOwned = item.hldYn;
              const isInCart = cartItems.some(
                (it) => it.itemSn === item.itemSn,
              );
              return (
                <button
                  key={item.itemSn}
                  type="button"
                  disabled={isOwned}
                  aria-pressed={isOwned ? undefined : isInCart}
                  onClick={() => pick(item)}
                  className={`relative flex flex-col items-center rounded-lg px-2 pt-2 pb-2.5 text-center text-sm leading-tight outline-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-ink ${
                    isOwned
                      ? 'cursor-not-allowed bg-surface-2 text-placeholder'
                      : isInCart
                        ? 'bg-brand-50 text-ink-2 shadow-[inset_0_0_0_2px_var(--color-brand-500)]'
                        : 'bg-surface-2 text-ink-2 hover:shadow-[inset_0_0_0_1px_var(--color-line-strong)]'
                  }`}
                >
                  {isOwned && (
                    <Badge className="absolute top-2 right-2">보유중</Badge>
                  )}
                  <span
                    className={`mb-2 grid size-[72px] place-items-center overflow-hidden rounded-sm bg-white text-xs ${
                      isOwned ? 'text-line-strong' : 'text-subtle'
                    }`}
                  >
                    <ItemImage item={item} />
                  </span>
                  <span className="mb-0.5 break-all">{item.itemNm}</span>
                  <span
                    className={`font-semibold tabular-nums ${
                      isOwned ? 'text-line-strong' : 'text-ink'
                    }`}
                  >
                    {formatPoint(item.needPnt)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </Modal>
  );
}
