import { useState } from 'react';
import { PanelLeftOpen, SquarePen, Trash2, X } from 'lucide-react';
import DeleteConversationModal from './DeleteConversationModal';

/** 일시 표기 변환 */
const formatDate = (regDt) => regDt.slice(0, 10).replaceAll('-', '.');

/** 새 대화 헤더와 같이 씀 */
export const chatHeaderClass =
  'flex h-16 shrink-0 items-center gap-3 border-b border-[#e2e7e7] bg-white px-6 max-[760px]:h-14 max-[760px]:gap-2 max-[760px]:px-2';

const mobileIconButton =
  'hidden size-9 shrink-0 items-center justify-center rounded-full text-[#3d4a4b] hover:bg-[#f4f6f6] max-[760px]:flex';

/**
 * 대화 제목 줄 오른쪽 끝 AI 매니저 닫기(모달만, 모든 폭 같은 자리)
 * - hasDivider: 앞에 [삭제]가 있으면 구분선으로 떼어 둠
 */
export function CloseButton({ onClick, hasDivider = false }) {
  return (
    <>
      {hasDivider ? (
        <span aria-hidden="true" className="h-5 w-px shrink-0 bg-[#e2e7e7]" />
      ) : (
        <span aria-hidden="true" className="ml-auto" />
      )}
      <button
        type="button"
        aria-label="AI 매니저 닫기"
        title="닫기"
        className="flex size-9 shrink-0 items-center justify-center rounded-full text-[#3d4a4b] hover:bg-[#f4f6f6]"
        onClick={onClick}
      >
        <X size={20} aria-hidden="true" />
      </button>
    </>
  );
}

/** 760px 미만: 사이드바 띠 대신 헤더에서 대화 목록 drawer를 엶 */
export function DrawerButton({ onClick }) {
  return (
    <button
      type="button"
      aria-label="대화 목록 열기"
      className={mobileIconButton}
      onClick={onClick}
    >
      <PanelLeftOpen size={20} aria-hidden="true" />
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
  pets,
  onDeleted,
  onOpenDrawer,
  onNewChat,
  onBack,
}) {
  const [isConfirming, setIsConfirming] = useState(false);

  return (
    <header className={chatHeaderClass}>
      <DrawerButton onClick={onOpenDrawer} />
      <h1 className="truncate text-lg font-bold text-[#1a3234] max-[760px]:text-base">
        {conversation.cnvrsTtl}
      </h1>
      <span className="shrink-0 rounded-full bg-[#e9f2f2] px-2.5 py-0.5 text-xs font-medium text-[#285a5c]">
        {pets?.find((pet) => pet.petSn === conversation.petSn)?.petNm ?? '전체'}
      </span>
      <span className="truncate text-sm text-[#667374] max-[760px]:hidden">
        {formatDate(conversation.regDt)}
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
      {onBack && <CloseButton onClick={onBack} hasDivider />}

      {isConfirming && (
        <DeleteConversationModal
          aiCnvrsRoomSn={conversation.aiCnvrsRoomSn}
          onDeleted={onDeleted}
          onClose={() => setIsConfirming(false)}
        />
      )}
    </header>
  );
}
