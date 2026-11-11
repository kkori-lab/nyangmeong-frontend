import { useCallback } from 'react';
import { useAiModal } from '@/context/aiModal';

/** 고정된 창 이름: `/ai` 주소로 따로 연 창을 닫을 때 */
const AI_WINDOW_NAME = 'nyangmeong-ai';

/** 본창 ↔ AI 창 첨부 사진 전달 채널: `/ai?attach=` 주소로 연 창(AiChatPage)만 쓴다 */
const ATTACH_CHANNEL = 'nyangmeong-ai-attach';
/** AI 창이 사진을 기다리는 시간 */
const ATTACH_WAIT_MS = 3000;

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

/**
 * AI 매니저 열기: 모든 폭에서 같은 창의 AI 모달(사람 결정 2026-11-11, 새 창 안 씀)
 * open(firstMessage?, file?, origin?)
 * - origin: { from: 'input', rect } 메인 검색창 자리에서 / { from: 'fab' } 플로팅 버튼에서 / 없으면 그냥 열기
 */
export default function useAiWindow() {
  const { open: openAiModal } = useAiModal();
  return useCallback(
    (firstMessage, file, origin) => openAiModal(firstMessage, file, origin),
    [openAiModal],
  );
}
