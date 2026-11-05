/**
 * [채팅·펫돌봄 매칭 API] (백엔드 docs/api/community.md)
 * - 채팅방 GET /chat-rooms?unreadOnly=, GET /chat-rooms/unread-count, GET·POST /chat-rooms/{otoChatRoomSn}, POST /chat-rooms
 *   나가기 POST .../leave, 읽음 POST .../read
 * - 메시지 GET .../messages?beforeChatMsgSn=&size=(커서, 최신순), POST .../messages(multipart, idmptDmndId로 중복 방지)
 * - 사진은 비공개라 GET .../images/{atchFileSn}을 쿠키 인증으로 받는다: chatImageUrl
 * - 매칭 POST /care-matches, GET /care-matches/{petPrtcMtchSn}, POST .../accept·cancel·completion-requests·confirm-completion·confirm-receipt
 */
import { api } from '@/api/axios';

export const getChatRooms = ({ unreadOnly }) =>
  api.get('/chat-rooms', {
    params: { unreadOnly: unreadOnly || undefined },
  });

export const getChatUnreadCount = () => api.get('/chat-rooms/unread-count');

/** 상단 게시글 카드·매칭 진행 상태·내 역할 (참여자만) */
export const getChatRoom = (otoChatRoomSn) =>
  api.get(`/chat-rooms/${otoChatRoomSn}`);

export const CHAT_MESSAGE_PAGE_SIZE = 30;

/** 최신순 { content, hasNext }. beforeChatMsgSn이 없으면 가장 최근부터 */
export const getChatMessages = ({ otoChatRoomSn, beforeChatMsgSn }) =>
  api.get(`/chat-rooms/${otoChatRoomSn}/messages`, {
    params: { beforeChatMsgSn, size: CHAT_MESSAGE_PAGE_SIZE },
  });

/** 게시글·보호자·지원자 조합의 방 생성 또는 기존 방 */
export const createChatRoom = ({ pstSn }) => api.post('/chat-rooms', { pstSn });

export const readChatRoom = ({ otoChatRoomSn, lastPrslMsgSeq }) =>
  api.post(`/chat-rooms/${otoChatRoomSn}/read`, { lastPrslMsgSeq });

/** 텍스트·사진(images: File[])·주소 공유(shrnAddr·dtlAddr). 실패 뒤 같은 idmptDmndId로 다시 보내면 한 번만 저장 */
export const createChatMessage = ({
  otoChatRoomSn,
  images = [],
  ...fields
}) => {
  const body = new FormData();
  Object.entries(fields).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      body.append(key, value);
    }
  });
  images.forEach((image) => body.append('images', image));
  return api.post(`/chat-rooms/${otoChatRoomSn}/messages`, body);
};

/** 채팅 사진 주소(useFileImage에 넘긴다) */
export const chatImageUrl = (otoChatRoomSn, atchFileSn) =>
  `/chat-rooms/${otoChatRoomSn}/images/${atchFileSn}`;

export const leaveChatRoom = (otoChatRoomSn) =>
  api.post(`/chat-rooms/${otoChatRoomSn}/leave`);

/** 매칭 조건(cnd)·완료 요청 회차 */
export const getCareMatch = (petPrtcMtchSn) =>
  api.get(`/care-matches/${petPrtcMtchSn}`);

/** 매칭 요청·다시 요청(보호자): 요청 시점의 모집글 조건으로 */
export const requestCareMatch = ({ otoChatRoomSn }) =>
  api.post('/care-matches', {
    otoChatRoomSn,
    idmptDmndId: crypto.randomUUID(),
  });

export const acceptCareMatch = ({ petPrtcMtchSn }) =>
  api.post(`/care-matches/${petPrtcMtchSn}/accept`);

export const cancelCareMatch = ({ petPrtcMtchSn, cnclRsn }) =>
  api.post(`/care-matches/${petPrtcMtchSn}/cancel`, { cnclRsn });

export const requestCareCompletion = ({ petPrtcMtchSn }) =>
  api.post(`/care-matches/${petPrtcMtchSn}/completion-requests`, {
    idmptDmndId: crypto.randomUUID(),
  });

export const confirmCareCompletion = ({ petPrtcMtchSn }) =>
  api.post(`/care-matches/${petPrtcMtchSn}/confirm-completion`);

export const confirmCareReceipt = ({ petPrtcMtchSn }) =>
  api.post(`/care-matches/${petPrtcMtchSn}/confirm-receipt`, { rcvYn: true });

/** 장소 검색 가짜(실제 API 미정, 정해지면 교체). 키워드가 없으면 돌봄 글 동네 근처 장소 */
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

export const searchChatPlaces = async ({ keyword }) => {
  const word = keyword.trim();
  if (!word) return FAKE_PLACES.slice(0, 3);
  return FAKE_PLACES.filter(
    (place) => place.plcNm.includes(word) || place.addr.includes(word),
  );
};
