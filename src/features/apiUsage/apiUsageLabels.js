/** 호출결과 공통코드(SYSG06) */
export const CALL_RSLT = {
  SUCCESS: 'SYSC0021',
  FAIL: 'SYSC0022',
  TIMEOUT: 'SYSC0023',
};

/**
 * 외부 API 종류: 기능명세서 7종
 * - AI 분류·PDF 분석은 SYSG05에 코드가 없어 임시 값 -> 공통코드 수정 뒤 교체
 */
export const API_TYPES = [
  { extlApiSeCd: 'SYSC0015', extlApiSeNm: 'AI 대화', hasToken: true },
  { extlApiSeCd: 'TMP00001', extlApiSeNm: 'AI 분류', hasToken: true },
  { extlApiSeCd: 'SYSC0016', extlApiSeNm: 'OCR', hasToken: false },
  { extlApiSeCd: 'SYSC0017', extlApiSeNm: '캐릭터 생성', hasToken: false },
  { extlApiSeCd: 'TMP00002', extlApiSeNm: 'PDF 분석', hasToken: false },
  { extlApiSeCd: 'SYSC0018', extlApiSeNm: '카카오 로컬', hasToken: false },
  { extlApiSeCd: 'SYSC0020', extlApiSeNm: '메일', hasToken: false },
];

/** 종류 코드의 이름 */
export const getApiTypeName = (extlApiSeCd) =>
  API_TYPES.find((type) => type.extlApiSeCd === extlApiSeCd)?.extlApiSeNm ??
  extlApiSeCd;

/** 실패율 표기 */
export const formatFailRate = (failRt) => `${failRt.toFixed(1)}%`;

/** 평균 응답 표기 */
export const formatResponseTime = (avgRspnsMs) =>
  `${(avgRspnsMs / 1000).toFixed(1)}초`;
