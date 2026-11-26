import { Link } from 'react-router-dom';
import homeIcon from '@/assets/home.svg';
import { PATHS } from '@/routes/paths';

/**
 * [경로 + 페이지 머리]
 * - 경로: 홈 아이콘 / 섹션 / 메뉴 / (상세면 제목). 위에 작게, 앞 단계는 보통·현재 위치는 굵게(디자인 COM-5)
 * - 머리: 제목(h1) · 설명 · 픽셀 그림
 * - 섹션 메뉴는 760px 이상 왼쪽 사이드 메뉴(SideMenu), 760px 미만은 바텀 네비가 맡음
 * - 레이아웃 칸 배치는 SubPageLayout이 맡는다. 경로는 전체 폭, 머리는 본문 칸
 */
export default function SubPageHead({
  section,
  activeItem,
  title,
  description,
  pixel,
  action,
  onLeave,
}) {
  const isDeep = Boolean(title && activeItem);
  const heading = title ?? activeItem?.label;

  return (
    <>
      <nav
        aria-label="현재 위치"
        className="mb-[51px] flex flex-wrap items-center gap-x-3 gap-y-1 text-sm leading-5 text-muted max-[1100px]:mb-5 min-[760px]:col-span-full"
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
      <header className="relative mb-6 max-[1100px]:mb-5 min-[760px]:col-start-2 min-[760px]:row-start-2">
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <div className="relative flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[28px] leading-[1.3] tracking-[-0.02em] max-[760px]:text-2xl">
              <h1 className="font-bold text-ink">{heading}</h1>
            </div>
            {/** 설명이 없어도 한 줄 높이를 비워 콘텐츠 시작 위치를 맞춤. 픽셀 그림이 있으면 오른쪽에 그림 폭(760~1100 128px·그 위 160px)만큼 비워 문구가 덮이지 않게 함 */}
            <p
              aria-hidden={description ? undefined : 'true'}
              className={`mt-2 text-muted max-[760px]:mt-1.5 max-[760px]:text-sm ${description ? '' : 'invisible'} ${pixel ? 'min-[760px]:pr-32 min-[1101px]:pr-40' : ''}`}
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
            className="pointer-events-none absolute -bottom-1 right-0 origin-bottom-right [image-rendering:pixelated] select-none max-[1100px]:scale-80 max-[760px]:hidden"
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
