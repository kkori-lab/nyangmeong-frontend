import { CircleAlert } from 'lucide-react';
import { useState } from 'react';
import { BTN_PRIMARY, BTN_SECONDARY } from './buttonStyles';
import Modal from './Modal';

const DETAIL_MAX = 500;
const ETC = '기타';
const REPORT_REASONS = [
  '스팸 · 광고성',
  '욕설 · 비방',
  '음란물 · 유해 콘텐츠',
  '개인정보 노출',
  '사기 · 허위 정보',
  ETC,
];

/**
 * 신고 모달(게시글·댓글 공용)
 * - 사유는 하나만 고르고 기본 선택이 없다. 상세 내용은 선택, 「기타」는 필수(최대 500자)
 * - 제출은 부모가 한다: onSubmit({ reason, detail }). 실패 문구는 errorMessage
 */
export default function ReportModal({
  title,
  targetLabel,
  isPending = false,
  errorMessage,
  onSubmit,
  onClose,
}) {
  const [reason, setReason] = useState('');
  const [detail, setDetail] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (isPending) return;
    if (!reason) {
      setError('신고 사유를 골라 주세요');
      return;
    }
    if (reason === ETC && !detail.trim()) {
      setError('기타를 고르셨다면 상세 내용을 적어 주세요');
      document.getElementById('report-detail')?.focus();
      return;
    }
    onSubmit({ reason, detail: detail.trim() });
  };

  const shownError = error || errorMessage;

  return (
    <Modal
      title={title}
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
            onClick={handleSubmit}
            disabled={isPending}
            className={BTN_PRIMARY}
          >
            신고 제출
          </button>
        </>
      }
    >
      <p className="mb-4 rounded-md bg-[#f4f6f6] px-3 py-2.5 text-sm leading-normal font-medium break-all text-[#3d4a4b]">
        {targetLabel}
      </p>
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-base font-semibold text-[#1a3234]">
          신고 사유
        </legend>
        {REPORT_REASONS.map((item) => (
          <label
            key={item}
            className="flex cursor-pointer items-center gap-2 text-base text-[#3d4a4b]"
          >
            <input
              type="radio"
              name="report-reason"
              value={item}
              checked={reason === item}
              onChange={() => {
                setReason(item);
                setError('');
              }}
              className="size-4 accent-[#285a5c]"
            />
            {item}
          </label>
        ))}
      </fieldset>
      <div className="mt-4 flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label
            htmlFor="report-detail"
            className="text-base font-semibold text-[#1a3234]"
          >
            상세 내용
            {reason === ETC && (
              <span className="ml-1 text-[#b4473a]" aria-hidden="true">
                (필수)
              </span>
            )}
          </label>
          <span className="text-xs text-[#667374]">
            {detail.length} / {DETAIL_MAX}
          </span>
        </div>
        <textarea
          id="report-detail"
          value={detail}
          maxLength={DETAIL_MAX}
          rows={3}
          required={reason === ETC}
          aria-required={reason === ETC}
          placeholder="신고 사유를 입력해 주세요."
          onChange={(event) => {
            setDetail(event.target.value);
            setError('');
          }}
          className="block w-full resize-none rounded-md border border-[#d3dae2] bg-white px-3 py-2 text-base placeholder:text-[#8c9899] focus:border-[#285a5c] focus:ring-focus focus:outline-none"
        />
      </div>
      {shownError && (
        <p
          role="alert"
          className="mt-3 flex items-center gap-1 text-sm text-[#b4473a]"
        >
          <CircleAlert size={14} aria-hidden="true" />
          {shownError}
        </p>
      )}
    </Modal>
  );
}
