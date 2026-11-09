import { aiApi, aiStream, api } from '@/api/axios';
import { IS_DEV } from '@/api/env';

/**
 * 대화 생성·목록·상세·삭제와 메시지 전송(판정·답변 SSE)은 Python AI 서버(/ai/conversations, ai 저장소 docs/api/chat.md)
 * 일정 등록 카드는 messages(draft·done.card)·register-result로 AI 서버, 일정·케어 항목 저장(Java, JAJ)은 아직 없어 가짜
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
 * - draft: 가장 최근 등록 카드(done.card 그대로), 새 방에는 없음
 * - action: 가장 최근 처리 안 한 확인 카드 { tool, input }(회원이 고친 값 포함), 새 방에는 없음
 * - error 이벤트는 { code, message }로 실패
 */
export const sendMessage = async ({
  aiCnvrsRoomSn,
  petSn,
  cnvrsCn,
  draft,
  action,
  signal,
  onRoom,
  onIntent,
  onDelta,
}) => {
  let roomSn = aiCnvrsRoomSn;
  let body = {
    ...(cnvrsCn != null && { cnvrsCn }),
    ...(draft && { draft }),
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
    card: done.card ?? null,
    action: done.action ?? null,
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

/** 확인 카드 실행: 카드의 call로 Java 공개 API(요청 모양은 actionForm.buildActionRequest) */
export const executeAction = (request) => api.request(request);

/** 확인 카드 결과를 요약 AI 메시지로 저장(요약 글은 서버가 만든다): 저장된 ConversationMessage */
export const saveActionResult = ({ aiCnvrsRoomSn, tool, status, input }) =>
  aiApi.post(`/conversations/${aiCnvrsRoomSn}/action-result`, {
    tool,
    status,
    input,
  });

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
 * - 방이 없으면 함께 보낸 글(없으면 '영수증 분석')을 첫 메시지로 방 생성(펫 태그 petSn), 글은 재전송 없음
 * - 응답: 저장한 메시지(사용자 메시지(있으면) → AI 요약)
 */
export const saveReceiptResult = async ({
  aiCnvrsRoomSn,
  petSn,
  cnvrsCn,
  result,
  ocr,
}) => {
  const text = cnvrsCn?.trim() || null;
  let roomSn = aiCnvrsRoomSn;
  let body = { result, ...(text && { cnvrsCn: text }) };
  if (roomSn == null) {
    roomSn = (
      await createConversation({ petSn, cnvrsCn: text ?? '영수증 분석' })
    ).aiCnvrsRoomSn;
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

/** 대화창에 첨부한 사진의 종류 */
export const IMAGE_KIND = {
  CHARACTER: 'CHARACTER',
  MEDICAL_RECEIPT: 'MEDICAL_RECEIPT',
  EXPENSE_RECEIPT: 'EXPENSE_RECEIPT',
  ASK: 'ASK',
};

/** 가짜 판단의 낱말: 앞의 것부터 맞춰 본다 */
const IMAGE_KIND_WORDS = [
  [IMAGE_KIND.CHARACTER, ['캐릭터']],
  [IMAGE_KIND.MEDICAL_RECEIPT, ['진료', '병원', '검진']],
  [IMAGE_KIND.EXPENSE_RECEIPT, ['가계부', '지출', '사료', '용품']],
];

/**
 * 첨부 사진+글의 의도 판단 (AI 서버 연결 전 가짜): { kind }
 * - 사진은 보지 않고 함께 보낸 글의 낱말로만 고른다, 모르면 ASK
 * - AI 연결 때 이 함수만 실제 요청으로 바꾼다(file·cnvrsCn·petSn을 보냄)
 */
export const judgeImageIntent = async ({ cnvrsCn }) => {
  await wait(400);
  const text = cnvrsCn ?? '';
  const matched = IMAGE_KIND_WORDS.find(([, words]) =>
    words.some((word) => text.includes(word)),
  );
  return { kind: matched?.[0] ?? IMAGE_KIND.ASK };
};
