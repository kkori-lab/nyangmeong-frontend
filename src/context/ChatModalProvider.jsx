import { useMemo, useState } from 'react';
import { ChatModalContext } from './chatModal';

const EMPTY_TARGET = { otoChatRoomSn: null, pstSn: null, listPstSn: null };

/**
 * [채팅 모달 상태] (SCR-COM-009)
 * - 열림 여부와 보던 방(otoChatRoomSn)·방을 만들 글(pstSn)·글별 보기(listPstSn)
 * - close는 열림을 끄고 대상도 잊음
 */
export default function ChatModalProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [target, setTarget] = useState(EMPTY_TARGET);

  const value = useMemo(
    () => ({
      isOpen,
      ...target,
      /** 대상을 넘기면 그 방·글로, 없으면 보던 방으로 열기 */
      open: ({ otoChatRoomSn = null, pstSn = null, listPstSn = null } = {}) => {
        if (otoChatRoomSn !== null || pstSn !== null || listPstSn !== null) {
          setTarget({ otoChatRoomSn, pstSn, listPstSn });
        }
        setIsOpen(true);
      },
      close: () => {
        setIsOpen(false);
        setTarget(EMPTY_TARGET);
      },
      /** 방 선택·목록 복귀(null), 글별 보기는 유지 */
      selectRoom: (otoChatRoomSn) =>
        setTarget((current) => ({ ...current, otoChatRoomSn, pstSn: null })),
      clearPost: () =>
        setTarget((current) => ({ ...current, listPstSn: null })),
    }),
    [isOpen, target],
  );

  return (
    <ChatModalContext.Provider value={value}>
      {children}
    </ChatModalContext.Provider>
  );
}
