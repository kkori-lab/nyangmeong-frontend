import { useId, useState } from 'react';
import { BTN_PRIMARY, BTN_SECONDARY } from '@/components/buttonStyles';
import { showToast } from '@/components/toastStore';
import { useCheckPhone, useUpdatePhone } from '../queries';
import { ACT_BTN, INPUT, SIDE_BTN } from '../shared/profileStyles';
import {
  formatPhone,
  isValidPhone,
  normalizePhone,
  sanitizePhoneInput,
} from '../shared/validate';
import AccountRow from './AccountRow';
import { ErrorText, OkText } from './FieldMessage';

const MSG = {
  invalid: '휴대전화번호 형식을 확인해 주세요.',
  duplicate: '이미 사용 중인 휴대전화번호입니다.',
  failed: '중복확인을 완료하지 못했습니다. 다시 시도해 주세요.',
  available: '사용 가능한 휴대전화번호입니다.',
};

export default function PhoneField({ mbrTelno, isEditing, onEdit, onClose }) {
  return (
    <AccountRow
      label="휴대폰 번호"
      value={<span className="tabular-nums">{formatPhone(mbrTelno)}</span>}
      actionLabel="수정"
      isEditing={isEditing}
      onEdit={onEdit}
    >
      <PhoneEdit mbrTelno={mbrTelno} onClose={onClose} />
    </AccountRow>
  );
}

/** 펼쳐졌을 때만 렌더. 닫히면 입력과 확인 결과가 함께 사라짐 */
function PhoneEdit({ mbrTelno, onClose }) {
  const inputId = useId();
  const [value, setValue] = useState('');
  // idle | available | invalid | duplicate | failed
  const [status, setStatus] = useState('idle');
  const check = useCheckPhone();
  const save = useUpdatePhone();

  const next = normalizePhone(value);
  const isBusy = check.isPending || save.isPending;
  const hasError = ['invalid', 'duplicate', 'failed'].includes(status);

  const handleChange = (event) => {
    setValue(sanitizePhoneInput(event.target.value));
    setStatus('idle');
  };

  const handleCheck = () => {
    if (!isValidPhone(value)) {
      setStatus('invalid');
      return;
    }
    check.mutate(
      { mbrTelno: next },
      {
        onSuccess: ({ dplctYn }) =>
          setStatus(dplctYn ? 'duplicate' : 'available'),
        onError: () => setStatus('failed'),
      },
    );
  };

  const handleSave = () =>
    save.mutate(
      { mbrTelno: next },
      {
        onSuccess: () => {
          showToast('휴대폰 번호를 저장했어요');
          onClose();
        },
        onError: (error) =>
          setStatus(error.code === 'DUPLICATE' ? 'duplicate' : 'failed'),
      },
    );

  return (
    <>
      <div className="flex gap-2">
        <label className="sr-only" htmlFor={inputId}>
          새 휴대폰 번호
        </label>
        <input
          id={inputId}
          value={value}
          inputMode="tel"
          maxLength={17}
          placeholder="새 번호 입력"
          aria-invalid={hasError || undefined}
          onChange={handleChange}
          className={INPUT}
        />
        <button
          type="button"
          disabled={!value || next === mbrTelno || isBusy}
          onClick={handleCheck}
          className={`${BTN_SECONDARY} ${SIDE_BTN}`}
        >
          중복확인
        </button>
      </div>
      {hasError && <ErrorText>{MSG[status]}</ErrorText>}
      {status === 'available' && <OkText>{MSG.available}</OkText>}
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className={`${BTN_SECONDARY} ${ACT_BTN}`}
        >
          취소
        </button>
        <button
          type="button"
          disabled={status !== 'available' || isBusy}
          onClick={handleSave}
          className={`${BTN_PRIMARY} ${ACT_BTN}`}
        >
          저장
        </button>
      </div>
    </>
  );
}
