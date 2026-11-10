/**
 * [처리 현황 코드·이름]
 * - 확인된 값: 영수증 출처 AIMC0026·AIMC0027·AIMC0031(AIMG07), 인식 실패 AIMC0004(AIMG01), 호출결과 SYSG06
 * - TMP로 시작하는 값은 공통코드를 몰라 둔 임시 값 -> 백엔드 연결 때 교체
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

/** 캐릭터 생성 작업 상태: 공통코드 미확인 */
export const CHAR_JOB_STTS = [
  { comCd: 'TMP00041', comCdNm: '대기' },
  { comCd: 'TMP00042', comCdNm: '생성 중' },
  { comCd: 'TMP00043', comCdNm: '완료' },
  { comCd: 'TMP00044', comCdNm: '실패' },
];

/** 캐릭터 생성 작업 상태: 실패 */
export const CHAR_JOB_STTS_FAIL = 'TMP00044';

/** 외부 API 호출결과(SYSG06) */
export const CALL_RSLT = {
  SUCCESS: 'SYSC0021',
  FAIL: 'SYSC0022',
  TIMEOUT: 'SYSC0023',
};

/** 공통코드 이름: 없으면 코드 그대로 */
export const getCodeName = (codes = [], code) =>
  codes.find(({ comCd }) => comCd === code)?.comCdNm ?? code;
