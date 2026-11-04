import { X } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BTN_PRIMARY, BTN_SECONDARY } from '@/components/buttonStyles';
import { showToast } from '@/components/toastStore';
import { useCharacterImage } from '@/hooks/useCharacterImage';
import { PATHS } from '@/routes/paths';
import { usePixelCharacter, useSaveEquippedItems } from '../queries';
import { ITEM_PART } from '../shared/petCodes';
import ItemImage from './ItemImage';
import ItemShopModal from './ItemShopModal';
import ItemStorage from './ItemStorage';
import WearPreview from './WearPreview';

const SLOT_NAMES = {
  [ITEM_PART.HEAD]: '머리',
  [ITEM_PART.FACE]: '얼굴',
  [ITEM_PART.NECK]: '목',
  [ITEM_PART.CLOTHES]: '의상',
  [ITEM_PART.BAG]: '가방',
};

/** 앱: 슬롯 5개를 캐릭터 아래 한 줄로 (머리·얼굴·목·의상·가방) */
const SLOT_ORDER = {
  [ITEM_PART.HEAD]: 'max-[760px]:order-1',
  [ITEM_PART.FACE]: 'max-[760px]:order-2',
  [ITEM_PART.NECK]: 'max-[760px]:order-3',
  [ITEM_PART.CLOTHES]: 'max-[760px]:order-4',
  [ITEM_PART.BAG]: 'max-[760px]:order-5',
};

/** 보유 아이템 목록 → { 부위: 착용 중인 아이템 } */
const toWorn = (items) =>
  Object.fromEntries(
    items.filter((item) => item.equipYn).map((item) => [item.itemRegnCd, item]),
  );

const SAVE_ERRORS = {
  PET_PRIMARY_ONLY: '주양육자만 꾸밀 수 있어요',
};

/**
 * [꾸미기] (FN-MYP-010-13~16·24)
 * - draft: 저장 전 착용 상태. null이면 서버에 저장된 상태 그대로
 * - [되돌리기]는 draft를 버려 진입 시점(저장된) 상태로, [장착]은 draft를 저장
 */
export default function CharacterDecorate({ pet }) {
  const navigate = useNavigate();
  const {
    data: character,
    isPending,
    isError,
    refetch,
  } = usePixelCharacter(pet.pixelCharSn);
  const items = character?.heldItems ?? [];
  const { mutate: saveWear, isPending: isSaving } = useSaveEquippedItems();
  const [draft, setDraft] = useState(null);
  const [isShopOpen, setIsShopOpen] = useState(false);
  const characterImage = useCharacterImage(pet.petSn, 'full');

  const worn = draft ?? toWorn(items);
  const wornItemSns = Object.values(worn).map((item) => item.itemSn);

  const toggle = (item) => {
    const next = { ...worn };
    /** 같은 아이템을 다시 누르면 해제, 같은 부위의 다른 아이템이면 교체 */
    if (next[item.itemRegnCd]?.hldItemSn === item.hldItemSn) {
      delete next[item.itemRegnCd];
    } else {
      next[item.itemRegnCd] = item;
    }
    setDraft(next);
  };

  const release = (part) => {
    const next = { ...worn };
    delete next[part];
    setDraft(next);
  };

  /** 미리보기 합성이 실패하면 마지막으로 성공한 조합으로 되돌린다 */
  const revertTo = (confirmedSns) => {
    const confirmed = new Set(confirmedSns);
    setDraft(toWorn(items.filter((item) => confirmed.has(item.itemSn))));
  };

  const handleSave = () => {
    saveWear(
      {
        pixelCharSn: pet.pixelCharSn,
        petSn: pet.petSn,
        hldItemSns: Object.values(worn).map((item) => item.hldItemSn),
        itemSns: Object.values(worn).map((item) => item.itemSn),
      },
      {
        onSuccess: () => {
          setDraft(null);
          showToast('착용 상태를 저장했어요');
        },
        onError: (error) => {
          if (error.code === 'PIXEL_CHARACTER_UNDER_REVIEW') {
            showToast('오류 확인 중인 캐릭터는 꾸밀 수 없어요');
            navigate(PATHS.MYPAGE_CHARACTERS, { replace: true });
            return;
          }
          showToast(
            SAVE_ERRORS[error.code] ??
              '저장하지 못했어요. 잠시 뒤 다시 시도해 주세요',
          );
        },
      },
    );
  };

  const slot = (part) => (
    <Slot
      name={SLOT_NAMES[part]}
      item={worn[part]}
      onRelease={() => release(part)}
      className={SLOT_ORDER[part]}
    />
  );

  if (isPending) return null;

  if (isError) {
    return (
      <p className="py-10 text-center text-muted">
        꾸미기 정보를 불러오지 못했어요{' '}
        <button
          type="button"
          onClick={() => refetch()}
          className="font-semibold text-brand-600 underline"
        >
          다시 시도
        </button>
      </p>
    );
  }

  return (
    <>
      <div className="flex justify-end max-[760px]:mb-4 max-[760px]:-translate-y-3">
        {pet.inqryRcptYn === 'Y' ? (
          <button type="button" disabled className={BTN_SECONDARY}>
            문의 접수됨
          </button>
        ) : (
          <Link
            to={PATHS.INQUIRY_NEW}
            state={{
              inquiryType: 'PIXEL_CHARACTER',
              petSn: pet.petSn,
              imageUrl: characterImage,
            }}
            className={BTN_SECONDARY}
          >
            오류 문의
          </Link>
        )}
      </div>
      <div className="mt-4 grid items-start gap-4 max-[760px]:col-span-full min-[1101px]:grid-cols-[minmax(0,1fr)_minmax(360px,420px)]">
        <section
          aria-label="착용 미리보기"
          className="rounded-card border border-line bg-white shadow-sm max-[760px]:col-span-full max-[760px]:grid max-[760px]:grid-cols-5 max-[760px]:gap-x-2 max-[760px]:gap-y-3 max-[760px]:p-4"
        >
          <div className="max-[760px]:contents grid grid-cols-[72px_minmax(0,300px)_72px] items-center justify-center gap-3 px-4 pt-8 pb-4 min-[600px]:grid-cols-[96px_minmax(0,300px)_96px] min-[600px]:gap-5 min-[600px]:px-6">
            <div className="flex flex-col gap-5 max-[760px]:contents">
              {slot(ITEM_PART.HEAD)}
              {slot(ITEM_PART.FACE)}
            </div>
            <div className="max-[760px]:col-span-full max-[760px]:mx-auto max-[760px]:w-[min(220px,100%)]">
              <WearPreview
                pet={pet}
                itemSns={wornItemSns}
                enabled={!isSaving}
                onFail={revertTo}
              />
            </div>
            <div className="flex flex-col gap-5 max-[760px]:contents">
              {slot(ITEM_PART.CLOTHES)}
              {slot(ITEM_PART.BAG)}
            </div>
          </div>
          <div className="flex justify-center px-6 pb-6 max-[760px]:contents">
            <div className="w-[72px] min-[600px]:w-24 max-[760px]:contents">
              {slot(ITEM_PART.NECK)}
            </div>
          </div>
        </section>
        <section
          aria-labelledby="inv-title"
          className="rounded-card border border-line bg-white shadow-sm"
        >
          <div className="flex items-center justify-between gap-3 border-b border-line-soft px-5 py-4">
            <h2 id="inv-title" className="text-lg font-bold">
              보관함
            </h2>
            <button
              type="button"
              onClick={() => setIsShopOpen(true)}
              className={BTN_PRIMARY}
            >
              아이템 상점
            </button>
          </div>
          <div className="p-5">
            <ItemStorage items={items} worn={worn} onToggle={toggle} />
          </div>
        </section>
      </div>
      <div className="mt-5 flex justify-end gap-2 border-t border-line pt-5 max-[760px]:sticky max-[760px]:bottom-[calc(60px+env(safe-area-inset-bottom))] max-[760px]:z-5 max-[760px]:col-span-full max-[760px]:-mx-4 max-[760px]:bg-white max-[760px]:px-4 max-[760px]:py-2.5">
        <button
          type="button"
          onClick={() => setDraft(null)}
          disabled={draft === null || isSaving}
          className={`${BTN_SECONDARY} max-[760px]:flex-1`}
        >
          되돌리기
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={draft === null || isSaving}
          className={`${BTN_PRIMARY} max-[760px]:flex-1`}
        >
          장착
        </button>
      </div>
      {isShopOpen && (
        <ItemShopModal
          pet={pet}
          worn={worn}
          onClose={() => setIsShopOpen(false)}
        />
      )}
    </>
  );
}

function Slot({ name, item, onRelease, className = '' }) {
  return (
    <div className={`flex min-w-0 flex-col items-center gap-1 ${className}`}>
      <div
        className={`relative grid h-20 w-full place-items-center rounded-lg px-1 text-center text-sm max-[760px]:h-14 max-[760px]:text-xs ${
          item
            ? 'bg-surface-2 font-semibold text-ink-2'
            : 'border border-dashed border-line-strong bg-white font-normal text-placeholder'
        }`}
      >
        {item ? (
          <ItemImage
            item={item}
            fallback={<span className="break-all">{item.itemNm}</span>}
          />
        ) : (
          '비어있음'
        )}
        {item && (
          <button
            type="button"
            onClick={onRelease}
            aria-label={`${name} ${item.itemNm} 해제`}
            className="absolute top-0 right-0 grid size-7 place-items-center rounded-md text-subtle hover:text-ink"
          >
            <X className="size-4" />
          </button>
        )}
      </div>
      <span className="text-sm text-subtle">{name}</span>
    </div>
  );
}
