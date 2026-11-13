import { useEffect, useRef } from 'react';
import Icon from '@/components/Icon';
import { BTN_PRIMARY, BTN_SECONDARY } from '@/components/buttonStyles';

/**
 * [건강 일지 입력 모달 틀]
 * - 머리 아이콘·제목·✕, 본문, 하단 줄(필수 안내·취소·저장)
 * - ESC·✕·취소로 닫음. 저장 중에는 닫지 않음
 * - cancelLabel·onCancel: 왼쪽 버튼을 닫기가 아닌 다른 일(예: 다시 촬영하기)로 바꿀 때
 * - hasRequiredNote: 하단 왼쪽 "* 표시는 필수 항목이에요", isSubmitDisabled: 저장 비활성
 */
export default function FormModal({
  icon,
  title,
  submitLabel = '저장',
  cancelLabel = '취소',
  isPending = false,
  isSubmitDisabled = false,
  hasRequiredNote = true,
  hasFooter = true,
  widthClassName = 'w-[min(720px,calc(100%-32px))]',
  onSubmit,
  onCancel,
  onClose,
  children,
}) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    dialog.showModal();
    return () => dialog.close();
  }, []);

  const handleCancel = (event) => {
    event.preventDefault();
    if (!isPending) onClose();
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!isPending && !isSubmitDisabled) onSubmit();
  };

  return (
    <dialog
      ref={dialogRef}
      aria-label={title}
      className={`m-auto max-h-[calc(100vh-32px)] ${widthClassName} flex-col rounded-[20px] bg-white p-0 shadow-[0_24px_64px_-12px_rgba(15,23,35,0.35)] backdrop:bg-[rgba(15,23,35,0.45)] open:flex`}
      onCancel={handleCancel}
    >
      <form
        noValidate
        className="flex min-h-0 flex-1 flex-col"
        onSubmit={handleSubmit}
      >
        <header className="flex items-start gap-3.5 border-b border-[#edf1f1] px-7 pt-6 pb-5">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#e9f2f2] text-[#285a5c]">
            <Icon name={icon} />
          </span>
          <h2 className="flex-1 pt-1.5 text-xl leading-[1.35] font-bold text-[#1a3234]">
            {title}
          </h2>
          <button
            type="button"
            aria-label="닫기"
            disabled={isPending}
            className="-mt-1 -mr-2 grid size-9 shrink-0 place-items-center rounded-[10px] text-[#566465] hover:bg-[#ebf0f0] hover:text-[#1a3234]"
            onClick={onClose}
          >
            <Icon name="close" />
          </button>
        </header>

        <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-7 pt-6 pb-7">
          {children}
        </div>

        {hasFooter && (
          <footer className="flex items-center justify-end gap-2 rounded-b-[20px] border-t border-[#e2e7e7] bg-[#fbfcfd] px-7 py-4">
            {hasRequiredNote && (
              <p className="mr-auto text-[#566465]">
                <span className="font-bold text-[#b4473a]">*</span> 표시는 필수
                항목이에요
              </p>
            )}
            <button
              type="button"
              disabled={isPending}
              className={`${BTN_SECONDARY} min-w-24 ${hasRequiredNote ? '' : 'mr-auto'}`}
              onClick={onCancel ?? onClose}
            >
              {cancelLabel}
            </button>
            <button
              type="submit"
              disabled={isPending || isSubmitDisabled}
              className={`${BTN_PRIMARY} min-w-24`}
            >
              {submitLabel}
            </button>
          </footer>
        )}
      </form>
    </dialog>
  );
}
