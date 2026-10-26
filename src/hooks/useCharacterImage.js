import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/axios';

/** 캐릭터 이미지 조회 GET /pets/{petSn}/character-image (로그인 전 401 랜딩 이동 끄기) */
const getCharacterImage = (petSn, part) =>
  api.get(`/pets/${petSn}/character-image`, {
    params: { part },
    responseType: 'blob',
    skipAuthRedirect: true,
  });

/** Blob을 <img>에 바로 쓸 data URL로 바꾼다(object URL과 달리 해제할 것이 없다) */
const blobToDataUrl = (blob) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });

/**
 * 캐릭터 이미지를 <img src>로 쓸 수 있는 주소로 돌려준다. 실패·로딩 중에는 null
 * 키가 `['pets', ...]`로 시작해 반려동물 캐시를 무효화하면 같이 다시 받는다
 */
export const useCharacterImage = (petSn, part) => {
  const { data } = useQuery({
    queryKey: ['pets', petSn, 'character-image', part],
    queryFn: () => getCharacterImage(petSn, part).then(blobToDataUrl),
    enabled: petSn != null,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
  return data ?? null;
};
