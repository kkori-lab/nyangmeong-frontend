import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CountBadge from '@/components/CountBadge';
import Icon from '@/components/Icon';
import Skeleton from '@/components/Skeleton';
import NotificationItem from '@/features/notification/shared/NotificationItem';
import { NOTI_TABS, NOTI_TYPE } from '@/features/notification/shared/notiTabs';
import {
  useNotifications,
  useReadNotification,
  useUnreadCount,
} from '@/features/notification/queries';
import { useChatModal } from '@/context/chatModal';
import { HEADER_ICON_CLASS } from './headerStyles';

/** 열릴 때만 마운트: 알림 목록 요청과 탭 상태를 열 때마다 초기화 */
function NotificationPanel({ unreadCount, onClose }) {
  const [tab, setTab] = useState(NOTI_TABS[0]);
  const { data, isPending } = useNotifications(tab);
  const readNotification = useReadNotification();
  const navigate = useNavigate();
  const { open: openChatModal } = useChatModal();

  /** 읽음 처리 성공 후 이동 */
  const handleItemClick = (notification) => {
    /** 펫돌봄 거래 상태는 mvmnPath의 방으로 채팅 모달 열기: 페이지 이동이 없어 읽음 처리를 기다리지 않음 */
    if (notification.notiTypeCd === NOTI_TYPE.MTCH_DLNG) {
      const otoChatRoomSn = new URL(
        notification.mvmnPath,
        window.location.origin,
      ).searchParams.get('otoChatRoomSn');
      openChatModal({ otoChatRoomSn: Number(otoChatRoomSn) });
      onClose();
      if (notification.prslDt === null) {
        readNotification.mutate(notification.inappNotiSn);
      }
      return;
    }

    const go = () => {
      onClose();
      navigate(notification.mvmnPath);
    };

    if (notification.prslDt !== null) {
      go();
      return;
    }
    readNotification.mutate(notification.inappNotiSn, { onSuccess: go });
  };

  return (
    <div className="absolute right-0 top-[61px] z-40 w-[380px] overflow-hidden rounded-[14px] border border-[#e2e7e7] bg-white shadow-lg max-[760px]:fixed max-[760px]:inset-x-3 max-[760px]:top-[72px] max-[760px]:w-auto">
      <div className="flex items-center justify-between px-[18px] pb-2 pt-3.5">
        <h2 className="text-base font-bold leading-[26px] text-[#1a3234]">
          알림
        </h2>
        <p className="text-base font-medium leading-[26px] text-[#566465]">
          미읽음 <span className="font-bold text-[#f44b21]">{unreadCount}</span>
        </p>
      </div>
      <div className="flex gap-1.5 border-b border-[#edf1f1] px-[18px] pb-3">
        {NOTI_TABS.map((item) => (
          <button
            key={item.key}
            type="button"
            aria-pressed={item.key === tab.key}
            className={`h-[30px] rounded-full border px-3 text-sm ${
              item.key === tab.key
                ? 'border-[#285a5c] bg-[#285a5c] text-white'
                : 'border-[#e2e7e7] bg-white text-[#3d4a4b] hover:bg-[#f4f6f6]'
            }`}
            onClick={() => setTab(item)}
          >
            {item.label}
          </button>
        ))}
      </div>
      {isPending && (
        <div aria-busy="true">
          {Array.from({ length: 5 }, (_, index) => (
            <div
              key={index}
              className="border-b border-[#edf1f1] px-[18px] py-4 last:border-b-0"
            >
              <Skeleton className="my-[5px] h-4 w-4/5" />
            </div>
          ))}
        </div>
      )}
      {data?.length === 0 && (
        <p className="px-[18px] py-10 text-center text-base text-[#667374]">
          새 알림이 없어요
        </p>
      )}
      {data?.map((notification) => (
        <NotificationItem
          key={notification.inappNotiSn}
          notification={notification}
          onClick={handleItemClick}
        />
      ))}
    </div>
  );
}

export default function NotificationDropdown({
  isOpen,
  onToggle,
  onClose,
  buttonClassName,
}) {
  const rootRef = useRef(null);
  const buttonRef = useRef(null);
  const { data: unread } = useUnreadCount();

  /** 토글 버튼이 rootRef 안: 닫자마자 다시 열리는 것 방지 */
  useEffect(() => {
    if (!isOpen) return undefined;
    const handleMouseDown = (event) => {
      if (!rootRef.current.contains(event.target)) onClose();
    };
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        /** 채팅 모달의 Esc 닫기가 같이 일어나지 않게 */
        event.preventDefault();
        onClose();
        buttonRef.current.focus();
      }
    };
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  /** position 미지정: 패널을 헤더 오른쪽 묶음 끝에 맞춤 */
  return (
    <div ref={rootRef}>
      <button
        ref={buttonRef}
        type="button"
        className={`${buttonClassName} ${isOpen ? 'bg-[#ebf0f0]' : ''}`}
        aria-label="알림"
        aria-expanded={isOpen}
        onClick={onToggle}
      >
        <Icon name="notifications" className={HEADER_ICON_CLASS} />
        <CountBadge
          count={unread?.count}
          className="absolute left-6 top-[5px]"
        />
      </button>
      {isOpen && (
        <NotificationPanel unreadCount={unread?.count ?? 0} onClose={onClose} />
      )}
    </div>
  );
}
