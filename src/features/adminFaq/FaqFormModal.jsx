import { useId, useState } from 'react';
import { BTN_PRIMARY, BTN_SECONDARY } from '@/components/buttonStyles';
import Modal from '@/components/Modal';
import Select from '@/components/Select';
import Skeleton from '@/components/Skeleton';
import { showToast } from '@/components/toastStore';
import Toggle from '@/components/Toggle';
import { useAdminFaq, useCreateAdminFaq, useUpdateAdminFaq } from './queries';
import { toFieldErrors } from '@/utils/fieldErrors';

const INPUT_CLASS =
  'block h-10 w-full rounded-[6px] border border-[#d3dae2] bg-white px-3 text-base leading-[1.4] text-[#1a3234] outline-none hover:border-[#b9c4c4] focus:border-[#285a5c] focus:shadow-[0_0_0_3px_rgba(40,90,92,0.18)]';
const TEXTAREA_CLASS =
  'block min-h-[200px] w-full resize-y rounded-[6px] border border-[#d3dae2] bg-white px-3 py-2 text-base leading-[1.6] text-[#1a3234] outline-none hover:border-[#b9c4c4] focus:border-[#285a5c] focus:shadow-[0_0_0_3px_rgba(40,90,92,0.18)]';

/** 질문 최대 글자 수 */
const MAX_QSTN_LENGTH = 200;
/** 답변 최대 글자 수 */
const MAX_ANS_LENGTH = 4000;
/** 정렬 순서: 0 이상 정수 */
const SORT_SEQ_PATTERN = /^\d+$/;

/** 칸 이름과 글자 수 */
function FieldLabel({ htmlFor, label, length, maxLength }) {
  return (
    <div className="mb-1.5 flex items-center justify-between">
      <label htmlFor={htmlFor} className="text-sm font-semibold text-ink-2">
        {label}
      </label>
      {maxLength && (
        <span className="text-sm text-subtle tabular-nums">
          {length.toLocaleString()}/{maxLength.toLocaleString()}
        </span>
      )}
    </div>
  );
}

/** 취소 + 저장 버튼. 저장은 form 속성으로 본문의 폼을 제출한다 */
function FormFooter({ formId, submitLabel, isDisabled, isPending, onClose }) {
  return (
    <>
      <button
        type="button"
        className={BTN_SECONDARY}
        disabled={isPending}
        onClick={onClose}
      >
        취소
      </button>
      <button
        type="submit"
        form={formId}
        className={BTN_PRIMARY}
        disabled={isDisabled || isPending}
      >
        {submitLabel}
      </button>
    </>
  );
}

/** 칸 아래 서버 검증 오류 */
function FieldError({ message }) {
  if (!message) return null;
  return (
    <p role="alert" className="mt-1.5 text-sm text-danger">
      {message}
    </p>
  );
}

/** 입력 모달. faq가 있으면 수정, 없으면 등록 */
function FaqEditor({ faq, categories, onClose }) {
  const formId = useId();
  const isEdit = Boolean(faq);

  const [faqClsfCd, setFaqClsfCd] = useState(faq?.faqClsfCd ?? '');
  const [qstnTtl, setQstnTtl] = useState(faq?.qstnTtl ?? '');
  const [ansCn, setAnsCn] = useState(faq?.ansCn ?? '');
  const [sortSeq, setSortSeq] = useState(faq ? String(faq.sortSeq) : '');
  const [useYn, setUseYn] = useState(faq?.useYn ?? true);

  const create = useCreateAdminFaq();
  const update = useUpdateAdminFaq();
  const save = isEdit ? update : create;

  const categoryOptions = [
    { value: '', label: '카테고리 선택' },
    ...categories.map(({ comCd, comCdNm }) => ({
      value: comCd,
      label: comCdNm,
    })),
  ];

  /** 서버 400의 칸별 오류: { 필드명: 메시지 } */
  const fieldErrors = toFieldErrors(save.error);

  const trimmedQstn = qstnTtl.trim();
  const canSubmit =
    Boolean(faqClsfCd && trimmedQstn && ansCn.trim()) &&
    SORT_SEQ_PATTERN.test(sortSeq);

  const handleSaved = () => {
    showToast(isEdit ? 'FAQ를 수정했어요' : 'FAQ를 등록했어요');
    onClose();
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!canSubmit || save.isPending) return;
    const body = {
      faqClsfCd,
      qstnTtl: trimmedQstn,
      ansCn,
      sortSeq: Number(sortSeq),
      useYn,
    };
    if (isEdit) {
      update.mutate({ faqSn: faq.faqSn, ...body }, { onSuccess: handleSaved });
      return;
    }
    create.mutate(body, { onSuccess: handleSaved });
  };

  return (
    <Modal
      title={isEdit ? 'FAQ 수정' : 'FAQ 등록'}
      isWide
      isTop
      isPending={save.isPending}
      onClose={onClose}
      footer={
        <FormFooter
          formId={formId}
          submitLabel={isEdit ? '저장' : '등록'}
          isDisabled={!canSubmit}
          isPending={save.isPending}
          onClose={onClose}
        />
      }
    >
      <form id={formId} onSubmit={handleSubmit} className="space-y-5">
        <div>
          <p className="mb-1.5 text-sm font-semibold text-ink-2">카테고리</p>
          <Select
            label="카테고리"
            value={faqClsfCd}
            options={categoryOptions}
            placeholder="카테고리 선택"
            onChange={setFaqClsfCd}
          />
          <FieldError message={fieldErrors.faqClsfCd} />
        </div>
        <div>
          <FieldLabel
            htmlFor={`${formId}-qstnTtl`}
            label="질문"
            length={qstnTtl.length}
            maxLength={MAX_QSTN_LENGTH}
          />
          <input
            id={`${formId}-qstnTtl`}
            type="text"
            value={qstnTtl}
            maxLength={MAX_QSTN_LENGTH}
            placeholder="질문을 입력해 주세요"
            className={INPUT_CLASS}
            onChange={(event) => setQstnTtl(event.target.value)}
          />
          <FieldError message={fieldErrors.qstnTtl} />
        </div>
        <div>
          <FieldLabel
            htmlFor={`${formId}-ansCn`}
            label="답변"
            length={ansCn.length}
            maxLength={MAX_ANS_LENGTH}
          />
          <textarea
            id={`${formId}-ansCn`}
            value={ansCn}
            maxLength={MAX_ANS_LENGTH}
            placeholder="답변을 입력해 주세요"
            className={TEXTAREA_CLASS}
            onChange={(event) => setAnsCn(event.target.value)}
          />
          <FieldError message={fieldErrors.ansCn} />
        </div>
        <div className="flex flex-wrap items-end gap-x-8 gap-y-4">
          <div className="w-[160px]">
            <FieldLabel htmlFor={`${formId}-sortSeq`} label="정렬 순서" />
            <input
              id={`${formId}-sortSeq`}
              type="text"
              inputMode="numeric"
              value={sortSeq}
              placeholder="0 이상 숫자"
              className={INPUT_CLASS}
              onChange={(event) =>
                setSortSeq(event.target.value.replace(/\D/g, ''))
              }
            />
            <FieldError message={fieldErrors.sortSeq} />
          </div>
          <div className="flex h-10 items-center gap-3">
            <span className="text-sm font-semibold text-ink-2">사용</span>
            <Toggle checked={useYn} onChange={setUseYn} label="사용" />
            <span className="text-sm text-subtle">
              {useYn ? '사용' : '비노출'}
            </span>
          </div>
        </div>
        {save.isError && !save.error.fields && (
          <p role="alert" className="text-sm text-danger">
            {save.error.message}
          </p>
        )}
      </form>
    </Modal>
  );
}

/** 수정: 상세를 불러오는 동안·실패했을 때의 모달 */
function FaqEditLoader({ faqSn, categories, onClose }) {
  const detail = useAdminFaq(faqSn);

  if (detail.isSuccess) {
    return (
      <FaqEditor faq={detail.data} categories={categories} onClose={onClose} />
    );
  }

  return (
    <Modal
      title="FAQ 수정"
      isWide
      isTop
      onClose={onClose}
      footer={
        <FormFooter
          formId=""
          submitLabel="저장"
          isDisabled
          isPending={false}
          onClose={onClose}
        />
      }
    >
      {detail.isError ? (
        <div role="alert" className="flex flex-col items-center gap-3 py-10">
          <p className="text-base text-subtle">{detail.error.message}</p>
          <button
            type="button"
            className={BTN_SECONDARY}
            onClick={() => detail.refetch()}
          >
            다시 시도
          </button>
        </div>
      ) : (
        <div className="space-y-5" aria-busy="true">
          <Skeleton className="h-[66px] w-full" />
          <Skeleton className="h-[66px] w-full" />
          <Skeleton className="h-[236px] w-full" />
          <Skeleton className="h-[66px] w-[160px]" />
        </div>
      )}
    </Modal>
  );
}

/**
 * [FAQ 등록·수정 모달]
 * - faqSn이 있으면 상세를 불러와 채운 수정, 없으면 등록
 * - 삭제는 없고 사용을 끄면 비노출
 * - 저장하면 토스트 후 닫고, 실패하면 입력을 유지하고 서버 문구 표시
 */
export default function FaqFormModal({ faqSn, categories, onClose }) {
  if (faqSn == null) {
    return <FaqEditor categories={categories} onClose={onClose} />;
  }
  return (
    <FaqEditLoader faqSn={faqSn} categories={categories} onClose={onClose} />
  );
}
