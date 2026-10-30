import { useEffect, useRef, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import logo from '@/assets/nm_logo.svg';
import ConfirmModal from '@/components/ConfirmModal';
import Skeleton from '@/components/Skeleton';
import { useLogout, useMe } from '@/features/member/queries';
import { PATHS } from '@/routes/paths';
import { ADMIN_MENUS } from './adminMenus';
import ScrollToTop from './ScrollToTop';

/**
 * [관리자 공통 레이아웃]
 * - 상단 바(로고·닉네임·로그아웃) + 왼쪽 사이드바 + 본문 <Outlet/>
 * - 1100px 이하: 사이드바를 숨기고 [≡]로 여는 덮는 서랍
 */

/** 사이드바가 고정으로 보이는 폭 */
const WIDE_QUERY = '(min-width: 1101px)';

/** PATHS에 경로가 있는 메뉴만 남긴 목록 */
const VISIBLE_MENUS = ADMIN_MENUS.map((menu) =>
  menu.items
    ? {
        ...menu,
        items: menu.items
          .filter((item) => PATHS[item.pathKey])
          .map((item) => ({ ...item, to: PATHS[item.pathKey] })),
      }
    : { ...menu, to: PATHS[menu.pathKey] },
).filter((menu) => (menu.items ? menu.items.length > 0 : menu.to));

const linkClass =
  'flex h-10 items-center border-l-4 border-transparent px-4 text-base text-ink-2 hover:bg-surface-2 aria-[current=page]:border-brand-500 aria-[current=page]:bg-surface-3 aria-[current=page]:font-semibold aria-[current=page]:text-brand-900';

/** 사이드바 메뉴 목록: 현재 경로 메뉴 강조, 묶음 제목은 클릭 없음 */
function SidebarNav({ onNavigate }) {
  const { pathname } = useLocation();

  const renderLink = (item) => (
    <Link
      key={item.screenId}
      to={item.to}
      aria-current={pathname === item.to ? 'page' : undefined}
      className={linkClass}
      onClick={onNavigate}
    >
      {item.label}
    </Link>
  );

  return (
    <nav aria-label="관리자 메뉴" className="py-2">
      {VISIBLE_MENUS.map((menu) =>
        menu.items ? (
          <div key={menu.label} className="mt-2">
            <p className="px-5 pt-3 pb-1 text-sm font-bold text-subtle">
              {menu.label}
            </p>
            {menu.items.map(renderLink)}
          </div>
        ) : (
          renderLink(menu)
        ),
      )}
    </nav>
  );
}

/** 1100px 이하 서랍: 딤 클릭·ESC·화면 확대로 닫힘 */
function AdminDrawer({ onClose }) {
  const closeRef = useRef(null);

  /** 열린 동안 포커스 이동·ESC·화면 확대 감지·배경 스크롤 잠금 */
  useEffect(() => {
    closeRef.current.focus();
    const wideQuery = window.matchMedia(WIDE_QUERY);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    const handleWideChange = (event) => {
      if (event.matches) onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    wideQuery.addEventListener('change', handleWideChange);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
      wideQuery.removeEventListener('change', handleWideChange);
    };
  }, [onClose]);

  return (
    <div id="admin-drawer" className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-[#0f1723]/45"
        aria-hidden="true"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="관리자 메뉴"
        className="absolute inset-y-0 left-0 flex w-[min(280px,88vw)] flex-col overflow-hidden bg-white shadow-lg"
      >
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-line pr-2 pl-5">
          <b className="text-lg font-bold text-ink">메뉴</b>
          <button
            ref={closeRef}
            type="button"
            aria-label="메뉴 닫기"
            className="flex size-10 items-center justify-center rounded-md text-ink-2 hover:bg-surface-2"
            onClick={onClose}
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <SidebarNav onNavigate={onClose} />
        </div>
      </div>
    </div>
  );
}

/** 로그아웃 확인 모달: 성공하면 캐시를 비우고 로그인 화면으로 이동 */
function AdminLogoutConfirm({ onClose }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const logout = useLogout();

  const handleConfirm = () => {
    logout.mutate(undefined, {
      onSuccess: () => {
        /** 이전 회원 캐시 비우기 */
        queryClient.clear();
        onClose();
        navigate(PATHS.LOGIN);
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

export default function AdminLayout() {
  const { data: me } = useMe();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);

  const handleDrawerOpen = () => setIsDrawerOpen(true);
  const handleDrawerClose = () => setIsDrawerOpen(false);
  const handleLogoutOpen = () => setIsLogoutOpen(true);
  const handleLogoutClose = () => setIsLogoutOpen(false);

  return (
    <div className="min-h-screen bg-surface-2">
      <ScrollToTop />
      {/** 상단 바 */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line bg-white px-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="메뉴 열기"
            aria-expanded={isDrawerOpen}
            aria-controls="admin-drawer"
            className="flex size-10 items-center justify-center rounded-md text-ink-2 hover:bg-surface-2 min-[1101px]:hidden"
            onClick={handleDrawerOpen}
          >
            <Menu className="size-5" aria-hidden="true" />
          </button>
          <Link to={PATHS.ADMIN} className="flex items-center gap-2">
            <img src={logo} alt="냥멍케어" className="h-7" />
            <b className="text-lg font-bold whitespace-nowrap text-ink">
              관리자
            </b>
          </Link>
        </div>
        <div className="flex min-w-0 items-center gap-3 text-base text-ink-2">
          {me ? (
            <span className="truncate whitespace-nowrap">{me.mbrNcnm} 님</span>
          ) : (
            <Skeleton className="h-4 w-20" />
          )}
          <button
            type="button"
            className="h-9 shrink-0 rounded-md border border-line px-3 font-semibold whitespace-nowrap hover:border-line-strong hover:bg-surface-2"
            onClick={handleLogoutOpen}
          >
            로그아웃
          </button>
        </div>
      </header>
      <div className="flex">
        {/** 사이드바 */}
        <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-60 shrink-0 overflow-y-auto border-r border-line bg-white min-[1101px]:block">
          <SidebarNav />
        </aside>
        {/** 본문 */}
        <main className="min-w-0 flex-1 p-6 max-[760px]:p-4">
          <Outlet />
        </main>
      </div>
      {isDrawerOpen && <AdminDrawer onClose={handleDrawerClose} />}
      {isLogoutOpen && <AdminLogoutConfirm onClose={handleLogoutClose} />}
    </div>
  );
}
