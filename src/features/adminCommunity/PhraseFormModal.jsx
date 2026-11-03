import { useId, useState } from 'react';
import { BTN_PRIMARY, BTN_SECONDARY } from '@/components/buttonStyles';
import Modal from '@/components/Modal';
import { showToast } from '@/components/toastStore';
import Toggle from '@/components/Toggle';
import {
  useCreateAdminTodayPhrase,
  useUpdateAdminTodayPhrase,
} from './queries';

const INPUT_CLASS =
  'block h-10 w-full rounded-[6px] border border-[#d3dae2] bg-white px-3 text-base leading-[1.4] text-[#1a3234] outline-none hover:border-[#b9c4c4] focus:border-[#285a5c] focus:shadow-[0_0_0_3px_rgba(40,90,92,0.18)] aria-invalid:border-danger';

/** 문구 최대 글자 수: 후보 문구 테이블 미정이라 가정값 */
const MAX_PHRS_LENGTH = 200;

/** 문구 칸 안내: 없으면 빈 문자열 */
const validate = (phrsCn) => {
  if (!phrsCn.trim()) return '문구를 입력해 주세요';
  if (phrsCn.length > MAX_PHRS_LENGTH) {
    return `문구는 ${MAX_PHRS_LENGTH}자 이하로 입력해 주세요`;
  }
  return '';
};

/**
 * [오늘의 한마디 문구 등록·수정 모달]
 * - phrase가 있으면 수정, 없으면 등록
 * - 사용 중인 문구만 매일 00:00 무작위 선택 대상
 */
export default function PhraseFormModal({ phrase, onClose }) {
  const formId = useId();
  const isEdit = Boolean(phrase);

  const [phrsCn, setPhrsCn] = useState(phrase?.phrsCn ?? '');
  const [useYn, setUseYn] = useState(phrase ? phrase.useYn : true);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const create = useCreateAdminTodayPhrase();
  const update = useUpdateAdminTodayPhrase();
  const save = isEdit ? update : create;

  const error = isSubmitted ? validate(phrsCn) : '';

  const handleSaved = () => {
    showToast(isEdit ? '문구를 수정했어요' : '문구를 등록했어요');
    onClose();
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (save.isPending) return;
    setIsSubmitted(true);
    if (validate(phrsCn)) return;
    const body = { phrsCn: phrsCn.trim(), useYn };
    if (isEdit) {
      update.mutate(
        { todayPhrsSn: phrase.todayPhrsSn, ...body },
        { onSuccess: handleSaved },
      );
      return;
    }
    create.mutate(body, { onSuccess: handleSaved });
  };

  return (
    <Modal
      title={isEdit ? '문구 수정' : '문구 등록'}
      isWide
      isPending={save.isPending}
      onClose={onClose}
      footer={
        <>
          <button
            type="button"
            className={BTN_SECONDARY}
            disabled={save.isPending}
            onClick={onClose}
          >
            취소
          </button>
          <button
            type="submit"
            form={formId}
            className={BTN_PRIMARY}
            disabled={save.isPending}
          >
            {isEdit ? '저장' : '등록'}
          </button>
        </>
      }
    >
      <form
        id={formId}
        noValidate
        onSubmit={handleSubmit}
        className="space-y-5"
      >
        <div>
          <label
            htmlFor={`${formId}-phrsCn`}
            className="mb-1.5 block text-sm font-semibold text-ink-2"
          >
            문구
          </label>
          <input
            id={`${formId}-phrsCn`}
            type="text"
            value={phrsCn}
            maxLength={MAX_PHRS_LENGTH}
            placeholder="문구를 입력해 주세요"
            aria-invalid={Boolean(error)}
            aria-describedby={`${formId}-phrsCn-error`}
            className={INPUT_CLASS}
            onChange={(event) => setPhrsCn(event.target.value)}
          />
          {error && (
            <p
              id={`${formId}-phrsCn-error`}
              className="mt-1.5 text-sm text-danger"
            >
              {error}
            </p>
          )}
        </div>
        <div>
          <p className="mb-1.5 text-sm font-semibold text-ink-2">사용</p>
          <div className="flex h-10 items-center gap-3">
            <Toggle checked={useYn} onChange={setUseYn} label="사용" />
            <span className="text-sm text-subtle">
              {useYn ? '사용' : '미사용'}
            </span>
          </div>
        </div>
        {save.isError && (
          <p role="alert" className="text-sm text-danger">
            {save.error.message}
          </p>
        )}
      </form>
    </Modal>
  );
}
