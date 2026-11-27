/**
 * 슬라이드 카드 겉틀 클래스: 로딩 스켈레톤(PetListPage)이 쓴다. PetSlide `PetCard`의 article 클래스와 같아야 하므로 고치면 둘 다 고친다.
 * 모바일 기준은 970px 미만
 */
export const SLIDE_CARD =
  'relative grid gap-5 rounded-modal border border-line bg-white p-5 pt-10 pb-16 shadow-depth-sm max-[970px]:grid-cols-[84px_minmax(0,1fr)] max-[970px]:gap-x-4 max-[970px]:gap-y-0 min-[970px]:grid-cols-[140px_minmax(0,1fr)] min-[970px]:gap-x-8 min-[970px]:gap-y-6 min-[970px]:px-8 min-[1100px]:grid-cols-[180px_minmax(0,1fr)] min-[1100px]:gap-x-10 min-[1100px]:px-10';

/** 왼쪽 캐릭터 사각형 자리: 970px 미만은 84px 정사각형·세로 가운데. 로딩 전후 같은 클래스 */
export const STAGE_BOX = 'max-[970px]:size-[84px] max-[970px]:self-center';
