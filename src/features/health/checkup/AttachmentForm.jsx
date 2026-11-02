import { useEffect, useRef, useState } from 'react';
import { BTN_PRIMARY, BTN_SECONDARY } from '@/components/buttonStyles';
import FieldError from '../diary/FieldError';
import {
  INPUT_CLASS,
  LABEL_CLASS,
  SELECT_ARROW_STYLE,
  SELECT_CLASS,
} from '../diary/formStyles';
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
          <select
            value={atchTypeCd}
            aria-invalid={isInvalid('type')}
            className={SELECT_CLASS}
            style={SELECT_ARROW_STYLE}
            onChange={(event) => setAtchTypeCd(event.target.value)}
          >
            <option value="">선택해 주세요</option>
            {ATTACHMENT_TYPES.map((type) => (
              <option key={type.cd} value={type.cd}>
                {type.nm}
              </option>
            ))}
          </select>
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
            <select
              value={imgKindCd}
              aria-invalid={isInvalid('kind')}
              className={SELECT_CLASS}
              style={SELECT_ARROW_STYLE}
              onChange={(event) => setImgKindCd(event.target.value)}
            >
              <option value="">선택해 주세요</option>
              {IMAGING_KINDS.map((kind) => (
                <option key={kind.cd} value={kind.cd}>
                  {kind.nm}
                </option>
              ))}
            </select>
            {isInvalid('kind') && (
              <FieldError>영상 종류를 선택해 주세요</FieldError>
            )}
          </label>
          <label className="flex flex-col gap-1.5">
            <span className={LABEL_CLASS}>촬영 부위{REQUIRED}</span>
            <select
              value={imgPartCd}
              aria-invalid={isInvalid('part')}
              className={SELECT_CLASS}
              style={SELECT_ARROW_STYLE}
              onChange={(event) => setImgPartCd(event.target.value)}
            >
              <option value="">선택해 주세요</option>
              {IMAGING_PARTS.map((part) => (
                <option key={part.cd} value={part.cd}>
                  {part.nm}
                </option>
              ))}
            </select>
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
