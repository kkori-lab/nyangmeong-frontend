import { Lock } from 'lucide-react';
import Badge from '@/components/Badge';
import { BTN_PRIMARY, BTN_SECONDARY } from '@/components/buttonStyles';
import Modal from '@/components/Modal';
import userIcon from '@/assets/user.svg';
import { addDays, formatDate, getYmdOf } from '@/utils/formatDate';
import { EXTEND_DAYS, foundCommentText } from '../missingCodes';

/** 「찾았어요」 확인: 자동으로 등록될 댓글을 미리 보여 준다(입력칸 없음) */
export function FoundConfirmModal({
  post,
  isPending,
  errorMessage,
  onConfirm,
  onClose,
}) {
  return (
    <Modal
      title="'찾았어요'로 바꿀까요?"
      isPending={isPending}
      onClose={onClose}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className={BTN_SECONDARY}
          >
            취소
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            className={BTN_PRIMARY}
          >
            찾았어요
          </button>
        </>
      }
    >
      <p className="mb-3 text-sm text-muted">아래 댓글이 자동으로 등록돼요</p>
      <div className="rounded-lg border border-warn-line bg-warn-soft px-4 py-3.5">
        <p className="flex items-center gap-2 text-sm">
          <span
            aria-hidden="true"
            style={{ backgroundImage: `url(${userIcon})` }}
            className="block size-8 shrink-0 rounded-full border border-line bg-white bg-cover bg-center"
          />
          <b className="text-base font-semibold text-ink">{post.mbrNcnm}</b>
          <Badge tone="ok">찾았어요</Badge>
        </p>
        <p className="mt-1.5 text-base leading-[1.6] text-ink">
          {foundCommentText(post.petNm)}
        </p>
      </div>
      <p className="mt-3 flex items-start gap-2 text-sm leading-[1.6] text-muted">
        <Lock size={16} aria-hidden="true" className="mt-0.5 shrink-0" />
        <span>
          바꾼 뒤에는 본문 · 사진 · 연락처 · 위치 · 댓글이 다른 사용자에게
          공개되지 않아요. 다시 &apos;실종&apos;으로 되돌릴 수 없어요.
        </span>
      </p>
      {errorMessage && (
        <p role="alert" className="mt-3 text-sm text-danger">
          {errorMessage}
        </p>
      )}
    </Modal>
  );
}

/** 「30일 더 게시」 확인: 새 종료일을 안내 */
export function ExtendConfirmModal({
  post,
  isPending,
  errorMessage,
  onConfirm,
  onClose,
}) {
  const nextEnd = formatDate(addDays(getYmdOf(post.expryCrtrDt), EXTEND_DAYS));
  return (
    <Modal
      isConfirm
      title="30일 더 게시할까요?"
      description={`게시 종료일이 ${nextEnd}로 늘어나요. 소중한 아이와 하루빨리 다시 만나길 바라요.`}
      isPending={isPending}
      onClose={onClose}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className={BTN_SECONDARY}
          >
            취소
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            className={BTN_PRIMARY}
          >
            30일 더 게시하기
          </button>
        </>
      }
    >
      {errorMessage && (
        <p role="alert" className="mt-3 text-sm text-danger">
          {errorMessage}
        </p>
      )}
    </Modal>
  );
}
