import { useCallback } from 'react';
import { PATHS } from '@/routes/paths';

/** 고정된 창 이름: window.open이 기존 채팅 창 재사용 */
const AI_WINDOW_NAME = 'nyangmeong-ai';

/** 열린 AI 창 닫기 */
export function closeAiWindow() {
  window.open('', AI_WINDOW_NAME)?.close();
}

/** open(firstMessage?) 반환, 창 열림 true·팝업 차단 false */
export default function useAiWindow() {
  return useCallback((firstMessage) => {
    /** 빈 URL: 기존 창 재사용 */
    const aiWindow = window.open('', AI_WINDOW_NAME);
    if (!aiWindow) return false;

    if (aiWindow.location.href === 'about:blank' || firstMessage) {
      /** 새 창이거나 첫 메시지가 있으면 채팅 페이지로 이동: 열린 창도 그 메시지로 새 대화 */
      const query = firstMessage
        ? `?q=${encodeURIComponent(firstMessage)}`
        : '';
      aiWindow.location.href = `${PATHS.AI}${query}`;
    }
    aiWindow.focus();
    return true;
  }, []);
}
