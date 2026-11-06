import { Cat, Dog, Loader2 } from 'lucide-react';
import { useEffect, useEffectEvent, useRef } from 'react';
import FileImage from '@/components/FileImage';
import { showToast } from '@/components/toastStore';
import { useCharacterPreview } from '../queries';
import { PET_SE } from '../shared/petCodes';

const BAKING_MESSAGE = '아이템을 준비 중이에요. 잠시 후 다시 시도해 주세요.';
const FAIL_MESSAGE =
  '미리보기를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.';

/**
 * [착용 미리보기] (FN-MYP-010-13, FN-MYP-011-01)
 * - AI 서버가 합성한 이미지 한 장을 보여 준다. 프론트는 아이템을 겹쳐 그리지 않는다
 * - itemSns: 입힐 아이템 번호(빈 배열이면 맨몸)
 * - 합성이 실패하면 토스트를 띄우고 마지막으로 성공한 조합 itemSns를 onFail로 돌려준다
 */
export default function WearPreview({ pet, itemSns, enabled = true, onFail }) {
  const Icon = pet.petSeCd === PET_SE.CAT ? Cat : Dog;
  const {
    data: src = null,
    error,
    isFetching,
    isSuccess,
    isPlaceholderData,
  } = useCharacterPreview({ pixelCharSn: pet.pixelCharSn, itemSns, enabled });

  const key = [...itemSns].sort((a, b) => a - b).join(',');
  const confirmedRef = useRef(null);
  useEffect(() => {
    if (isSuccess && !isPlaceholderData) {
      confirmedRef.current = key ? key.split(',').map(Number) : [];
    }
  }, [isSuccess, isPlaceholderData, key]);

  const handleFail = useEffectEvent((failure) => {
    showToast(failure.code === 'ITEM_BAKING' ? BAKING_MESSAGE : FAIL_MESSAGE);
    if (confirmedRef.current) onFail?.(confirmedRef.current);
  });
  useEffect(() => {
    if (error) handleFail(error);
  }, [error]);

  return (
    <div
      role="img"
      aria-label={`${pet.petNm} 착용 미리보기`}
      className="relative grid aspect-square place-items-center overflow-hidden rounded-xl bg-brand-50 text-brand-500"
    >
      <FileImage
        src={src}
        pending={!src && isFetching}
        className="size-full object-contain [image-rendering:pixelated]"
        fallback={<Icon className="size-3/5" aria-hidden="true" />}
      />
      {isFetching && (
        <div
          role="status"
          className="absolute inset-0 grid place-items-center bg-white/50"
        >
          <Loader2 className="size-8 animate-spin" aria-hidden="true" />
          <span className="sr-only">미리보기를 만드는 중</span>
        </div>
      )}
    </div>
  );
}
