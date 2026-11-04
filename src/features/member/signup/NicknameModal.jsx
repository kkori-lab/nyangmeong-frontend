import { User } from 'lucide-react';
import { useState } from 'react';
import Modal from '@/components/Modal';
import { useCheckNicknameAvailability, useSetupNickname } from '../queries';
import { PRIMARY_BTN, SIDE_BTN } from '../shared/authStyles';
import AuthField from '../shared/AuthField';
import { NICKNAME_MAX, isValidNickname } from '../shared/validate';
import { SIGNUP_MESSAGES as MSG } from './signupMessages';

export default function NicknameModal({ savedNickname, onSaved, onClose }) {
  const [value, setValue] = useState(savedNickname);
  const [isEdited, setIsEdited] = useState(false);
  // idle | available | duplicate | failed
  const [status, setStatus] = useState('idle');
  const check = useCheckNicknameAvailability();
  const save = useSetupNickname();
  const isBusy = check.isPending || save.isPending;

  const isSame = value === savedNickname;
  // 입력을 자르거나 지우지 않고 그대로 두고, 길이·문자 오류를 문구로 알린다
  const isTooLong = value.length > NICKNAME_MAX;
  const isValid = !isTooLong && isValidNickname(value);
  const error =
    isEdited && !value
      ? MSG.nickEmpty
      : isTooLong
        ? MSG.nickTooLong
        : value && !isValid
          ? MSG.nickRule
          : status === 'duplicate'
            ? MSG.nickDuplicate
            : status === 'failed'
              ? MSG.nickFailed
              : '';
  const help =
    isEdited && isValid && !isSame && status === 'idle'
      ? MSG.nickNeedCheck
      : '';
  const canSave = isValid && (isSame || status === 'available') && !isBusy;

  const change = (next) => {
    setValue(next);
    setIsEdited(true);
    setStatus('idle');
  };

  const handleCheck = () =>
    check.mutate(
      { mbrNcnm: value },
      {
        onSuccess: ({ available }) =>
          setStatus(available ? 'available' : 'duplicate'),
        onError: () => setStatus('failed'),
      },
    );

  const handleSave = () => {
    save.mutate(
      { mbrNcnm: value },
      {
        onSuccess: () => onSaved(value),
        onError: (err) =>
          setStatus(
            err.code === 'NICKNAME_ALREADY_USED' ? 'duplicate' : 'failed',
          ),
      },
    );
  };

  return (
    <Modal
      title="닉네임을 정해 주세요"
      isPending={isBusy}
      onClose={onClose}
      footer={
        <button
          type="button"
          disabled={!canSave}
          onClick={handleSave}
          className={PRIMARY_BTN}
        >
          닉네임 설정 완료
        </button>
      }
    >
      <p className="leading-6 text-muted">
        기본 닉네임을 원하는 이름으로 바꿔 보세요.
      </p>
      <div className="mt-4 flex items-center justify-between rounded-box bg-surface-2 px-4 py-3 text-muted">
        현재 저장된 닉네임
        <strong className="font-semibold text-ink">{savedNickname}</strong>
      </div>
      <div className="mt-5">
        <AuthField
          id="signup-nickname"
          icon={User}
          label="닉네임"
          value={value}
          onChange={change}
          placeholder="닉네임을 입력하세요"
          autoComplete="off"
          error={error}
          success={status === 'available' ? MSG.nickAvailable : ''}
          help={help}
          hasGuide
          endAdornment={
            <span className="text-sm text-subtle tabular-nums">
              {value.length} / {NICKNAME_MAX}
            </span>
          }
          action={
            <button
              type="button"
              onClick={handleCheck}
              disabled={!isValid || isSame || isBusy}
              className={SIDE_BTN}
            >
              중복 확인
            </button>
          }
        />
        <p className="mt-2 text-sm leading-5 text-muted">
          최대 10글자 · 한글·영문·숫자만 가능
          <br />
          특수문자·공백·이모지는 사용할 수 없어요.
        </p>
      </div>
    </Modal>
  );
}
