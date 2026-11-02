import { useState } from 'react';
import {
  BTN_DANGER,
  BTN_PRIMARY,
  BTN_SECONDARY,
} from '@/components/buttonStyles';
import Modal from '@/components/Modal';
import { showToast } from '@/components/toastStore';
import { useBlindPost, useRestorePost } from './queries';

const TEXTAREA_CLASS =
  'block min-h-24 w-full resize-none rounded-[6px] border border-[#d3dae2] bg-white px-3 py-2 text-base leading-[1.4] text-[#1a3234] outline-none hover:border-[#b9c4c4] focus:border-[#285a5c] focus:shadow-[0_0_0_3px_rgba(40,90,92,0.18)]';

/** 사유 최대 글자 수 */
const MAX_RSN_LENGTH = 1000;

/**
 * [게시글 블라인드·복구 모달]
 * - 사유 필수, 실패하면 입력을 유지하고 서버 문구 표시
 */
export default function PostStatusModal({ post, isRestore = false, onClose }) {
  const [chgRsn, setChgRsn] = useState('');
  const blind = useBlindPost();
  const restore = useRestorePost();

  const mutation = isRestore ? restore : blind;
  const actionLabel = isRestore ? '복구' : '블라인드';
  const trimmedRsn = chgRsn.trim();

  const handleSubmit = () =>
    mutation.mutate(
      { pstSn: post.pstSn, chgRsn: trimmedRsn },
      {
        onSuccess: () => {
          showToast(
            isRestore ? '게시글을 복구했어요' : '게시글을 블라인드했어요',
          );
          onClose();
        },
      },
    );

  return (
    <Modal
      title={`게시글 ${actionLabel}`}
      isTop
      isPending={mutation.isPending}
      onClose={onClose}
      footer={
        <>
          <button
            type="button"
            className={BTN_SECONDARY}
            disabled={mutation.isPending}
            onClick={onClose}
          >
            취소
          </button>
          <button
            type="button"
            className={isRestore ? BTN_PRIMARY : BTN_DANGER}
            disabled={!trimmedRsn || mutation.isPending}
            onClick={handleSubmit}
          >
            {actionLabel}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <p className="mb-1.5 text-sm font-semibold text-ink-2">게시글</p>
          <p className="break-words text-base text-ink">{post.pstTtl}</p>
        </div>
        <label className="block text-sm font-semibold text-ink-2">
          사유
          <textarea
            value={chgRsn}
            maxLength={MAX_RSN_LENGTH}
            placeholder={`${actionLabel} 사유를 입력해 주세요`}
            className={`${TEXTAREA_CLASS} mt-1.5 font-normal`}
            onChange={(event) => setChgRsn(event.target.value)}
          />
        </label>
        {mutation.isError && (
          <p role="alert" className="text-sm text-danger">
            {mutation.error.message}
          </p>
        )}
      </div>
    </Modal>
  );
}
