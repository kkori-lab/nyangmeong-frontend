import { useEffect, useRef } from 'react';
import { ChevronRight, LogOut, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import userAvatar from '@/assets/user.svg';
import Skeleton from '@/components/Skeleton';
import { useMemberSummary } from '@/features/member/queries';
import { PATHS } from '@/routes/paths';
import { GNB_MENUS } from './gnbMenus';

/**
 * [전체 메뉴 drawer]
 * - 1100px 미만 헤더 햄버거로 열림 -> 회원 요약·메뉴·로그아웃
 * - 딤 클릭·ESC·메뉴 이동·화면 확대로 닫힘
 */

/** 헤더 햄버거가 사라지는 폭 */
const WIDE_QUERY = '(min-width: 1100px)';

/** 2차 메뉴와 별개인 보조 메뉴 */
const ETC_LINKS = [
  { label: '고객센터', to: { pathname: PATHS.NOTICES } },
  { label: '설정', to: { pathname: PATHS.SETTINGS_NOTIFICATIONS } },
];

const linkClass =
  '-mx-3 flex min-h-12 items-center rounded-lg px-3 text-lg font-semibold text-[#3d4a4b] hover:bg-[#f4f6f6] aria-[current=page]:bg-[#ebf0f0] aria-[current=page]:text-[#285a5c]';

const sectionClass =
  'mx-8 grid grid-cols-[76px_minmax(0,1fr)] items-start gap-x-3 py-4';

export default function NavDrawer({ onClose, onLogout }) {
  const { data: summary } = useMemberSummary();
  const location = useLocation();
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

  /** 쿼리스트링까지 같은 메뉴만 현재 화면으로 표시(플레이스 탭 구분) */
  const getCurrent = (to) =>
    location.pathname === to.pathname &&
    (to.search ?? '') === (location.search ?? '')
      ? 'page'
      : undefined;

  return (
    <div id="nav-drawer" className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-[#0f1723]/45"
        aria-hidden="true"
        onClick={onClose}
      />
      <nav
        role="dialog"
        aria-modal="true"
        aria-label="전체 메뉴"
        className="absolute inset-y-0 right-0 flex w-[min(360px,88vw)] flex-col overflow-hidden bg-white shadow-lg max-[760px]:w-full"
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-[#e2e7e7] pl-8 pr-3">
          <b className="text-lg font-bold text-[#1a3234]">전체 메뉴</b>
          <button
            ref={closeRef}
            type="button"
            aria-label="메뉴 닫기"
            className="grid h-10 w-10 place-items-center rounded-full text-[#3d4a4b] hover:bg-[#ebf0f0]"
            onClick={onClose}
          >
            <X size={28} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <Link
            to={PATHS.MYPAGE}
            aria-label="마이페이지로 이동"
            className="flex items-center gap-4 bg-[#f4f6f6] py-5 pl-8 pr-5"
            onClick={onClose}
          >
            <span className="size-16 shrink-0 overflow-hidden rounded-full border border-[#e2e7e7] bg-white">
              <img
                src={userAvatar}
                alt=""
                aria-hidden="true"
                className="size-full object-cover"
              />
            </span>
            <div className="min-w-0 grow">
              <div className="flex items-center gap-0.5 text-xl font-bold leading-[1.4] text-[#1a3234]">
                {summary ? (
                  summary.mbrNcnm
                ) : (
                  <Skeleton className="my-1 h-5 w-24" />
                )}
                <ChevronRight size={24} className="text-[#667374]" />
              </div>
              <div className="mt-0.5 truncate text-sm text-[#667374]">
                {summary ? (
                  summary.maskedAcntEml
                ) : (
                  <Skeleton className="my-0.5 h-4 w-36" />
                )}
              </div>
            </div>
          </Link>

          <div className="pb-6 pt-2">
            {GNB_MENUS.map((menu) => (
              <section
                key={menu.label}
                aria-label={menu.label}
                className={`${sectionClass} border-t border-[#e2e7e7] first:border-t-0`}
              >
                <h3 className="pt-3.5 text-sm font-bold leading-[1.4] text-[#667374]">
                  {menu.label}
                </h3>
                <div className="flex min-w-0 flex-col">
                  {menu.items.map((item) => (
                    <Link
                      key={item.label}
                      to={item.to}
                      aria-current={getCurrent(item.to)}
                      className={linkClass}
                      onClick={onClose}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </section>
            ))}

            <div
              className={`${sectionClass} border-t border-[#e2e7e7] [&>a]:col-start-2`}
            >
              {ETC_LINKS.map((item) => (
                <Link
                  key={item.label}
                  to={item.to}
                  aria-current={getCurrent(item.to)}
                  className={linkClass}
                  onClick={onClose}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="mx-8 flex justify-end border-t border-[#e2e7e7] pt-2">
              <button
                type="button"
                className="flex min-h-12 items-center gap-1.5 rounded-lg px-3 text-base font-semibold text-[#566465] hover:bg-[#f4f6f6]"
                onClick={onLogout}
              >
                로그아웃
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}
