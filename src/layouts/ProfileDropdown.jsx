import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import userAvatar from '@/assets/user.svg';
import ConfirmModal from '@/components/ConfirmModal';
import Skeleton from '@/components/Skeleton';
import { useLogout, useMemberSummary } from '@/features/member/queries';
import { useChatModal } from '@/context/chatModal';
import { closeAiWindow } from '@/hooks/useAiWindow';
import { closeChatWindow } from '@/hooks/useChatWindow';
import { PATHS } from '@/routes/paths';

const MENU_LINKS = [
  { label: '마이페이지', to: PATHS.MYPAGE },
  { label: '고객센터', to: PATHS.NOTICES },
  { label: '설정', to: PATHS.SETTINGS_NOTIFICATIONS },
];

const itemClass =
  'flex h-11 w-full items-center rounded-lg px-3 text-left text-base text-[#1a3234] hover:bg-[#f4f6f6]';

/** 열릴 때만 마운트: 열 때마다 회원 요약 요청 */
function ProfileMenuPanel({ onClose, onLogout }) {
  const { data: summary } = useMemberSummary();

  return (
    <div
      role="menu"
      className="absolute right-0 top-[61px] z-40 w-60 rounded-[14px] border border-[#e2e7e7] bg-white p-2 shadow-lg"
    >
      {/** 요약 로딩 중 상자 크기 고정(min-h) */}
      <div className="mb-1 min-h-[71px] border-b border-[#edf1f1] px-3 pb-2 pt-3.5">
        <div className="flex h-[26px] items-center text-base font-bold leading-[26px] text-[#1a3234]">
          {summary ? summary.mbrNcnm : <Skeleton className="h-4 w-24" />}
        </div>
        <div className="flex h-[23px] items-center text-sm leading-[23px] text-[#667374]">
          {summary ? (
            summary.maskedAcntEml
          ) : (
            <Skeleton className="h-[17px] w-40" />
          )}
        </div>
      </div>
      {MENU_LINKS.map((item) => (
        <Link
          key={item.label}
          to={item.to}
          role="menuitem"
          className={itemClass}
          onClick={onClose}
        >
          {item.label}
        </Link>
      ))}
      <button
        type="button"
        role="menuitem"
        className={itemClass}
        onClick={onLogout}
      >
        로그아웃
      </button>
    </div>
  );
}

/** 로그아웃 확인 모달과 처리 */
export function LogoutConfirm({ onClose }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const logout = useLogout();
  const { close: closeChatModal } = useChatModal();

  const handleConfirm = () => {
    logout.mutate(undefined, {
      onSuccess: () => {
        closeAiWindow();
        closeChatWindow();
        closeChatModal();
        /** 이전 회원 캐시 비우기 */
        queryClient.clear();
        onClose();
        navigate(PATHS.HOME);
      },
    });
  };

  return (
    <ConfirmModal
      title="로그아웃하시겠어요?"
      confirmLabel="로그아웃"
      errorMessage={
        logout.isError
          ? '로그아웃하지 못했어요. 잠시 후 다시 시도해 주세요.'
          : undefined
      }
      isPending={logout.isPending}
      onConfirm={handleConfirm}
      onCancel={onClose}
    />
  );
}

export default function ProfileDropdown({
  isOpen,
  onToggle,
  onClose,
  buttonClassName,
}) {
  const rootRef = useRef(null);
  const buttonRef = useRef(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

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

  /** 모달 닫힘 후 프로필 아이콘 포커스 복귀: 자식 cleanup이 부모 effect보다 먼저 실행되는 순서 이용 */
  const wasConfirmOpenRef = useRef(false);
  useEffect(() => {
    if (wasConfirmOpenRef.current && !isConfirmOpen) buttonRef.current.focus();
    wasConfirmOpenRef.current = isConfirmOpen;
  }, [isConfirmOpen]);

  const handleLogoutClick = () => {
    onClose();
    setIsConfirmOpen(true);
  };

  const closeConfirm = () => setIsConfirmOpen(false);

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        className={buttonClassName}
        aria-label="프로필"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={onToggle}
      >
        <img src={userAvatar} alt="" className="size-full object-cover" />
      </button>
      {isOpen && (
        <ProfileMenuPanel onClose={onClose} onLogout={handleLogoutClick} />
      )}
      {isConfirmOpen && <LogoutConfirm onClose={closeConfirm} />}
    </div>
  );
}
