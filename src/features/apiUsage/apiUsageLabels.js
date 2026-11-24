/** 호출결과 공통코드(SYSG06) */
export const CALL_RSLT = {
  SUCCESS: 'SYSC0021',
  FAIL: 'SYSC0022',
  TIMEOUT: 'SYSC0023',
};

/** 외부 API 종류(SYSG05): 기능명세서 7종 */
export const API_TYPES = [
  { extlApiSeCd: 'SYSC0015', extlApiSeNm: 'AI 대화' },
  { extlApiSeCd: 'SYSC0024', extlApiSeNm: 'AI 분류' },
  { extlApiSeCd: 'SYSC0016', extlApiSeNm: 'OCR' },
  { extlApiSeCd: 'SYSC0017', extlApiSeNm: '캐릭터 생성' },
  { extlApiSeCd: 'SYSC0025', extlApiSeNm: 'PDF 분석' },
  { extlApiSeCd: 'SYSC0018', extlApiSeNm: '카카오 로컬' },
  { extlApiSeCd: 'SYSC0020', extlApiSeNm: '메일' },
];

/** 종류 코드의 이름 */
export const getApiTypeName = (extlApiSeCd) =>
  API_TYPES.find((type) => type.extlApiSeCd === extlApiSeCd)?.extlApiSeNm ??
  extlApiSeCd;

/** 행의 종류 이름: 서버 extlApiNm, 없으면 코드로 찾은 이름 */
export const getApiName = ({ extlApiNm, extlApiSeCd }) =>
  extlApiNm || getApiTypeName(extlApiSeCd);

/** 비었을 때 표기 */
export const EMPTY_TEXT = '-';

/** 실패율 표기: 서버 failRate(%) */
export const formatFailRate = (failRate) =>
  `${Number(failRate ?? 0).toFixed(1)}%`;

/** 평균 응답 표기: 응답 시간이 있는 호출이 없으면 null */
export const formatResponseTime = (avgRspnsMs) =>
  avgRspnsMs == null ? EMPTY_TEXT : `${(avgRspnsMs / 1000).toFixed(1)}초`;
