import { ITEM_PART } from '../shared/petCodes';

/**
 * [착용 미리보기 겹침 순서]
 * - 아이템 이미지는 캐릭터와 같은 크기 캔버스에 고정 좌표로 그려진 것을 겹치기만 함
 * - 캐릭터 → 의상 → 가방 → 목장식 → 머리장식 → 안경 (FN-MYP-010-13)
 */
export const LAYER_ORDER = [
  ITEM_PART.CLOTHES,
  ITEM_PART.BAG,
  ITEM_PART.NECK,
  ITEM_PART.HEAD,
  ITEM_PART.FACE,
];
