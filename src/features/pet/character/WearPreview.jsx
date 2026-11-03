import { Cat, Dog } from 'lucide-react';
import FileImage from '@/components/FileImage';
import { useFileImage } from '@/hooks/useFileImage';
import { characterImageOptions } from '@/hooks/useCharacterImage';
import { PET_SE } from '../shared/petCodes';
import { LAYER_ORDER } from './wearLayout';

/**
 * [착용 미리보기]
 * - 캐릭터 위에 착용한 아이템 이미지를 같은 크기로 겹친다 (좌표 계산 없음)
 * - worn: { [부위 코드]: 아이템 }
 */
export default function WearPreview({ pet, worn }) {
  const Icon = pet.petSeCd === PET_SE.CAT ? Cat : Dog;
  const { src, isPending } = useFileImage(characterImageOptions(pet.petSn, 'full'));
  return (
    <div
      role="img"
      aria-label={`${pet.petNm} 착용 미리보기`}
      className="relative grid aspect-square place-items-center rounded-xl bg-brand-50 text-brand-500"
    >
      <FileImage
        src={src}
        pending={isPending}
        className="size-full object-contain [image-rendering:pixelated]"
        fallback={<Icon className="size-3/5" aria-hidden="true" />}
      />
      {LAYER_ORDER.map((part, index) =>
        worn[part]?.itemImgUrl ? (
          <img
            key={part}
            src={worn[part].itemImgUrl}
            alt=""
            style={{ zIndex: index + 1 }}
            className="absolute inset-0 size-full object-contain [image-rendering:pixelated]"
          />
        ) : null,
      )}
    </div>
  );
}
