import { useFileImage } from '@/hooks/useFileImage';

/**
 * 캐릭터 이미지 조회 조건 GET /pets/{petSn}/character-image
 * 키가 `['pets', ...]`로 시작해 반려동물 캐시를 무효화하면 같이 재조회
 */
export const characterImageOptions = (petSn, part) => ({
  queryKey: ['pets', petSn, 'character-image', part],
  url: `/pets/${petSn}/character-image`,
  params: { part },
  enabled: petSn != null,
});

/** 캐릭터 이미지 주소: 실패·로딩 중에는 null */
export const useCharacterImage = (petSn, part) =>
  useFileImage(characterImageOptions(petSn, part)).src;
