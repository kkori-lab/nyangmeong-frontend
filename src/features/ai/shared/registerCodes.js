/** 등록 카드 공통코드 이름: 값은 백엔드 공통코드 그대로(ai 저장소 docs/api/chat.md RegisterDraft) */

/** 일정종류 HLTG19 */
export const SCHEDULE_KIND_NAMES = {
  HLTC0057: '병원',
  HLTC0058: '미용·목욕',
  HLTC0059: '케어·투약',
  HLTC0060: '기타',
};
export const HOSPITAL_KIND = 'HLTC0057';

/** 검진유형 HLTG01 */
export const CHECKUP_TYPE_NAMES = {
  HLTC0001: '정기검진',
  HLTC0002: '예방접종',
  HLTC0003: '질병진료',
  HLTC0004: '검사',
  HLTC0005: '기타 진료',
};

/** 반복 유형 HLTG13 */
export const CARE_ZONE_NAMES = {
  HLTC0036: '매일 (일상관리)',
  HLTC0037: '주기 (정기관리)',
};
export const PERIODIC_ZONE = 'HLTC0037';

/** 케어주기 HLTG15: 직접입력(HLTC0042)은 cycleDays로 표기 */
export const CARE_CYCLE_NAMES = {
  HLTC0038: '1주',
  HLTC0039: '2주',
  HLTC0040: '한달',
  HLTC0041: '1년',
};

/** 카드 종류 */
export const CARD_TYPE = {
  SCHEDULE: 'SCHEDULE',
  CARE_ITEM: 'CARE_ITEM',
  ASK: 'ASK',
};
