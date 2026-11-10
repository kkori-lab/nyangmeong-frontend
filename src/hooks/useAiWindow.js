import { useCallback } from 'react';
import { useAiModal } from '@/context/aiModal';
import { PATHS } from '@/routes/paths';

/** 고정된 창 이름: window.open이 기존 채팅 창 재사용 */
const AI_WINDOW_NAME = 'nyangmeong-ai';

/** 새 창 대신 모달로 여는 폭 (사람 결정 2026-11-09) */
const MODAL_QUERY = '(max-width: 760px)';

/** 본창 ↔ AI 창 첨부 사진 전달 채널(같은 origin의 모든 창) */
const ATTACH_CHANNEL = 'nyangmeong-ai-attach';
/** 본창이 사진을 잡아 두는 시간: AI 창이 이 안에 요청하지 않으면 버림 */
const ATTACH_HOLD_MS = 60_000;
/** AI 창이 사진을 기다리는 시간 */
const ATTACH_WAIT_MS = 3000;

/**
 * 본창: 사진을 메모리에 잡아 두고 번호 반환
 * - AI 창이 그 번호로 요청하면 File 전달 뒤 채널 닫기
 * - AI 창을 연 탭이 아니어도 같은 origin이면 전달(이미 열린 창 재사용 대비)
 */
const holdAttachment = (file) => {
  const attachId = crypto.randomUUID();
  const channel = new BroadcastChannel(ATTACH_CHANNEL);
  const timer = setTimeout(() => channel.close(), ATTACH_HOLD_MS);
  channel.onmessage = ({ data }) => {
    if (data?.type !== 'request' || data.attachId !== attachId) return;
    channel.postMessage({ type: 'file', attachId, file });
    clearTimeout(timer);
    channel.close();
  };
  return attachId;
};

/** AI 창: 번호로 본창에 사진 요청, 본창이 닫혔거나 시간 안에 못 받으면 null */
export const receiveAttachment = (attachId) =>
  new Promise((resolve) => {
    const channel = new BroadcastChannel(ATTACH_CHANNEL);
    const finish = (file) => {
      clearTimeout(timer);
      channel.close();
      resolve(file);
    };
    const timer = setTimeout(() => finish(null), ATTACH_WAIT_MS);
    channel.onmessage = ({ data }) => {
      if (data?.type === 'file' && data.attachId === attachId) {
        finish(data.file);
      }
    };
    channel.postMessage({ type: 'request', attachId });
  });

/** 열린 AI 창 닫기 */
export function closeAiWindow() {
  window.open('', AI_WINDOW_NAME)?.close();
}

/** open(firstMessage?, file?) 반환, 창·모달 열림 true·팝업 차단 false */
export default function useAiWindow() {
  const { open: openAiModal } = useAiModal();
  return useCallback(
    (firstMessage, file) => {
      /** 760px 이하: 같은 창의 모달 */
      if (window.matchMedia(MODAL_QUERY).matches) {
        openAiModal(firstMessage, file);
        return true;
      }
      /** 빈 URL: 기존 창 재사용 */
      const aiWindow = window.open('', AI_WINDOW_NAME);
      if (!aiWindow) return false;

      if (aiWindow.location.href === 'about:blank' || firstMessage || file) {
        /** 새 창이거나 첫 메시지·사진이 있으면 채팅 페이지로 이동: 열린 창도 그 내용으로 새 대화 */
        const params = new URLSearchParams();
        if (firstMessage) params.set('q', firstMessage);
        if (file) params.set('attach', holdAttachment(file));
        const query = params.size > 0 ? `?${params}` : '';
        aiWindow.location.href = `${PATHS.AI}${query}`;
      }
      aiWindow.focus();
      return true;
    },
    [openAiModal],
  );
}
