/**
 * [실종제보 상태 코드]
 * - 공통코드 CMUC0006 실종·CMUC0007 찾았어요·CMUC0008 만료(회원 화면 코드와 같은 값)
 */
export const LOST_STATUS = {
  LOST: 'CMUC0006',
  FOUND: 'CMUC0007',
  EXPIRED: 'CMUC0008',
};

/** 상태 탭: 값 ''은 전체 */
export const LOST_STATUS_TABS = [
  { value: '', label: '전체' },
  { value: LOST_STATUS.LOST, label: '실종' },
  { value: LOST_STATUS.FOUND, label: '찾았어요' },
  { value: LOST_STATUS.EXPIRED, label: '만료' },
];

/** 상태 이름: 모르는 코드는 그대로 */
export const getLostStatusLabel = (code) =>
  LOST_STATUS_TABS.find(({ value }) => value && value === code)?.label ?? code;
