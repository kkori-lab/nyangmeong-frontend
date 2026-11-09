/**
 * AI 대화창(별도 창) → 본창 쓰기 알림: 확인 카드 저장이 성공하면 본창이 데이터를 다시 불러온다
 * - 같은 오리진 창끼리 BroadcastChannel, 지원하지 않는 브라우저는 알리지 않는다
 */
const CHANNEL_NAME = 'nyangmeong-ai-write';

const isSupported = () => typeof BroadcastChannel !== 'undefined';

/** 쓰기 알림: { domain, petSn } */
export const notifyAiWrite = (payload) => {
  if (!isSupported()) return;
  const channel = new BroadcastChannel(CHANNEL_NAME);
  channel.postMessage(payload);
  channel.close();
};

/** 쓰기 알림 받기: 해제 함수 반환 */
export const subscribeAiWrite = (onWrite) => {
  if (!isSupported()) return () => {};
  const channel = new BroadcastChannel(CHANNEL_NAME);
  channel.onmessage = (event) => onWrite(event.data);
  return () => channel.close();
};
