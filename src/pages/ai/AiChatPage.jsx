import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { openInMainWindow } from '@/features/ai/chat/openInMainWindow';
import { receiveAttachment } from '@/hooks/useAiWindow';
import useChatWindow from '@/hooks/useChatWindow';
import { PATHS } from '@/routes/paths';
import AiChatScreen from './AiChatScreen';

/**
 * [AI 채팅 새 창]
 * - 주소의 첫 메시지(q)·사진 번호(attach) -> AiChatScreen
 * - 본창 이동 뒤 이 창 닫기, 펫돌봄 채팅은 채팅 새 창
 */
export default function AiChatPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const openChatWindow = useChatWindow();
  const [initialMessage] = useState(() => searchParams.get('q'));
  const [attachId] = useState(() => searchParams.get('attach'));

  /** 본창에 사진 요청 */
  const loadAttachment = async () => {
    /** 새로고침 뒤 다시 받기 방지용 주소 정리 */
    setSearchParams(
      (prev) => {
        prev.delete('attach');
        return prev;
      },
      { replace: true },
    );
    return receiveAttachment(attachId);
  };

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
      loadAttachment={attachId ? loadAttachment : null}
      onOpenMain={openInMainWindow}
      onOpenCareChat={handleOpenCareChat}
    />
  );
}
