/**
 * [채팅 모달] (SCR-COM-009, SCR-CMU-005)
 * - 본문은 새 창과 같은 ChatPanes. 760px 이하는 헤더 아래 전체 화면
 * - [─] 최소화(보던 방 기억), [새 창으로 띄우기] 새 창(/chat)으로 옮김, [✕]·Esc 닫기
 * - 페이지를 이동하면 펼친 모달만 닫기. 최소화 중이면 보던 방 기억
 * - 딤은 헤더(z-40) 아래, AI·TOP 버튼(z-30) 위(z-35): 모달이 떠 있어도 헤더 조작 가능 (FN-COM-009-12)
 * - 모달은 헤더 아래 영역의 가운데에 둔다(위쪽이 헤더에 가리지 않게)
 */
import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import Icon from '@/components/Icon';
import { showToast } from '@/components/toastStore';
import { useChatModal } from '@/context/chatModal';
import ChatPanes from '@/features/chat/room/ChatPanes';
import { useCreateChatRoom } from '@/features/chat/queries';
import useChatWindow from '@/hooks/useChatWindow';

const headButton =
  'grid size-11 place-items-center rounded-full text-ink-2 hover:bg-surface-3';

function ChatModalPanel() {
  const {
    otoChatRoomSn,
    pstSn,
    listPstSn,
    minimize,
    close,
    selectRoom,
    clearPost,
  } = useChatModal();
  const openChatWindow = useChatWindow();
  const { mutate: createChatRoom } = useCreateChatRoom();
  const panelRef = useRef(null);

  /** 열릴 때 모달로 포커스 */
  useEffect(() => {
    panelRef.current?.focus();
  }, []);

  /** 모달 열림 중 본문 스크롤 잠금 */
  useEffect(() => {
    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    const previousPaddingRight = root.style.paddingRight;
    const scrollbarWidth = window.innerWidth - root.clientWidth;
    root.style.overflow = 'hidden';
    root.style.paddingRight = `${scrollbarWidth}px`;
    return () => {
      root.style.overflow = previousOverflow;
      root.style.paddingRight = previousPaddingRight;
    };
  }, []);

  /** Esc 닫기: window에서 받아 방 메뉴(document)가 먼저 처리, 안쪽 dialog의 Esc는 제외 */
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

  /** 게시글 [채팅하기]: 방 생성 후 그 방으로. StrictMode effect 이중 실행 방지 */
  const startedPstSn = useRef(null);
  useEffect(() => {
    if (pstSn === null || startedPstSn.current === pstSn) return;
    startedPstSn.current = pstSn;
    createChatRoom(
      { pstSn },
      { onSuccess: ({ otoChatRoomSn: createdSn }) => selectRoom(createdSn) },
    );
  }, [pstSn, createChatRoom, selectRoom]);

  /** 클릭 핸들러에서 바로 열기: 지연되면 팝업 차단 */
  const handlePopOut = () => {
    if (!openChatWindow({ otoChatRoomSn, pstSn, listPstSn })) {
      showToast('팝업이 차단돼 새 창을 열지 못했어요');
      return;
    }
    close();
  };

  const handleBack = () => selectRoom(null);

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-labelledby="chat-modal-title"
      tabIndex={-1}
      className="fixed top-[calc(50%+32px)] left-1/2 z-35 flex h-[780px] max-h-[calc(100dvh-96px)] w-[1040px] max-w-[calc(100vw-32px)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-[20px] bg-white shadow-depth-lg outline-none max-[760px]:inset-x-0 max-[760px]:top-16 max-[760px]:bottom-0 max-[760px]:h-auto max-[760px]:max-h-none max-[760px]:w-auto max-[760px]:max-w-none max-[760px]:translate-x-0 max-[760px]:translate-y-0 max-[760px]:rounded-none max-[760px]:pb-[env(safe-area-inset-bottom)]"
    >
      <header className="flex h-16 shrink-0 items-center gap-1 border-b border-line pr-4 pl-6 max-[760px]:pl-5">
        <h2 id="chat-modal-title" className="flex-1 text-xl font-bold text-ink">
          채팅
        </h2>
        <button
          type="button"
          aria-label="최소화"
          title="최소화"
          className={headButton}
          onClick={minimize}
        >
          <Icon name="remove" className="text-2xl" />
        </button>
        <button
          type="button"
          aria-label="새 창으로 띄우기"
          title="새 창으로 띄우기"
          className={headButton}
          onClick={handlePopOut}
        >
          <Icon name="open_in_new" className="text-[22px]" />
        </button>
        <button
          type="button"
          aria-label="닫기"
          title="닫기"
          className={headButton}
          onClick={close}
        >
          <Icon name="close" className="text-2xl" />
        </button>
      </header>

      <ChatPanes
        otoChatRoomSn={otoChatRoomSn}
        pstSn={pstSn}
        listPstSn={listPstSn}
        onSelect={selectRoom}
        onBack={handleBack}
        onLeft={handleBack}
        onClearPost={clearPost}
      />
    </div>
  );
}

export default function ChatModal() {
  const { isOpen, close } = useChatModal();
  const { pathname } = useLocation();
  const previousPathname = useRef(pathname);

  /** 페이지 이동 시 펼친 모달만 닫기 (FN-COM-009-11) */
  useEffect(() => {
    if (previousPathname.current === pathname) return;
    previousPathname.current = pathname;
    if (isOpen) close();
  }, [pathname, isOpen, close]);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-35 bg-[#0f1723]/45" aria-hidden="true" />
      <ChatModalPanel />
    </>
  );
}
