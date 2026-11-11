/**
 * [채팅 두 칸 본문] (SCR-COM-009, SCR-CMU-005)
 * - 채팅 모달과 새 창(/chat)이 같이 쓴다: 왼쪽 380px 목록 | 오른쪽 대화
 * - 760px 이하는 한 칸: 목록 → 방, 방 위 ‹로 목록 복귀
 * - pstSn: 방을 만드는 중이면 오른쪽에 안내
 */
import { useSyncExternalStore } from 'react';
import ChatConversation from './ChatConversation';
import ChatRoomList from './ChatRoomList';

/** Tailwind max-[760px]와 같은 기준 */
const NARROW_QUERY = '(max-width: 760px)';

const subscribeNarrow = (onChange) => {
  const media = window.matchMedia(NARROW_QUERY);
  media.addEventListener('change', onChange);
  return () => media.removeEventListener('change', onChange);
};

const getIsNarrow = () => window.matchMedia(NARROW_QUERY).matches;

export default function ChatPanes({
  otoChatRoomSn,
  pstSn,
  listPstSn,
  onSelect,
  onBack,
  onLeft,
  onClearPost,
}) {
  const isNarrow = useSyncExternalStore(subscribeNarrow, getIsNarrow);
  const hasRoom = otoChatRoomSn !== null;
  const isRoomPane = hasRoom || pstSn !== null;

  return (
    <div className="flex min-h-0 flex-1">
      <section
        aria-label="채팅 목록"
        className={`w-[356px] shrink-0 flex-col border-r border-line max-[760px]:w-full max-[760px]:border-r-0 ${
          isNarrow && isRoomPane ? 'hidden' : 'flex'
        }`}
      >
        <ChatRoomList
          isHidden={isNarrow && isRoomPane}
          listPstSn={listPstSn}
          selectedRoomSn={otoChatRoomSn}
          onClearPost={onClearPost}
          onSelect={onSelect}
        />
      </section>

      <section
        aria-label="대화"
        className={`min-w-0 flex-1 flex-col ${
          isNarrow && !isRoomPane ? 'hidden' : 'flex'
        }`}
      >
        {hasRoom ? (
          <ChatConversation
            key={otoChatRoomSn}
            otoChatRoomSn={otoChatRoomSn}
            onBack={isNarrow ? onBack : undefined}
            onLeft={onLeft}
          />
        ) : (
          <p
            role="status"
            className="flex flex-1 items-center justify-center bg-[#fdfcfb] text-subtle"
          >
            {pstSn !== null ? '채팅방을 여는 중이에요' : '채팅방을 골라 주세요'}
          </p>
        )}
      </section>
    </div>
  );
}
