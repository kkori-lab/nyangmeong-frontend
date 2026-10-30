import { useId, useState } from 'react';
import { BTN_PRIMARY, BTN_SECONDARY } from '@/components/buttonStyles';
import { showToast } from '@/components/toastStore';
import { useCheckNickname, useUpdateNickname } from '../queries';
import { ACT_BTN, HELP, INPUT, SIDE_BTN } from '../shared/profileStyles';
import {
  NICKNAME_MAX,
  isValidNickname,
  sanitizeNickname,
} from '../shared/validate';
import AccountRow from './AccountRow';
import { ErrorText, OkText } from './FieldMessage';

const MSG = {
  duplicate: '이미 사용 중인 닉네임입니다.',
  failed: '중복확인을 완료하지 못했습니다. 다시 시도해 주세요.',
  available: '사용 가능한 닉네임입니다.',
};

export default function NicknameField({ mbrNcnm, isEditing, onEdit, onClose }) {
  return (
    <AccountRow
      label="닉네임"
      value={mbrNcnm}
      actionLabel="수정"
      isEditing={isEditing}
      onEdit={onEdit}
    >
      <NicknameEdit mbrNcnm={mbrNcnm} onClose={onClose} />
    </AccountRow>
  );
}

/** 펼쳐졌을 때만 렌더. 닫히면 입력과 확인 결과가 함께 사라짐 */
function NicknameEdit({ mbrNcnm, onClose }) {
  const inputId = useId();
  const [value, setValue] = useState(mbrNcnm);
  // idle | available | duplicate | failed
  const [status, setStatus] = useState('idle');
  const check = useCheckNickname();
  const save = useUpdateNickname();

  const isBusy = check.isPending || save.isPending;
  const hasError = status === 'duplicate' || status === 'failed';

  const handleChange = (event) => {
    setValue(sanitizeNickname(event.target.value));
    setStatus('idle');
  };

  const handleCheck = () =>
    check.mutate(
      { mbrNcnm: value },
      {
        onSuccess: ({ dplctYn }) =>
          setStatus(dplctYn ? 'duplicate' : 'available'),
        onError: () => setStatus('failed'),
      },
    );

  const handleSave = () =>
    save.mutate(
      { mbrNcnm: value },
      {
        onSuccess: () => {
          showToast('닉네임을 저장했어요');
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
          닉네임
        </label>
        <input
          id={inputId}
          value={value}
          maxLength={NICKNAME_MAX}
          aria-invalid={hasError || undefined}
          onChange={handleChange}
          className={INPUT}
        />
        <button
          type="button"
          disabled={!isValidNickname(value) || value === mbrNcnm || isBusy}
          onClick={handleCheck}
          className={`${BTN_SECONDARY} ${SIDE_BTN}`}
        >
          중복확인
        </button>
      </div>
      {hasError && <ErrorText>{MSG[status]}</ErrorText>}
      {status === 'available' && <OkText>{MSG.available}</OkText>}
      {status === 'idle' && (
        <p className={HELP}>최대 10글자 · 한글·영문·숫자</p>
      )}
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
