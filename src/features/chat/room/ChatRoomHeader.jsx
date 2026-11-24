/**
 * [채팅방 상단 바]
 * - ‹ 목록으로, 상대 프로필·이름, 돌봄 글 제목, [⋮] 돌봄 글 보기·신고하기(채팅방 신고, 보호자·지원자 모두)·거래 취소 요청·채팅방 나가기 (FN-CMU-005-01·11)
 */
import { useEffect, useRef, useState } from 'react';
import { generatePath } from 'react-router-dom';
import Avatar from '@/components/Avatar';
import Icon from '@/components/Icon';
import { PATHS } from '@/routes/paths';
import { publicFileUrl } from '@/utils/fileUrl';
import {
  canRequestDealCancel,
  getDealCancelState,
  isLeaveBlockedStage,
} from '../shared/chatCodes';

const menuItem =
  'flex h-11 w-full items-center gap-2.5 px-4 text-left text-ink-2 hover:bg-surface-2';

export default function ChatRoomHeader({
  room,
  onBack,
  onLeaveAsk,
  onCancelAsk,
  onReportAsk,
}) {
  const isLeaveBlocked = isLeaveBlockedStage(room.mtchDlngSttsCd);
  const cancelState = getDealCancelState(room);
  const canCancelDeal = canRequestDealCancel(room);
  /** 요청중이거나 내 요청이 거절됐으면 다시 요청할 수 없다(서버도 409 CARE_DEAL_CANCEL_REJECTED) */
  const cancelBlockedNote = {
    'requesting-mine': '상대의 응답을 기다리고 있어요',
    'requesting-theirs': '상대가 보낸 취소 요청에 먼저 답해 주세요',
    'rejected-mine': '상대가 거절해 이 거래에서는 다시 요청할 수 없어요',
  }[cancelState];
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

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

  return (
    <header
      className={`flex h-[60px] shrink-0 items-center gap-2 border-b border-line pr-2 ${
        onBack ? 'pl-1' : 'pl-4'
      }`}
    >
      {onBack && (
        <button
          type="button"
          aria-label="채팅 목록으로"
          className="grid size-11 place-items-center rounded-full text-ink-2 hover:bg-surface-3"
          onClick={onBack}
        >
          <Icon name="chevron_left" className="text-2xl" />
        </button>
      )}
      <div className="flex min-w-0 flex-1 items-center gap-2.5">
        <Avatar
          src={publicFileUrl(room.ctptProfileAtchFileSn)}
          className="size-9"
        />
        <div className="min-w-0">
          <p className="truncate leading-[1.3] font-bold text-ink">
            {room.ctptMbrNcnm}
          </p>
          <p className="truncate text-sm leading-[1.3] text-subtle">
            {room.pstTtl}
          </p>
        </div>
      </div>

      <div ref={menuRef} className="relative">
        <button
          type="button"
          aria-label="채팅방 메뉴"
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
            className="absolute top-full right-0 z-20 mt-1 w-44 overflow-hidden rounded-box border border-line bg-white py-1 shadow-depth-md"
          >
            <a
              role="menuitem"
              className={menuItem}
              href={generatePath(PATHS.COMMUNITY_PETCARE_DETAIL, {
                petPrtcRcrtSn: room.petPrtcRcrtSn,
              })}
              target="_blank"
              rel="noopener"
              onClick={() => setIsMenuOpen(false)}
            >
              <Icon name="article" />
              돌봄 글 보기
            </a>
            <button
              type="button"
              role="menuitem"
              className={menuItem}
              onClick={() => {
                setIsMenuOpen(false);
                onReportAsk();
              }}
            >
              <Icon name="flag" />
              신고하기
            </button>
            <hr className="my-1 border-line" />
            {canCancelDeal && (
              <>
                <button
                  type="button"
                  role="menuitem"
                  aria-disabled={Boolean(cancelBlockedNote)}
                  className={`${menuItem} ${cancelBlockedNote ? 'text-line-strong' : ''}`}
                  onClick={() => {
                    if (cancelBlockedNote) return;
                    setIsMenuOpen(false);
                    onCancelAsk();
                  }}
                >
                  <Icon name="event_busy" />
                  거래 취소 요청
                </button>
                {cancelBlockedNote && (
                  <p className="px-4 pt-1 pb-2 text-sm leading-normal text-subtle">
                    {cancelBlockedNote}
                  </p>
                )}
              </>
            )}
            <button
              type="button"
              role="menuitem"
              aria-disabled={isLeaveBlocked}
              className={`${menuItem} ${isLeaveBlocked ? 'text-line-strong' : 'text-danger'}`}
              onClick={() => {
                if (isLeaveBlocked) return;
                setIsMenuOpen(false);
                onLeaveAsk();
              }}
            >
              <Icon name="logout" />
              채팅방 나가기
            </button>
            {isLeaveBlocked && (
              <p className="px-4 pt-1 pb-2 text-sm leading-normal text-subtle">
                거래를 마치거나 취소한 뒤에 나갈 수 있어요
              </p>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
