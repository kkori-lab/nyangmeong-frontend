/**
 * [펫돌봄 모집 상태 코드]
 * - PCAG01 (PET_PRTC_RCRT.RCRT_STTS_CD): PCAC0001 모집중·PCAC0002 매칭완료·PCAC0003 거래완료
 */
export const RCRT_STATUS = {
  OPEN: 'PCAC0001',
  MATCHED: 'PCAC0002',
  DONE: 'PCAC0003',
};

/** 상태 탭: 값 ''은 전체 */
export const RCRT_STATUS_TABS = [
  { value: '', label: '전체' },
  { value: RCRT_STATUS.OPEN, label: '모집중' },
  { value: RCRT_STATUS.MATCHED, label: '매칭완료' },
  { value: RCRT_STATUS.DONE, label: '거래완료' },
];

/** 모집 상태 이름: 모르는 코드는 그대로 */
export const getRcrtStatusLabel = (code) =>
  RCRT_STATUS_TABS.find(({ value }) => value && value === code)?.label ?? code;

/** 비용 단위 PCAG02 (PET_PRTC_RCRT.CST_UNIT_CD) */
const CST_UNIT_SUFFIX = { PCAC0004: '/시간', PCAC0005: '/건' };

/** "15,000원/시간" */
export const formatCost = (cstAmt, cstUnitCd) =>
  cstAmt == null
    ? '—'
    : `${cstAmt.toLocaleString()}원${CST_UNIT_SUFFIX[cstUnitCd] ?? ''}`;

/**
 * [매칭 거래 상태 (PET_PRTC_MTCH.MTCH_DLNG_STTS_CD)]
 * - 공통코드 값이 아직 없어 이름은 가정 -> 백엔드 API가 나오면 실제 코드로 바꾼다
 */
const MTCH_STATUS_LABELS = {
  REQUESTED: '매칭 요청',
  MATCHED: '매칭완료',
  DONE_REQ: '완료 요청',
  COMPLETE: '거래완료',
  CANCELED: '취소',
  EXPIRED: '만료',
  ABORTED: '중단',
};

/** 매칭 거래 상태 이름: 모르는 코드는 그대로 */
export const getMtchStatusLabel = (code) => MTCH_STATUS_LABELS[code] ?? code;

/** 보호자 확인 결과 (가정 이름: ownerCfmtnRsltCd) */
const OWNER_CFMTN_LABELS = {
  CONFIRMED: '확인함',
  REJECTED: '이의 제기',
};

export const getOwnerCfmtnLabel = (code) =>
  code ? (OWNER_CFMTN_LABELS[code] ?? code) : '—';
