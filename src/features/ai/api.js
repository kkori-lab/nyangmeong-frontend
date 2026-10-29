import { aiApi, aiStream } from '@/api/axios';
import { IS_DEV } from '@/api/env';
import { AI_ROLE } from './shared/aiCodes';
import { fakePets } from './chat/fakePets';

/**
 * 대화 생성·목록·상세·삭제와 메시지 전송(판정·답변 SSE)은 Python AI 서버(/ai/conversations, ai 저장소 docs/api/chat.md)
 * 일정 등록 카드는 messages(draft·done.card)·register-result로 AI 서버, 일정·케어 항목 저장(Java, JAJ)은 아직 없어 가짜
 * 영수증은 서버 API가 아직 없어 가짜
 * 펫 태그: 반려동물 목록(pet, SJM) 연결 전이라 서버에는 petSn을 보내지 않고 목록도 petSn 없이 조회
 */

/** 서버에 없는 메시지(영수증 가짜): 대화 번호 → 가짜 메시지(새로고침하면 사라짐) */
const fakeMessages = new Map();
const getFakeMessages = (aiCnvrsRoomSn) =>
  fakeMessages.get(aiCnvrsRoomSn) ?? [];

/** 서버 번호와 겹치지 않는 가짜 메시지 번호 */
let nextFakeMsgSn = -1;

const pad = (value) => String(value).padStart(2, '0');

/** 서버 regDt와 같은 모양(타임존 없는 현재 시각) */
const nowLocal = () => {
  const date = new Date();
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
};

const addFakeMessage = (aiCnvrsRoomSn, roleCd, cnvrsCn) => {
  const message = {
    aiCnvrsMsgSn: nextFakeMsgSn--,
    roleCd,
    cnvrsCn,
    regDt: nowLocal(),
    cmptnYn: true,
  };
  fakeMessages.set(aiCnvrsRoomSn, [...getFakeMessages(aiCnvrsRoomSn), message]);
  return message;
};

/** AI 메시지 저장 */
const saveAiMessage = (aiCnvrsRoomSn, cnvrsCn) =>
  addFakeMessage(aiCnvrsRoomSn, AI_ROLE.AI, cnvrsCn);

/** 이어서 진행한 대화의 마지막 활동 시각: 서버에 갱신 시각이 없어 이 창 메모리에만 있다 */
const lastActive = new Map();

/** 대화를 이어서 진행하면 목록 맨 위로 올린다 */
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

/** 대화 상세: 서버 메시지와 가짜 메시지를 시각 순으로 합친다 */
export const getConversation = async (aiCnvrsRoomSn) => {
  const room = await aiApi.get(`/conversations/${aiCnvrsRoomSn}`);
  return {
    ...room,
    messages: [...room.messages, ...getFakeMessages(aiCnvrsRoomSn)].sort(
      (a, b) => Date.parse(a.regDt) - Date.parse(b.regDt),
    ),
  };
};

/** 대화 삭제 */
export const deleteConversation = async (aiCnvrsRoomSn) => {
  await aiApi.delete(`/conversations/${aiCnvrsRoomSn}`);
  fakeMessages.delete(aiCnvrsRoomSn);
  lastActive.delete(aiCnvrsRoomSn);
};

/** 새 대화 저장: 서버가 방과 첫 사용자 메시지를 만들고 제목을 정한다 */
const createConversation = (cnvrsCn) =>
  aiApi.post('/conversations', { petSn: null, cnvrsCn });

/** 스트림이 done·error 없이 닫힘 */
const STREAM_CLOSED = { code: 'STREAM_CLOSED', message: '연결이 끊겼어요' };

/**
 * 메시지 전송: 판정(intent) → 답변 조각(delta) → 끝(done)|오류(error) SSE
 * - 방이 없으면 대화를 만들고(첫 메시지 저장) 같은 방에 cnvrsCn 없이 보낸다
 * - cnvrsCn이 없으면 저장 없이 방의 마지막 사용자 메시지에 답한다([다시 시도]·[다시 생성])
 * - draft: 가장 최근 등록 카드(done.card 그대로), 새 방에는 없다
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

/** 가짜 응답 대기: signal이 중단되면 AbortError */
const waitAbortable = (ms, signal) =>
  new Promise((resolve, reject) => {
    const abort = () => reject(new DOMException('중단', 'AbortError'));
    if (signal.aborted) return abort();
    const timer = setTimeout(() => {
      signal.removeEventListener('abort', onAbort);
      resolve();
    }, ms);
    const onAbort = () => {
      clearTimeout(timer);
      abort();
    };
    signal.addEventListener('abort', onAbort, { once: true });
  });

/** 건강 일지에서 연 영수증 분석의 요청 출처 */
const OCR_SOURCE_HEALTH = 'AIMC0026';

/**
 * 검진 영수증 분석 (POST /ai/receipts, multipart)
 * 응답 { recptSn, ocr }에 고른 반려동물을 붙여 결과 확인 모달로 넘긴다
 */
export const recognizeCheckupReceipt = async ({ file, petSn, signal }) => {
  const form = new FormData();
  form.append('file', file);
  form.append('petSn', petSn);
  form.append('ocrRqstSrcCd', OCR_SOURCE_HEALTH);
  const { recptSn, ocr } = await aiApi.post('/receipts', form, { signal });
  return { recptSn, petSn, ocr };
};

/** 본창이 읽을 가짜 분석 결과: 창마다 메모리가 달라 localStorage 사용 */
const fakeChatReceiptKey = (recptSn) => `fakeChatReceipt:${recptSn}`;

const saveFakeChatReceipt = (result) => {
  try {
    localStorage.setItem(
      fakeChatReceiptKey(result.recptSn),
      JSON.stringify(result),
    );
  } catch {
    /** 저장소를 못 쓰면 본창 조회 실패로 처리 */
  }
};

/**
 * 대화창 영수증 인식 결과 조회 (경로 미정)
 * 건강 일지 결과 확인 모달(SCR-HLT-002)이 받는 { recptSn, petSn, ocr } 모양(검진 영수증 분석 응답과 같다)
 */
export const getChatReceiptResult = async (rcptSn) => {
  await wait(200);
  let saved = null;
  try {
    saved = localStorage.getItem(fakeChatReceiptKey(rcptSn));
  } catch {
    saved = null;
  }
  if (!saved) throw new Error('not found');
  return JSON.parse(saved);
};

/** 대화 이력용 영수증 분석 요약 한 줄(FN-AIM-013-09) */
const summarizeReceipt = ({ hsptlNm, ckupYmd, recptAmt }) => {
  const [, month, day] = ckupYmd ? ckupYmd.split('-').map(Number) : [];
  const parts = [
    hsptlNm,
    ckupYmd && `${month}월 ${day}일`,
    recptAmt != null && `${recptAmt.toLocaleString()}원`,
  ].filter(Boolean);
  return `영수증 분석 — ${parts.join(', ')}`;
};

/**
 * 대화창 영수증 분석 (경로 미정, Python AI 서버 `/ai/` 아래)
 * 가짜 응답: 파일 이름의 slow(20초)·error(오류)·fail(추출 0건)·partial(일부 인식)에 따른 상황
 * 인식되면 요약 한 줄을 AI 메시지로 저장, 필드 이름은 연결 때 Swagger로 확인
 */
export const analyzeChatReceipt = async ({
  aiCnvrsRoomSn,
  petSn,
  file,
  text,
  signal,
}) => {
  await waitAbortable(file.name.includes('slow') ? 20000 : 2000, signal);
  if (file.name.includes('error')) throw new Error('일시 오류');
  const recptSn = Date.now();
  if (file.name.includes('fail')) {
    return {
      aiCnvrsRoomSn,
      recptSn,
      hsptlNm: null,
      ckupYmd: null,
      recptAmt: null,
      petAmts: [],
      prscrptnCnt: null,
    };
  }

  const pet = fakePets.find((item) => item.petSn === petSn);
  const otherPet = fakePets.find((item) => item.petSn !== petSn);
  const result = file.name.includes('partial')
    ? {
        hsptlNm: '메이 동물병원',
        ckupYmd: null,
        recptAmt: 145000,
        petAmts: [{ petSn, petNm: pet.petNm, amt: null }],
        prscrptnCnt: null,
      }
    : {
        hsptlNm: '메이 동물병원',
        ckupYmd: '2026-10-20',
        recptAmt: 145000,
        petAmts: [
          { petSn, petNm: pet.petNm, amt: 85000 },
          { petSn: otherPet.petSn, petNm: otherPet.petNm, amt: 60000 },
        ],
        prscrptnCnt: 2,
      };

  const roomSn =
    aiCnvrsRoomSn ??
    (await createConversation(text?.trim() || '영수증 분석')).aiCnvrsRoomSn;
  if (aiCnvrsRoomSn != null) touchConversation(roomSn);
  /** 이미지는 이력에 남기지 않고 요약만 저장(FN-AIM-013-08·09) */
  const summary = saveAiMessage(roomSn, summarizeReceipt(result));
  saveFakeChatReceipt({
    recptSn,
    petSn,
    ocr: {
      hsptlNm: result.hsptlNm,
      ckupYmd: result.ckupYmd,
      recptAmt: result.recptAmt,
      btmDscntAmt: 0,
      sections: result.petAmts.map((petAmt) => ({
        sectionNm: petAmt.petNm,
        sbttlAmt: petAmt.amt,
        dscntAmt: 0,
        items: [{ itemNm: '종합검진', itemAmt: petAmt.amt }],
        drugs: [],
      })),
    },
  });
  return {
    aiCnvrsRoomSn: roomSn,
    aiCnvrsMsgSn: summary.aiCnvrsMsgSn,
    recptSn,
    ...result,
  };
};

/**
 * 대화창 영수증 분석 취소 (영수증 상태 '취소', FN-AIM-013-04)
 * 가짜 응답: 저장 없음, 연결 때 recptSn 기준 취소 요청으로 교체
 */
export const cancelChatReceipt = async () => {
  await wait(150);
};
