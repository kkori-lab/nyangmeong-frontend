import { Cat, Dog } from 'lucide-react';
import { CHRC_STTS, PET_SE } from '@/utils/petCodes';
import FileImage from '@/components/FileImage';
import { useFileImage } from '@/hooks/useFileImage';
import { characterImageOptions } from '@/hooks/useCharacterImage';

/**
 * 반려동물 캐릭터 얼굴 (마이페이지·건강기록·건강일지·메인에서 공용)
 *
 * 사용법
 *   <PetFace petSn={pet.petSn} petSeCd={pet.petSeCd} chrcSttsCd={pet.chrcSttsCd} className="size-16 rounded-full" iconClassName="size-7" alt="초코 캐릭터" />
 *
 * - petSn: 얼굴 이미지 요청용
 * - petSeCd: 이미지가 없을 때 그릴 기본 아이콘 종류(강아지·고양이)
 * - chrcSttsCd: 오류 확인 중이면 흑백 표시
 * - className: 크기·모양·바탕 지정. 이미지와 기본 아이콘 자리에 똑같이 붙으므로 `rounded-full`, `size-*`는 여기에 지정
 * - iconClassName: 기본 아이콘(종별 강아지·고양이) 크기. 기본 `size-7`
 * - alt: 이미지 설명. 꾸밈용이면 비워 둔다(기본 빈 문자열)
 * - fallback: 이미지가 없거나 요청이 실패했을 때 대신 그릴 노드. 없으면 종별 아이콘(받는 중에는 로딩 자리)
 *
 * 이미지는 `GET /pets/{petSn}/character-image?part=face`를 `useFileImage`로 한 번만 받아 같은 동물끼리 캐시 공유.
 * 오류 확인 중인 동물은 서버가 기본 캐릭터 이미지를 줘도 흑백으로 그린다(반려동물 상태 기준).
 * 도트 이미지라 `image-rendering: pixelated`로 늘려 표시.
 */
export default function PetFace({
  petSn,
  petSeCd,
  chrcSttsCd,
  className = '',
  iconClassName = 'size-7',
  alt = '',
  fallback,
}) {
  const { src, isPending } = useFileImage(characterImageOptions(petSn, 'face'));
  const muted = chrcSttsCd === CHRC_STTS.ERROR ? ' opacity-55 grayscale' : '';
  const Icon = petSeCd === PET_SE.CAT ? Cat : Dog;

  return (
    <FileImage
      src={src}
      alt={alt}
      pending={isPending}
      className={`object-cover [image-rendering:pixelated] ${className}${muted}`}
      fallback={
        fallback ?? (
          <span className={`grid place-items-center ${className}${muted}`}>
            <Icon className={iconClassName} aria-hidden="true" />
          </span>
        )
      }
    />
  );
}
