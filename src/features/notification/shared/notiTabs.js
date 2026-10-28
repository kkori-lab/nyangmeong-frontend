/** 알림 유형 코드 (AIMG02) */
export const NOTI_TYPE = {
  CARE_SCHDL: 'AIMC0008',
  MTCH_DLNG: 'AIMC0009',
  CMNT: 'AIMC0010',
  JNT_BRUP: 'AIMC0011',
  LOST_EXPRY: 'AIMC0012',
  EXPND_LIM: 'AIMC0013',
  CHRCTR: 'AIMC0014',
  NTC: 'AIMC0015',
  INQRY_ANSWR: 'AIMC0030',
};

/** 알림 행의 [유형] 라벨 (서버는 라벨을 주지 않는다) */
export const NOTI_TYPE_LABEL = {
  [NOTI_TYPE.CARE_SCHDL]: '케어 일정',
  [NOTI_TYPE.MTCH_DLNG]: '펫돌봄',
  [NOTI_TYPE.CMNT]: '커뮤니티',
  [NOTI_TYPE.JNT_BRUP]: '공동양육',
  [NOTI_TYPE.LOST_EXPRY]: '실종 만료',
  [NOTI_TYPE.EXPND_LIM]: '가계부',
  [NOTI_TYPE.CHRCTR]: '캐릭터',
  [NOTI_TYPE.NTC]: '공지',
  [NOTI_TYPE.INQRY_ANSWR]: '문의 답변',
};

/** 유형 묶음 탭 (tab은 서버 ?tab= 값) */
export const NOTI_TABS = [
  { key: 'all', label: '전체', tab: 'ALL' },
  { key: 'care', label: '케어', tab: 'CARE' },
  { key: 'community', label: '커뮤니티', tab: 'COMMUNITY' },
  { key: 'guide', label: '안내', tab: 'INFO' },
];
