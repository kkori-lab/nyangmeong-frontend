import defaultDogFace from '@/assets/pets/default-character-dog.png';
import PetFace from '@/components/PetFace';

const AVATAR_CLASS =
  'size-9 shrink-0 rounded-full border border-line bg-brand-50';

/**
 * AI 말풍선 왼쪽 얼굴
 * - pet: 방 태그 반려동물. 있으면 그 아이 캐릭터 얼굴(없으면 PetFace가 종별 기본 얼굴)
 * - 없으면("전체" 방·반려동물 없음·목록 로딩 중) 기본 강아지 캐릭터 얼굴
 */
export default function AiAvatar({ pet }) {
  if (!pet) {
    return (
      <img
        src={defaultDogFace}
        alt=""
        width="36"
        height="36"
        className={`object-cover [image-rendering:pixelated] ${AVATAR_CLASS}`}
      />
    );
  }
  return (
    <PetFace
      petSn={pet.petSn}
      petSeCd={pet.petSeCd}
      isError={pet.bscCharSbstYn}
      className={AVATAR_CLASS}
    />
  );
}
