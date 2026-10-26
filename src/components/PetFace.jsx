import { Cat, Dog } from 'lucide-react';
import { CHRC_STTS, PET_SE } from '@/utils/petCodes';
import { useCharacterImage } from '@/hooks/useCharacterImage';

/**
 * 반려동물 캐릭터 얼굴 (마이페이지·건강기록·건강일지·메인에서 같이 쓴다)
 *
 * 사용법
 *   <PetFace petSn={pet.petSn} petSeCd={pet.petSeCd} chrcSttsCd={pet.chrcSttsCd} className="size-16 rounded-full" iconClassName="size-7" alt="초코 캐릭터" />
 *
 * - petSn: 얼굴 이미지 요청에 쓴다
 * - petSeCd: 이미지가 없을 때 그릴 기본 아이콘 종류(강아지·고양이)
 * - chrcSttsCd: 오류 확인 중이면 흑백으로 그린다
 * - className: 크기·모양·바탕을 정한다. 이미지와 기본 아이콘 자리에 똑같이 붙으므로 `rounded-full`, `size-*`는 여기에 쓴다
 * - iconClassName: 기본 아이콘(종별 강아지·고양이) 크기. 기본 `size-7`
 * - alt: 이미지 설명. 꾸밈용이면 비워 둔다(기본 빈 문자열)
 * - fallback: 이미지가 오기 전이나 요청이 실패했을 때 대신 그릴 노드. 없으면 종별 아이콘
 *
 * 이미지는 `GET /pets/{petSn}/character-image?part=face`를 `useCharacterImage`로 한 번만 받아 같은 동물끼리 캐시를 나눈다.
 * 오류 확인 중인 동물은 서버가 기본 캐릭터 이미지를 줘도 흑백으로 그린다(반려동물 상태 기준).
 * 도트 이미지라 `image-rendering: pixelated`로 늘려 그린다.
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
  const url = useCharacterImage(petSn, 'face');
  const muted = chrcSttsCd === CHRC_STTS.ERROR ? ' opacity-55 grayscale' : '';

  if (url) {
    return (
      <img
        src={url}
        alt={alt}
        className={`object-cover [image-rendering:pixelated] ${className}${muted}`}
      />
    );
  }
  if (fallback) return fallback;

  const Icon = petSeCd === PET_SE.CAT ? Cat : Dog;
  return (
    <span className={`grid place-items-center ${className}${muted}`}>
      <Icon className={iconClassName} aria-hidden="true" />
    </span>
  );
}
