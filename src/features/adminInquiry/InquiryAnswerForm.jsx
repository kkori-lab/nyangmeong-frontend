import { useState } from 'react';
import { BTN_PRIMARY, BTN_SECONDARY } from '@/components/buttonStyles';
import { showToast } from '@/components/toastStore';
import { formatDateTime } from '@/utils/formatDate';
import {
  useCreateAdminInquiryAnswer,
  useUpdateAdminInquiryAnswer,
} from './queries';

const TEXTAREA_CLASS =
  'block min-h-40 w-full resize-y rounded-[6px] border border-[#d3dae2] bg-white px-3 py-2 text-base leading-[1.5] text-[#1a3234] outline-none hover:border-[#b9c4c4] focus:border-[#285a5c] focus:shadow-[0_0_0_3px_rgba(40,90,92,0.18)]';

/** 답변 최대 글자 수 */
const MAX_ANSWER_LENGTH = 4000;

/** 답변 입력칸 + 글자 수 + 오류 + 버튼 */
function AnswerEditor({
  defaultValue,
  submitLabel,
  mutation,
  onSubmit,
  onCancel,
}) {
  const [ansCn, setAnsCn] = useState(defaultValue);
  const trimmed = ansCn.trim();
  const canSubmit = trimmed && trimmed !== defaultValue.trim();

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-ink-2">
        답변
        <textarea
          value={ansCn}
          maxLength={MAX_ANSWER_LENGTH}
          placeholder="답변을 입력해 주세요"
          className={`${TEXTAREA_CLASS} mt-1.5 font-normal`}
          onChange={(event) => setAnsCn(event.target.value)}
        />
      </label>
      <p className="text-right text-sm text-subtle tabular-nums">
        {ansCn.length.toLocaleString()} / {MAX_ANSWER_LENGTH.toLocaleString()}
      </p>
      {mutation.isError && (
        <p role="alert" className="text-sm text-danger">
          {mutation.error.message}
        </p>
      )}
      <div className="flex justify-end gap-2">
        {onCancel && (
          <button
            type="button"
            className={BTN_SECONDARY}
            disabled={mutation.isPending}
            onClick={onCancel}
          >
            취소
          </button>
        )}
        <button
          type="button"
          className={BTN_PRIMARY}
          disabled={!canSubmit || mutation.isPending}
          onClick={() => onSubmit(trimmed)}
        >
          {submitLabel}
        </button>
      </div>
    </div>
  );
}

/** 등록한 답변: 일시·처리 관리자 */
function AnswerView({ inquiry }) {
  return (
    <div className="space-y-2">
      <p className="text-sm text-subtle">
        <span className="tabular-nums">{formatDateTime(inquiry.ansDt)}</span>
        {inquiry.prcsMbrNcnm && ` · ${inquiry.prcsMbrNcnm}`}
      </p>
      <p className="break-words whitespace-pre-line text-base text-ink-2">
        {inquiry.ansCn}
      </p>
    </div>
  );
}

/**
 * [1:1 문의 답변]
 * - 답변 전: 입력 -> [답변 등록](회원에게 알림)
 * - 답변 후: 보기 -> [수정] -> [저장](알림 없음). 삭제는 없다
 * - 회원이 삭제한 문의는 입력 없이 안내(기존 답변은 읽기만)
 */
export default function InquiryAnswerForm({ inquiry }) {
  const [isEditing, setIsEditing] = useState(false);
  const create = useCreateAdminInquiryAnswer();
  const update = useUpdateAdminInquiryAnswer();
  const hasAnswer = inquiry.ansCn != null;

  const handleCreate = (ansCn) =>
    create.mutate(
      { otoInqrySn: inquiry.otoInqrySn, ansCn },
      { onSuccess: () => showToast('답변을 등록했어요') },
    );

  const handleUpdate = (ansCn) =>
    update.mutate(
      { otoInqrySn: inquiry.otoInqrySn, ansCn },
      {
        onSuccess: () => {
          setIsEditing(false);
          showToast('답변을 수정했어요');
        },
      },
    );

  const handleEditStart = () => {
    update.reset();
    setIsEditing(true);
  };

  const renderBody = () => {
    if (inquiry.delYn) {
      return (
        <>
          <p className="text-base text-subtle">회원이 삭제한 문의예요</p>
          {hasAnswer && (
            <div className="mt-3 border-t border-line pt-3">
              <AnswerView inquiry={inquiry} />
            </div>
          )}
        </>
      );
    }
    if (!hasAnswer) {
      return (
        <AnswerEditor
          defaultValue=""
          submitLabel="답변 등록"
          mutation={create}
          onSubmit={handleCreate}
        />
      );
    }
    if (isEditing) {
      return (
        <AnswerEditor
          defaultValue={inquiry.ansCn}
          submitLabel="저장"
          mutation={update}
          onSubmit={handleUpdate}
          onCancel={() => setIsEditing(false)}
        />
      );
    }
    return (
      <>
        <AnswerView inquiry={inquiry} />
        <div className="mt-3 flex justify-end">
          <button
            type="button"
            className={BTN_SECONDARY}
            onClick={handleEditStart}
          >
            수정
          </button>
        </div>
      </>
    );
  };

  return (
    <section className="rounded-[14px] border border-line bg-white p-4">
      {renderBody()}
    </section>
  );
}
