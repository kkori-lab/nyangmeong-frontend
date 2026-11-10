/** 미션 풀 코드(MYPG04, CARE_MSN.MSN_POOL_CD) */
export const MSN_POOL = { DAILY: 'MYPC0010', ACTIVITY: 'MYPC0011' };

/** 미션 풀 이름 */
export const MSN_POOL_LABELS = {
  [MSN_POOL.DAILY]: '일상케어',
  [MSN_POOL.ACTIVITY]: '활동기반',
};

/** 탭: 값 ''은 전체 */
export const MSN_POOL_TABS = [
  { value: '', label: '전체' },
  { value: MSN_POOL.DAILY, label: MSN_POOL_LABELS[MSN_POOL.DAILY] },
  { value: MSN_POOL.ACTIVITY, label: MSN_POOL_LABELS[MSN_POOL.ACTIVITY] },
];

/** 보상 포인트 최대(백엔드 AdminCareMissionUpdateRequest 1~1000) */
export const CMPN_PNT_MAX = 1000;

/** 달성 기준 횟수 최대(백엔드 AdminCareMissionUpdateRequest 1~10) */
export const ACHV_CRTR_NMTM_MAX = 10;
