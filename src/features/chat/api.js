/**
 * [채팅 가짜 API]
 * - 채팅·매칭 API(KSJ, 백엔드 docs/api/community.md) 전까지 사용, api.get()·api.post()로 교체
 * - 읽음 위치는 localStorage 공유: 채팅 창에서 읽으면 본창 배지에도 반영
 * - 거래 상태는 이 창의 메모리에만 있어 새로고침하면 처음으로 복귀
 * - ?fakeChatRooms=0·?fakeChatForbidden=1·?fakeChatSendFail=1·?fakeChatTools=1은 개발 환경 전용
 * - 추정 필드(백엔드 문서에 없음): 목록·방의 myRole·mtchDlngSttsCd·rcrtSummary, 메시지의 sysToneCd·tagCn·photos[].url
 */
import { toYmd } from '@/utils/formatDate';
import {
  MSG_TYPE,
  MTCH_STTS,
  ROLE,
  SYS_TONE,
  getOtherRole,
  isActiveStage,
} from './shared/chatCodes';

/** 참여자 아님 오류 모양(인터셉터가 만드는 { code, message, fields }) */
const FORBIDDEN_ERROR = {
  code: 'CHAT_ROOM_ACCESS_DENIED',
  message: '참여한 채팅방만 볼 수 있어요',
  fields: null,
};

/** 서버가 단계·권한을 다시 검증하는 모양 (FN-CMU-005-11) */
const INVALID_STATE_ERROR = {
  code: 'CARE_MATCH_INVALID_STATE',
  message: '이미 처리됐거나 지금은 할 수 없는 단계예요',
  fields: null,
};

const SEND_FAIL_ERROR = {
  code: 'NETWORK_ERROR',
  message: '메시지를 보내지 못했어요',
  fields: null,
};

const READ_SEQ_STORAGE_KEY = 'fake-chat-read-seq';

/** 내 닉네임: 시스템 메시지용 */
const MY_NICKNAME = '토리맘';

const DEFAULT_SUMMARY =
  '10.13 ~ 11.26 · 매주 화·목 19:00 ~ 19:30 · 시급 15,000원';

const pad = (value) => String(value).padStart(2, '0');

/** n일 전 hh:mm → 서버 일시 형식 */
const daysAgo = (days, hour, minute) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return `${toYmd(date)}T${pad(hour)}:${pad(minute)}:00`;
};

/** 현재 시각 → 서버 일시 형식 */
const nowDateTime = () => {
  const now = new Date();
  return `${toYmd(now)}T${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
};

const baseRoom = {
  chatRoomSttsCd: 'OPEN',
  ctptProfileAtchFileSn: null,
  petPrtcMtchSn: null,
  rcrtSummary: DEFAULT_SUMMARY,
};

const fakeRooms = [
  {
    ...baseRoom,
    otoChatRoomSn: 1,
    pstSn: 101,
    pstTtl: '보리(몰티즈) 저녁 산책 도와주실 분 구해요',
    ctptMbrSn: 21,
    ctptMbrNcnm: '산책왕',
    myRole: ROLE.OWNER,
    mtchDlngSttsCd: MTCH_STTS.PRE,
    lastMsgDt: daysAgo(0, 14, 20),
  },
  {
    ...baseRoom,
    otoChatRoomSn: 2,
    pstSn: 101,
    pstTtl: '보리(몰티즈) 저녁 산책 도와주실 분 구해요',
    ctptMbrSn: 22,
    ctptMbrNcnm: '냥집사',
    myRole: ROLE.OWNER,
    mtchDlngSttsCd: MTCH_STTS.PRE,
    lastMsgDt: daysAgo(0, 13, 5),
  },
  {
    ...baseRoom,
    otoChatRoomSn: 3,
    pstSn: 101,
    pstTtl: '보리(몰티즈) 저녁 산책 도와주실 분 구해요',
    ctptMbrSn: 25,
    ctptMbrNcnm: '콩이언니',
    myRole: ROLE.OWNER,
    mtchDlngSttsCd: MTCH_STTS.PRE,
    lastMsgDt: daysAgo(1, 18, 40),
  },
  {
    ...baseRoom,
    otoChatRoomSn: 4,
    pstSn: 102,
    pstTtl: '주말 펫시터 구해요 (코리안숏헤어 2마리)',
    ctptMbrSn: 23,
    ctptMbrNcnm: '김하늘',
    myRole: ROLE.SITTER,
    mtchDlngSttsCd: MTCH_STTS.PRE,
    lastMsgDt: daysAgo(18, 18, 30),
  },
  {
    ...baseRoom,
    otoChatRoomSn: 5,
    pstSn: 103,
    pstTtl: '두부 목욕 · 미용 맡기실 분',
    ctptMbrSn: 24,
    ctptMbrNcnm: '두부아빠',
    myRole: ROLE.SITTER,
    mtchDlngSttsCd: MTCH_STTS.PRE,
    lastMsgDt: daysAgo(2, 21, 10),
  },
  {
    ...baseRoom,
    otoChatRoomSn: 6,
    pstSn: 104,
    pstTtl: '주말 고양이 방문돌봄 해주실 분',
    ctptMbrSn: 26,
    ctptMbrNcnm: '나비엄마',
    myRole: ROLE.SITTER,
    mtchDlngSttsCd: MTCH_STTS.PRE,
    lastMsgDt: daysAgo(3, 9, 15),
  },
  {
    ...baseRoom,
    otoChatRoomSn: 7,
    pstSn: 105,
    pstTtl: '콩이 놀이 돌봄 요청',
    ctptMbrSn: 27,
    ctptMbrNcnm: '놀이왕',
    myRole: ROLE.OWNER,
    mtchDlngSttsCd: MTCH_STTS.PRE,
    lastMsgDt: daysAgo(4, 16, 0),
  },
  {
    ...baseRoom,
    otoChatRoomSn: 8,
    pstSn: 106,
    pstTtl: '초코 주말 산책',
    ctptMbrSn: 28,
    ctptMbrNcnm: '초코친구',
    myRole: ROLE.SITTER,
    mtchDlngSttsCd: MTCH_STTS.PRE,
    lastMsgDt: daysAgo(5, 11, 30),
  },
  {
    ...baseRoom,
    otoChatRoomSn: 9,
    pstSn: 107,
    pstTtl: '말티즈 하루 돌봄 맡아주세요',
    ctptMbrSn: 29,
    ctptMbrNcnm: '마루네',
    myRole: ROLE.SITTER,
    mtchDlngSttsCd: MTCH_STTS.PRE,
    lastMsgDt: daysAgo(6, 10, 0),
  },
  {
    ...baseRoom,
    otoChatRoomSn: 10,
    pstSn: 108,
    pstTtl: '고양이 이틀 맡아주실 분',
    ctptMbrSn: 30,
    ctptMbrNcnm: '치즈집사',
    myRole: ROLE.SITTER,
    mtchDlngSttsCd: MTCH_STTS.PRE,
    lastMsgDt: daysAgo(7, 20, 20),
  },
];

const fakeMessages = {};

/** 방마다 지금 단계로 가는 동안의 거래 기록 */
const SEED_PLAN = {
  1: ['request'],
  3: ['request', 'cancel'],
  4: ['request', 'accept', 'doneRequest', 'confirm', 'receive'],
  5: ['request', 'accept', 'doneRequest'],
  6: ['request', 'accept'],
  7: ['request', 'accept', 'doneRequest'],
  8: ['request', 'accept', 'doneRequest', 'confirm'],
  9: ['request'],
  10: ['request', 'accept'],
};

/** 시안의 대화: 다른 것은 마지막 말뿐 */
const SEED_LAST_TEXT = {
  1: '네, 화요일 7시 전에 도착할게요!',
  2: '혹시 하네스는 따로 챙겨 가야 할까요?',
  3: '다음에 기회 되면 꼭 같이 해요 :)',
  4: '덕분에 잘 다녀왔어요. 감사합니다!',
  5: '완료 확인 부탁드려요!',
  6: '내일 10시에 방문할게요',
  7: '오늘 놀이 돌봄 끝났어요',
  8: '다녀왔어요. 사진 보내드릴게요',
  9: '조건 확인했어요. 수락 부탁드려요',
  10: '고양이가 낯을 가려요',
};

/** 처음 읽음 위치: 1·2번 방에 안 읽은 메시지 */
const INITIAL_READ_SEQ = { 1: 0, 2: 1 };

const getQueryParam = (name) =>
  import.meta.env.DEV
    ? new URLSearchParams(window.location.search).get(name)
    : null;

const loadReadSeq = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(READ_SEQ_STORAGE_KEY));
    return { ...INITIAL_READ_SEQ, ...saved };
  } catch {
    return { ...INITIAL_READ_SEQ };
  }
};

const saveReadSeq = (readSeq) => {
  try {
    localStorage.setItem(READ_SEQ_STORAGE_KEY, JSON.stringify(readSeq));
  } catch {
    /** 저장 불가 환경: 이 창 안에서만 반영 */
  }
};

const nextMsgSeq = (otoChatRoomSn) =>
  (fakeMessages[otoChatRoomSn].at(-1)?.msgSeq ?? 0) + 1;

const pushMessage = (otoChatRoomSn, message) => {
  const full = {
    chatMsgSn: Date.now() + Math.random(),
    msgSeq: nextMsgSeq(otoChatRoomSn),
    mbrSn: message.mine ? 1 : 0,
    msgCn: null,
    shrnAddr: null,
    photos: [],
    ...message,
  };
  fakeMessages[otoChatRoomSn].push(full);
  return full;
};

const pushSystem = (otoChatRoomSn, msgCn, sysToneCd = null) =>
  pushMessage(otoChatRoomSn, {
    mine: false,
    msgTypeCd: MSG_TYPE.SYSTEM,
    msgCn,
    sysToneCd,
  });

const pushText = (otoChatRoomSn, mine, msgCn, extra = {}) =>
  pushMessage(otoChatRoomSn, {
    mine,
    msgTypeCd: MSG_TYPE.TEXT,
    msgCn,
    ...extra,
  });

const getNames = (room) => {
  const isOwner = room.myRole === ROLE.OWNER;
  return {
    owner: isOwner ? MY_NICKNAME : room.ctptMbrNcnm,
    sitter: isOwner ? room.ctptMbrNcnm : MY_NICKNAME,
  };
};

/**
 * 서버가 하는 일: 단계 검사 → 상태 변경 → 두 사람에게 안내 메시지
 * - actorRole: 누른 사람의 역할, 단계나 역할이 안 맞으면 INVALID_STATE_ERROR
 */
const TRANSITIONS = {
  request: {
    role: ROLE.OWNER,
    from: [MTCH_STTS.PRE, MTCH_STTS.CANCELED],
    to: MTCH_STTS.REQUESTED,
    message: (names, room) =>
      room.mtchDlngSttsCd === MTCH_STTS.CANCELED
        ? `${names.owner}님이 현재 모집글 조건으로 다시 매칭을 요청했어요`
        : `${names.owner}님이 매칭을 요청했어요`,
  },
  cancel: {
    role: ROLE.OWNER,
    from: [MTCH_STTS.REQUESTED],
    to: MTCH_STTS.CANCELED,
    message: () => '매칭 요청이 취소됐어요',
    tone: SYS_TONE.END,
  },
  accept: {
    role: ROLE.SITTER,
    from: [MTCH_STTS.REQUESTED],
    to: MTCH_STTS.MATCHED,
    message: (names) => `${names.sitter}님이 매칭을 수락했어요 · 매칭 완료`,
    tone: SYS_TONE.KEY,
  },
  doneRequest: {
    role: ROLE.SITTER,
    from: [MTCH_STTS.MATCHED],
    to: MTCH_STTS.DONE_REQ,
    message: (names) => `${names.sitter}님이 돌봄 완료를 요청했어요`,
  },
  confirm: {
    role: ROLE.OWNER,
    from: [MTCH_STTS.DONE_REQ],
    to: MTCH_STTS.PAYING,
    message: (names) =>
      `${names.owner}님이 돌봄 완료를 확인했어요 · 약속한 비용을 전달해 주세요`,
  },
  receive: {
    role: ROLE.SITTER,
    from: [MTCH_STTS.PAYING],
    to: MTCH_STTS.COMPLETE,
    message: (names) =>
      `${names.sitter}님이 비용 수령을 확인했어요 · 거래가 완료됐어요`,
    tone: SYS_TONE.KEY,
  },
};

const applyTransition = (room, type, actorRole) => {
  const rule = TRANSITIONS[type];
  if (
    room.chatRoomSttsCd !== 'OPEN' ||
    actorRole !== rule.role ||
    !rule.from.includes(room.mtchDlngSttsCd)
  ) {
    throw INVALID_STATE_ERROR;
  }
  const message = rule.message(getNames(room), room);
  room.mtchDlngSttsCd = rule.to;
  room.petPrtcMtchSn ??= room.otoChatRoomSn * 100;
  pushSystem(room.otoChatRoomSn, message, rule.tone ?? null);
};

/** 14일 동안 응답 없음: 서버가 자동으로 정리 (개발 확인용) */
const applyTimeout = (room) => {
  if (room.mtchDlngSttsCd === MTCH_STTS.REQUESTED) {
    room.mtchDlngSttsCd = MTCH_STTS.CANCELED;
    pushSystem(
      room.otoChatRoomSn,
      '14일 동안 수락이 없어 요청이 자동 취소됐어요',
      SYS_TONE.END,
    );
  } else if (
    [MTCH_STTS.DONE_REQ, MTCH_STTS.PAYING].includes(room.mtchDlngSttsCd)
  ) {
    room.mtchDlngSttsCd = MTCH_STTS.EXPIRED;
    pushSystem(
      room.otoChatRoomSn,
      '14일간 응답이 없어 매칭이 종료됐어요',
      SYS_TONE.END,
    );
  } else {
    throw INVALID_STATE_ERROR;
  }
};

const seedRooms = () => {
  fakeRooms.forEach((room) => {
    const sn = room.otoChatRoomSn;
    room.petPrtcRcrtSn = room.pstSn;
    const peerFirst = room.myRole === ROLE.OWNER;
    fakeMessages[sn] = [];
    pushText(
      sn,
      false,
      peerFirst
        ? '안녕하세요! 보리 저녁 산책 글 보고 연락드려요. 서곡동 근처에 살고, 소형견 산책 경험이 많아요.'
        : '안녕하세요, 글 보고 연락드려요',
    );
    pushText(sn, true, '안녕하세요 :) 일정과 비용 먼저 이야기 나눌까요?');
    SEED_PLAN[sn]?.forEach((type) => {
      const rule = TRANSITIONS[type];
      applyTransition(room, type, rule.role);
    });
    pushText(sn, false, SEED_LAST_TEXT[sn]);
  });
  /** 10번 방: 상대가 나간 방 */
  const leftRoom = fakeRooms.find((room) => room.otoChatRoomSn === 10);
  leftRoom.mtchDlngSttsCd = MTCH_STTS.ABORTED;
  leftRoom.chatRoomSttsCd = 'PEER_LEFT';
  pushSystem(10, '상대방이 나갔어요', SYS_TONE.END);
};

seedRooms();

const findRoom = (otoChatRoomSn) =>
  getQueryParam('fakeChatForbidden') === '1' ||
  getQueryParam('fakeChatRooms') === '0'
    ? undefined
    : fakeRooms.find(
        (room) => room.otoChatRoomSn === otoChatRoomSn && !room.isLeft,
      );

const visibleRooms = () =>
  getQueryParam('fakeChatRooms') === '0'
    ? []
    : fakeRooms.filter((room) => !room.isLeft);

const countUnread = (otoChatRoomSn, readSeq) =>
  fakeMessages[otoChatRoomSn].filter(
    (message) =>
      !message.mine &&
      message.msgTypeCd !== MSG_TYPE.SYSTEM &&
      message.msgSeq > (readSeq[otoChatRoomSn] ?? 0),
  ).length;

const previewOf = (message) => {
  if (!message) return null;
  if (message.msgTypeCd === MSG_TYPE.IMAGE) return '사진을 보냈어요';
  if (message.msgTypeCd === MSG_TYPE.ADDRESS) return '주소를 공유했어요';
  return message.msgCn;
};

const toSummary = (room, readSeq) => ({
  ...room,
  lastMsgCn: previewOf(fakeMessages[room.otoChatRoomSn].at(-1)),
  unreadCnt: countUnread(room.otoChatRoomSn, readSeq),
});

export const getChatRooms = async ({ unreadOnly }) => {
  const readSeq = loadReadSeq();
  const summaries = visibleRooms().map((room) => toSummary(room, readSeq));
  return unreadOnly
    ? summaries.filter((room) => room.unreadCnt > 0)
    : summaries;
};

export const getChatUnreadCount = async () => {
  const readSeq = loadReadSeq();
  return {
    unreadCnt: visibleRooms().reduce(
      (sum, room) => sum + countUnread(room.otoChatRoomSn, readSeq),
      0,
    ),
  };
};

/** 상단 게시글 카드·매칭 진행 상태·내 역할 (참여자만) */
export const getChatRoom = async (otoChatRoomSn) => {
  const room = findRoom(otoChatRoomSn);
  if (!room) throw FORBIDDEN_ERROR;
  return { ...room };
};

export const getChatMessages = async (otoChatRoomSn) => {
  if (!findRoom(otoChatRoomSn)) throw FORBIDDEN_ERROR;
  return fakeMessages[otoChatRoomSn].map((message) => ({ ...message }));
};

/** 게시글·보호자·지원자 조합의 방 생성 또는 기존 방 (남의 글에 지원: 내 역할은 돌보미) */
export const createChatRoom = async ({ pstSn }) => {
  const existing = fakeRooms.find(
    (room) => room.pstSn === pstSn && room.myRole === ROLE.SITTER,
  );
  if (existing) {
    existing.isLeft = false;
    return { otoChatRoomSn: existing.otoChatRoomSn };
  }

  const otoChatRoomSn =
    Math.max(...fakeRooms.map((room) => room.otoChatRoomSn)) + 1;
  fakeRooms.push({
    ...baseRoom,
    otoChatRoomSn,
    pstSn,
    petPrtcRcrtSn: pstSn,
    pstTtl: `게시글 ${pstSn}`,
    ctptMbrSn: 0,
    ctptMbrNcnm: '작성자',
    myRole: ROLE.SITTER,
    mtchDlngSttsCd: MTCH_STTS.PRE,
    lastMsgDt: null,
  });
  fakeMessages[otoChatRoomSn] = [];
  return { otoChatRoomSn };
};

export const readChatRoom = async ({ otoChatRoomSn, lastPrslMsgSeq }) => {
  const readSeq = loadReadSeq();
  if (lastPrslMsgSeq <= (readSeq[otoChatRoomSn] ?? 0)) return;
  saveReadSeq({ ...readSeq, [otoChatRoomSn]: lastPrslMsgSeq });
};

const failedIds = new Set();

/** 텍스트·사진·주소 공유. 사진은 photoUrls(미리보기 주소)로 대체 */
export const createChatMessage = async ({ otoChatRoomSn, ...body }) => {
  const room = findRoom(otoChatRoomSn);
  if (!room) throw FORBIDDEN_ERROR;
  if (room.chatRoomSttsCd !== 'OPEN') throw INVALID_STATE_ERROR;

  const messages = fakeMessages[otoChatRoomSn];
  const duplicate = messages.find(
    (message) => message.idmptDmndId === body.idmptDmndId,
  );
  if (duplicate) return { ...duplicate };

  /** 같은 요청 ID로 다시 보내면 성공: 재시도 확인용 */
  if (
    getQueryParam('fakeChatSendFail') === '1' &&
    !failedIds.has(body.idmptDmndId)
  ) {
    failedIds.add(body.idmptDmndId);
    throw SEND_FAIL_ERROR;
  }

  const message = pushMessage(otoChatRoomSn, {
    mine: true,
    msgTypeCd: body.msgTypeCd,
    msgCn: body.msgCn ?? null,
    shrnAddr: body.shrnAddr ?? null,
    tagCn: body.tagCn ?? null,
    photos: (body.photoUrls ?? []).map((url, index) => ({
      atchFileSn: index + 1,
      sortSeq: index + 1,
      url,
    })),
    idmptDmndId: body.idmptDmndId,
  });
  room.lastMsgDt = nowDateTime();
  return { ...message };
};

/** 매칭 요청·다시 요청 (POST /care-matches) */
export const requestCareMatch = async ({ otoChatRoomSn }) => {
  const room = findRoom(otoChatRoomSn);
  if (!room) throw FORBIDDEN_ERROR;
  applyTransition(room, 'request', room.myRole);
  room.lastMsgDt = nowDateTime();
};

const makeTransitionApi = (type) => async (otoChatRoomSn) => {
  const room = findRoom(otoChatRoomSn);
  if (!room) throw FORBIDDEN_ERROR;
  applyTransition(room, type, room.myRole);
  room.lastMsgDt = nowDateTime();
};

export const cancelCareMatch = makeTransitionApi('cancel');
export const acceptCareMatch = makeTransitionApi('accept');
export const requestCareCompletion = makeTransitionApi('doneRequest');
export const confirmCareCompletion = makeTransitionApi('confirm');
export const confirmCareReceipt = makeTransitionApi('receive');

/** 채팅방 나가기: 진행 중이면 매칭 취소, 내 목록에서만 숨기기 */
export const leaveChatRoom = async (otoChatRoomSn) => {
  const room = findRoom(otoChatRoomSn);
  if (!room) throw FORBIDDEN_ERROR;
  room.isLeft = true;
  if (isActiveStage(room.mtchDlngSttsCd)) {
    room.mtchDlngSttsCd = MTCH_STTS.ABORTED;
  }
};

const FAKE_PLACES = [
  {
    placeSn: 1,
    plcNm: '늘봄아파트',
    addr: '전주시 완산구 서곡동 늘봄아파트',
    lat: 35.8412,
    lng: 127.1081,
  },
  {
    placeSn: 2,
    plcNm: '서곡공원',
    addr: '전주시 완산구 서곡동 서곡공원',
    lat: 35.8425,
    lng: 127.1102,
  },
  {
    placeSn: 3,
    plcNm: '서곡초등학교 정문',
    addr: '전주시 완산구 서곡동 서곡초등학교 정문',
    lat: 35.8398,
    lng: 127.1068,
  },
  {
    placeSn: 4,
    plcNm: '효자동 주민센터',
    addr: '전주시 완산구 효자동 주민센터',
    lat: 35.8127,
    lng: 127.1019,
  },
];

/** 장소 검색(YAY, GET /places 예정). 키워드가 없으면 돌봄 글 동네 근처 장소 */
export const searchChatPlaces = async ({ keyword }) => {
  const word = keyword.trim();
  if (!word) return FAKE_PLACES.slice(0, 3);
  return FAKE_PLACES.filter(
    (place) => place.plcNm.includes(word) || place.addr.includes(word),
  );
};

/**
 * 개발 확인용: 상대가 한 일을 흉내 낸다 (type: accept·doneRequest·confirm·receive·cancel·timeout·leave·say)
 * - 실제로는 서버가 상대의 요청으로 상태 변경, 이 창은 목록·방 조회로 수신
 */
export const fakePeerAct = async ({ otoChatRoomSn, type }) => {
  const room = findRoom(otoChatRoomSn);
  if (!room) throw FORBIDDEN_ERROR;
  const peerRole = getOtherRole(room.myRole);

  if (type === 'timeout') {
    applyTimeout(room);
  } else if (type === 'leave') {
    if (isActiveStage(room.mtchDlngSttsCd)) {
      room.mtchDlngSttsCd = MTCH_STTS.ABORTED;
    }
    room.chatRoomSttsCd = 'PEER_LEFT';
    pushSystem(otoChatRoomSn, '상대방이 나갔어요', SYS_TONE.END);
  } else if (type === 'say') {
    pushText(otoChatRoomSn, false, '확인했어요, 감사합니다 :)');
  } else {
    applyTransition(room, type, peerRole);
  }
  room.lastMsgDt = nowDateTime();
};
