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

/** [매칭 거래 상태 PCAG05 (PET_PRTC_MTCH.MTCH_DLNG_STTS_CD)] */
const MTCH_STATUS_LABELS = {
  PCAC0012: '수락 대기',
  PCAC0013: '매칭 완료',
  PCAC0014: '확인 대기',
  PCAC0015: '수령 대기',
  PCAC0016: '거래 완료',
  PCAC0017: '요청 취소',
  PCAC0018: '무응답 종료',
};

/** 매칭 거래 상태 이름: 모르는 코드는 그대로 */
export const getMtchStatusLabel = (code) => MTCH_STATUS_LABELS[code] ?? code;

/** [보호자 확인 결과 PCAG06 (PET_PRTC_CMPTN_DMND.PRTCR_IDNTY_RSLT_CD)] */
const PRTCR_IDNTY_LABELS = {
  PCAC0019: '완료 확인',
  PCAC0020: '보완 요청',
};

/** 보호자 확인 결과 이름: 없으면 확인 전 */
export const getPrtcrIdntyLabel = (code) =>
  code ? (PRTCR_IDNTY_LABELS[code] ?? code) : '확인 전';
