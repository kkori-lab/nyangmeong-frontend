import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { openInMainWindow } from '@/features/ai/chat/openInMainWindow';
import useChatWindow from '@/hooks/useChatWindow';
import { PATHS } from '@/routes/paths';
import AiChatScreen from './AiChatScreen';

/**
 * [AI 채팅 새 창]
 * - 주소의 첫 메시지(q) -> AiChatScreen
 * - 본창 이동 뒤 이 창 닫기, 펫돌봄 채팅은 채팅 새 창
 */
export default function AiChatPage() {
  const [searchParams] = useSearchParams();
  const openChatWindow = useChatWindow();
  const [initialMessage] = useState(() => searchParams.get('q'));

  /** 펫돌봄 채팅 새 창 열기, 팝업 차단 시 이 창을 채팅 화면으로 */
  const handleOpenCareChat = () => {
    if (openChatWindow()) {
      window.close();
    } else {
      window.location.href = PATHS.CHAT;
    }
  };

  return (
    <AiChatScreen
      initialMessage={initialMessage}
      onOpenMain={openInMainWindow}
      onOpenCareChat={handleOpenCareChat}
    />
  );
}
