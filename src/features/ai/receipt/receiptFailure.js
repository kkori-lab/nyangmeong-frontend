/**
 * [영수증 분석 실패 안내]
 * - 업로드 모달(SCR-AIM-008)과 대화창 영수증 분석(SCR-AIM-013) 공용
 * - 문구는 SCR-AIM-010 기준
 */

/** 분석이 이 시간을 넘기면 일시 오류로 판정(FN-AIM-008-07) */
export const ANALYZE_TIMEOUT_MS = 15000;

/**
 * AI 서버로 분석할 때의 안전망: 서버가 15초에 OCR_TIMEOUT으로 끝내므로 그보다 늦게 끊기
 * 화면이 먼저 끊으면 서버에는 '취소'로 기록
 */
export const SERVER_ANALYZE_GUARD_MS = 20000;

/** 서버가 거절한 파일: 업로드 전 검사(utils/receiptFile)와 같은 문구 */
export const FILE_ERROR = {
  FILE_TYPE_NOT_ALLOWED:
    '지원하지 않는 형식이에요. jpg·jpeg·png·webp 이미지를 올려 주세요',
  FILE_SIZE_EXCEEDED: '용량이 너무 커요. 10MB 이하 이미지를 올려 주세요',
};

/** 서버 오류 code → 실패 안내 종류 */
export const getFailureByCode = (code) =>
  code === 'OCR_TIMEOUT' ? 'timeout' : 'error';

/** 200인데 아무것도 읽지 못한 결과(추출 0건) */
export const isEmptyOcr = (ocr) =>
  ocr.sections.length === 0 &&
  [ocr.hsptlNm, ocr.ckupYmd, ocr.recptAmt, ocr.btmDscntAmt].every(
    (value) => value == null,
  );

export const FAILURE = {
  empty: {
    title: '영수증을 읽지 못했어요',
    message: '글씨가 흐리거나 접힌 부분이 있으면 인식이 어려울 수 있어요.',
    noteStyle: 'border-danger/30 bg-danger-soft text-danger',
  },
  timeout: {
    title: '분석을 끝내지 못했어요',
    message: '분석이 오래 걸려 멈췄어요. 다시 올리거나 직접 입력해 주세요.',
    noteStyle: 'border-warn-line bg-warn-soft text-warn',
  },
  error: {
    title: '분석을 끝내지 못했어요',
    message:
      '일시적인 오류가 생겼어요. 잠시 후 다시 올리거나 직접 입력해 주세요.',
    noteStyle: 'border-warn-line bg-warn-soft text-warn',
  },
};

/** Java 영수증 상태(AIMG01) 인식 실패 */
const RECEIPT_NOT_RECOGNIZED = 'AIMC0004';

/** 본창에서 다시 연 결과를 받지 못했거나 보여 줄 상태가 아닐 때 */
export const CHAT_RECEIPT_LOAD_ERROR = '영수증 분석 결과를 불러오지 못했어요';

/** 본창에서 다시 연 결과(GET /api/receipts/{recptSn})에 ocr이 없을 때 안내 */
export const getChatReceiptFailure = ({ ocrPrcsSttsCd, failRsn }) => {
  if (failRsn === 'TIMEOUT') return FAILURE.timeout.title;
  if (failRsn === 'API_ERROR') return FAILURE.error.title;
  if (ocrPrcsSttsCd === RECEIPT_NOT_RECOGNIZED) return FAILURE.empty.title;
  return CHAT_RECEIPT_LOAD_ERROR;
};
