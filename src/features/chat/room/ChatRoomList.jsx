/**
 * [채팅 목록]
 * - 전체·내 글·지원한 글 탭, 안 읽음만, 글별 보기 (FN-COM-009-05~08, FN-CMU-005-02)
 * - 방을 열어도 마운트를 유지해 탭·체크·스크롤 위치 보존
 */
import { useEffect, useRef, useState } from 'react';
import CountBadge from '@/components/CountBadge';
import Icon from '@/components/Icon';
import Skeleton from '@/components/Skeleton';
import { formatChatListTime } from '@/utils/formatDate';
import { useChatRooms } from '../queries';
import { ROLE, ROLE_LABEL, getOtherRole } from '../shared/chatCodes';
import ChatAvatar from './ChatAvatar';
import DealBadge from './DealBadge';

const TABS = [
  { key: 'all', label: '전체' },
  { key: 'mine', label: '내 글' },
  { key: 'applied', label: '지원한 글' },
];

const EMPTY_TEXT = {
  all: '채팅이 없어요',
  mine: '내 글에 온 채팅이 없어요',
  applied: '지원한 글의 채팅이 없어요',
};

const TAB_ROLE = { mine: ROLE.OWNER, applied: ROLE.SITTER };

/** lastMsgDt 내림차순, 메시지 없는 방은 끝 */
const sortByLastMessage = (rooms) =>
  [...rooms].sort((a, b) =>
    (b.lastMsgDt ?? '').localeCompare(a.lastMsgDt ?? ''),
  );

function ChatRoomRow({ room, isSelected, onSelect }) {
  const hasUnread = room.unreadCnt > 0;

  return (
    <li className="[&+li>button]:border-t [&+li>button]:border-line">
      <button
        type="button"
        aria-current={isSelected ? 'true' : undefined}
        className={`grid w-full grid-cols-[44px_minmax(0,1fr)] gap-3 px-5 py-4 text-left transition-colors ${
          isSelected ? 'bg-brand-50' : 'hover:bg-surface-2'
        }`}
        onClick={() => onSelect(room.otoChatRoomSn)}
      >
        <ChatAvatar name={room.ctptMbrNcnm} size="lg" />
        <span className="flex min-w-0 flex-col gap-0.5">
          <span className="flex items-center gap-1.5">
            <b className="font-bold text-ink">{room.ctptMbrNcnm}</b>
            <span className="text-sm text-subtle">
              {ROLE_LABEL[getOtherRole(room.myRole)]}
            </span>
            {room.lastMsgDt && (
              <time className="ml-auto text-sm text-placeholder">
                {formatChatListTime(room.lastMsgDt)}
              </time>
            )}
          </span>
          <span className="truncate text-sm text-subtle">{room.pstTtl}</span>
          <span className="mt-0.5 flex items-center gap-1.5">
            <span
              className={`min-w-0 flex-1 truncate ${
                hasUnread ? 'font-semibold text-ink' : 'text-ink-2'
              }`}
            >
              {room.lastMsgCn ?? '아직 메시지가 없어요'}
            </span>
            <DealBadge stage={room.mtchDlngSttsCd} />
            <CountBadge count={room.unreadCnt} className="shrink-0" />
          </span>
        </span>
      </button>
    </li>
  );
}

/**
 * isHidden: 방을 보는 동안 숨김
 * listPstSn: 돌봄 글 [채팅 목록 보기]로 들어오면 그 글의 채팅만 (onClearPost로 해제)
 */
export default function ChatRoomList({
  isHidden,
  listPstSn,
  selectedRoomSn,
  onClearPost,
  onSelect,
}) {
  const [tab, setTab] = useState(listPstSn === null ? 'all' : 'mine');
  const [isUnreadOnly, setIsUnreadOnly] = useState(false);
  const scrollRef = useRef(null);
  const savedScroll = useRef(0);
  const {
    data: rooms,
    isPending,
    isError,
    error,
    refetch,
  } = useChatRooms(isUnreadOnly);

  /** display:none이 되면 스크롤 위치가 사라지니 숨기기 전에 저장하고 다시 보일 때 복원 */
  useEffect(() => {
    if (!isHidden && scrollRef.current) {
      scrollRef.current.scrollTop = savedScroll.current;
    }
  }, [isHidden]);

  const handleSelect = (otoChatRoomSn) => {
    savedScroll.current = scrollRef.current?.scrollTop ?? 0;
    onSelect(otoChatRoomSn);
  };

  const filtered = rooms?.filter(
    (room) =>
      (tab === 'all' || room.myRole === TAB_ROLE[tab]) &&
      (listPstSn === null || room.pstSn === listPstSn),
  );
  const postTitle = rooms?.find((room) => room.pstSn === listPstSn)?.pstTtl;

  return (
    <div className={isHidden ? 'hidden' : 'flex min-h-0 flex-1 flex-col'}>
      <div className="flex shrink-0 items-center justify-between pr-4 pl-2 shadow-[inset_0_-1px_0_var(--color-line)]">
        <div role="tablist" aria-label="채팅 나누기" className="flex">
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={tab === key}
              className={`relative h-12 px-3 font-semibold ${
                tab === key
                  ? 'text-brand-500 after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:rounded-full after:bg-brand-500'
                  : 'text-subtle hover:text-ink'
              }`}
              onClick={() => setTab(key)}
            >
              {label}
            </button>
          ))}
        </div>
        <label className="flex min-h-11 shrink-0 cursor-pointer items-center gap-2 text-sm font-medium text-ink-2">
          <input
            type="checkbox"
            className="size-5 accent-brand-500"
            checked={isUnreadOnly}
            onChange={(event) => setIsUnreadOnly(event.target.checked)}
          />
          안 읽음만
        </label>
      </div>

      {listPstSn !== null && (
        <div className="mx-4 mt-3 mb-1 flex shrink-0 items-center gap-2.5 rounded-card bg-brand-50 py-2.5 pr-3 pl-4 text-sm text-brand-600">
          <span className="min-w-0 flex-1">
            내 돌봄 글의 채팅
            <b className="block truncate text-base text-ink">
              {postTitle ?? ''}
            </b>
          </span>
          <button
            type="button"
            className="h-9 shrink-0 rounded-md border border-line bg-white px-3.5 font-semibold text-ink hover:bg-surface-2"
            onClick={onClearPost}
          >
            전체 채팅
          </button>
        </div>
      )}

      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto">
        {isPending && (
          <div aria-busy="true" className="space-y-5 px-5 py-4">
            {Array.from({ length: 5 }, (_, index) => (
              <div key={index} className="flex items-center gap-3">
                <Skeleton className="size-11 shrink-0 rounded-full" />
                <Skeleton lines={2} className="flex-1" />
              </div>
            ))}
          </div>
        )}
        {isError && (
          <div className="flex flex-col items-center gap-3 px-5 py-10 text-center text-muted">
            <p>{error.message}</p>
            <button
              type="button"
              className="h-10 rounded-lg border border-line px-4 text-sm hover:bg-surface-2"
              onClick={() => refetch()}
            >
              다시 시도
            </button>
          </div>
        )}
        {filtered?.length === 0 && (
          <div className="flex flex-col items-center gap-3 px-6 py-16 text-center text-muted">
            <span className="grid size-14 place-items-center rounded-full bg-surface-3">
              <Icon name="mark_chat_read" className="text-[28px]" />
            </span>
            <p>{isUnreadOnly ? '안 읽은 채팅이 없어요' : EMPTY_TEXT[tab]}</p>
          </div>
        )}
        {filtered?.length > 0 && (
          <ul>
            {sortByLastMessage(filtered).map((room) => (
              <ChatRoomRow
                key={room.otoChatRoomSn}
                room={room}
                isSelected={room.otoChatRoomSn === selectedRoomSn}
                onSelect={handleSelect}
              />
            ))}
          </ul>
        )}
      </div>

      <p className="flex shrink-0 gap-2 border-t border-line px-5 py-3 text-sm text-subtle">
        <Icon name="info" className="mt-0.5 text-lg" />
        거래는 채팅방 위 카드에서 단계별로 진행해요. 냥멍케어는 결제를 대신하지
        않아요.
      </p>
    </div>
  );
}
