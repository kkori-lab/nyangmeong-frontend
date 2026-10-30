import { useState } from 'react';
import { showToast } from '@/components/toastStore';
import useCountdown from '@/hooks/useCountdown';
import {
  useCheckSignupPhone,
  useJoinMember,
  useSendSignupCode,
  useVerifySignupCode,
} from '../queries';
import {
  isValidEmail,
  isValidPassword,
  isValidPhone,
  normalizePhone,
  sanitizePhoneInput,
} from '../shared/validate';
import { SIGNUP_MESSAGES as MSG, SIGNUP_TERMS } from './signupMessages';

const PREV_STEP = { email: 'terms', phone: 'email', password: 'phone' };
const ORDER = ['terms', 'email', 'phone', 'password', 'complete'];

// 이메일 가입 4단계(terms, email, phone, password)와 가입 뒤 완료 화면(complete)의 입력·확인 결과를 한곳에서 다룬다.
// 단계를 오가도 약관·이메일·번호와 확인 결과는 남기고, 비밀번호는 단계를 벗어나면 비운다
export default function useSignup({ onBackToLogin, onRecover }) {
  const [step, setStep] = useState('terms');
  // 단계 전환 모션의 방향(앞으로 가면 forward, 되돌아가면 back)
  const [direction, setDirection] = useState('forward');
  const [terms, setTerms] = useState({});
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [isSent, setIsSent] = useState(false);
  const [expiresAt, setExpiresAt] = useState(0);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [phone, setPhone] = useState('');
  const [isPhoneChecked, setIsPhoneChecked] = useState(false);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [touched, setTouched] = useState({ password: false, confirm: false });
  const [errors, setErrors] = useState({});
  const [notice, setNotice] = useState(null);
  const [nickname, setNickname] = useState('');
  const [isNicknameOpen, setIsNicknameOpen] = useState(false);
  const sendCode = useSendSignupCode();
  const verifyCode = useVerifySignupCode();
  const checkPhone = useCheckSignupPhone();
  const join = useJoinMember();
  const countdown = useCountdown(expiresAt);

  const isTermsOk = SIGNUP_TERMS.every(({ key, required }) =>
    required ? terms[key] : true,
  );
  const isAllChecked = SIGNUP_TERMS.every(({ key }) => terms[key]);
  const normalizedPhone = normalizePhone(phone);

  const goStep = (next) => {
    setDirection(
      ORDER.indexOf(next) < ORDER.indexOf(step) ? 'back' : 'forward',
    );
    setStep(next);
    setErrors({});
    setNotice(null);
  };

  const goBack = () => {
    if (step === 'terms') {
      onBackToLogin();
      return;
    }
    if (step === 'password') {
      setPassword('');
      setConfirm('');
      setTouched({ password: false, confirm: false });
    }
    goStep(PREV_STEP[step]);
  };

  const toggleTerm = (key) =>
    setTerms((prev) => ({ ...prev, [key]: !prev[key] }));

  const toggleAll = () => {
    const next = !isAllChecked;
    setTerms(Object.fromEntries(SIGNUP_TERMS.map(({ key }) => [key, next])));
  };

  const showTermsView = () => showToast(MSG.notReady);

  /* 이메일 */
  const changeEmail = (value) => {
    setEmail(value);
    setCode('');
    setIsSent(false);
    setExpiresAt(0);
    setIsEmailVerified(false);
    setErrors({});
    setNotice(null);
  };

  const changeCode = (value) => {
    setCode(value.replace(/\D/g, '').slice(0, 6));
    setErrors({});
  };

  const submitSend = () => {
    const trimmed = email.trim();
    if (!trimmed) {
      setErrors({ email: MSG.emailEmpty });
      return;
    }
    if (!isValidEmail(trimmed)) {
      setErrors({ email: MSG.emailFormat });
      return;
    }
    setNotice(null);
    sendCode.mutate(
      { acntEml: trimmed },
      {
        onSuccess: (result) => {
          if (result.result === 'DUPLICATE') {
            setErrors({ email: MSG.emailDuplicate });
          } else if (result.result === 'RESTORE') {
            onRecover(trimmed);
          } else {
            setEmail(trimmed);
            setExpiresAt(result.expiresAt);
            setCode('');
            setIsSent(true);
            setErrors({});
          }
        },
        onError: (error) => {
          // 탈퇴 후 보관 기간 안의 이메일이면 서버가 409로 거절하고 재가입 복구로 보낸다
          if (error?.code === 'MEMBER_RECOVERY_AVAILABLE') {
            onRecover(trimmed);
            return;
          }
          setNotice({ type: 'error', message: MSG.sendFailed });
        },
      },
    );
  };

  const submitVerify = () => {
    if (!code) {
      setErrors({ code: MSG.codeEmpty });
      return;
    }
    if (!/^\d{6}$/.test(code)) {
      setErrors({ code: MSG.codeFormat });
      return;
    }
    if (countdown.isExpired) {
      setErrors({ code: MSG.codeExpired });
      return;
    }
    verifyCode.mutate(
      { acntEml: email, authCd: code },
      {
        onSuccess: ({ result }) => {
          if (result === 'OK') {
            setIsEmailVerified(true);
            setErrors({});
          } else {
            setErrors({
              code: result === 'EXPIRED' ? MSG.codeExpired : MSG.codeMismatch,
            });
          }
        },
      },
    );
  };

  /* 휴대전화번호 */
  const changePhone = (value) => {
    setPhone(sanitizePhoneInput(value));
    setIsPhoneChecked(false);
    setErrors({});
  };

  const submitPhoneCheck = () => {
    if (!normalizedPhone) {
      setErrors({ phone: MSG.phoneEmpty });
      return;
    }
    if (!isValidPhone(normalizedPhone)) {
      setErrors({ phone: MSG.phoneFormat });
      return;
    }
    checkPhone.mutate(
      { mbrTelno: normalizedPhone },
      {
        onSuccess: ({ dplctYn }) => {
          setIsPhoneChecked(!dplctYn);
          setErrors(dplctYn ? { phone: MSG.phoneDuplicate } : {});
        },
        onError: () => setErrors({ phone: MSG.phoneFailed }),
      },
    );
  };

  /* 비밀번호 */
  const passwordError = !touched.password
    ? ''
    : !password
      ? MSG.pwEmpty
      : !isValidPassword(password)
        ? MSG.pwRule
        : '';
  const confirmError = !touched.confirm
    ? ''
    : !confirm
      ? MSG.confirmEmpty
      : password !== confirm
        ? MSG.confirmMismatch
        : '';
  const confirmSuccess =
    touched.confirm && confirm && password === confirm ? MSG.confirmMatch : '';
  const canJoin = isValidPassword(password) && password === confirm;

  const changePassword = (value) => {
    setPassword(value);
    setTouched((prev) => ({ ...prev, password: true }));
    setNotice(null);
  };

  const changeConfirm = (value) => {
    setConfirm(value);
    setTouched((prev) => ({ ...prev, confirm: true }));
    setNotice(null);
  };

  const blurConfirm = () => setTouched((prev) => ({ ...prev, confirm: true }));

  // 앞 단계 확인 결과가 모두 유효할 때만 가입한다(서버도 다시 검사한다)
  const submitJoin = (event) => {
    event.preventDefault();
    if (!canJoin || !isTermsOk || !isEmailVerified || !isPhoneChecked) return;
    join.mutate(
      {
        acntEml: email,
        pswd: password,
        mbrTelno: normalizedPhone,
        termsAgreeList: SIGNUP_TERMS.map(({ key }) => ({
          trmsKey: key,
          agreeYn: Boolean(terms[key]),
        })),
      },
      {
        onSuccess: (result) => {
          if (!result.ok) {
            setNotice({ type: 'error', message: MSG.joinFailed });
            return;
          }
          setNickname(result.mbrNcnm);
          setPassword('');
          setConfirm('');
          goStep('complete');
          setIsNicknameOpen(true);
        },
        onError: () => setNotice({ type: 'error', message: MSG.joinFailed }),
      },
    );
  };

  const guideTarget = errors.email
    ? 'email'
    : errors.code
      ? 'code'
      : errors.phone
        ? 'phone'
        : passwordError
          ? 'password'
          : confirmError
            ? 'confirm'
            : notice
              ? 'notice'
              : null;

  return {
    step,
    direction,
    terms,
    isTermsOk,
    isAllChecked,
    email,
    code,
    isSent,
    countdown,
    isEmailVerified,
    phone,
    isPhoneChecked,
    password,
    confirm,
    errors,
    passwordError,
    confirmError,
    confirmSuccess,
    canJoin,
    notice,
    nickname,
    isNicknameOpen,
    isSending: sendCode.isPending,
    isVerifying: verifyCode.isPending,
    isPhoneChecking: checkPhone.isPending,
    isJoining: join.isPending,
    guideTarget,
    goBack,
    goStep,
    toggleTerm,
    toggleAll,
    showTermsView,
    changeEmail,
    changeCode,
    submitSend,
    submitVerify,
    changePhone,
    submitPhoneCheck,
    changePassword,
    changeConfirm,
    blurConfirm,
    submitJoin,
    openNickname: () => setIsNicknameOpen(true),
    closeNickname: () => setIsNicknameOpen(false),
    saveNickname: (name) => {
      setNickname(name);
      setIsNicknameOpen(false);
    },
  };
}
