import { NOTI_TYPE_LABEL } from './notiTabs';

/**
 * [알림 행]
 * - 미읽음(prslDt null)은 배경·점으로 구분
 */
export default function NotificationItem({ notification, onClick }) {
  const isUnread = notification.prslDt === null;

  return (
    <button
      type="button"
      className={`flex w-full items-start gap-2 border-b border-[#edf1f1] px-[18px] py-4 text-left last:border-b-0 hover:bg-[#f4f6f6] ${
        isUnread ? 'bg-[#e9f2f2]' : ''
      }`}
      onClick={() => onClick(notification)}
    >
      {isUnread && (
        <span
          className="mt-[10px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#1a3234]"
          aria-label="읽지 않음"
        />
      )}
      <span className="text-base leading-[26px] text-[#1a3234]">
        [{NOTI_TYPE_LABEL[notification.notiTypeCd]}] {notification.notiTtl}
      </span>
    </button>
  );
}
