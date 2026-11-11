import { useCallback } from 'react';
import { PATHS } from '@/routes/paths';

/** 고정된 창 이름: window.open이 기존 채팅 창 재사용 */
const CHAT_WINDOW_NAME = 'nyangmeong-chat';

/** 채팅 창 크기: 채팅 모달과 같은 두 칸 */
const CHAT_WINDOW_WIDTH = 1040;
const CHAT_WINDOW_HEIGHT = 780;

/** 탭이 아닌 별도 창 옵션: 본창 가운데 */
const getPopupFeatures = () => {
  const width = Math.min(CHAT_WINDOW_WIDTH, window.screen.availWidth);
  const height = Math.min(CHAT_WINDOW_HEIGHT, window.screen.availHeight);
  const left = Math.round(window.screenX + (window.outerWidth - width) / 2);
  const top = Math.round(window.screenY + (window.outerHeight - height) / 2);
  return `popup,width=${width},height=${height},left=${left},top=${top}`;
};

/** 이 탭에서 연 채팅 창: 닫을 때 창 이름으로 찾으면 창이 없을 때 빈 창이 열림 */
let openedChatWindow = null;

/** 이 탭에서 연 채팅 창만 닫기, 본창 새로고침 뒤에는 모름 */
export function closeChatWindow() {
  if (openedChatWindow && !openedChatWindow.closed) {
    openedChatWindow.close();
  }
  openedChatWindow = null;
}

/**
 * open({ otoChatRoomSn?, pstSn?, listPstSn? }) 반환, 창 열림 true·팝업 차단 false
 * - listPstSn: 돌봄 글 [채팅 목록 보기]가 그 글의 채팅만 보여 주며 열 때
 * - 클릭 핸들러에서 바로 호출: 요청을 기다린 뒤 부르면 팝업 차단
 */
export default function useChatWindow() {
  return useCallback(({ otoChatRoomSn, pstSn, listPstSn } = {}) => {
    /** 빈 URL: 기존 창 재사용, 창 옵션은 새로 열 때만 적용 */
    const chatWindow = window.open('', CHAT_WINDOW_NAME, getPopupFeatures());
    if (!chatWindow) return false;
    openedChatWindow = chatWindow;

    const params = new URLSearchParams();
    if (otoChatRoomSn != null) params.set('otoChatRoomSn', otoChatRoomSn);
    if (pstSn != null) params.set('pstSn', pstSn);
    if (listPstSn != null) params.set('listPstSn', listPstSn);
    const query = params.toString();

    /** 새 창이거나 방 지정이면 이동, 아니면 보던 방 그대로 */
    if (chatWindow.location.href === 'about:blank' || query) {
      chatWindow.location.href = query ? `${PATHS.CHAT}?${query}` : PATHS.CHAT;
    }
    chatWindow.focus();
    return true;
  }, []);
}
