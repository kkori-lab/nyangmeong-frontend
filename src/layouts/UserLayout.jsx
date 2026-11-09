import { Outlet, useLocation } from 'react-router-dom';
import footerMoIllust from '@/assets/footer_mo_illust.svg';
import footerPixel from '@/assets/footer_pixel.svg';
import { PATHS } from '@/routes/paths';
import BottomNav from './BottomNav';
import { findBottomNavMenu } from './bottomNavMenus';
import FloatingButtons from './FloatingButtons';
import ScrollToTop from './ScrollToTop';
import UserFooter from './UserFooter';
import UserHeader from './UserHeader';

export default function UserLayout() {
  const { pathname } = useLocation();
  const bottomNavMenu = findBottomNavMenu(pathname);
  /** 메인은 푸터 없이 화면 높이에 맞춰 스크롤하지 않음 */
  const isMain = pathname === PATHS.MAIN;

  let mainPadding = 'pb-[160px] max-[760px]:pb-20';
  if (isMain) mainPadding = 'pb-0';
  else if (bottomNavMenu)
    mainPadding =
      'pb-[160px] max-[760px]:pb-[calc(144px+env(safe-area-inset-bottom))]';

  return (
    <div
      className={`flex flex-col bg-[#faf8f5] ${
        isMain ? 'h-dvh overflow-hidden' : 'min-h-screen'
      }`}
    >
      <ScrollToTop />
      <UserHeader />
      {/** 바텀 네비 화면: 본문 끝이 네비·AI 버튼에 가리지 않게 여백 */}
      <main
        className={`mx-auto w-full max-w-[1440px] flex-1 px-8 pt-6 max-[760px]:px-4 ${mainPadding}`}
      >
        <Outlet />
      </main>
      {/** 메인: 푸터 대신 맨 아래 픽셀 띠만(높이 100px 이하, MainPage가 그만큼 비움) */}
      {isMain && (
        <picture className="shrink-0">
          <source media="(max-width: 759.98px)" srcSet={footerMoIllust} />
          <img
            src={footerPixel}
            alt=""
            aria-hidden="true"
            className="pointer-events-none mx-auto block h-auto w-[calc(100%-4rem)] max-w-[1376px] max-[760px]:w-[300px] max-[760px]:max-w-[calc(100%-2rem)]"
          />
        </picture>
      )}
      {!isMain && (
        <UserFooter className={bottomNavMenu ? 'max-[760px]:hidden' : ''} />
      )}
      {bottomNavMenu && <BottomNav menu={bottomNavMenu} />}
      <FloatingButtons hasBottomNav={Boolean(bottomNavMenu)} />
    </div>
  );
}
