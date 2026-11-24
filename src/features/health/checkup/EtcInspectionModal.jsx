import { useState } from 'react';
import { Required } from '@/components/FieldError';
import FormModal from '../diary/FormModal';
import { INPUT, LABEL, TEXTAREA } from '@/components/formStyles';
import { useCreateEtcInspection, useUpdateEtcInspection } from '../queries';
import FieldFoot from '@/components/FieldFoot';

const MAX_NAME_LENGTH = 100;
const MAX_RESULT_LENGTH = 500;
const MAX_MEMO_LENGTH = 200;

const REQUIRED = <Required />;

/**
 * [기타검사 추가 모달]
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
      title="기타검사 추가"
      width={560}
      isPending={isPending}
      onSubmit={handleSubmit}
      onClose={onClose}
    >
      <label className="flex flex-col gap-1.5">
        <span className={LABEL}>검사명{REQUIRED}</span>
        <input
          value={inspNm}
          maxLength={MAX_NAME_LENGTH}
          placeholder="예: 체온, 소변검사, 알레르기 검사"
          aria-invalid={isInvalid('name')}
          className={INPUT}
          onChange={(event) => setInspNm(event.target.value)}
        />
        <FieldFoot
          value={inspNm}
          max={MAX_NAME_LENGTH}
          error={isInvalid('name') && '검사명을 입력해 주세요'}
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className={LABEL}>검사 결과{REQUIRED}</span>
        <textarea
          value={rsltCn}
          maxLength={MAX_RESULT_LENGTH}
          aria-invalid={isInvalid('result')}
          className={TEXTAREA}
          onChange={(event) => setRsltCn(event.target.value)}
        />
        <FieldFoot
          value={rsltCn}
          max={MAX_RESULT_LENGTH}
          error={isInvalid('result') && '검사 결과를 입력해 주세요'}
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className={LABEL}>메모</span>
        <textarea
          value={memoCn}
          maxLength={MAX_MEMO_LENGTH}
          className={TEXTAREA}
          onChange={(event) => setMemoCn(event.target.value)}
        />
        <FieldFoot value={memoCn} max={MAX_MEMO_LENGTH} />
      </label>
    </FormModal>
  );
}
