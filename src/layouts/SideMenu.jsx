import { Link, useLocation } from 'react-router-dom';
import Icon from '@/components/Icon';
import { findActiveItem, SUB_MENUS } from './subMenus';

/**
 * [사이드 메뉴]
 * - 760px 이상에서 보이는 왼쪽 2차 메뉴(디자인 COM-5). 760px 미만은 바텀 네비가 맡는다
 * - section: SUB_MENUS 키, active: 선택 메뉴의 to.
 * - showTitle: 메뉴 위에 섹션 제목을 크게 보임(SubPageLayout이 켬)
 * - onLeave: 있으면 메뉴를 눌러도 이동 대신 onLeave(to)를 호출한다(글쓰기 중 이탈 확인)
 */
export default function SideMenu({ section, active, showTitle, onLeave }) {
  const { pathname } = useLocation();
  const menu = SUB_MENUS[section];
  if (!menu) return null;
  const activeItem = findActiveItem(menu, active, pathname);

  return (
    <aside
      className={`sticky top-[104px] hidden self-start min-[760px]:block ${showTitle ? '' : 'pt-2.5'}`}
    >
      {showTitle && (
        <p className="mb-5 text-2xl leading-[1.3] font-medium tracking-[-0.02em] text-ink max-[1100px]:mb-4 max-[1100px]:text-xl">
          {menu.label}
        </p>
      )}
      <nav aria-label={`${menu.label} 하위 메뉴`}>
        <ul className="flex flex-col gap-1">
          {menu.items.map((item) => {
            const isActive = item === activeItem;
            return (
              <li key={item.label}>
                <Link
                  to={item.to}
                  aria-current={isActive ? 'page' : undefined}
                  onClick={(event) => {
                    if (!onLeave) return;
                    event.preventDefault();
                    onLeave(item.to);
                  }}
                  className={`-mx-3 flex min-h-10 items-center justify-between gap-3 rounded-lg px-3 text-base/[1.6] transition-colors ${
                    isActive
                      ? 'font-bold text-ok'
                      : 'font-medium text-ink-2 hover:bg-surface-3 hover:text-ink'
                  }`}
                >
                  {item.label}
                  {isActive && <Icon name="chevron_right" />}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
