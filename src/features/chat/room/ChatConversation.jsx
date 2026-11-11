/**
 * [채팅방]
 * - 상단 바, 거래 카드, 대화(텍스트·사진·주소·시스템 안내), 입력 (FN-COM-009-20, FN-CMU-005-01·04)
 * - 창이 보일 때 표시된 마지막 메시지까지 읽음 처리 (FN-COM-009-14·16)
 * - 맨 위로 올리면 이전 30건을 이어 붙이고 보던 자리 유지
 */
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import Avatar from '@/components/Avatar';
import FileImage from '@/components/FileImage';
import Icon from '@/components/Icon';
import Modal from '@/components/Modal';
import Skeleton from '@/components/Skeleton';
import { BTN_DANGER, BTN_SECONDARY } from '@/components/buttonStyles';
import { publicFileUrl } from '@/utils/fileUrl';
import {
  useChatImage,
  useChatMessages,
  useChatRoom,
  useLeaveChatRoom,
  useReadChatRoom,
  useViewingChatRoom,
} from '../queries';
import { MSG_TYPE, ROOM_STTS } from '../shared/chatCodes';
import CareDealCard from './CareDealCard';
import ChatMessageInput from './ChatMessageInput';
import ChatRoomHeader from './ChatRoomHeader';
import { getLeaveText } from './dealSteps';

const BUBBLE_BASE =
  'whitespace-pre-line break-words border px-3.5 py-[7px] text-sm leading-[1.55]';
const BUBBLE_PEER = `${BUBBLE_BASE} rounded-[4px_18px_18px_18px] border-line bg-white text-ink`;
const BUBBLE_MINE = `${BUBBLE_BASE} rounded-[18px_4px_18px_18px] border-brand-500 bg-brand-500 text-white`;

/** 보낸 시각 "14:20" */
const MessageTime = ({ message }) =>
  message.regDt ? (
    <time className="shrink-0 text-xs text-placeholder tabular-nums">
      {message.regDt.slice(11, 16)}
    </time>
  ) : null;

/** 거래 단계 안내(요청·수락·완료 등). 서버가 강조 구분을 주지 않아 한 모양 */
function SystemNotice({ message }) {
  return (
    <li className="my-3 flex justify-center">
      <span className="inline-flex max-w-[88%] items-center gap-1.5 text-center text-sm leading-normal text-muted">
        <Icon name="info" className="text-lg text-subtle" />
        {message.msgCn}
      </span>
    </li>
  );
}

/** 비공개 채팅 사진: 참여자 쿠키로 받아 그린다 */
function ChatPhoto({ otoChatRoomSn, atchFileSn }) {
  const { src, isPending } = useChatImage(otoChatRoomSn, atchFileSn);

  return (
    <FileImage
      src={src}
      pending={isPending}
      alt="보낸 사진"
      className="aspect-[4/3] w-[200px] rounded-[14px] border border-line object-cover"
    />
  );
}

function MessageBody({ message, otoChatRoomSn }) {
  if (message.msgTypeCd === MSG_TYPE.IMAGE) {
    return (
      <span className="flex flex-wrap gap-1.5">
        {message.photos.map((photo) => (
          <ChatPhoto
            key={photo.atchFileSn}
            otoChatRoomSn={otoChatRoomSn}
            atchFileSn={photo.atchFileSn}
          />
        ))}
      </span>
    );
  }
  if (message.msgTypeCd === MSG_TYPE.ADDRESS) {
    return (
      <span
        className={`flex min-w-[200px] flex-col gap-0.5 ${
          message.mine ? BUBBLE_MINE : BUBBLE_PEER
        }`}
      >
        <b className="flex items-center gap-1 text-sm">
          <Icon name="location_on" className="text-base" />
          주소 공유
        </b>
        {message.shrnAddr}
        {message.dtlAddr && <span>{message.dtlAddr}</span>}
      </span>
    );
  }
  return (
    <span className={message.mine ? BUBBLE_MINE : BUBBLE_PEER}>
      {message.msgCn}
    </span>
  );
}

function MessageItem({
  message,
  isContinued,
  ctptMbrNcnm,
  ctptProfileAtchFileSn,
  otoChatRoomSn,
}) {
  if (message.msgTypeCd === MSG_TYPE.SYSTEM) {
    return <SystemNotice message={message} />;
  }

  return (
    <li
      className={`flex items-end gap-1.5 ${isContinued ? 'mt-0.5' : 'mt-1.5'} ${
        message.mine ? 'justify-end' : ''
      }`}
    >
      {message.mine && <MessageTime message={message} />}
      {!message.mine && (
        <span className={`self-start ${isContinued ? 'invisible' : ''}`}>
          <Avatar
            src={publicFileUrl(ctptProfileAtchFileSn)}
            className="size-8"
          />
        </span>
      )}
      <div
        className={`flex max-w-[72%] min-w-0 flex-col gap-1 max-[760px]:max-w-[78%] ${
          message.mine ? 'items-end' : 'items-start'
        }`}
      >
        {!message.mine && !isContinued && (
          <span className="text-sm text-subtle">{ctptMbrNcnm}</span>
        )}
        <MessageBody message={message} otoChatRoomSn={otoChatRoomSn} />
      </div>
      {!message.mine && <MessageTime message={message} />}
    </li>
  );
}

/** 채팅 목록으로 돌아가며 onBack(없으면 ‹ 없음: 목록이 옆에 있는 두 칸), 나가기 끝나면 onLeft */
export default function ChatConversation({ otoChatRoomSn, onBack, onLeft }) {
  const [isLeaveOpen, setIsLeaveOpen] = useState(false);
  const {
    data: room,
    isError: isRoomError,
    error: roomError,
    refetch: refetchRoom,
  } = useChatRoom(otoChatRoomSn);
  const {
    data: messages,
    isPending,
    isError,
    error,
    refetch,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useChatMessages(otoChatRoomSn);
  useViewingChatRoom(otoChatRoomSn);
  const { mutate: readChatRoom } = useReadChatRoom();
  const { mutate: leaveRoom, isPending: isLeaving } =
    useLeaveChatRoom(otoChatRoomSn);
  const listRef = useRef(null);
  /** 이전 메시지를 받기 직전의 스크롤 { height, top }: 받은 뒤 보던 자리로 */
  const restoreRef = useRef(null);
  const lastMsgSeq = messages?.at(-1)?.msgSeq;

  /** 이전 메시지를 붙였으면 보던 자리, 그 밖에는 마지막 메시지가 보이도록 맨 아래 */
  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const restore = restoreRef.current;
    restoreRef.current = null;
    list.scrollTop = restore
      ? list.scrollHeight - restore.height + restore.top
      : list.scrollHeight;
  }, [messages]);

  const handleScroll = (event) => {
    const list = event.currentTarget;
    if (list.scrollTop > 80 || !hasNextPage || isFetchingNextPage) return;
    restoreRef.current = { height: list.scrollHeight, top: list.scrollTop };
    fetchNextPage();
  };

  /** 창이 보일 때만 읽음 처리: 다른 탭에 가려진 동안 도착한 메시지 제외 */
  useEffect(() => {
    if (lastMsgSeq === undefined) return undefined;
    const handleVisible = () => {
      if (document.visibilityState !== 'visible') return;
      readChatRoom({ otoChatRoomSn, lastPrslMsgSeq: lastMsgSeq });
    };
    handleVisible();
    document.addEventListener('visibilitychange', handleVisible);
    return () =>
      document.removeEventListener('visibilitychange', handleVisible);
  }, [otoChatRoomSn, lastMsgSeq, readChatRoom]);

  /** 참여자가 아니거나 방 조회에 실패하면 대화 대신 안내 */
  if (isRoomError) {
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        {onBack && (
          <div className="flex h-[60px] shrink-0 items-center border-b border-line pl-1">
            <button
              type="button"
              aria-label="채팅 목록으로"
              className="grid size-11 place-items-center rounded-full text-ink-2 hover:bg-surface-3"
              onClick={onBack}
            >
              <Icon name="chevron_left" className="text-[26px]" />
            </button>
          </div>
        )}
        <div className="flex flex-col items-center gap-3 px-6 py-16 text-center text-muted">
          <p>{roomError.message}</p>
          <button
            type="button"
            className="h-10 rounded-lg border border-line px-4 text-sm hover:bg-surface-2"
            onClick={() => refetchRoom()}
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  const [leaveTitle, leaveDescription] = room
    ? getLeaveText(room.mtchDlngSttsCd)
    : [];
  const isClosed = room && room.chatRoomSttsCd !== ROOM_STTS.ACTIVE;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {room && (
        <>
          <ChatRoomHeader
            room={room}
            onBack={onBack}
            onLeaveAsk={() => setIsLeaveOpen(true)}
          />
          <CareDealCard key={room.mtchDlngSttsCd} room={room} />
        </>
      )}

      <div
        ref={listRef}
        role="log"
        aria-live="polite"
        aria-label="대화 내용"
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-[#fdfcfb] px-4 pt-4 pb-2"
        onScroll={handleScroll}
      >
        {isFetchingNextPage && (
          <div aria-busy="true" className="mb-3 flex justify-center">
            <Skeleton className="h-8 w-2/5 rounded-2xl" />
          </div>
        )}
        {isPending && (
          <div aria-busy="true" className="flex flex-col gap-3">
            <Skeleton className="h-10 w-1/2 rounded-2xl" />
            <Skeleton className="h-10 w-2/5 self-end rounded-2xl" />
            <Skeleton className="h-16 w-3/5 rounded-2xl" />
          </div>
        )}
        {isError && (
          <div className="flex flex-col items-center gap-3 py-10 text-center text-muted">
            <p>{error.message}</p>
            <button
              type="button"
              className="h-10 rounded-lg border border-line bg-white px-4 text-sm hover:bg-surface-2"
              onClick={() => refetch()}
            >
              다시 시도
            </button>
          </div>
        )}
        {messages?.length === 0 && (
          <p className="py-10 text-center text-subtle">
            첫 메시지를 보내 보세요
          </p>
        )}
        {messages?.length > 0 && (
          <ul>
            {messages.map((message, index) => {
              const previous = messages[index - 1];
              const isContinued =
                previous !== undefined &&
                previous.msgTypeCd !== MSG_TYPE.SYSTEM &&
                previous.mine === message.mine;
              return (
                <MessageItem
                  key={message.chatMsgSn}
                  message={message}
                  isContinued={isContinued}
                  ctptMbrNcnm={room?.ctptMbrNcnm}
                  ctptProfileAtchFileSn={room?.ctptProfileAtchFileSn}
                  otoChatRoomSn={otoChatRoomSn}
                />
              );
            })}
          </ul>
        )}
      </div>

      {isClosed && (
        <p className="flex h-11 shrink-0 items-center justify-center gap-1.5 border-t border-line text-sm text-subtle">
          <Icon name="lock" className="text-lg" />
          상대방이 나간 채팅방이에요 · 메시지를 보낼 수 없어요
        </p>
      )}
      {room && !isClosed && !isError && (
        <ChatMessageInput
          otoChatRoomSn={otoChatRoomSn}
          stage={room.mtchDlngSttsCd}
          ctptMbrNcnm={room.ctptMbrNcnm}
        />
      )}

      {isLeaveOpen && (
        <Modal
          isConfirm
          isPending={isLeaving}
          title={leaveTitle}
          description={leaveDescription}
          onClose={() => setIsLeaveOpen(false)}
          footer={
            <>
              <button
                type="button"
                className={BTN_SECONDARY}
                disabled={isLeaving}
                onClick={() => setIsLeaveOpen(false)}
              >
                취소
              </button>
              <button
                type="button"
                className={BTN_DANGER}
                disabled={isLeaving}
                onClick={() =>
                  leaveRoom(undefined, {
                    onSuccess: () => {
                      setIsLeaveOpen(false);
                      onLeft();
                    },
                  })
                }
              >
                나가기
              </button>
            </>
          }
        />
      )}
    </div>
  );
}
