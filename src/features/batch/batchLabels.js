/** 배치구분 공통코드(SYSG02) */
export const BATCH_SE = { MEMBER_PURGE: 'SYSC0027' };

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

/** 실행 중 여부: 서버는 잠금을 푼 뒤 이력을 마감해 그사이 runningYn만 먼저 false가 됨 */
export const isRunning = ({ runningYn, lastRsltCd }) =>
  runningYn || lastRsltCd === EXCN_RSLT.RUNNING;
