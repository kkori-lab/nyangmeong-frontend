import { Link, useLocation } from 'react-router-dom';
import SideMenu from './SideMenu';
import SubPageHead from './SubPageHead';
import { findActiveItem, SUB_MENUS } from './subMenus';

/**
 * [사이드 메뉴가 있는 서브 화면 틀]
 * - 경로(전체 폭) + 사이드 메뉴 210px(섹션 제목 포함) + 페이지 머리·본문(디자인 COM-5)
 * - 사용법·prop 표: handoff/LJS.md
 */
export default function SubPageLayout({
  section,
  menu,
  title,
  back,
  description,
  pixel = true,
  onLeave,
  contentClassName = 'min-[1101px]:pt-6',
  children,
}) {
  const { pathname } = useLocation();
  const sectionMenu = SUB_MENUS[section];
  const activeItem = findActiveItem(sectionMenu, menu, pathname);
  const hasBack = (back ?? Boolean(title)) && Boolean(activeItem);

  /** 760px 이하: 하단 여백은 UserLayout main이 바텀 네비 기준으로 맡아 0, 위 여백 0으로 헤더~경로 24px */
  return (
    <div className="grid grid-cols-1 pt-2 pb-[126px] max-[760px]:pt-0 max-[760px]:pb-0 text-ink leading-[1.6] break-keep min-[1101px]:grid-cols-[210px_minmax(0,1fr)] min-[1101px]:gap-x-12">
      <SubPageHead
        section={sectionMenu}
        activeItem={activeItem}
        title={title}
        description={description}
        pixel={pixel ? sectionMenu.pixel : null}
        hasSwitch={!title && !hasBack}
        onLeave={onLeave}
      />
      <div className="min-[1101px]:col-start-1 min-[1101px]:row-span-2 min-[1101px]:row-start-2">
        <SideMenu
          section={section}
          active={activeItem?.to}
          showTitle
          onLeave={onLeave}
        />
      </div>
      <div
        className={`flex min-w-0 flex-col min-[1101px]:col-start-2 min-[1101px]:row-start-3 ${contentClassName}`}
      >
        {hasBack && <BackLink to={activeItem.to} onLeave={onLeave} />}
        {children}
      </div>
    </div>
  );
}

/** 상세·글쓰기·수정 화면의 ‹ 목록으로 */
function BackLink({ to, onLeave }) {
  const handleClick = (event) => {
    if (!onLeave) return;
    event.preventDefault();
    onLeave(to);
  };

  return (
    <Link
      to={to}
      onClick={handleClick}
      className="-mt-1 mb-4 inline-flex h-6 items-center gap-2 self-start text-base leading-none font-medium text-muted transition-colors hover:text-ink"
    >
      <span
        aria-hidden="true"
        className="ml-[3px] size-2 rotate-45 border-b-2 border-l-2 border-current"
      />
      목록으로
    </Link>
  );
}
