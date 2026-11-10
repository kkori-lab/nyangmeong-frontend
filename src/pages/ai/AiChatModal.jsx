import { useCallback, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Icon from '@/components/Icon';
import { useAiModal } from '@/context/aiModal';
import { useChatModal } from '@/context/chatModal';
import useMediaQuery from '@/hooks/useMediaQuery';
import useScrollLock from '@/hooks/useScrollLock';
import AiChatScreen from './AiChatScreen';

/**
 * [AI 매니저 모달] (SCR-COM-007, 760px 이하)
 * - 헤더 아래 전체 화면, 본문은 새 창과 같은 AiChatScreen
 * - [✕]·Esc·페이지 이동·761px 이상으로 넓힘에 닫힘, 다시 열면 새 대화
 * - transform-gpu: 대화 목록 drawer(fixed)를 헤더 아래 모달 안에 가두기 위함
 */
function AiChatModalPanel() {
  const { openKey, firstMessage, file, close } = useAiModal();
  const { open: openChatModal } = useChatModal();
  const navigate = useNavigate();
  const panelRef = useRef(null);

  useScrollLock();

  /** 열릴 때 모달로 포커스 */
  useEffect(() => {
    panelRef.current?.focus();
  }, []);

  /** Esc 닫기: drawer·안쪽 dialog의 Esc는 제외 */
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key !== 'Escape' || event.defaultPrevented) return;
      if (event.target instanceof Element && event.target.closest('dialog')) {
        return;
      }
      close();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [close]);

  /** 같은 창에서 화면 이동 후 모달 닫기 */
  const handleOpenMain = useCallback(
    (path) => {
      close();
      navigate(path);
    },
    [close, navigate],
  );

  /** AI 모달 대신 펫돌봄 채팅 모달 */
  const handleOpenCareChat = () => {
    close();
    openChatModal();
  };

  /** 넘긴 사진 그대로 사용 */
  const loadAttachment = file ? async () => file : null;

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-labelledby="ai-modal-title"
      tabIndex={-1}
      className="fixed inset-x-0 top-16 bottom-0 z-35 flex transform-gpu flex-col overflow-hidden bg-white pb-[env(safe-area-inset-bottom)] outline-none"
    >
      <header className="flex h-16 shrink-0 items-center gap-1 border-b border-line pr-4 pl-5">
        <h2
          id="ai-modal-title"
          className="flex-1 text-xl leading-[1.3] font-bold tracking-[-0.03em] text-ink"
        >
          AI 매니저
        </h2>
        <button
          type="button"
          aria-label="닫기"
          title="닫기"
          className="grid size-11 place-items-center rounded-full text-ink-2 hover:bg-surface-3"
          onClick={close}
        >
          <Icon name="close" className="text-2xl" />
        </button>
      </header>

      <AiChatScreen
        key={openKey}
        initialMessage={firstMessage}
        loadAttachment={loadAttachment}
        onOpenMain={handleOpenMain}
        onOpenCareChat={handleOpenCareChat}
        className="min-h-0 flex-1"
      />
    </div>
  );
}

export default function AiChatModal() {
  const { isOpen, close } = useAiModal();
  const { pathname } = useLocation();
  const previousPathname = useRef(pathname);
  const isNarrow = useMediaQuery('(max-width: 760px)');

  /** 페이지 이동 시 닫기 */
  useEffect(() => {
    if (previousPathname.current === pathname) return;
    previousPathname.current = pathname;
    if (isOpen) close();
  }, [pathname, isOpen, close]);

  /** 761px 이상으로 넓히면 닫기: PC는 새 창 */
  useEffect(() => {
    if (isOpen && !isNarrow) close();
  }, [isOpen, isNarrow, close]);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-35 bg-[#0f1723]/45" aria-hidden="true" />
      <AiChatModalPanel />
    </>
  );
}
