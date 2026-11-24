import { X } from 'lucide-react';
import { useEffect, useId, useRef } from 'react';
import useScrollLock from '@/hooks/useScrollLock';

/** width 옵션 → 폭 클래스(정적 문자열이어야 Tailwind가 만든다). 기본은 440px */
const WIDTH_CLASSES = {
  560: 'w-[min(560px,calc(100vw-2rem))]',
  688: 'w-[min(688px,calc(100vw-2rem))]',
  720: 'w-[min(720px,calc(100vw-2rem))]',
  1040: 'w-[min(1040px,calc(100vw-2rem))]',
};

/** 모바일 시트 경계. Tailwind max-[760px](width < 760px)와 같은 조건 */
const SHEET_QUERY = '(width < 760px)';
/** 끌어서 닫기: 이만큼(px) 넘게 내리거나, 20px 넘게 내리며 이 속도(px/ms)보다 빠르면 닫는다 */
const DRAG_CLOSE_DISTANCE = 80;
const DRAG_CLOSE_SPEED = 0.5;
/** 시트가 올라오고 내려가는 시간(ms) */
const SHEET_MOTION_MS = 200;

/** 760px 미만 시트 공통: 위 모서리만 둥글게, 홈 표시줄 여백, 아래에서 올라오는 움직임 */
const SHEET_MOTION =
  'max-[760px]:max-h-[calc(100dvh-2rem)] max-[760px]:w-full max-[760px]:max-w-none max-[760px]:rounded-b-none max-[760px]:pb-[env(safe-area-inset-bottom)] max-[760px]:motion-safe:transition-transform max-[760px]:motion-safe:duration-200 max-[760px]:motion-safe:ease-out max-[760px]:starting:translate-y-full';

/**
 * isConfirm: 왼쪽 정렬 확인 팝업(role="alertdialog", description이 있으면 aria-describedby로 연결), 아니면 제목 줄과 ✕가 있는 입력 모달.
 *            제목 18px 600, 설명 16px 회색. 버튼은 760px 이상이면 오른쪽에 자기 너비로, 760px 미만이면 반반 꽉 참
 * 760px 미만에서 확인 창(isConfirm)을 뺀 모든 모달은 아래 시트로 보인다: 화면 아래에 붙고 폭 100%, 위 모서리만 둥글게,
 *   손잡이 막대, 높이는 화면 − 2rem까지(넘치면 본문 안쪽 스크롤), 맨 아래 홈 표시줄 여백, 열 때 아래에서 올라온다(동작 줄이기 설정이면 없음).
 *   손잡이·제목 줄을 아래로 끌어 80px 넘게 내리거나 빠르게 내리면 닫힌다(닫을 수 없는 동안은 제자리로). 푸터 버튼은 반반 꽉 참
 * isLarge: 화면을 크게 덮는 모달. 본문(children)이 남는 높이를 차지하고 푸터는 맨 아래에 구분선과 함께 고정.
 *          760px 미만 시트에서는 높이가 화면 − 2rem 고정, 푸터의 안내 문구(<p>)는 버튼 위 한 줄, 버튼 묶음(<div>)은 반반 꽉 참
 * isAutoHeight: isLarge와 함께 쓴다. 높이를 내용에 맞추고 화면을 넘으면 본문 안쪽에서 스크롤
 * isCloseIconHidden: 제목 줄 오른쪽 위 ✕를 숨긴다. 배경 클릭·ESC 닫기는 그대로
 * isWide: 가로 688px(본문 640px) 입력 모달. 푸터 버튼은 내용 너비로 오른쪽 정렬(760px 미만은 반반 꽉 참)
 * width: 가로 폭(px) 560·688·720·1040, 없으면 440(isLarge는 760). isWide(688)보다 우선. 화면보다 좁으면 양옆 1rem을 남긴다
 * headerLead: 제목 줄 왼쪽에 제목 대신 둘 요소(예: 「‹ 다시 검색」). isTitleHidden와 함께 쓴다
 * isHeaderBorderHidden: 제목 줄 아래 구분선을 없앤다
 * isHeaderHidden: 제목 줄(제목·✕)을 화면에서 통째로 숨긴다(화면 읽기용 제목은 유지). 본문이 모달 위 끝부터 꽉 차게 그릴 때(사진 배너 등) 쓰고,
 *                 닫기 버튼은 본문에서 직접 둔다. 760px 미만 시트의 손잡이 막대는 그대로 있다
 * isSheetDisabled: 760px 미만에서도 아래 시트로 바꾸지 않고 가운데 팝업으로 둔다(손잡이·끌어서 닫기 없음). 랜딩 진입 안내처럼 화면을 여는 첫 팝업에 쓴다
 * isTitleHidden: 제목 글자를 화면에서 숨긴다(화면 읽기용 이름은 유지, ✕는 오른쪽에 그대로)
 * isTitleSmall: 제목을 18px(확인 창 제목과 같은 크기)로 줄인다. 기본은 22px
 * isDismissDisabled: 배경 클릭·ESC로 닫지 않는다(입력 유실 방지). ✕·푸터 버튼으로만 닫힌다
 * 열려 있는 동안 페이지 스크롤을 잠근다(useScrollLock, 창이 겹쳐도 마지막이 닫힐 때 풀린다)
 * 길어지면(isTop이 아닐 때) 제목 줄·푸터는 두고 본문만 안쪽에서 스크롤한다(막대가 모서리 밖으로 나가지 않게).
 *   dialog 자체는 overflow-hidden이라 브라우저 기본값(dialog:modal overflow auto)으로 막대가 하나 더 생기지 않는다
 * isTop: 760px 이상에서 가운데 대신 화면 위에서 80px 떨어져 고정(760px 미만은 다른 모달과 같은 아래 시트). 내용 높이가 바뀌어도(검색 결과 등) 위치가 고정.
 *        dialog를 화면 전체 투명 스크롤 영역으로 두고 흰 판을 그 안에 놓아, 길어지면 모달 안이 아니라 화면 전체 스크롤
 */
export default function Modal({
  title,
  description,
  footer,
  isConfirm = false,
  isLarge = false,
  isAutoHeight = false,
  isCloseIconHidden = false,
  isWide = false,
  width = null,
  isTop = false,
  isTitleHidden = false,
  isTitleSmall = false,
  headerLead = null,
  isHeaderBorderHidden = false,
  isHeaderHidden = false,
  isSheetDisabled = false,
  isDismissDisabled = false,
  isPending = false,
  onClose,
  children,
}) {
  const dialogRef = useRef(null);
  /** 끌어서 닫을 때 움직이는 판(isTop은 안쪽 흰 판, 아니면 dialog) */
  const sheetRef = useRef(null);
  const dragRef = useRef(null);
  const closeTimerRef = useRef(null);
  const hasSheet = !isConfirm && !isSheetDisabled;
  const titleId = useId();
  const descId = useId();
  useScrollLock();

  /** ConfirmModal과 같은 showModal·cleanup 방식 */
  useEffect(() => {
    const dialog = dialogRef.current;
    dialog.showModal();
    return () => {
      clearTimeout(closeTimerRef.current);
      dialog.close();
    };
  }, []);

  const handleCancel = (event) => {
    event.preventDefault();
    if (!isPending && !isDismissDisabled) onClose();
  };

  /**
   * 닫을 수 없는 동안(isDismissDisabled·isPending) Esc는 keydown에서 막는다.
   * cancel의 preventDefault만으로는 Esc를 연달아 누르면 Chrome이 dialog를 강제로 닫는다
   */
  const handleKeyDown = (event) => {
    if (event.key === 'Escape' && (isDismissDisabled || isPending))
      event.preventDefault();
  };

  /** 배경(backdrop) 클릭 판별. isTop은 dialog의 스크롤바를 잡는 것도 dialog 클릭이라 그 영역은 제외 */
  const handleMouseDown = (event) => {
    if (event.target !== event.currentTarget || isPending || isDismissDisabled)
      return;
    const dialog = event.currentTarget;
    if (
      event.clientX >=
      dialog.getBoundingClientRect().left + dialog.clientWidth
    )
      return;
    event.preventDefault();
    onClose();
  };

  /**
   * 끌어서 닫기(760px 미만 시트, 손잡이·제목 줄에서만 시작). 본문은 스크롤하므로 끌기를 시작하지 않는다.
   * 놓을 때 기준을 넘으면 아래로 빠진 뒤 onClose, 아니면 제자리로. 닫을 수 없는 동안은 항상 제자리로
   */
  const handleDragStart = (event) => {
    if (!hasSheet || !window.matchMedia(SHEET_QUERY).matches) return;
    if (event.button !== 0 || event.target.closest('button, a, input')) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    sheetRef.current.style.transition = 'none';
    dragRef.current = {
      startY: event.clientY,
      lastY: event.clientY,
      lastTime: event.timeStamp,
      speed: 0,
    };
  };

  const handleDragMove = (event) => {
    const drag = dragRef.current;
    if (!drag) return;
    const elapsed = event.timeStamp - drag.lastTime;
    if (elapsed > 0) drag.speed = (event.clientY - drag.lastY) / elapsed;
    drag.lastY = event.clientY;
    drag.lastTime = event.timeStamp;
    const offset = Math.max(0, event.clientY - drag.startY);
    sheetRef.current.style.transform = `translateY(${offset}px)`;
  };

  const handleDragEnd = () => {
    const drag = dragRef.current;
    if (!drag) return;
    dragRef.current = null;
    const sheet = sheetRef.current;
    const offset = Math.max(0, drag.lastY - drag.startY);
    const isFlick = offset > 20 && drag.speed > DRAG_CLOSE_SPEED;
    const isClosing =
      !isPending &&
      !isDismissDisabled &&
      (offset > DRAG_CLOSE_DISTANCE || isFlick);
    const isReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    sheet.style.transition = isReduced
      ? 'none'
      : `transform ${SHEET_MOTION_MS}ms ease-out`;
    if (!isClosing) {
      sheet.style.transform = '';
      return;
    }
    sheet.style.transform = 'translateY(100%)';
    closeTimerRef.current = setTimeout(
      onClose,
      isReduced ? 0 : SHEET_MOTION_MS,
    );
  };

  const dragProps = {
    onPointerDown: handleDragStart,
    onPointerMove: handleDragMove,
    onPointerUp: handleDragEnd,
    onPointerCancel: handleDragEnd,
  };

  /** 확인 창은 alertdialog, 설명이 있으면 그 문구를 aria-describedby로 연결 */
  const dialogProps = {
    'aria-labelledby': titleId,
    ...(isConfirm && {
      role: 'alertdialog',
      ...(description && { 'aria-describedby': descId }),
    }),
  };

  const widthClass =
    WIDTH_CLASSES[width] ??
    (isWide ? WIDTH_CLASSES[688] : 'w-[min(440px,calc(100vw-2rem))]');

  const content = (
    <>
      {isConfirm ? (
        <div className="px-6 pt-7 pb-5">
          <h2
            id={titleId}
            className="text-lg leading-7 font-semibold break-keep"
          >
            {title}
          </h2>
          {description && (
            <p
              id={descId}
              className="mt-2 text-base leading-6 break-keep text-muted"
            >
              {description}
            </p>
          )}
          {children}
        </div>
      ) : (
        <>
          {/** 손잡이 막대: 760px 미만 시트에서만, 위아래 넓은 자리까지 끌기 시작 */}
          <span
            aria-hidden="true"
            {...dragProps}
            className={`absolute top-0 left-1/2 z-1 flex h-5 w-20 -translate-x-1/2 touch-none items-start justify-center pt-2 min-[760px]:hidden ${hasSheet ? '' : 'hidden'}`}
          >
            <span className="h-1 w-9 rounded-xs bg-line-strong" />
          </span>
          <header
            {...dragProps}
            className={
              isHeaderHidden
                ? 'sr-only'
                : `flex shrink-0 items-center justify-between gap-3 px-6 ${isHeaderBorderHidden ? '' : 'border-b border-line-soft'} py-3 max-[760px]:touch-none`
            }
          >
            {headerLead}
            <h2
              id={titleId}
              className={
                isTitleHidden
                  ? 'sr-only'
                  : `font-bold ${isTitleSmall ? 'text-lg' : 'text-[22px]'}`
              }
            >
              {title}
            </h2>
            {!isCloseIconHidden && (
              <button
                type="button"
                onClick={onClose}
                disabled={isPending}
                aria-label="닫기"
                className="ml-auto grid size-8 place-items-center rounded-md text-subtle hover:bg-surface-2"
              >
                <X className="size-5" />
              </button>
            )}
          </header>
          <div
            className={
              isLarge
                ? /**
                   * isAutoHeight는 flex-auto(내용 높이에서 시작). 모달이 h-fit인데 본문이 flex-1(0에서 시작)이면
                   * iOS WebKit(Safari·Chrome)이 본문과 모달 높이를 0으로 잡아 배경만 보인다(2026-11-24 iPhone 16 Pro 확인)
                   */
                  `flex min-h-0 flex-col overflow-y-auto ${isAutoHeight ? 'flex-auto' : 'flex-1 min-[760px]:overflow-hidden'}`
                : 'min-h-0 overflow-y-auto px-6 py-5'
            }
          >
            {children}
          </div>
        </>
      )}
      {/* isLarge는 푸터가 없으면(false·null) 구분선 줄도 그리지 않는다 */}
      {(!isLarge || footer) && (
        <footer
          className={
            isLarge
              ? 'flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-line px-6 py-2.5 max-[760px]:[&>p]:w-full max-[760px]:[&>span:empty]:hidden max-[760px]:[&>div:has(>button~button)]:flex-1 max-[760px]:[&>div:has(>button~button)>button]:min-w-0 max-[760px]:[&>div:has(>button~button)>button]:flex-1'
              : isWide
                ? 'flex justify-end gap-2 px-6 pb-6 max-[760px]:*:min-w-0 max-[760px]:*:flex-1'
                : isConfirm
                  ? 'flex gap-2 px-6 pb-6 max-[760px]:*:min-w-0 max-[760px]:*:flex-1 min-[760px]:justify-end min-[760px]:*:min-w-20'
                  : 'flex gap-2 px-6 pb-6 *:min-w-0 *:flex-1'
          }
        >
          {footer}
        </footer>
      )}
    </>
  );

  if (isTop) {
    return (
      <dialog
        ref={dialogRef}
        {...dialogProps}
        className="m-0 size-full max-h-none max-w-none overflow-y-auto overscroll-contain bg-transparent p-0 backdrop:bg-dim/45 max-[760px]:overflow-hidden max-[760px]:open:flex max-[760px]:open:flex-col"
        onCancel={handleCancel}
        onKeyDown={handleKeyDown}
        onMouseDown={handleMouseDown}
      >
        <div
          ref={sheetRef}
          className={`relative mx-auto mt-20 mb-10 rounded-modal bg-white shadow-depth-lg ${widthClass} max-[760px]:mt-auto max-[760px]:mb-0 max-[760px]:flex max-[760px]:flex-col max-[760px]:overflow-hidden ${SHEET_MOTION}`}
        >
          {content}
        </div>
      </dialog>
    );
  }

  /** 760px 미만 아래 시트: 화면 아래에 붙인다(확인 창은 가운데 카드 그대로) */
  const sheetClass = hasSheet
    ? `max-[760px]:fixed max-[760px]:m-0 max-[760px]:mt-auto ${SHEET_MOTION}`
    : '';

  return (
    <dialog
      ref={(node) => {
        dialogRef.current = node;
        sheetRef.current = node;
      }}
      {...dialogProps}
      className={`m-auto bg-white p-0 shadow-depth-lg backdrop:bg-dim/45 ${
        isLarge
          ? `${
              isAutoHeight
                ? 'h-fit max-h-[calc(100dvh-2rem)]'
                : 'h-[min(660px,calc(100dvh-2rem))] max-h-none max-[760px]:h-[calc(100dvh-2rem)]'
            } ${WIDTH_CLASSES[width] ?? 'w-[min(760px,calc(100vw-2rem))]'} max-w-none flex-col overflow-hidden rounded-modal open:flex`
          : `max-h-[calc(100dvh-2rem)] flex-col overflow-hidden rounded-modal open:flex ${widthClass}`
      } ${sheetClass}`}
      onCancel={handleCancel}
      onKeyDown={handleKeyDown}
      onMouseDown={handleMouseDown}
    >
      {content}
    </dialog>
  );
}
