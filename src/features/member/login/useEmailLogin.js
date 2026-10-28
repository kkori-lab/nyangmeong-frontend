import { useState } from 'react';
import { useLogin, useLoginStatus, useNewCaptcha } from '../queries';
import { isValidEmail } from '../shared/validate';
import { LOGIN_MESSAGES as MSG } from './loginMessages';

const CAPTCHA_FORMAT = /^[A-Z0-9]{6}$/;
const cleanCaptcha = (value) =>
  value
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 6);

/** 서버 검증 오류의 field를 폼의 입력칸 이름으로 */
const FIELD_KEYS = { acntEml: 'email', pswd: 'password', scrtyCd: 'captcha' };

// 이메일 로그인 폼의 값·오류·보안코드 상태를 한곳에서 다룬다. 로그인에 성공하면 onSuccess(로그인 응답)를 부른다
export default function useEmailLogin(onSuccess) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [errors, setErrors] = useState({});
  const [notice, setNotice] = useState(null);
  const [isCaptchaOn, setIsCaptchaOn] = useState(false);
  const [checkedEmail, setCheckedEmail] = useState('');
  const login = useLogin();
  const status = useLoginStatus();
  const captcha = useNewCaptcha();

  const setError = (key, message) =>
    setErrors((prev) => ({ ...prev, [key]: message }));

  // 보안코드가 필요 없는 아이디로 바뀌었으면 서버가 CAPTCHA_NOT_REQUIRED로 거절하므로 영역을 닫는다
  const issueCaptcha = (acntEml) =>
    captcha.mutate(
      { acntEml },
      {
        onError: (error) => {
          if (error.code === 'CAPTCHA_NOT_REQUIRED') {
            setIsCaptchaOn(false);
            setNotice(null);
            return;
          }
          setNotice({ type: 'error', message: error.message });
        },
      },
    );

  const refreshCaptcha = () => {
    setCaptchaInput('');
    setError('captcha', '');
    issueCaptcha(email.trim());
  };

  const requireCaptcha = (acntEml, nextNotice) => {
    setCheckedEmail(acntEml);
    setNotice(nextNotice);
    setIsCaptchaOn(true);
    issueCaptcha(acntEml);
  };

  const changeEmail = (value) => {
    setEmail(value);
    setError('email', '');
  };

  const changePassword = (value) => {
    setPassword(value);
    setError('password', '');
  };

  const changeCaptcha = (value) => {
    setCaptchaInput(cleanCaptcha(value));
    setError('captcha', '');
  };

  // 형식이 맞고 마지막으로 확인한 이메일과 다르면 서버에서 보안코드 요구 여부를 확인한다
  // 보안코드가 열린 뒤 이메일이 바뀌었으면 비밀번호·보안코드를 비우고 새 코드를 받는다
  const blurEmail = () => {
    const trimmed = email.trim();
    if (!trimmed) return;
    if (!isValidEmail(trimmed)) {
      setError('email', MSG.emailFormat);
      return;
    }
    if (trimmed === checkedEmail) return;
    const isChanged = isCaptchaOn;
    if (isChanged) {
      setPassword('');
      setCaptchaInput('');
      setError('captcha', '');
      captcha.reset();
    }
    status.mutate(
      { acntEml: trimmed },
      {
        onSuccess: ({ scrtyCdRqtYn }) => {
          setCheckedEmail(trimmed);
          if (scrtyCdRqtYn) {
            if (!isCaptchaOn || !captcha.data || isChanged) {
              issueCaptcha(trimmed);
            }
            setIsCaptchaOn(true);
            return;
          }
          if (isCaptchaOn) {
            setIsCaptchaOn(false);
            setNotice(null);
          }
        },
        onError: (error) =>
          setNotice({ type: 'error', message: error.message }),
      },
    );
  };

  const handleError = (acntEml, error) => {
    setPassword('');
    setCaptchaInput('');
    switch (error.code) {
      case 'LOGIN_FAILED':
        setNotice({ type: 'error', message: error.message });
        if (isCaptchaOn) issueCaptcha(acntEml);
        return;
      case 'LOGIN_CAPTCHA_REQUIRED':
        requireCaptcha(acntEml, { type: 'warn', message: error.message });
        return;
      case 'CAPTCHA_MISMATCH':
        setNotice(null);
        setErrors({ captcha: error.message });
        issueCaptcha(acntEml);
        return;
      case 'INVALID_INPUT_VALUE': {
        const next = {};
        (error.fields ?? []).forEach(({ field, message }) => {
          const key = FIELD_KEYS[field];
          if (key && !next[key]) next[key] = message;
        });
        setNotice(null);
        setErrors(next);
        return;
      }
      default:
        setNotice({ type: 'error', message: error.message });
    }
  };

  const submit = (event) => {
    event.preventDefault();
    const trimmed = email.trim();
    const next = {};
    if (!trimmed) next.email = MSG.emailEmpty;
    else if (!isValidEmail(trimmed)) next.email = MSG.emailFormat;
    if (!password) next.password = MSG.passwordEmpty;
    if (isCaptchaOn) {
      if (!captchaInput) next.captcha = MSG.captchaEmpty;
      else if (!CAPTCHA_FORMAT.test(captchaInput)) {
        next.captcha = MSG.captchaFormat;
      }
    }
    setErrors(next);
    if (Object.keys(next).length > 0) {
      setNotice(null);
      return;
    }
    login.mutate(
      {
        acntEml: trimmed,
        pswd: password,
        scrtyCd: isCaptchaOn ? captchaInput : undefined,
      },
      {
        onSuccess,
        onError: (error) => handleError(trimmed, error),
      },
    );
  };

  // 입력칸 오류가 있으면 그 칸을, 없으면 폼 위 알림을 AI가 안내한다
  const guideTarget = errors.email
    ? 'email'
    : errors.password
      ? 'password'
      : errors.captcha
        ? 'captcha'
        : notice
          ? 'notice'
          : null;

  return {
    email,
    password,
    captchaInput,
    errors,
    notice,
    isCaptchaOn,
    captchaImg: captcha.data?.captchaImg,
    isCaptchaLoading: captcha.isPending,
    isPending: login.isPending,
    guideTarget,
    changeEmail,
    changePassword,
    changeCaptcha,
    blurEmail,
    refreshCaptcha,
    submit,
  };
}
