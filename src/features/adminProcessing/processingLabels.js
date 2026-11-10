/**
 * [처리 현황 코드·이름]
 * - 영수증 출처 AIMG07, 인식 실패 AIMC0004(AIMG01), 캐릭터 생성 작업 상태 CHRG01, 호출결과 SYSG06
 */

/** 탭: ?tab=ocr|character|pdf */
export const PROCESSING_TABS = [
  { key: 'ocr', label: '영수증 OCR' },
  { key: 'character', label: '캐릭터 생성' },
  { key: 'pdf', label: '검사결과지 분석' },
];

/** 탭이 없거나 모를 때 */
export const DEFAULT_TAB_KEY = 'ocr';

/** 탭 키로 탭 찾기 */
export const findProcessingTab = (key) =>
  PROCESSING_TABS.find((tab) => tab.key === key) ?? PROCESSING_TABS[0];

/** 영수증 처리 상태 공통코드 그룹 */
export const OCR_STTS_GROUP = 'AIMG01';

/** 영수증 처리 상태: 인식 실패 */
export const OCR_STTS_FAIL = 'AIMC0004';

/** 영수증 요청 출처(AIMG07) */
export const OCR_SOURCES = [
  { comCd: 'AIMC0026', comCdNm: '건강 일지' },
  { comCd: 'AIMC0027', comCdNm: '가계부' },
  { comCd: 'AIMC0031', comCdNm: 'AI 대화창' },
];

/** 캐릭터 생성 작업 상태(CHRG01) */
export const CHAR_JOB_STTS = [
  { comCd: 'CHRC0001', comCdNm: '요청' },
  { comCd: 'CHRC0002', comCdNm: '생성 중' },
  { comCd: 'CHRC0003', comCdNm: '생성 완료' },
  { comCd: 'CHRC0004', comCdNm: '생성 실패' },
];

/** 캐릭터 생성 작업 상태: 생성 실패 */
export const CHAR_JOB_STTS_FAIL = 'CHRC0004';

/** 외부 API 호출결과(SYSG06) */
export const CALL_RSLT = {
  SUCCESS: 'SYSC0021',
  FAIL: 'SYSC0022',
  TIMEOUT: 'SYSC0023',
};

/** 공통코드 이름: 없으면 코드 그대로 */
export const getCodeName = (codes = [], code) =>
  codes.find(({ comCd }) => comCd === code)?.comCdNm ?? code;
