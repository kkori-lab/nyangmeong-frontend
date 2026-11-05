import { useState } from 'react';
import { useInvalidateRecoveryCode, useResetPassword } from '../queries';
import { isValidPassword } from '../shared/validate';
import { PASSWORD_MESSAGES as MSG } from './passwordMessages';

const FIELD_KEYS = { pswd: 'password', pswdCnfrm: 'confirm' };

// 비밀번호 재설정 입력과 오류. 두 칸이 올바를 때만 저장할 수 있다.
// grant({ emlCertSn, pswdInitTkn, certTrgtEml })는 인증 화면이 메모리(router state)로 넘긴 재설정 권한이다
export default function usePasswordReset(grant) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [touched, setTouched] = useState({ password: false, confirm: false });
  const [notice, setNotice] = useState(null);
  const [isDone, setIsDone] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const [serverErrors, setServerErrors] = useState({});
  const reset = useResetPassword();
  const invalidate = useInvalidateRecoveryCode();

  const passwordError = serverErrors.password
    ? serverErrors.password
    : !touched.password
      ? ''
    : !password
      ? MSG.pwEmpty
      : !isValidPassword(password)
        ? MSG.pwRule
        : '';
  const confirmError = serverErrors.confirm
    ? serverErrors.confirm
    : !touched.confirm
      ? ''
    : !confirm
      ? MSG.confirmEmpty
      : password !== confirm
        ? MSG.confirmMismatch
        : '';
  const confirmSuccess =
    touched.confirm && confirm && password === confirm ? MSG.confirmMatch : '';
  const canSubmit = isValidPassword(password) && password === confirm;

  const changePassword = (value) => {
    setPassword(value);
    setTouched((prev) => ({ ...prev, password: true }));
    setServerErrors({});
    setNotice(null);
  };

  const changeConfirm = (value) => {
    setConfirm(value);
    setTouched((prev) => ({ ...prev, confirm: true }));
    setServerErrors({});
    setNotice(null);
  };

  const blurConfirm = () => setTouched((prev) => ({ ...prev, confirm: true }));

  const showServerError = (error) => {
    if (error.code === 'PASSWORD_RESET_NOT_AVAILABLE') {
      setIsExpired(true);
    } else if (error.code === 'PASSWORD_MISMATCH') {
      setServerErrors({ confirm: error.message });
    } else if (error.code === 'INVALID_INPUT_VALUE') {
      const next = {};
      (error.fields ?? []).forEach(({ field, message }) => {
        const key = FIELD_KEYS[field];
        if (key && !next[key]) next[key] = message;
      });
      if (Object.keys(next).length) setServerErrors(next);
      else setNotice({ type: 'error', message: MSG.saveFailed });
    } else {
      setNotice({ type: 'error', message: MSG.saveFailed });
    }
  };

  const submit = (event) => {
    event.preventDefault();
    if (!canSubmit || reset.isPending) return;
    reset.mutate(
      {
        emlCertSn: grant.emlCertSn,
        pswdInitTkn: grant.pswdInitTkn,
        pswd: password,
        pswdCnfrm: confirm,
      },
      {
        onSuccess: () => setIsDone(true),
        onError: showServerError,
      },
    );
  };

  // 재설정 권한을 끝내고 나간다. 무효화가 실패해도 권한은 만료 시각에 끝나므로 이동은 막지 않는다
  const cancel = (onDone) => {
    invalidate.mutate(
      { emlCertSn: grant.emlCertSn, certTrgtEml: grant.certTrgtEml },
      { onSettled: onDone },
    );
  };

  const guideTarget = passwordError
    ? 'password'
    : confirmError
      ? 'confirm'
      : notice
        ? 'notice'
        : null;

  return {
    password,
    confirm,
    passwordError,
    confirmError,
    confirmSuccess,
    canSubmit,
    notice,
    isDone,
    isExpired,
    isPending: reset.isPending,
    guideTarget,
    changePassword,
    changeConfirm,
    blurConfirm,
    submit,
    cancel,
  };
}
