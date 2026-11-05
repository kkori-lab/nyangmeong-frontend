/**
 * [채팅 실시간 수신] (백엔드 docs/api/community.md 「실시간」)
 * - STOMP over WebSocket /ws, 로그인 쿠키로 인증. /user/queue/chat 구독으로 { type: MESSAGE | READ, ... } 수신
 * - 지금 보는 방을 /app/chat/view로 알림(보는 방이면 서버가 거래 알림을 만들지 않음)
 * - 연결은 쓰는 화면이 하나라도 있을 때만: retainChatRealtime이 돌려준 해제 함수로 끝
 */
import { Client } from '@stomp/stompjs';

const SUBSCRIBE_DESTINATION = '/user/queue/chat';
const VIEW_DESTINATION = '/app/chat/view';

let client = null;
let users = 0;
let handleEvent = null;
let viewingRoomSn = null;

const brokerURL = () =>
  `${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}/ws`;

const publishView = () => {
  if (!client?.connected) return;
  client.publish({
    destination: VIEW_DESTINATION,
    body: JSON.stringify({ otoChatRoomSn: viewingRoomSn }),
  });
};

const connect = () => {
  client = new Client({
    brokerURL: brokerURL(),
    /** 끊기거나 인증 만료로 거절되면 5초 뒤 다시(쿠키는 axios 재발급이 갱신) */
    reconnectDelay: 5000,
    heartbeatIncoming: 10000,
    heartbeatOutgoing: 10000,
    onConnect: () => {
      client.subscribe(SUBSCRIBE_DESTINATION, (frame) => {
        try {
          handleEvent?.(JSON.parse(frame.body));
        } catch {
          /** 모르는 모양의 프레임은 무시 */
        }
      });
      publishView();
    },
  });
  client.activate();
};

/** 연결을 쓴다: onEvent는 마지막에 넘긴 것 하나만(캐시 반영 중복 방지). 돌려준 함수로 해제 */
export const retainChatRealtime = (onEvent) => {
  handleEvent = onEvent;
  users += 1;
  if (!client) connect();
  return () => {
    users -= 1;
    if (users > 0) return;
    const closing = client;
    client = null;
    closing?.deactivate();
  };
};

/** 지금 보는 방(없으면 null) */
export const setViewingChatRoom = (otoChatRoomSn) => {
  viewingRoomSn = otoChatRoomSn;
  publishView();
};
