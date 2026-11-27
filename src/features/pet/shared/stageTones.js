import { BRUP_ROLE } from '@/utils/petCodes';

/** 캐릭터 무대(목록 카드·슬라이드)에서 돌려 쓰는 배경색 */
export const STAGE_TONES = [
  'bg-tone-blue-bg',
  'bg-tone-rose-bg',
  'bg-tone-amber-bg',
  'bg-tone-violet-bg',
  'bg-tone-green-bg',
];

/**
 * 한 동물의 무대 색 순번: 캐릭터 목록(SCR-MYP-010)과 같은 순번
 * - 목록은 주양육·공동양육을 따로 그리고 각 묶음 안 순서(usePets 순서)로 순번을 센다
 */
export const getStageToneIndex = (pets, pet) => {
  const isOwn = (item) => item.brupRoleCd === BRUP_ROLE.PRIMARY;
  return pets
    .filter((item) => isOwn(item) === isOwn(pet))
    .findIndex((item) => item.petSn === pet.petSn);
};
