import { CRT_JOB_STTS, CHRC_STTS } from '@/utils/petCodes';

/**
 * [캐릭터 상태 판정] (FN-MYP-010-02·03·12·23)
 * - character: GET /pixel-characters 한 행({ pixelCharSn, crtJobSttsCd, bscCharSbstYn }), 없으면 undefined
 * - status: NONE(캐릭터 없음·생성 실패) / GENERATING / DONE
 * - isError: 오류 확인 중(bscCharSbstYn). 종별 기본 캐릭터를 흑백으로 보이고 꾸미기에 못 들어간다
 * - 생성 실패(CHRC0004)는 결과가 없으므로 NONE (서버도 같은 동물에 다시 요청 가능)
 */
export const getCharState = (character) => {
  if (!character?.pixelCharSn) return { status: CHRC_STTS.NONE, isError: false };
  if (character.bscCharSbstYn) {
    return { status: CHRC_STTS.DONE, isError: true };
  }
  switch (character.crtJobSttsCd) {
    case CRT_JOB_STTS.REQUESTED:
    case CRT_JOB_STTS.GENERATING:
      return { status: CHRC_STTS.GENERATING, isError: false };
    case CRT_JOB_STTS.DONE:
      return { status: CHRC_STTS.DONE, isError: false };
    default:
      return { status: CHRC_STTS.NONE, isError: false };
  }
};
