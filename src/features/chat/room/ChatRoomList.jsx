/**
 * [채팅 목록]
 * - 내 글·지원한 글 탭, [⋮] 메뉴(최신 메시지 순·안 읽은 메시지 순 / 채팅방 관리)로 끝난 방 골라 나가기 (FN-COM-009-05~08, FN-CMU-005-02)
 * - 방을 열어도 마운트를 유지해 탭·정렬·선택 모드·스크롤 위치 보존
 * - 나가기는 방마다 기존 나가기를 부른다: 내 목록에서만 사라지고 상대 쪽에는 남는다
 */
import { useEffect, useRef, useState } from 'react';
import Avatar from '@/components/Avatar';
import CountBadge from '@/components/CountBadge';
import Icon from '@/components/Icon';
import Modal from '@/components/Modal';
import Skeleton from '@/components/Skeleton';
import { BTN_DANGER, BTN_SECONDARY } from '@/components/buttonStyles';
import { showToast } from '@/components/toastStore';
import { formatChatListTime } from '@/utils/formatDate';
import { publicFileUrl } from '@/utils/fileUrl';
import { useChatRooms, useLeaveChatRooms } from '../queries';
import { MTCH_STTS, ROLE, ROOM_STTS, isEndedRoom } from '../shared/chatCodes';
import DealBadge from './DealBadge';

const TABS = [
  { key: 'mine', label: '내 글' },
  { key: 'applied', label: '지원한 글' },
];

const EMPTY_TEXT = {
  mine: '내 글에 온 채팅이 없어요',
  applied: '지원한 글의 채팅이 없어요',
};

const LOCKED_NOTICE = '진행 중인 거래는 나갈 수 없어요';

/** 정렬: 기본은 최신 메시지 순. 고른 값은 화면 상태로만 두고 새로 열면 기본으로 돌아간다 */
const SORTS = [
  { key: 'latest', label: '최신 메시지 순' },
  { key: 'unread', label: '안 읽은 메시지 순' },
];

const menuItemClass =
  'flex h-11 w-full items-center gap-2.5 px-4 text-left text-ink-2 hover:bg-surface-2';

/** 이 방이 속한 탭: 내가 보호자(돌봄 글 작성자)면 내 글, 돌보미(지원한 사람)면 지원한 글 */
const tabOf = (room) => (room.myRole === ROLE.GUARDIAN ? 'mine' : 'applied');

/** 나갈 수 있는 방: 끝난 방(상대방 나감·무응답 종료)과 거래 완료·요청 취소. 진행 중인 방은 나갈 수 없다 */
const isDeletableRoom = (room) =>
  isEndedRoom(room) ||
  room.mtchDlngSttsCd === MTCH_STTS.COMPLETE ||
  room.mtchDlngSttsCd === MTCH_STTS.CANCELED;

const sumUnread = (rooms) =>
  rooms.reduce((sum, room) => sum + (room.unreadCnt ?? 0), 0);

/**
 * 처음 열 때 탭
 * - 안 읽은 메시지가 한 탭에만 있으면 그 탭
 * - 아니면 내 글에 방이 없고 지원한 글에만 방이 있으면 지원한 글
 * - 그 밖(둘 다 있거나 둘 다 없음)은 내 글
 */
const pickFirstTab = (rooms) => {
  const mineRooms = rooms.filter((room) => tabOf(room) === 'mine');
  const appliedRooms = rooms.filter((room) => tabOf(room) === 'applied');
  const mine = sumUnread(mineRooms);
  const applied = sumUnread(appliedRooms);
  if (mine === 0 && applied > 0) return 'applied';
  if (mine === 0 && mineRooms.length === 0 && appliedRooms.length > 0) {
    return 'applied';
  }
  return 'mine';
};

/** lastMsgDt 내림차순, 메시지 없는 방은 끝 */
const sortByLastMessage = (rooms) =>
  [...rooms].sort((a, b) =>
    (b.lastMsgDt ?? '').localeCompare(a.lastMsgDt ?? ''),
  );

/** 안 읽은 메시지 순: 안 읽은 방을 위로, 그 안과 나머지는 각각 최신 메시지 순 */
const sortRooms = (rooms, sort) => {
  const byLatest = sortByLastMessage(rooms);
  if (sort !== 'unread') return byLatest;
  return [
    ...byLatest.filter((room) => room.unreadCnt > 0),
    ...byLatest.filter((room) => (room.unreadCnt ?? 0) <= 0),
  ];
};

/** 글 상세에서 열었다면 그 글의 채팅을 맨 위로(묶음 안과 나머지는 각각 기존 순서) */
const putPostFirst = (rooms, pstSn) =>
  pstSn === null
    ? rooms
    : [
        ...rooms.filter((room) => room.pstSn === pstSn),
        ...rooms.filter((room) => room.pstSn !== pstSn),
      ];

/**
 * isFocused: 글 상세 [채팅 목록 보기]로 열었을 때 그 글의 방(왼쪽 띠와 옅은 배경으로 구분)
 * isEdit: 편집 중이면 줄을 눌러도 방이 열리지 않고 체크만 바뀐다(진행 중인 방은 잠금)
 */
function ChatRoomRow({
  room,
  isSelected,
  isEdit,
  isChecked,
  isFocused,
  onSelect,
  onToggle,
}) {
  const hasUnread = room.unreadCnt > 0;
  const isDeletable = isDeletableRoom(room);
  /** 끝난 방은 내용만 흐리게: 거래 상태 배지는 선명하게 둔다 */
  const dim = isEndedRoom(room)
    ? 'opacity-60 transition-opacity group-hover:opacity-100'
    : '';
  const isHighlighted = isEdit ? isChecked : isSelected;

  return (
    <li className="[&+li>button]:border-t [&+li>button]:border-line">
      <button
        type="button"
        aria-current={isSelected && !isEdit ? 'true' : undefined}
        aria-pressed={isEdit && isDeletable ? isChecked : undefined}
        className={`group grid w-full gap-3 px-5 py-4 text-left transition-colors ${
          isEdit
            ? 'grid-cols-[20px_44px_minmax(0,1fr)]'
            : 'grid-cols-[44px_minmax(0,1fr)]'
        } ${isHighlighted ? 'bg-brand-50' : isFocused ? 'bg-brand-50/50 hover:bg-brand-50' : 'hover:bg-surface-2'} ${isFocused ? 'shadow-[inset_3px_0_0_var(--color-brand-500)]' : ''}`}
        onClick={() => (isEdit ? onToggle(room) : onSelect(room.otoChatRoomSn))}
      >
        {isEdit &&
          (isDeletable ? (
            <input
              type="checkbox"
              checked={isChecked}
              readOnly
              tabIndex={-1}
              aria-hidden="true"
              className="pointer-events-none size-5 self-center accent-brand-500"
            />
          ) : (
            <span
              title={LOCKED_NOTICE}
              className="grid size-5 self-center text-subtle"
            >
              <Icon name="lock" className="text-lg" />
            </span>
          ))}
        <Avatar
          src={publicFileUrl(room.ctptProfileAtchFileSn)}
          className={`size-11 ${dim}`}
          iconSize={20}
        />
        <span className="flex min-w-0 flex-col">
          <span className="flex items-center gap-1.5">
            <b className={`font-bold text-ink ${dim}`}>{room.ctptMbrNcnm}</b>
            {room.lastMsgDt && (
              <time className={`ml-auto text-sm text-placeholder ${dim}`}>
                {formatChatListTime(room.lastMsgDt)}
              </time>
            )}
          </span>
          <span className={`truncate text-sm text-subtle ${dim}`}>
            {room.pstTtl}
          </span>
          <span className="flex items-center gap-1.5">
            <span
              className={`min-w-0 flex-1 truncate ${dim} ${
                hasUnread ? 'font-semibold text-ink' : 'text-ink-2'
              }`}
            >
              {room.lastMsgCn ?? '아직 메시지가 없어요'}
            </span>
            {room.chatRoomSttsCd === ROOM_STTS.READ_ONLY && (
              <DealBadge label="상대방 나감" tone="gray" />
            )}
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
 * pstSn: 돌봄 글 [채팅하기]로 들어와 방을 만드는 중이면 그 글(지원한 글 탭에서 연다)
 * listPstSn: 글 상세에서 연 글. 내 글 탭에서 열고(작성자) 그 글의 채팅을 목록 맨 위에 둔다
 * 탭은 열릴 때 정하고, 그 뒤 선택된 방이 바뀌면 그 방의 탭으로 맞춘다
 */
export default function ChatRoomList({
  isHidden,
  pstSn,
  listPstSn,
  selectedRoomSn,
  onSelect,
}) {
  const [tab, setTab] = useState(null);
  const [sort, setSort] = useState('latest');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [checkedSns, setCheckedSns] = useState([]);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const menuRef = useRef(null);
  const scrollRef = useRef(null);
  const savedScroll = useRef(0);
  /** 탭을 맞춰 둔 방: 사용자가 탭을 바꿔도 같은 방이면 되돌리지 않는다 */
  const [syncedSn, setSyncedSn] = useState(null);
  const {
    data: rooms,
    isPending,
    isError,
    error,
    refetch,
  } = useChatRooms(false);
  const { mutate: leaveRooms, isPending: isDeleting } = useLeaveChatRooms();

  /** 처음 열 때 탭 정하기, 선택된 방이 바뀌면 그 방의 탭으로(렌더 중 조건부 갱신) */
  if (rooms) {
    const selected =
      selectedRoomSn === null
        ? undefined
        : rooms.find((room) => room.otoChatRoomSn === selectedRoomSn);
    if (tab === null) {
      if (selected) {
        setSyncedSn(selectedRoomSn);
        setTab(tabOf(selected));
      } else if (pstSn !== null) {
        setTab('applied');
      } else if (listPstSn !== null) {
        setTab('mine');
      } else {
        setTab(pickFirstTab(rooms));
      }
    } else if (selected && syncedSn !== selectedRoomSn) {
      setSyncedSn(selectedRoomSn);
      setTab(tabOf(selected));
    }
  }

  /** display:none이 되면 스크롤 위치가 사라지니 숨기기 전에 저장하고 다시 보일 때 복원 */
  useEffect(() => {
    if (!isHidden && scrollRef.current) {
      scrollRef.current.scrollTop = savedScroll.current;
    }
  }, [isHidden]);

  /** 메뉴 밖을 누르거나 Esc로 닫기 */
  useEffect(() => {
    if (!isMenuOpen) return undefined;
    const handlePointerDown = (event) => {
      if (!menuRef.current?.contains(event.target)) setIsMenuOpen(false);
    };
    /** preventDefault: 채팅 모달의 Esc 닫기가 함께 동작하지 않게 */
    const handleKeyDown = (event) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      setIsMenuOpen(false);
    };
    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMenuOpen]);

  const activeTab = tab ?? 'mine';
  const tabRooms = rooms?.filter((room) => tabOf(room) === activeTab);
  const visibleRooms =
    tabRooms && putPostFirst(sortRooms(tabRooms, sort), listPstSn);
  const deletableRooms = visibleRooms?.filter(isDeletableRoom) ?? [];
  /** 지금 보이는 나갈 수 있는 방 중 체크된 것(목록이 바뀌어 사라진 방은 빠진다) */
  const checkedRooms = deletableRooms.filter((room) =>
    checkedSns.includes(room.otoChatRoomSn),
  );
  const isAllChecked =
    deletableRooms.length > 0 && checkedRooms.length === deletableRooms.length;
  const hasUnreadInOtherTab = (key) =>
    key !== activeTab &&
    (rooms?.some((room) => tabOf(room) === key && room.unreadCnt > 0) ?? false);

  const handleSelect = (otoChatRoomSn) => {
    savedScroll.current = scrollRef.current?.scrollTop ?? 0;
    onSelect(otoChatRoomSn);
  };

  const handleTab = (key) => {
    setTab(key);
    setCheckedSns([]);
  };

  const handleToggle = (room) => {
    if (!isDeletableRoom(room)) {
      showToast(LOCKED_NOTICE);
      return;
    }
    setCheckedSns((current) =>
      current.includes(room.otoChatRoomSn)
        ? current.filter((sn) => sn !== room.otoChatRoomSn)
        : [...current, room.otoChatRoomSn],
    );
  };

  const handleToggleAll = () =>
    setCheckedSns(
      isAllChecked ? [] : deletableRooms.map((room) => room.otoChatRoomSn),
    );

  const handleEditEnd = () => {
    setIsEdit(false);
    setCheckedSns([]);
  };

  const handleDelete = () => {
    const targetSns = checkedRooms.map((room) => room.otoChatRoomSn);
    leaveRooms(targetSns, {
      onSuccess: ({ succeeded, failed }) => {
        setIsDeleteOpen(false);
        handleEditEnd();
        /** 열려 있던 방을 지웠다면 오른쪽을 비운다 */
        if (selectedRoomSn !== null && succeeded.includes(selectedRoomSn)) {
          onSelect(null);
        }
        showToast(
          failed.length > 0
            ? `${failed.length}개는 나가지 못했어요`
            : `채팅방 ${succeeded.length}개에서 나갔어요`,
          { type: failed.length > 0 ? 'error' : 'success' },
        );
      },
    });
  };

  return (
    <div className={isHidden ? 'hidden' : 'flex min-h-0 flex-1 flex-col'}>
      {isEdit ? (
        <div className="flex h-15 shrink-0 items-center gap-3 bg-brand-50 pr-3 pl-5 shadow-[inset_0_-1px_0_var(--color-line)]">
          <label className="flex min-h-11 cursor-pointer items-center gap-2 font-semibold text-ink">
            <input
              type="checkbox"
              className="size-[18px] accent-brand-500"
              checked={isAllChecked}
              disabled={deletableRooms.length === 0}
              onChange={handleToggleAll}
            />
            전체 선택
          </label>
          <span className="text-sm font-bold text-brand-500">
            {checkedRooms.length}개 선택
          </span>
          <button
            type="button"
            className="ml-auto h-8 shrink-0 rounded-md px-2.5 text-sm font-semibold text-ink-2 hover:bg-white/70"
            onClick={handleEditEnd}
          >
            취소
          </button>
        </div>
      ) : (
        <div className="flex h-15 shrink-0 items-center justify-between pr-3 pl-2 shadow-[inset_0_-1px_0_var(--color-line)]">
          <div role="tablist" aria-label="채팅 나누기" className="flex">
            {TABS.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={activeTab === key}
                className={`relative h-15 px-3 font-semibold whitespace-nowrap ${
                  activeTab === key
                    ? 'text-brand-500 after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:rounded-full after:bg-brand-500'
                    : 'text-subtle hover:text-ink'
                }`}
                onClick={() => handleTab(key)}
              >
                {label}
                {hasUnreadInOtherTab(key) && (
                  <>
                    <span
                      aria-hidden="true"
                      className="absolute top-3 right-1 size-1.5 rounded-full bg-alert"
                    />
                    <span className="sr-only">(안 읽은 메시지 있음)</span>
                  </>
                )}
              </button>
            ))}
          </div>
          <div ref={menuRef} className="relative shrink-0">
            <button
              type="button"
              aria-label="채팅 목록 메뉴"
              aria-haspopup="menu"
              aria-expanded={isMenuOpen}
              className="grid size-11 place-items-center rounded-full text-ink-2 hover:bg-surface-3"
              onClick={() => setIsMenuOpen((prev) => !prev)}
            >
              <Icon name="more_vert" className="text-2xl" />
            </button>
            {isMenuOpen && (
              <div
                role="menu"
                className="absolute top-full right-0 z-20 mt-1 w-48 overflow-hidden rounded-box border border-line bg-white py-1 shadow-depth-md"
              >
                {SORTS.map(({ key, label }) => (
                  <button
                    key={key}
                    type="button"
                    role="menuitemradio"
                    aria-checked={sort === key}
                    className={menuItemClass}
                    onClick={() => {
                      setSort(key);
                      setIsMenuOpen(false);
                    }}
                  >
                    <span className="grid size-5 place-items-center text-brand-500">
                      {sort === key && <Icon name="check" className="text-xl" />}
                    </span>
                    {label}
                  </button>
                ))}
                <hr className="my-1 border-line" />
                <button
                  type="button"
                  role="menuitem"
                  className={menuItemClass}
                  onClick={() => {
                    setIsMenuOpen(false);
                    setIsEdit(true);
                  }}
                >
                  <span className="grid size-5 place-items-center">
                    <Icon name="logout" className="text-xl" />
                  </span>
                  채팅방 관리
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="relative flex min-h-0 flex-1 flex-col">
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
          {visibleRooms?.length === 0 && (
            <div className="flex flex-col items-center gap-3 px-6 py-16 text-center text-muted">
              <span className="grid size-14 place-items-center rounded-full bg-surface-3">
                <Icon name="mark_chat_read" className="text-[28px]" />
              </span>
              <p>{EMPTY_TEXT[activeTab]}</p>
            </div>
          )}
          {visibleRooms?.length > 0 && (
            <ul className={isEdit && checkedRooms.length > 0 ? 'pb-20' : ''}>
              {visibleRooms.map((room) => (
                <ChatRoomRow
                  key={room.otoChatRoomSn}
                  room={room}
                  isSelected={room.otoChatRoomSn === selectedRoomSn}
                  isEdit={isEdit}
                  isChecked={checkedSns.includes(room.otoChatRoomSn)}
                  isFocused={listPstSn !== null && room.pstSn === listPstSn}
                  onSelect={handleSelect}
                  onToggle={handleToggle}
                />
              ))}
            </ul>
          )}
        </div>

        {isEdit && checkedRooms.length > 0 && (
          <div className="absolute inset-x-0 bottom-0 z-10 flex justify-end border-t border-line-strong bg-white px-4 py-3 shadow-[0_-6px_16px_rgba(20,40,35,0.08)]">
            <button
              type="button"
              className={`${BTN_DANGER} max-[760px]:w-full`}
              onClick={() => setIsDeleteOpen(true)}
            >
              {checkedRooms.length}개 나가기
            </button>
          </div>
        )}
      </div>

      <p className="flex h-16.25 shrink-0 items-center gap-2 border-t border-line px-5 text-[12px] leading-4 text-subtle">
        <Icon name="info" className="shrink-0 text-lg" />
        거래는 채팅방 위 카드에서 단계별로 진행해요. 냥멍케어는 결제를 대신하지
        않아요.
      </p>

      {isDeleteOpen && (
        <Modal
          isConfirm
          isPending={isDeleting}
          title={`채팅방 ${checkedRooms.length}개에서 나가시겠어요?`}
          description="선택한 대화가 내 목록에서 사라져요. 상대방에게는 그대로 남고, 나간 대화는 되돌릴 수 없어요."
          onClose={() => setIsDeleteOpen(false)}
          footer={
            <>
              <button
                type="button"
                className={BTN_SECONDARY}
                disabled={isDeleting}
                onClick={() => setIsDeleteOpen(false)}
              >
                취소
              </button>
              <button
                type="button"
                className={BTN_DANGER}
                disabled={isDeleting}
                onClick={handleDelete}
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
