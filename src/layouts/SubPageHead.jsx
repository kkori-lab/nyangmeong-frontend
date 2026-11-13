import { useEffect, useId, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import homeIcon from '@/assets/home.svg';
import { PATHS } from '@/routes/paths';

/**
 * [경로 + 페이지 머리]
 * - 경로: 홈 아이콘 / 섹션 / 메뉴 / (상세면 제목). 위에 작게, 앞 단계는 보통·현재 위치는 굵게(디자인 COM-5)
 * - 머리: 제목(h1) · 설명 · 픽셀 그림
 * - 761~1100px 목록 화면은 제목 옆 ▾로 같은 섹션 메뉴 전환(COM-6), 760px 이하는 바텀 네비가 맡음
 * - 레이아웃 칸 배치는 SubPageLayout이 맡는다. 경로는 전체 폭, 머리는 본문 칸
 */
export default function SubPageHead({
  section,
  activeItem,
  title,
  description,
  pixel,
  action,
  hasSwitch,
  onLeave,
}) {
  const isDeep = Boolean(title && activeItem);
  const heading = title ?? activeItem?.label;

  return (
    <>
      <nav
        aria-label="현재 위치"
        className="mb-[51px] flex flex-wrap items-center gap-x-3 gap-y-1 text-sm leading-5 text-muted max-[1101px]:mb-5 min-[1101px]:col-span-full"
      >
        <CrumbLink to={PATHS.MAIN} onLeave={onLeave} label="홈">
          <img src={homeIcon} alt="" width="16" height="16" />
        </CrumbLink>
        <Slash />
        <CrumbLink to={section.to} onLeave={onLeave}>
          {section.label}
        </CrumbLink>
        <Slash />
        {isDeep && (
          <>
            <CrumbLink to={activeItem.to} onLeave={onLeave}>
              {activeItem.label}
            </CrumbLink>
            <Slash />
          </>
        )}
        <span aria-current="page" className="font-semibold text-ink-2">
          {heading}
        </span>
      </nav>
      <header className="relative mb-6 max-[1101px]:mb-5 min-[1101px]:col-start-2 min-[1101px]:row-start-2">
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <div className="relative flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[28px] leading-[1.3] tracking-[-0.02em] max-[761px]:text-2xl">
              <h1 className="font-bold text-ink">{heading}</h1>
              {hasSwitch && (
                <MenuSwitch section={section} activeItem={activeItem} />
              )}
            </div>
            {/** 설명이 없어도 한 줄 높이를 비워 콘텐츠 시작 위치를 맞춤 */}
            <p
              aria-hidden={description ? undefined : 'true'}
              className={`mt-2 text-muted max-[761px]:mt-1.5 max-[761px]:text-sm ${description ? '' : 'invisible'}`}
            >
              {description || ' '}
            </p>
          </div>
          {/** 머리 오른쪽 작업 버튼(예: 글 등록): 제목이 아니라 설명 줄 아래에 맞춘다. 쓰는 쪽에서 픽셀 그림은 끈다 */}
          {action && <div className="shrink-0">{action}</div>}
        </div>
        {pixel && (
          <img
            src={pixel}
            alt=""
            width="160"
            height="100"
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-1 right-0 origin-bottom-right [image-rendering:pixelated] select-none max-[1101px]:scale-80 max-[761px]:hidden"
          />
        )}
      </header>
    </>
  );
}

/** 경로 링크: onLeave가 있으면 이동 대신 호출. label은 아이콘만 있을 때 읽을 이름 */
function CrumbLink({ to, onLeave, label, children }) {
  const handleClick = (event) => {
    if (!onLeave) return;
    event.preventDefault();
    onLeave(to);
  };

  return (
    <Link
      to={to}
      aria-label={label}
      onClick={handleClick}
      className="inline-flex items-center font-normal transition-colors hover:text-ink hover:underline hover:underline-offset-4"
    >
      {children}
    </Link>
  );
}

/** 경로 구분자 / */
function Slash() {
  return (
    <span aria-hidden="true" className="text-line-strong">
      /
    </span>
  );
}

/** 761~1100px 섹션 메뉴 전환 드롭다운 */
function MenuSwitch({ section, activeItem }) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef(null);
  const menuId = useId();

  useEffect(() => {
    if (!isOpen) return undefined;
    const handlePointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) setIsOpen(false);
    };
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={rootRef} className="contents">
      <button
        type="button"
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-controls={menuId}
        aria-label={`${section.label} 메뉴 열기`}
        onClick={() => setIsOpen((open) => !open)}
        className="-ml-1 hidden size-8 flex-none cursor-pointer place-items-center rounded-full bg-brand-50 text-brand-600 transition-colors hover:bg-brand-100 aria-expanded:bg-brand-100 min-[761px]:max-[1101px]:inline-grid"
      >
        <span
          aria-hidden="true"
          className={`size-2 border-r-2 border-b-2 border-current transition-[rotate,margin] duration-200 ${isOpen ? 'mt-1 -rotate-[135deg]' : '-mt-1 rotate-45'}`}
        />
      </button>
      {isOpen && (
        <div
          id={menuId}
          role="dialog"
          aria-label={`${section.label} 메뉴`}
          className="absolute top-[calc(100%+8px)] left-0 z-60 w-[280px] rounded-[10px] border border-line bg-white p-2 tracking-normal shadow-depth-sm min-[1101px]:hidden max-[761px]:hidden"
        >
          <nav className="flex flex-col gap-0.5">
            {section.items.map((item) => {
              const isActive = item === activeItem;
              return (
                <Link
                  key={item.label}
                  to={item.to}
                  aria-current={isActive ? 'page' : undefined}
                  onClick={() => setIsOpen(false)}
                  className={`flex min-h-12 items-center justify-between gap-3 rounded-[6px] px-3.5 text-base leading-[1.4] ${
                    isActive
                      ? 'bg-brand-50 font-bold text-brand-600'
                      : 'font-medium text-ink-2 hover:bg-surface-2 hover:text-ink'
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span
                      aria-hidden="true"
                      className="mr-1 -mt-[3px] h-[11px] w-1.5 flex-none rotate-45 border-r-2 border-b-2 border-current"
                    />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </div>
  );
}
