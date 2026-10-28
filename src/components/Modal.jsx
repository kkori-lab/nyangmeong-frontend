import { X } from 'lucide-react';
import { useEffect, useId, useRef } from 'react';

/**
 * isConfirm: 가운데 정렬 확인 팝업, 아니면 제목 줄과 ✕가 있는 입력 모달
 * isLarge: 화면을 크게 덮는 모달. 본문(children)이 남는 높이를 차지하고 푸터는 맨 아래에 구분선과 함께 고정,
 *          760px 이하에서는 화면 전체
 * isAutoHeight: isLarge와 함께 쓴다. 높이를 내용에 맞추고 화면을 넘으면 본문 안쪽에서 스크롤, 760px 이하는 화면 전체 그대로
 * isCloseIconHidden: 제목 줄 오른쪽 위 ✕를 숨긴다. 배경 클릭·ESC 닫기는 그대로
 * isSheet: 760px 이하에서만 아래에서 올라오는 시트(손잡이 막대 포함), 그 위 폭은 가운데 모달 그대로
 * isWide: 가로 688px(본문 640px) 입력 모달. 제목 줄 위아래 8px, 푸터 버튼은 내용 너비로 오른쪽 정렬
 * isTop: 가운데 대신 화면 위에서 80px 떨어져 고정. 내용 높이가 바뀌어도(검색 결과 등) 위치가 움직이지 않는다.
 *        dialog를 화면 전체 투명 스크롤 영역으로 두고 흰 판을 그 안에 놓아, 길어지면 모달 안이 아니라 화면 전체가 스크롤된다
 */
export default function Modal({
  title,
  description,
  footer,
  isConfirm = false,
  isLarge = false,
  isAutoHeight = false,
  isCloseIconHidden = false,
  isSheet = false,
  isWide = false,
  isTop = false,
  isPending = false,
  onClose,
  children,
}) {
  const dialogRef = useRef(null);
  const titleId = useId();

  /** ConfirmModal과 같은 showModal·cleanup 방식 */
  useEffect(() => {
    const dialog = dialogRef.current;
    dialog.showModal();
    return () => dialog.close();
  }, []);

  const handleCancel = (event) => {
    event.preventDefault();
    if (!isPending) onClose();
  };

  /** 배경(backdrop) 클릭 판별. isTop은 dialog의 스크롤바를 잡는 것도 dialog 클릭이라 그 영역은 뺀다 */
  const handleMouseDown = (event) => {
    if (event.target !== event.currentTarget || isPending) return;
    const dialog = event.currentTarget;
    if (
      event.clientX >=
      dialog.getBoundingClientRect().left + dialog.clientWidth
    )
      return;
    event.preventDefault();
    onClose();
  };

  const width = isWide
    ? 'w-[min(688px,calc(100vw-2rem))]'
    : 'w-[min(440px,calc(100vw-2rem))]';

  const content = (
    <>
      {isConfirm ? (
        <div className="px-8 pt-8 pb-6 text-center">
          <h2
            id={titleId}
            className="text-lg leading-[1.35] font-bold break-keep"
          >
            {title}
          </h2>
          {description && (
            <p className="mt-2 leading-[1.6] break-keep text-muted">
              {description}
            </p>
          )}
          {children}
        </div>
      ) : (
        <>
          {isSheet && (
            <span
              aria-hidden="true"
              className="absolute top-2 left-1/2 h-1 w-9 -translate-x-1/2 rounded-xs bg-line-strong min-[761px]:hidden"
            />
          )}
          <header
            className={`flex shrink-0 items-center justify-between gap-3 border-b border-line-soft px-6 ${isLarge ? 'py-2.5' : isWide ? 'py-2' : 'py-4'}`}
          >
            <h2 id={titleId} className="text-lg font-bold">
              {title}
            </h2>
            {!isCloseIconHidden && (
              <button
                type="button"
                onClick={onClose}
                disabled={isPending}
                aria-label="닫기"
                className="grid size-8 place-items-center rounded-md text-subtle hover:bg-surface-2"
              >
                <X className="size-5" />
              </button>
            )}
          </header>
          <div
            className={
              isLarge
                ? `flex min-h-0 flex-1 flex-col overflow-y-auto ${isAutoHeight ? '' : 'min-[761px]:overflow-hidden'}`
                : 'px-6 py-5'
            }
          >
            {children}
          </div>
        </>
      )}
      <footer
        className={
          isLarge
            ? 'flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-line px-6 py-2.5'
            : isWide
              ? 'flex justify-end gap-2 px-6 pb-6'
              : 'flex gap-2 px-6 pb-6 *:min-w-0 *:flex-1'
        }
      >
        {footer}
      </footer>
    </>
  );

  if (isTop) {
    return (
      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        className="m-0 size-full max-h-none max-w-none overflow-y-auto overscroll-contain bg-transparent p-0 backdrop:bg-[rgba(15,23,35,0.45)]"
        onCancel={handleCancel}
        onMouseDown={handleMouseDown}
      >
        <div
          className={`mx-auto mt-20 mb-10 rounded-modal bg-white shadow-depth-lg ${width}`}
        >
          {content}
        </div>
      </dialog>
    );
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      className={`m-auto bg-white p-0 shadow-depth-lg backdrop:bg-[rgba(15,23,35,0.45)] ${
        isLarge
          ? `${
              isAutoHeight
                ? 'max-h-[calc(100dvh-2rem)] min-[761px]:h-fit'
                : 'h-[min(660px,calc(100dvh-2rem))] max-h-none'
            } w-[min(760px,calc(100vw-2rem))] max-w-none flex-col rounded-modal open:flex max-[760px]:h-dvh max-[760px]:max-h-none max-[760px]:w-screen max-[760px]:rounded-none`
          : `max-h-[calc(100vh-2rem)] rounded-modal ${width}`
      } ${
        isSheet
          ? 'max-[760px]:relative max-[760px]:m-0 max-[760px]:mt-auto max-[760px]:max-h-[calc(100dvh-2rem)] max-[760px]:w-full max-[760px]:max-w-none max-[760px]:rounded-b-none'
          : ''
      }`}
      onCancel={handleCancel}
      onMouseDown={handleMouseDown}
    >
      {content}
    </dialog>
  );
}
