import { aiApi, aiStream, api } from '@/api/axios';
import { IS_DEV } from '@/api/env';
import { addDays, diffDays, getYmdOf } from '@/utils/formatDate';

/**
 * 대화 생성·목록·상세·삭제와 메시지 전송(판정·답변 SSE)은 Python AI 서버(/ai/conversations, ai 저장소 docs/api/chat.md)
 * 확인 카드(2단계 쓰기)는 messages(action·done.action)로 받고, 실행은 카드의 call로 Java, 결과는 action-result로 AI 서버
 * 영수증 분석은 AI 서버 /ai/receipts(docs/api/ocr.md), 대화창 결과 이력은 receipt-result
 * 본창이 다시 여는 인식 결과는 Spring /api/receipts/{recptSn}
 * 펫 태그: 새 대화는 선택한 반려동물 칩의 petSn([전체]면 null), 목록은 그 petSn으로 거름([전체]면 전부)
 */

const pad = (value) => String(value).padStart(2, '0');

/** 서버 regDt와 같은 모양(타임존 없는 현재 시각) */
const nowLocal = () => {
  const date = new Date();
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
};

/** 이어서 진행한 대화의 마지막 활동 시각: 서버에 갱신 시각이 없어 이 창 메모리에만 보관 */
const lastActive = new Map();

/** 이어서 진행한 대화를 목록 맨 위로 */
const touchConversation = (aiCnvrsRoomSn) =>
  lastActive.set(aiCnvrsRoomSn, nowLocal());

/** 대화 목록: 마지막 활동(lastDt, 없으면 regDt)이 최신인 순 */
export const getConversations = async (petSn) => {
  const rooms = await aiApi.get('/conversations', {
    params: petSn == null ? undefined : { petSn },
  });
  return rooms
    .map((room) => ({
      ...room,
      lastDt: lastActive.get(room.aiCnvrsRoomSn) ?? room.regDt,
    }))
    .sort((a, b) => Date.parse(b.lastDt) - Date.parse(a.lastDt));
};

/** 대화 상세 */
export const getConversation = (aiCnvrsRoomSn) =>
  aiApi.get(`/conversations/${aiCnvrsRoomSn}`);

/** 대화 삭제 */
export const deleteConversation = async (aiCnvrsRoomSn) => {
  await aiApi.delete(`/conversations/${aiCnvrsRoomSn}`);
  lastActive.delete(aiCnvrsRoomSn);
};

/** 새 대화 저장: 서버가 방과 첫 사용자 메시지 생성, 제목 결정 */
const createConversation = ({ petSn, cnvrsCn }) =>
  aiApi.post('/conversations', { petSn, cnvrsCn });

/** 스트림이 done·error 없이 닫힘 */
const STREAM_CLOSED = { code: 'STREAM_CLOSED', message: '연결이 끊겼어요' };

/**
 * 메시지 전송: 판정(intent) → 답변 조각(delta) → 끝(done)|오류(error) SSE
 * - 방이 없으면 대화 생성(첫 메시지 저장, 펫 태그 petSn) 뒤 같은 방에 cnvrsCn 없이 전송
 * - petSn은 방을 만들 때만 쓴다: 열린 방 메시지 본문에는 싣지 않는다(늘 방 태그 기준)
 * - cnvrsCn이 없으면 저장 없이 방의 마지막 사용자 메시지에 답한다([다시 시도]·[다시 생성])
 * - action: 가장 최근 처리 안 한 확인 카드 { tool, input }(회원이 고친 값 포함), 새 방에는 없음
 * - error 이벤트는 { code, message }로 실패
 */
export const sendMessage = async ({
  aiCnvrsRoomSn,
  petSn,
  cnvrsCn,
  action,
  signal,
  onRoom,
  onIntent,
  onDelta,
}) => {
  let roomSn = aiCnvrsRoomSn;
  let body = {
    ...(cnvrsCn != null && { cnvrsCn }),
    ...(action && { action }),
  };
  if (roomSn == null) {
    roomSn = (await createConversation({ petSn, cnvrsCn })).aiCnvrsRoomSn;
    body = {};
  } else if (cnvrsCn != null) {
    touchConversation(roomSn);
  }
  onRoom?.(roomSn);

  let intent = null;
  let done = null;
  let failure = null;
  await aiStream(`/conversations/${roomSn}/messages`, body, {
    signal,
    onEvent: (name, data) => {
      if (name === 'intent') {
        intent = data;
        onIntent?.(data);
      }
      if (name === 'delta') onDelta?.(data.text);
      if (name === 'done') done = data;
      if (name === 'error') failure = data;
    },
  });
  if (failure) throw failure;
  if (!done) throw STREAM_CLOSED;
  return {
    aiCnvrsRoomSn: roomSn,
    intent,
    message: done.message,
    shortcut: done.shortcut,
    action: done.action ?? null,
    execute: done.execute ?? false,
  };
};

/** 확인 카드 실행: 카드의 call로 Java 공개 API(요청 모양은 actionForm.buildActionRequest) */
export const executeAction = (request) => api.request(request);

/** 확인 카드 결과를 요약 AI 메시지로 저장(요약 글은 서버가 만든다): 저장된 ConversationMessage */
export const saveActionResult = ({ aiCnvrsRoomSn, tool, status, input }) =>
  aiApi.post(`/conversations/${aiCnvrsRoomSn}/action-result`, {
    tool,
    status,
    input,
  });

/** 건강 일지에서 연 영수증 분석의 요청 출처 */
const OCR_SOURCE_HEALTH = 'AIMC0026';
/** AI 대화창에서 연 영수증 분석의 요청 출처 */
const OCR_SOURCE_CHAT = 'AIMC0031';

/** 영수증 분석 (POST /ai/receipts, multipart): 응답 { recptSn, ocr }에 고른 반려동물 추가 */
const analyzeReceipt = async ({ file, petSn, ocrRqstSrcCd, signal }) => {
  const form = new FormData();
  form.append('file', file);
  form.append('petSn', petSn);
  form.append('ocrRqstSrcCd', ocrRqstSrcCd);
  const { recptSn, ocr } = await aiApi.post('/receipts', form, { signal });
  return { recptSn, petSn, ocr };
};

/** 검진 영수증 분석: 결과 확인 모달 입력 */
export const recognizeCheckupReceipt = ({ file, petSn, signal }) =>
  analyzeReceipt({ file, petSn, ocrRqstSrcCd: OCR_SOURCE_HEALTH, signal });

/** 대화창 영수증 분석: 함께 보낸 글은 보내지 않는다(FN-AIM-013-02) */
export const analyzeChatReceipt = ({ file, petSn, signal }) =>
  analyzeReceipt({ file, petSn, ocrRqstSrcCd: OCR_SOURCE_CHAT, signal });

/**
 * 대화창 영수증 결과 이력 저장 (POST /ai/conversations/{aiCnvrsRoomSn}/receipt-result)
 * - result: RECOGNIZED·FAILED·ERROR·CANCELED, 병원명·검진일·금액은 RECOGNIZED일 때만
 * - 방과 사진 메시지는 image-intent가 이미 저장했으므로 함께 보낸 글(cnvrsCn)은 보내지 않는다
 * - 응답: 저장한 메시지(AI 요약)
 */
export const saveReceiptResult = async ({ aiCnvrsRoomSn, result, ocr }) => {
  touchConversation(aiCnvrsRoomSn);
  let body = { result };
  if (result === 'RECOGNIZED') {
    const { hsptlNm, ckupYmd, recptAmt } = ocr;
    body = { ...body, hsptlNm, ckupYmd, recptAmt };
  }
  const messages = await aiApi.post(
    `/conversations/${aiCnvrsRoomSn}/receipt-result`,
    body,
  );
  return { aiCnvrsRoomSn, messages };
};

/**
 * 대화창 검사결과지 PDF 분석 (POST /ai/checkups/lab-results, multipart, ai 저장소 docs/api/checkup.md)
 * - 응답 { items, excludedArtclNms }, 오류 NOT_LAB_RESULT(422)·PDF_ANALYZE_TIMEOUT(504)·PDF_ANALYZE_API_ERROR(502)
 */
export const analyzeChatLabPdf = ({ file, signal }) => {
  const form = new FormData();
  form.append('file', file);
  return aiApi.post('/checkups/lab-results', form, { signal });
};

/**
 * 대화창 검사결과지 분석 결과 저장 (POST /ai/conversations/{aiCnvrsRoomSn}/checkup-card)
 * - result: RECOGNIZED·NOT_LAB_RESULT·ERROR·CANCELED, items·excludedArtclNms는 RECOGNIZED일 때만
 * - 응답 { messages: [AI 요약], action: 검사 수치 저장 확인 카드 | null, noCardReason: 'NO_CHECKUP'(검진기록 0건) | null }
 */
export const saveCheckupCard = async ({
  aiCnvrsRoomSn,
  result,
  petSn,
  items,
  excludedArtclNms,
}) => {
  touchConversation(aiCnvrsRoomSn);
  const body =
    result === 'RECOGNIZED'
      ? { result, petSn, items, excludedArtclNms }
      : { result, petSn };
  const { messages, action, noCardReason } = await aiApi.post(
    `/conversations/${aiCnvrsRoomSn}/checkup-card`,
    body,
  );
  return {
    aiCnvrsRoomSn,
    messages,
    action: action ?? null,
    noCardReason: noCardReason ?? null,
  };
};

/** 건강기록 병원 일정 종류(HLTG, 케어 캘린더) */
const HOSPITAL_SCHEDULE = 'HLTC0057';
const NEAR_SCHEDULE_DAYS = 7;

/**
 * 대화창 검진기록 만들기: 가까운 예정 병원 일정 1건 (GET /api/pets/{petSn}/care-schedules, JAJ)
 * - 건강 일지 검진기록 추가(FN-HLT-002-46)와 같은 규칙: 같은 날 병원 일정이 있으면 서버가 연결하므로 null,
 *   없으면 앞뒤 7일 안의 검진기록 없는 병원 일정 중 가장 가까운 것(거리가 같으면 먼저 등록된 일정)
 */
export const findChatNearSchedule = async ({ petSn, ckupYmd }) => {
  const schedules = await api.get(`/pets/${petSn}/care-schedules`, {
    params: {
      fromYmd: addDays(ckupYmd, -NEAR_SCHEDULE_DAYS),
      toYmd: addDays(ckupYmd, NEAR_SCHEDULE_DAYS),
      schdlKndCd: HOSPITAL_SCHEDULE,
    },
  });
  const distance = (schedule) =>
    Math.abs(diffDays(ckupYmd, getYmdOf(schedule.schdlDt)));
  if (schedules.some((schedule) => distance(schedule) === 0)) return null;
  return (
    schedules
      .filter((schedule) => schedule.ckupRcdCnt === 0)
      .sort((a, b) => distance(a) - distance(b) || a.schdlSn - b.schdlSn)[0] ??
    null
  );
};

/**
 * 대화창 검진기록 만들기 (POST /api/pets/{petSn}/checkups, JAJ)
 * - body: ckupYmd·hsptlNm·ckupTypeCd·ckupCn·ckupMemoCn, schdlSn이 있으면 그 일정을 검진일로 옮겨 연결
 * - 응답: 저장한 검진기록({ petSn, ckupRcdSn, … })
 */
export const createChatCheckup = ({ petSn, body }) =>
  api.post(`/pets/${petSn}/checkups`, body);

/**
 * 대화창에서 분석한 영수증 인식 결과 (GET /api/receipts/{recptSn}?petSn=, Spring)
 * 본창 건강 일지 결과 확인 모달용 { recptSn, petSn, ocrPrcsSttsCd, failRsn, ocr }
 */
export const getChatReceiptResult = ({ recptSn, petSn }) =>
  api.get(`/receipts/${recptSn}`, { params: { petSn } });

/** 대화창에 첨부한 사진의 종류 */
export const IMAGE_KIND = {
  CHARACTER: 'CHARACTER',
  MEDICAL_RECEIPT: 'MEDICAL_RECEIPT',
  EXPENSE_RECEIPT: 'EXPENSE_RECEIPT',
  ASK: 'ASK',
  /** PDF 첨부: 판단 LLM 없이 검사결과지 분석으로(2026-11-23) */
  CHECKUP_PDF: 'CHECKUP_PDF',
};

/**
 * 첨부 사진+글의 의도 판단 (POST /ai/image-intent, multipart): { kind, aiCnvrsRoomSn, messages }
 * - 판단 뒤 사진 턴(`[사진] <글>` + 용도별 안내)을 방에 저장, 방이 없으면(aiCnvrsRoomSn 없음) 만든다(펫 태그 petSn)
 * - 글은 공백만이면 보내지 않는다, 형식·크기 400은 저장하지 않는다
 */
export const judgeImageIntent = ({ file, cnvrsCn, petSn, aiCnvrsRoomSn }) => {
  const form = new FormData();
  form.append('file', file);
  if (cnvrsCn?.trim()) form.append('cnvrsCn', cnvrsCn);
  if (petSn != null) form.append('petSn', petSn);
  if (aiCnvrsRoomSn != null) {
    form.append('aiCnvrsRoomSn', aiCnvrsRoomSn);
    touchConversation(aiCnvrsRoomSn);
  }
  return aiApi.post('/image-intent', form);
};
