import { useState } from 'react';
import useCountdown from '@/hooks/useCountdown';
import {
  useCheckPhoneAvailability,
  useJoinMember,
  useSendSignupCode,
  useTermsList,
  useVerifySignupCode,
} from '../queries';
import {
  isValidEmail,
  isValidPassword,
  isValidPhone,
  normalizePhone,
  sanitizePhoneInput,
} from '../shared/validate';
import { SIGNUP_MESSAGES as MSG } from './signupMessages';

/** 서버 시각(LocalDateTime, 시간대 없음)을 ms로 */
const toMs = (dateTime) => Date.parse(dateTime);

// 가입 요청의 서버 검증 오류 field를 가입 화면 칸 이름으로
const JOIN_FIELD_KEYS = { mblTelno: 'phone', certNo: 'code' };

// 서버 쪽 오류(5xx)·네트워크 오류. 사용자가 고칠 수 없어 공통 실패 문구로 보인다
const JOIN_FAILED_CODES = [
  'SERVER_ERROR',
  'NETWORK_ERROR',
  'INTERNAL_SERVER_ERROR',
];

const PREV_STEP = { email: 'terms', phone: 'email', password: 'phone' };
const ORDER = ['terms', 'email', 'phone', 'password', 'complete'];

// 인증번호 발송 오류: 재전송 제한이면 서버 문구에 남은 시간을 붙인다
const resendMessage = (error) => {
  const resendAt = error.data?.resendAvailableDt;
  const remain = resendAt
    ? Math.max(0, Math.ceil((toMs(resendAt) - Date.now()) / 1000))
    : 0;
  return remain ? `${error.message} (${remain}초 남음)` : error.message;
};

// 이메일 가입 4단계(terms, email, phone, password)와 가입 뒤 완료 화면(complete)의 입력·확인 결과를 한곳에서 다룬다.
// 단계를 오가도 약관·이메일·번호와 확인 결과는 남기고, 비밀번호는 단계를 벗어나면 비운다
export default function useSignup({ onBackToLogin, onRecover }) {
  const [step, setStep] = useState('terms');
  // 단계 전환 모션의 방향(앞으로 가면 forward, 되돌아가면 back)
  const [direction, setDirection] = useState('forward');
  const [terms, setTerms] = useState({});
  const [termsView, setTermsView] = useState(null);
  const [emlCertSn, setEmlCertSn] = useState(null);
  const [verifiedCode, setVerifiedCode] = useState('');
  // 같은 가입 시도의 재요청(중복 클릭·응답 유실)을 서버가 알아보게 하는 값
  const [idempotencyKey] = useState(() => crypto.randomUUID());
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
  const checkPhone = useCheckPhoneAvailability();
  const join = useJoinMember();
  const termsQuery = useTermsList();
  const countdown = useCountdown(expiresAt);

  const termsList = [...(termsQuery.data ?? [])].sort(
    (a, b) => a.sortSeq - b.sortSeq,
  );
  const isTermsOk =
    termsList.length > 0 &&
    termsList.every(({ trmsSn, esntlAgreYn }) =>
      esntlAgreYn ? terms[trmsSn] : true,
    );
  const isAllChecked =
    termsList.length > 0 && termsList.every(({ trmsSn }) => terms[trmsSn]);
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

  const toggleTerm = (trmsSn) =>
    setTerms((prev) => ({ ...prev, [trmsSn]: !prev[trmsSn] }));

  const toggleAll = () => {
    const next = !isAllChecked;
    setTerms(Object.fromEntries(termsList.map(({ trmsSn }) => [trmsSn, next])));
  };

  /* 이메일 */
  const changeEmail = (value) => {
    setEmail(value);
    setCode('');
    setIsSent(false);
    setExpiresAt(0);
    setEmlCertSn(null);
    setVerifiedCode('');
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
      { certTrgtEml: trimmed },
      {
        onSuccess: (result) => {
          setEmail(trimmed);
          setEmlCertSn(result.emlCertSn);
          setExpiresAt(toMs(result.certExpryDt));
          setCode('');
          setIsSent(true);
          setErrors({});
        },
        onError: (error) => {
          // 탈퇴 후 보관 기간 안의 이메일이면 서버가 409로 거절하고 재가입 복구로 보낸다
          if (error.code === 'MEMBER_RECOVERY_AVAILABLE') {
            onRecover(trimmed);
          } else if (error.code === 'EMAIL_ALREADY_REGISTERED') {
            setErrors({ email: MSG.emailDuplicate });
          } else if (error.code === 'EMAIL_CERT_RESEND_NOT_YET') {
            setNotice({ type: 'error', message: resendMessage(error) });
          } else {
            setNotice({ type: 'error', message: MSG.sendFailed });
          }
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
      { emlCertSn, certNo: code },
      {
        onSuccess: ({ certRslt }) => {
          if (certRslt === 'SIGNUP_READY') {
            setIsEmailVerified(true);
            setVerifiedCode(code);
            setErrors({});
          } else {
            setErrors({ code: MSG.codeMismatch });
          }
        },
        onError: (error) =>
          error.code.startsWith('EMAIL_CERT_')
            ? setErrors({ code: error.message })
            : setNotice({ type: 'error', message: error.message }),
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
      { mblTelno: normalizedPhone },
      {
        onSuccess: ({ available, normalizedMblTelno }) => {
          setIsPhoneChecked(available);
          setPhone(normalizedMblTelno);
          setErrors(available ? {} : { phone: MSG.phoneDuplicate });
        },
        onError: (error) =>
          setErrors({
            phone:
              error.code === 'INVALID_PHONE_NUMBER'
                ? MSG.phoneFormat
                : MSG.phoneFailed,
          }),
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

  // 서버 검증 오류는 해당 칸으로, 그 밖은 서버 문구를 알림으로 보인다
  const handleJoinError = (error) => {
    const fieldErrors = {};
    (error.fields ?? []).forEach(({ field, message }) => {
      const key = JOIN_FIELD_KEYS[field];
      if (key && !fieldErrors[key]) fieldErrors[key] = message;
    });
    if (fieldErrors.phone) {
      goStep('phone');
      setErrors({ phone: fieldErrors.phone });
      return;
    }
    if (fieldErrors.code) {
      goStep('email');
      setErrors({ code: fieldErrors.code });
      return;
    }
    // 400·409는 서버 문구, 서버 오류·네트워크 오류는 공통 실패 문구
    setNotice({
      type: 'error',
      message: JOIN_FAILED_CODES.includes(error.code)
        ? MSG.joinFailed
        : error.message,
    });
  };

  // 앞 단계 확인 결과가 모두 유효할 때만 가입한다(서버도 다시 검사한다)
  const submitJoin = (event) => {
    event.preventDefault();
    if (!canJoin || !isTermsOk || !isEmailVerified || !isPhoneChecked) return;
    join.mutate(
      {
        emlCertSn,
        certNo: verifiedCode,
        mblTelno: normalizedPhone,
        pswd: password,
        trmsAgres: termsList.map(({ trmsSn }) => ({
          trmsSn,
          agreYn: Boolean(terms[trmsSn]),
        })),
        idmptDmndId: idempotencyKey,
      },
      {
        onSuccess: ({ mbrNcnm }) => {
          setNickname(mbrNcnm);
          setPassword('');
          setConfirm('');
          goStep('complete');
          setIsNicknameOpen(true);
        },
        onError: handleJoinError,
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
    termsList,
    isTermsLoading: termsQuery.isPending,
    isTermsError: termsQuery.isError,
    retryTerms: termsQuery.refetch,
    termsView,
    openTerms: setTermsView,
    closeTerms: () => setTermsView(null),
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
    goLoginMethods: onBackToLogin,
    toggleTerm,
    toggleAll,
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
