/** 실행구분 공통코드(SYSG03) */
export const EXCN_SE = { AUTO: 'SYSC0010', MANUAL: 'SYSC0011' };

/** 실행결과 공통코드(SYSG04) */
export const EXCN_RSLT = {
  RUNNING: 'SYSC0012',
  SUCCESS: 'SYSC0013',
  FAIL: 'SYSC0014',
};

/** 값 없음 표기 */
export const EMPTY_LABEL = '—';

/** 실행 중 여부 */
export const isRunning = ({ excnRsltCd }) => excnRsltCd === EXCN_RSLT.RUNNING;
