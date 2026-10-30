import { useId, useState } from 'react';
import { BTN_PRIMARY, BTN_SECONDARY } from '@/components/buttonStyles';
import { showToast } from '@/components/toastStore';
import { useUpdatePassword } from '../queries';
import { ACT_BTN, HELP, INPUT, LABEL } from '../shared/profileStyles';
import { isValidPassword } from '../shared/validate';
import AccountRow from './AccountRow';
import { ErrorText } from './FieldMessage';

export default function PasswordChangeCard({ isEditing, onEdit, onClose }) {
  return (
    <AccountRow
      label="비밀번호"
      value={
        <span
          aria-label="비밀번호 설정됨"
          className="tracking-[2px] text-subtle"
        >
          ●●●●●●●●
        </span>
      }
      actionLabel="변경"
      isEditing={isEditing}
      onEdit={onEdit}
    >
      <PasswordEdit onClose={onClose} />
    </AccountRow>
  );
}

/** 펼쳐졌을 때만 렌더. 닫히면 입력이 함께 사라짐 */
function PasswordEdit({ onClose }) {
  const curId = useId();
  const newId = useId();
  const cfmId = useId();
  const curErrId = useId();
  const cfmErrId = useId();
  const [curPswd, setCurPswd] = useState('');
  const [newPswd, setNewPswd] = useState('');
  const [cfmPswd, setCfmPswd] = useState('');
  const { mutate, isPending, isError, reset } = useUpdatePassword();

  const isMismatch = cfmPswd !== '' && cfmPswd !== newPswd;
  const canSave =
    curPswd !== '' &&
    isValidPassword(newPswd) &&
    cfmPswd === newPswd &&
    !isPending;

  const handleSave = () =>
    mutate(
      { curPswd, newPswd },
      {
        onSuccess: () => {
          showToast('비밀번호를 변경했어요');
          onClose();
        },
      },
    );

  return (
    <>
      <div className="flex flex-col gap-1.5">
        <label className={LABEL} htmlFor={curId}>
          현재 비밀번호
        </label>
        <input
          id={curId}
          type="password"
          value={curPswd}
          autoComplete="current-password"
          placeholder="현재 비밀번호 입력"
          aria-invalid={isError || undefined}
          aria-describedby={isError ? curErrId : undefined}
          onChange={(event) => {
            setCurPswd(event.target.value);
            if (isError) reset();
          }}
          className={INPUT}
        />
        {isError && (
          <ErrorText id={curErrId}>
            현재 비밀번호가 일치하지 않습니다.
          </ErrorText>
        )}
      </div>
      <div className="flex flex-col gap-1.5">
        <label className={LABEL} htmlFor={newId}>
          새 비밀번호
        </label>
        <input
          id={newId}
          type="password"
          value={newPswd}
          autoComplete="new-password"
          aria-describedby={`${newId}-help`}
          onChange={(event) => setNewPswd(event.target.value)}
          className={INPUT}
        />
        <p id={`${newId}-help`} className={HELP}>
          8자 이상, 문자·숫자 조합
        </p>
      </div>
      <div className="flex flex-col gap-1.5">
        <label className={LABEL} htmlFor={cfmId}>
          새 비밀번호 확인
        </label>
        <input
          id={cfmId}
          type="password"
          value={cfmPswd}
          autoComplete="new-password"
          aria-invalid={isMismatch || undefined}
          aria-describedby={isMismatch ? cfmErrId : undefined}
          onChange={(event) => setCfmPswd(event.target.value)}
          className={INPUT}
        />
        {isMismatch && (
          <ErrorText id={cfmErrId}>비밀번호가 일치하지 않아요</ErrorText>
        )}
      </div>
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
          disabled={!canSave}
          onClick={handleSave}
          className={`${BTN_PRIMARY} ${ACT_BTN}`}
        >
          저장
        </button>
      </div>
    </>
  );
}
