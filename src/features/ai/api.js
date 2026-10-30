import { aiApi, aiStream, api } from '@/api/axios';
import { IS_DEV } from '@/api/env';

/**
 * 대화 생성·목록·상세·삭제와 메시지 전송(판정·답변 SSE)은 Python AI 서버(/ai/conversations, ai 저장소 docs/api/chat.md)
 * 일정 등록 카드는 messages(draft·done.card)·register-result로 AI 서버, 일정·케어 항목 저장(Java, JAJ)은 아직 없어 가짜
 * 영수증 분석은 AI 서버 /ai/receipts(docs/api/ocr.md), 대화창 결과 이력은 receipt-result
 * 본창이 다시 여는 인식 결과는 Spring /api/receipts/{recptSn}
 * 펫 태그: 반려동물 목록(pet, SJM) 연결 전이라 서버에는 petSn을 보내지 않고 목록도 petSn 없이 조회
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
export const getConversations = async () => {
  const rooms = await aiApi.get('/conversations');
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
const createConversation = (cnvrsCn) =>
  aiApi.post('/conversations', { petSn: null, cnvrsCn });

/** 스트림이 done·error 없이 닫힘 */
const STREAM_CLOSED = { code: 'STREAM_CLOSED', message: '연결이 끊겼어요' };

/**
 * 메시지 전송: 판정(intent) → 답변 조각(delta) → 끝(done)|오류(error) SSE
 * - 방이 없으면 대화 생성(첫 메시지 저장) 뒤 같은 방에 cnvrsCn 없이 전송
 * - cnvrsCn이 없으면 저장 없이 방의 마지막 사용자 메시지에 답한다([다시 시도]·[다시 생성])
 * - draft: 가장 최근 등록 카드(done.card 그대로), 새 방에는 없음
 * - error 이벤트는 { code, message }로 실패
 */
export const sendMessage = async ({
  aiCnvrsRoomSn,
  cnvrsCn,
  draft,
  signal,
  onRoom,
  onIntent,
  onDelta,
}) => {
  let roomSn = aiCnvrsRoomSn;
  let body = {
    ...(cnvrsCn != null && { cnvrsCn }),
    ...(draft && { draft }),
  };
  if (roomSn == null) {
    roomSn = (await createConversation(cnvrsCn)).aiCnvrsRoomSn;
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
    card: done.card ?? null,
  };
};

/** 일정·케어 항목 저장 (Java, JAJ 연결 전 가짜): 출처 HLTC0067 AI 생성 */
const registerToHealth = async () => {
  await wait(300);
  if (fakeFlagOnce('fakeRegisterError')) throw new Error('register error');
};

/** 등록 카드 결과를 요약 AI 메시지로 저장: 저장된 ConversationMessage */
const saveRegisterResult = ({ aiCnvrsRoomSn, result, card }) =>
  aiApi.post(`/conversations/${aiCnvrsRoomSn}/register-result`, {
    result,
    card,
  });

/** 등록 확정: 저장한 뒤 결과 저장 */
export const confirmRegister = async ({ aiCnvrsRoomSn, card }) => {
  await registerToHealth(card);
  return saveRegisterResult({ aiCnvrsRoomSn, result: 'REGISTERED', card });
};

/** 등록 취소 */
export const cancelRegister = ({ aiCnvrsRoomSn, card }) =>
  saveRegisterResult({ aiCnvrsRoomSn, result: 'CANCELED', card });

/** 개발 환경 전용 실패 상황 쿼리 */
const fakeFlag = (name) =>
  IS_DEV ? new URLSearchParams(window.location.search).get(name) : null;

/** 첫 요청에만 실패 상황 적용: 재시도 성공 확인용 */
const usedFakeFlags = new Set();
const fakeFlagOnce = (name) => {
  if (usedFakeFlags.has(name)) return null;
  const value = fakeFlag(name);
  if (value !== null) usedFakeFlags.add(name);
  return value;
};

const wait = (ms, signal) =>
  new Promise((resolve) => {
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener('abort', () => {
      clearTimeout(timer);
      resolve();
    });
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
 * - 방이 없으면 함께 보낸 글(없으면 '영수증 분석')을 첫 메시지로 방 생성, 글은 재전송 없음
 * - 응답: 저장한 메시지(사용자 메시지(있으면) → AI 요약)
 */
export const saveReceiptResult = async ({
  aiCnvrsRoomSn,
  cnvrsCn,
  result,
  ocr,
}) => {
  const text = cnvrsCn?.trim() || null;
  let roomSn = aiCnvrsRoomSn;
  let body = { result, ...(text && { cnvrsCn: text }) };
  if (roomSn == null) {
    roomSn = (await createConversation(text ?? '영수증 분석')).aiCnvrsRoomSn;
    body = { result };
  } else {
    touchConversation(roomSn);
  }
  if (result === 'RECOGNIZED') {
    const { hsptlNm, ckupYmd, recptAmt } = ocr;
    body = { ...body, hsptlNm, ckupYmd, recptAmt };
  }
  const messages = await aiApi.post(
    `/conversations/${roomSn}/receipt-result`,
    body,
  );
  return { aiCnvrsRoomSn: roomSn, messages };
};

/**
 * 대화창에서 분석한 영수증 인식 결과 (GET /api/receipts/{recptSn}?petSn=, Spring)
 * 본창 건강 일지 결과 확인 모달용 { recptSn, petSn, ocrPrcsSttsCd, failRsn, ocr }
 */
export const getChatReceiptResult = ({ recptSn, petSn }) =>
  api.get(`/receipts/${recptSn}`, { params: { petSn } });
