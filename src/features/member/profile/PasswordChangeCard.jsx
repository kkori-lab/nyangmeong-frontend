import { useId, useState } from 'react';
import { BTN_PRIMARY, BTN_SECONDARY } from '@/components/buttonStyles';
import { showToast } from '@/components/toastStore';
import { useUpdatePassword } from '../queries';
import { ACT_BTN, HELP, INPUT, LABEL } from '../shared/profileStyles';
import { isValidPassword } from '../shared/validate';
import AccountRow from './AccountRow';
import { ErrorText } from './FieldMessage';

const PW_RULE = '영문과 숫자를 함께 써서 8~64자로 입력해 주세요(공백 제외)';

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
  const { mutate, isPending, error, reset } = useUpdatePassword();
  const fieldMessage = (name) =>
    error?.fields?.find((item) => item.field === name) ? PW_RULE : null;
  const isCurError = error?.code === 'CURRENT_PASSWORD_MISMATCH';
  const isCfmServerError = error?.code === 'PASSWORD_MISMATCH';
  const newError = fieldMessage('pswd');

  const isMismatch =
    (cfmPswd !== '' && cfmPswd !== newPswd) || isCfmServerError;
  const canSave =
    curPswd !== '' &&
    isValidPassword(newPswd) &&
    cfmPswd === newPswd &&
    !isPending;

  const handleSave = () =>
    mutate(
      { currentPswd: curPswd, pswd: newPswd, pswdCnfrm: cfmPswd },
      {
        onSuccess: () => {
          showToast('비밀번호를 변경했어요');
          onClose();
        },
        onError: (err) => {
          // 입력란 아래에 안내하는 오류 말고는 토스트로 알린다
          if (
            err.code !== 'CURRENT_PASSWORD_MISMATCH' &&
            err.code !== 'PASSWORD_MISMATCH' &&
            !err.fields?.some((item) => item.field === 'pswd')
          ) {
            showToast('잠시 후 다시 시도해 주세요');
          }
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
          aria-invalid={isCurError || undefined}
          aria-describedby={isCurError ? curErrId : undefined}
          onChange={(event) => {
            setCurPswd(event.target.value);
            if (isCurError) reset();
          }}
          className={INPUT}
        />
        {isCurError && (
          <ErrorText id={curErrId}>현재 비밀번호가 일치하지 않아요</ErrorText>
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
          aria-invalid={newError ? true : undefined}
          aria-describedby={newError ? `${newId}-err` : `${newId}-help`}
          onChange={(event) => {
            setNewPswd(event.target.value);
            if (newError) reset();
          }}
          className={INPUT}
        />
        {newError ? (
          <ErrorText id={`${newId}-err`}>{newError}</ErrorText>
        ) : (
          <p id={`${newId}-help`} className={HELP}>
            {PW_RULE}
          </p>
        )}
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
          onChange={(event) => {
            setCfmPswd(event.target.value);
            if (isCfmServerError) reset();
          }}
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
