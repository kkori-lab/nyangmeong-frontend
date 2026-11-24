import Modal from './Modal';
import { BTN_DANGER, BTN_PRIMARY, BTN_SECONDARY } from './buttonStyles';

/**
 * 확인 창. 공용 Modal의 isConfirm(440px 가운데 카드, 왼쪽 정렬, 760px 미만은 버튼 반반 꽉 참, 아래 시트 아님)으로 그린다.
 * 버튼 순서는 [취소][확인], 처음 포커스는 안전한 [취소]. ESC·배경 클릭은 onCancel, 처리 중에는 닫지 않는다
 * children: 설명 아래에 넣을 본문(선택). 안 넘기면 지금과 같음
 * isDanger: 되돌릴 수 없는 일(삭제 등)이면 확인 버튼을 빨간 바탕(BTN_DANGER)으로
 */
export default function ConfirmModal({
  title,
  description,
  confirmLabel = '확인',
  cancelLabel = '취소',
  errorMessage,
  isPending = false,
  isDanger = false,
  onConfirm,
  onCancel,
  children,
}) {
  return (
    <Modal
      isConfirm
      title={title}
      description={description}
      isPending={isPending}
      onClose={onCancel}
      footer={
        <>
          <button
            type="button"
            autoFocus
            disabled={isPending}
            className={BTN_SECONDARY}
            onClick={onCancel}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            disabled={isPending}
            className={isDanger ? BTN_DANGER : BTN_PRIMARY}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </>
      }
    >
      {children}
      {errorMessage && (
        <p role="alert" className="mt-2 text-sm text-danger">
          {errorMessage}
        </p>
      )}
    </Modal>
  );
}
