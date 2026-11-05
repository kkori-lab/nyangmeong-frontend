import { useState } from 'react';
import { BTN_DANGER, BTN_SECONDARY } from '@/components/buttonStyles';
import Modal from '@/components/Modal';
import { showToast } from '@/components/toastStore';
import { toFieldErrors, toFormError } from '@/utils/fieldErrors';
import { useRejectReport } from './queries';

const TEXTAREA_CLASS =
  'block min-h-24 w-full resize-none rounded-[6px] border border-[#d3dae2] bg-white px-3 py-2 text-base leading-[1.4] text-[#1a3234] outline-none hover:border-[#b9c4c4] focus:border-[#285a5c] focus:shadow-[0_0_0_3px_rgba(40,90,92,0.18)] aria-invalid:border-danger';

/** 사유 최대 글자 수 */
const MAX_RSN_LENGTH = 1000;

/**
 * [신고 반려 모달]
 * - 사유 필수, 그 신고 1건만 반려
 * - 실패하면 입력을 유지하고 서버 문구 표시
 */
export default function ReportRejectModal({ dclrSn, onClose }) {
  const [rjctRsn, setRjctRsn] = useState('');
  const reject = useRejectReport();

  // 400 칸별 오류는 사유 칸 아래, 그 밖의 오류는 아래 줄
  const fieldError = toFieldErrors(reject.error).rjctRsn;
  const formError = toFormError(reject.error, ['rjctRsn']);
  const trimmedRsn = rjctRsn.trim();

  const handleSubmit = () =>
    reject.mutate(
      { dclrSn, rjctRsn: trimmedRsn },
      {
        onSuccess: () => {
          showToast('신고를 반려했어요');
          onClose();
        },
      },
    );

  return (
    <Modal
      title="신고 반려"
      isTop
      isPending={reject.isPending}
      onClose={onClose}
      footer={
        <>
          <button
            type="button"
            className={BTN_SECONDARY}
            disabled={reject.isPending}
            onClick={onClose}
          >
            취소
          </button>
          <button
            type="button"
            className={BTN_DANGER}
            disabled={!trimmedRsn || reject.isPending}
            onClick={handleSubmit}
          >
            반려
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <label className="block text-sm font-semibold text-ink-2">
          사유
          <textarea
            value={rjctRsn}
            maxLength={MAX_RSN_LENGTH}
            placeholder="반려 사유를 입력해 주세요"
            aria-invalid={Boolean(fieldError)}
            className={`${TEXTAREA_CLASS} mt-1.5 font-normal`}
            onChange={(event) => setRjctRsn(event.target.value)}
          />
          {fieldError && (
            <span className="mt-1.5 block font-normal text-danger">
              {fieldError}
            </span>
          )}
        </label>
        {formError && (
          <p role="alert" className="text-sm text-danger">
            {formError}
          </p>
        )}
      </div>
    </Modal>
  );
}
