import { useEffect, useRef } from 'react';

export default function ConfirmModal({
  title,
  description,
  confirmLabel = '확인',
  cancelLabel = '취소',
  errorMessage,
  isPending = false,
  onConfirm,
  onCancel,
}) {
  const dialogRef = useRef(null);
  const cancelRef = useRef(null);

  /** showModal로 top layer 사용 */
  /** cleanup에서 닫기: StrictMode의 effect 이중 실행 시 showModal 중복 호출 오류 방지 */
  useEffect(() => {
    const dialog = dialogRef.current;
    dialog.showModal();
    /** 안전한 선택지에 초기 포커스 */
    cancelRef.current.focus();
    return () => dialog.close();
  }, []);

  /** ESC 기본 닫기 차단, 닫기는 부모에 위임 */
  const handleCancel = (event) => {
    event.preventDefault();
    if (!isPending) onCancel();
  };

  /** 배경(backdrop) 클릭 판별 */
  /** preventDefault: 포커스가 body로 옮겨져 부모가 돌려준 포커스가 사라지는 것 방지 */
  const handleMouseDown = (event) => {
    if (event.target !== event.currentTarget || isPending) return;
    event.preventDefault();
    onCancel();
  };

  return (
    <dialog
      ref={dialogRef}
      aria-label={title}
      className="m-auto w-80 rounded-[14px] bg-white p-0 shadow-lg backdrop:bg-black/40"
      onCancel={handleCancel}
      onMouseDown={handleMouseDown}
    >
      <div className="p-6">
        <p className="text-base font-bold text-[#1a3234]">{title}</p>
        {description && (
          <p className="mt-2 text-sm text-[#566465]">{description}</p>
        )}
        {errorMessage && (
          <p role="alert" className="mt-2 text-sm text-[#f44b21]">
            {errorMessage}
          </p>
        )}
        <div className="mt-6 flex justify-end gap-2">
          <button
            ref={cancelRef}
            type="button"
            disabled={isPending}
            className="h-10 rounded-lg border border-[#e2e7e7] px-4 text-sm text-[#3d4a4b] hover:bg-[#f4f6f6] disabled:opacity-50"
            onClick={onCancel}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            disabled={isPending}
            className="h-10 rounded-lg bg-[#285a5c] px-4 text-sm font-bold text-white hover:bg-[#1f4a4c] disabled:opacity-50"
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
}
