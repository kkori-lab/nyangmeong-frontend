import { useId, useState } from 'react';
import { BTN_PRIMARY, BTN_SECONDARY } from '@/components/buttonStyles';
import Modal from '@/components/Modal';
import { showToast } from '@/components/toastStore';
import Toggle from '@/components/Toggle';
import { VRTY_NM_MAX } from './api';
import { useCreateAdminBreed, useUpdateAdminBreed } from './queries';

const INPUT_CLASS =
  'block h-10 w-full rounded-[6px] border border-[#d3dae2] bg-white px-3 text-base leading-[1.4] text-[#1a3234] outline-none hover:border-[#b9c4c4] focus:border-[#285a5c] focus:shadow-[0_0_0_3px_rgba(40,90,92,0.18)] aria-invalid:border-danger';

/** 정렬: 0 이상 정수 */
const SORT_SEQ_PATTERN = /^\d+$/;

/** 공백을 뺀 이름(중복 비교용) */
const compact = (value) => value.replace(/\s/g, '');

/** 칸 아래 안내 */
function FieldError({ id, message }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-1.5 text-sm text-danger">
      {message}
    </p>
  );
}

/** 칸마다 빠졌거나 틀린 값 안내: 없으면 빈 객체 */
const validate = ({ vrtyNm, sortSeq, breeds, vrtySn }) => {
  const name = vrtyNm.trim();
  const isDuplicated = breeds.some(
    (breed) =>
      breed.vrtySn !== vrtySn && compact(breed.vrtyNm) === compact(name),
  );
  let nameError = '';
  if (!name) nameError = '이름을 입력해 주세요';
  else if (isDuplicated) nameError = '같은 종에 이미 있는 품종 이름이에요';
  return {
    ...(nameError ? { vrtyNm: nameError } : {}),
    ...(SORT_SEQ_PATTERN.test(sortSeq.trim())
      ? {}
      : { sortSeq: '정렬은 0 이상 정수로 입력해 주세요' }),
  };
};

/** 새 품종 정렬 기본값: 지금 맨 뒤 + 10 */
const nextSortSeq = (breeds) =>
  String(Math.max(0, ...breeds.map((breed) => breed.sortSeq)) + 10);

/**
 * [품종 추가·수정 모달]
 * - breed가 있으면 그 행 값으로 채운 수정, 없으면 petSeCd 종에 추가
 * - breeds: 같은 종 목록(이름 중복 검사용)
 * - 삭제는 없고 사용을 끄면 회원 화면 품종 목록에서 빠짐
 */
export default function BreedFormModal({
  breed,
  petSeCd,
  petSeName,
  breeds,
  onClose,
}) {
  const formId = useId();
  const isEdit = Boolean(breed);

  const [vrtyNm, setVrtyNm] = useState(breed?.vrtyNm ?? '');
  const [sortSeq, setSortSeq] = useState(
    breed ? String(breed.sortSeq) : nextSortSeq(breeds),
  );
  const [useYn, setUseYn] = useState(breed?.useYn ?? true);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const create = useCreateAdminBreed();
  const update = useUpdateAdminBreed();
  const save = isEdit ? update : create;

  const errors = isSubmitted
    ? validate({ vrtyNm, sortSeq, breeds, vrtySn: breed?.vrtySn })
    : {};

  const handleSaved = () => {
    showToast(isEdit ? '품종을 수정했어요' : '품종을 추가했어요');
    onClose();
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (save.isPending) return;
    setIsSubmitted(true);
    const nextErrors = validate({
      vrtyNm,
      sortSeq,
      breeds,
      vrtySn: breed?.vrtySn,
    });
    if (Object.keys(nextErrors).length > 0) return;
    const body = {
      vrtyNm: vrtyNm.trim(),
      sortSeq: Number(sortSeq.trim()),
      useYn,
    };
    if (isEdit) {
      update.mutate(
        { vrtySn: breed.vrtySn, ...body },
        { onSuccess: handleSaved },
      );
      return;
    }
    create.mutate({ petSeCd, ...body }, { onSuccess: handleSaved });
  };

  return (
    <Modal
      title={isEdit ? '품종 수정' : '품종 추가'}
      isWide
      isTop
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
            {isEdit ? '저장' : '추가'}
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
          <p className="mb-1.5 text-sm font-semibold text-ink-2">종</p>
          <p className="text-base text-ink">{petSeName}</p>
        </div>
        <div>
          <label
            htmlFor={`${formId}-vrtyNm`}
            className="mb-1.5 block text-sm font-semibold text-ink-2"
          >
            이름
          </label>
          <input
            id={`${formId}-vrtyNm`}
            type="text"
            value={vrtyNm}
            maxLength={VRTY_NM_MAX}
            placeholder="품종 이름을 입력해 주세요"
            aria-invalid={Boolean(errors.vrtyNm)}
            aria-describedby={`${formId}-vrtyNm-error`}
            className={INPUT_CLASS}
            onChange={(event) => setVrtyNm(event.target.value)}
          />
          <FieldError id={`${formId}-vrtyNm-error`} message={errors.vrtyNm} />
        </div>
        <div className="flex flex-wrap items-start gap-x-8 gap-y-4">
          <div className="w-[160px]">
            <label
              htmlFor={`${formId}-sortSeq`}
              className="mb-1.5 block text-sm font-semibold text-ink-2"
            >
              정렬
            </label>
            <input
              id={`${formId}-sortSeq`}
              type="text"
              inputMode="numeric"
              value={sortSeq}
              placeholder="0 이상 숫자"
              aria-invalid={Boolean(errors.sortSeq)}
              aria-describedby={`${formId}-sortSeq-error`}
              className={INPUT_CLASS}
              onChange={(event) => setSortSeq(event.target.value)}
            />
            <FieldError
              id={`${formId}-sortSeq-error`}
              message={errors.sortSeq}
            />
          </div>
          <div>
            <p className="mb-1.5 text-sm font-semibold text-ink-2">사용</p>
            <div className="flex h-10 items-center gap-3">
              <Toggle checked={useYn} onChange={setUseYn} label="사용" />
              <span className="text-sm text-subtle">
                {useYn ? '사용' : '안 함'}
              </span>
            </div>
          </div>
        </div>
        <p className="text-sm text-subtle">
          정렬 숫자가 작을수록 앞에 나오고, 사용을 끄면 회원 화면 품종 목록에서
          빠져요
        </p>
        {save.isError && (
          <p role="alert" className="text-sm text-danger">
            {save.error.message}
          </p>
        )}
      </form>
    </Modal>
  );
}
