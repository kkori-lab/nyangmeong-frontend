import { useEffect, useRef, useState } from 'react';
import { BTN_PRIMARY, BTN_SECONDARY } from '@/components/buttonStyles';
import { showToast } from '@/components/toastStore';
import { DIRECT } from '../labInput/ItemSelect';
import LabItemForm from '../labInput/LabItemForm';
import { getSkippedNames, toInspectionValue } from '../labInput/labRows';
import { getLabNumberError, getLabRangeError } from '../numberFormat';
import { useCreateInspections } from '../queries';
import { SUB_BOX } from './checkupStyles';

const EMPTY_FORM = {
  item: '',
  directNm: '',
  val: '',
  unit: '',
  rangeMin: '',
  rangeMax: '',
  memo: '',
};

/**
 * [검사 수치 추가 입력 영역]
 * - 검사 결과 탭에서 [검사 수치 추가]를 누르면 목록 아래에 열리는 입력칸 (FN-HLT-007-01·02·03과 같은 규칙)
 * - 저장하면 검사 결과 목록 재렌더와 영역 닫힘
 * - registeredNames: 이미 등록된 항목 이름 (같은 항목 재입력 불가)
 */
export default function BloodResultForm({
  petSn,
  ckupRcdSn,
  registeredNames,
  onClose,
}) {
  const formRef = useRef(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const createInspections = useCreateInspections();

  useEffect(() => {
    formRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, []);

  const itemName = form.item === DIRECT ? form.directNm.trim() : form.item;
  const errors = {};
  if (itemName === '') errors.item = '검사 항목을 선택해 주세요';
  else if (registeredNames.has(itemName)) {
    errors.item = `이미 등록된 항목입니다: ${itemName}`;
  }
  if (form.val.trim() === '') errors.val = '검사 결과값을 입력해 주세요';
  else if (getLabNumberError(form.val)) {
    errors.val = getLabNumberError(form.val);
  }
  if (form.unit.trim() === '') errors.unit = '단위를 입력해 주세요';
  const rangeError = getLabRangeError(form.rangeMin, form.rangeMax);
  if (rangeError) errors.range = rangeError;

  const changeForm = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = (event) => {
    event.preventDefault();
    if (createInspections.isPending) return;
    setIsSubmitted(true);
    if (Object.keys(errors).length > 0) return;
    const values = [
      toInspectionValue(itemName, {
        rsltNvl: Number(form.val),
        unitNm: form.unit.trim(),
        refLlmtNvl: form.rangeMin.trim() === '' ? null : Number(form.rangeMin),
        refUplmtNvl: form.rangeMax.trim() === '' ? null : Number(form.rangeMax),
        memoCn: form.memo.trim(),
      }),
    ];
    createInspections.mutate(
      { petSn, ckupRcdSn, values },
      {
        onSuccess: (savedValues) => {
          const skippedNames = getSkippedNames([itemName], values, savedValues);
          if (skippedNames.length > 0) {
            showToast(`이미 등록된 항목입니다: ${skippedNames.join(', ')}`);
          }
          onClose();
        },
      },
    );
  };

  return (
    <form
      ref={formRef}
      noValidate
      aria-label="검사 수치 추가"
      className={SUB_BOX}
      onSubmit={handleSubmit}
    >
      <LabItemForm
        form={form}
        errors={isSubmitted ? errors : {}}
        isEdit={false}
        onChange={changeForm}
      />
      <div className="mt-6 flex justify-end gap-2">
        <button
          type="button"
          className={`${BTN_SECONDARY} min-w-24`}
          disabled={createInspections.isPending}
          onClick={onClose}
        >
          취소
        </button>
        <button
          type="submit"
          className={`${BTN_PRIMARY} min-w-24`}
          disabled={createInspections.isPending}
        >
          저장하기
        </button>
      </div>
    </form>
  );
}
