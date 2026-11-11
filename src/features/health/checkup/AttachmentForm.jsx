import { useEffect, useRef, useState } from 'react';
import DropdownSelect from '@/components/DropdownSelect';
import { BTN_PRIMARY, BTN_SECONDARY } from '@/components/buttonStyles';
import FieldError from '../diary/FieldError';
import { INPUT_CLASS, LABEL_CLASS } from '../diary/formStyles';
import { useCreateAttachment } from '../queries';
import { SUB_BOX } from './checkupStyles';
import {
  ATTACHMENT_ACCEPT,
  ATTACHMENT_IMAGE,
  ATTACHMENT_TYPES,
  IMAGING_KINDS,
  IMAGING_PARTS,
} from './checkupTypes';
import { getFileError } from './attachmentUtils';

const REQUIRED = <span className="ml-0.5 font-bold text-danger">*</span>;

/**
 * [첨부 추가 입력 영역]
 * - 파일 유형·파일, "영상 사진"이면 영상 종류·촬영 부위 둘 다 필수 (FN-HLT-005-01)
 */
export default function AttachmentForm({ petSn, ckupRcdSn, onClose }) {
  const formRef = useRef(null);
  const [atchTypeCd, setAtchTypeCd] = useState('');
  const [file, setFile] = useState(null);
  const [imgKindCd, setImgKindCd] = useState('');
  const [imgPartCd, setImgPartCd] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const createAttachment = useCreateAttachment();
  const isImage = atchTypeCd === ATTACHMENT_IMAGE;

  useEffect(() => {
    formRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, []);

  const errors = {
    type: atchTypeCd === '',
    file: getFileError(file),
    kind: isImage && imgKindCd === '',
    part: isImage && imgPartCd === '',
  };
  const isInvalid = (field) => isSubmitted && errors[field];

  const handleSubmit = (event) => {
    event.preventDefault();
    setIsSubmitted(true);
    if (Object.values(errors).some(Boolean)) return;
    createAttachment.mutate(
      {
        petSn,
        ckupRcdSn,
        atchTypeCd,
        file,
        imgKndCd: imgKindCd,
        shtRegnCd: imgPartCd,
      },
      { onSuccess: onClose },
    );
  };

  return (
    <form
      ref={formRef}
      noValidate
      className={`${SUB_BOX} grid gap-5`}
      onSubmit={handleSubmit}
    >
      <div className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span className={LABEL_CLASS}>파일 유형{REQUIRED}</span>
          <DropdownSelect
            value={atchTypeCd}
            invalid={isInvalid('type')}
            placeholder="선택해 주세요"
            options={ATTACHMENT_TYPES.map((type) => ({
              value: type.cd,
              label: type.nm,
            }))}
            onChange={setAtchTypeCd}
          />
          {isInvalid('type') && (
            <FieldError>파일 유형을 선택해 주세요</FieldError>
          )}
        </label>
        <label className="flex flex-col gap-1.5">
          <span className={LABEL_CLASS}>파일{REQUIRED}</span>
          <input
            type="file"
            accept={ATTACHMENT_ACCEPT}
            aria-invalid={isInvalid('file') ? true : undefined}
            className={`${INPUT_CLASS} pt-2`}
            onChange={(event) => setFile(event.target.files[0] ?? null)}
          />
          <p className="text-sm text-muted">
            jpg·jpeg·png·webp·pdf · 1건 10MB 이하
          </p>
          {isInvalid('file') && <FieldError>{errors.file}</FieldError>}
        </label>
      </div>

      {isImage && (
        <div className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5">
            <span className={LABEL_CLASS}>영상 종류{REQUIRED}</span>
            <DropdownSelect
              value={imgKindCd}
              invalid={isInvalid('kind')}
              placeholder="선택해 주세요"
              options={IMAGING_KINDS.map((kind) => ({
                value: kind.cd,
                label: kind.nm,
              }))}
              onChange={setImgKindCd}
            />
            {isInvalid('kind') && (
              <FieldError>영상 종류를 선택해 주세요</FieldError>
            )}
          </label>
          <label className="flex flex-col gap-1.5">
            <span className={LABEL_CLASS}>촬영 부위{REQUIRED}</span>
            <DropdownSelect
              value={imgPartCd}
              invalid={isInvalid('part')}
              placeholder="선택해 주세요"
              options={IMAGING_PARTS.map((part) => ({
                value: part.cd,
                label: part.nm,
              }))}
              onChange={setImgPartCd}
            />
            {isInvalid('part') && (
              <FieldError>촬영 부위를 선택해 주세요</FieldError>
            )}
          </label>
        </div>
      )}

      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          className={BTN_SECONDARY}
          disabled={createAttachment.isPending}
          onClick={onClose}
        >
          취소
        </button>
        <button
          type="submit"
          className={BTN_PRIMARY}
          disabled={createAttachment.isPending}
        >
          저장하기
        </button>
      </div>
    </form>
  );
}
