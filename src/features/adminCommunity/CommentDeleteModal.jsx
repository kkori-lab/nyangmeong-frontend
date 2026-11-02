import { useState } from 'react';
import { BTN_DANGER, BTN_SECONDARY } from '@/components/buttonStyles';
import Modal from '@/components/Modal';
import { showToast } from '@/components/toastStore';
import { useDeleteComment } from './queries';

const TEXTAREA_CLASS =
  'block min-h-24 w-full resize-none rounded-[6px] border border-[#d3dae2] bg-white px-3 py-2 text-base leading-[1.4] text-[#1a3234] outline-none hover:border-[#b9c4c4] focus:border-[#285a5c] focus:shadow-[0_0_0_3px_rgba(40,90,92,0.18)]';

/** 사유 최대 글자 수 */
const MAX_RSN_LENGTH = 1000;

/**
 * [댓글 삭제 모달]
 * - 사유 필수, 실패하면 입력을 유지하고 서버 문구 표시
 */
export default function CommentDeleteModal({ comment, onClose }) {
  const [delRsn, setDelRsn] = useState('');
  const deletion = useDeleteComment();

  const trimmedRsn = delRsn.trim();

  const handleDelete = () =>
    deletion.mutate(
      { cmntSn: comment.cmntSn, delRsn: trimmedRsn },
      {
        onSuccess: () => {
          showToast('댓글을 삭제했어요');
          onClose();
        },
      },
    );

  return (
    <Modal
      title="댓글 삭제"
      isTop
      isPending={deletion.isPending}
      onClose={onClose}
      footer={
        <>
          <button
            type="button"
            className={BTN_SECONDARY}
            disabled={deletion.isPending}
            onClick={onClose}
          >
            취소
          </button>
          <button
            type="button"
            className={BTN_DANGER}
            disabled={!trimmedRsn || deletion.isPending}
            onClick={handleDelete}
          >
            삭제
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <p className="mb-1.5 text-sm font-semibold text-ink-2">
            {comment.mbrNcnm} 님의 댓글
          </p>
          <p className="break-words whitespace-pre-line text-base text-ink">
            {comment.cmntCn}
          </p>
        </div>
        <label className="block text-sm font-semibold text-ink-2">
          사유
          <textarea
            value={delRsn}
            maxLength={MAX_RSN_LENGTH}
            placeholder="삭제 사유를 입력해 주세요"
            className={`${TEXTAREA_CLASS} mt-1.5 font-normal`}
            onChange={(event) => setDelRsn(event.target.value)}
          />
        </label>
        {deletion.isError && (
          <p role="alert" className="text-sm text-danger">
            {deletion.error.message}
          </p>
        )}
      </div>
    </Modal>
  );
}
