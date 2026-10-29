import { useState } from 'react';
import { Menu, SquarePen, Trash2 } from 'lucide-react';
import ConfirmModal from '@/components/ConfirmModal';
import { useDeleteConversation } from '../queries';

/** 일시 표기 변환 */
const formatDate = (regDt) => regDt.slice(0, 10).replaceAll('-', '.');

/** 새 대화 헤더와 같이 씀 */
export const chatHeaderClass =
  'flex h-16 shrink-0 items-center gap-3 border-b border-[#e2e7e7] bg-white px-6 max-[760px]:h-14 max-[760px]:gap-2 max-[760px]:px-2';

const mobileIconButton =
  'hidden size-9 shrink-0 items-center justify-center rounded-full text-[#3d4a4b] hover:bg-[#f4f6f6] max-[760px]:flex';

/** 760px 미만: 사이드바 띠 대신 헤더에서 대화 목록 drawer를 엶 */
export function DrawerButton({ onClick }) {
  return (
    <button
      type="button"
      aria-label="대화 목록 열기"
      className={mobileIconButton}
      onClick={onClick}
    >
      <Menu size={20} aria-hidden="true" />
    </button>
  );
}

/** 760px 미만: 헤더 오른쪽 새 대화 */
export function NewChatButton({ onClick }) {
  return (
    <button
      type="button"
      aria-label="새 대화"
      className={mobileIconButton}
      onClick={onClick}
    >
      <SquarePen size={20} aria-hidden="true" />
    </button>
  );
}

/** 대화 제목·삭제 헤더 */
export default function ConversationHeader({
  conversation,
  onDeleted,
  onOpenDrawer,
  onNewChat,
}) {
  const [isConfirming, setIsConfirming] = useState(false);
  const deleteConversation = useDeleteConversation();

  const handleDeleteConfirm = () => {
    deleteConversation.mutate(conversation.aiCnvrsRoomSn, {
      onSuccess: () => onDeleted(),
    });
  };

  const handleDeleteCancel = () => {
    deleteConversation.reset();
    setIsConfirming(false);
  };

  return (
    <header className={chatHeaderClass}>
      <DrawerButton onClick={onOpenDrawer} />
      <h1 className="truncate text-lg font-bold text-[#1a3234] max-[760px]:text-base">
        {conversation.cnvrsTtl}
      </h1>
      <span className="shrink-0 rounded-full bg-[#e9f2f2] px-2.5 py-0.5 text-xs font-medium text-[#285a5c]">
        {conversation.petNm ?? '전체'}
      </span>
      <span className="truncate text-sm text-[#667374] max-[760px]:hidden">
        {formatDate(conversation.regDt)} · 대화 제목은 첫 메시지로 자동 생성돼요
      </span>
      <button
        type="button"
        aria-label="삭제"
        className="ml-auto flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-sm font-medium text-[#285a5c] hover:bg-[#f4f6f6] max-[760px]:size-9 max-[760px]:justify-center max-[760px]:rounded-full max-[760px]:p-0"
        onClick={() => setIsConfirming(true)}
      >
        <Trash2 size={16} aria-hidden="true" />
        <span className="max-[760px]:hidden">삭제</span>
      </button>
      <NewChatButton onClick={onNewChat} />

      {isConfirming && (
        <ConfirmModal
          title="이 대화를 삭제할까요?"
          description="삭제한 대화와 메시지는 되돌릴 수 없어요."
          confirmLabel="삭제하기"
          errorMessage={
            deleteConversation.isError
              ? '삭제하지 못했어요. 잠시 뒤 다시 시도해 주세요'
              : undefined
          }
          isPending={deleteConversation.isPending}
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
        />
      )}
    </header>
  );
}
