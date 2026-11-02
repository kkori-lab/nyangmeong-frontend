import { useState } from 'react';
import FieldError from '../diary/FieldError';
import FormModal from '../diary/FormModal';
import { INPUT_CLASS, LABEL_CLASS, TEXTAREA_CLASS } from '../diary/formStyles';
import { useCreateEtcInspection, useUpdateEtcInspection } from '../queries';

const MAX_NAME_LENGTH = 100;
const MAX_RESULT_LENGTH = 500;
const MAX_MEMO_LENGTH = 200;

const REQUIRED = <span className="ml-0.5 font-bold text-danger">*</span>;
const OPTIONAL = (
  <span className="ml-1 text-[13px] font-medium text-subtle">선택</span>
);

/**
 * [기타검사 입력 모달]
 * - 검사명·검사 결과(텍스트 500자)·메모(200자), 단위·참고범위 없음 (FN-HLT-005-11~14)
 * - etcInspection이 있으면 입력값이 채워진 수정 상태
 */
export default function EtcInspectionModal({
  petSn,
  ckupRcdSn,
  etcInspection,
  onClose,
}) {
  const [inspNm, setInspNm] = useState(etcInspection?.inspNm ?? '');
  const [rsltCn, setRsltCn] = useState(etcInspection?.inspRsltCn ?? '');
  const [memoCn, setMemoCn] = useState(etcInspection?.memoCn ?? '');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const createEtcInspection = useCreateEtcInspection();
  const updateEtcInspection = useUpdateEtcInspection();
  const isPending =
    createEtcInspection.isPending || updateEtcInspection.isPending;

  const errors = { name: inspNm.trim() === '', result: rsltCn.trim() === '' };
  const isInvalid = (field) => isSubmitted && errors[field];

  const handleSubmit = () => {
    setIsSubmitted(true);
    if (Object.values(errors).some(Boolean)) return;
    const body = {
      petSn,
      ckupRcdSn,
      inspNm: inspNm.trim(),
      inspRsltCn: rsltCn.trim(),
      memoCn: memoCn.trim(),
    };
    if (etcInspection) {
      updateEtcInspection.mutate(
        { ...body, etcInspSn: etcInspection.etcInspSn },
        { onSuccess: onClose },
      );
    } else {
      createEtcInspection.mutate(body, { onSuccess: onClose });
    }
  };

  return (
    <FormModal
      icon="assignment"
      title="기타검사 입력"
      widthClassName="w-[min(560px,calc(100%-32px))]"
      isPending={isPending}
      onSubmit={handleSubmit}
      onClose={onClose}
    >
      <label className="flex flex-col gap-1.5">
        <span className={LABEL_CLASS}>검사명{REQUIRED}</span>
        <input
          value={inspNm}
          maxLength={MAX_NAME_LENGTH}
          placeholder="예: 체온, 소변검사, 알레르기 검사"
          aria-invalid={isInvalid('name')}
          className={INPUT_CLASS}
          onChange={(event) => setInspNm(event.target.value)}
        />
        {isInvalid('name') && <FieldError>검사명을 입력해 주세요</FieldError>}
      </label>

      <label className="flex flex-col gap-1.5">
        <span className={LABEL_CLASS}>검사 결과{REQUIRED}</span>
        <textarea
          value={rsltCn}
          maxLength={MAX_RESULT_LENGTH}
          aria-invalid={isInvalid('result')}
          className={TEXTAREA_CLASS}
          onChange={(event) => setRsltCn(event.target.value)}
        />
        <span className="self-end text-sm text-subtle tabular-nums">
          {rsltCn.length} / {MAX_RESULT_LENGTH}
        </span>
        {isInvalid('result') && (
          <FieldError>검사 결과를 입력해 주세요</FieldError>
        )}
      </label>

      <label className="flex flex-col gap-1.5">
        <span className={LABEL_CLASS}>메모{OPTIONAL}</span>
        <textarea
          value={memoCn}
          maxLength={MAX_MEMO_LENGTH}
          className={TEXTAREA_CLASS}
          onChange={(event) => setMemoCn(event.target.value)}
        />
        <span className="self-end text-sm text-subtle tabular-nums">
          {memoCn.length} / {MAX_MEMO_LENGTH}
        </span>
      </label>
    </FormModal>
  );
}
