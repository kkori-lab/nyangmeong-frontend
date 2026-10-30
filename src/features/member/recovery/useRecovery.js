import { useState } from 'react';
import useCountdown from '@/hooks/useCountdown';
import {
  useCheckRecoveryPhone,
  useInvalidateRecoveryCode,
  useRecoverMember,
  useRecoveryInfo,
  useSendMemberRecoveryCode,
  useVerifyRecoveryCode,
} from '../queries';
import {
  isValidPhone,
  normalizePhone,
  sanitizePhoneInput,
} from '../shared/validate';
import { SIGNUP_MESSAGES as SIGNUP } from '../signup/signupMessages';
import { RECOVERY_MESSAGES as MSG } from './recoveryMessages';

/** 서버 검증 오류의 field를 입력칸 이름으로 */
const FIELD_KEYS = { certTrgtEml: 'email', certNo: 'code', mblTelno: 'phone' };
const DAY_MS = 24 * 60 * 60 * 1000;

/** 서버 시각(LocalDateTime, 시간대 없음)을 ms로 */
const toMs = (dateTime) => Date.parse(dateTime);

const toFieldErrors = (fields) => {
  const next = {};
  (fields ?? []).forEach(({ field, message }) => {
    const key = FIELD_KEYS[field];
    if (key && !next[key]) next[key] = message;
  });
  return next;
};

// 재가입 복구 화면의 단계(verify, confirm, complete)와 입력·오류를 한곳에서 다룬다.
// 복구 확인 권한 토큰(rcvryAuthrtTkn)은 이 훅의 state에만 두고 URL·저장소에 넣지 않는다
export default function useRecovery(email, { onCancel }) {
  const [step, setStep] = useState('verify');
  const [direction, setDirection] = useState('forward');
  const [code, setCode] = useState('');
  const [isSent, setIsSent] = useState(false);
  const [expiresAt, setExpiresAt] = useState(0);
  const [emlCertSn, setEmlCertSn] = useState(null);
  const [token, setToken] = useState('');
  const [info, setInfo] = useState(null);
  const [remainDays, setRemainDays] = useState(0);
  const [agreed, setAgreed] = useState({});
  const [phone, setPhone] = useState('');
  const [checkedPhone, setCheckedPhone] = useState('');
  const [termsView, setTermsView] = useState(null);
  const [errors, setErrors] = useState({});
  const [notice, setNotice] = useState(null);
  const send = useSendMemberRecoveryCode();
  const verify = useVerifyRecoveryCode();
  const loadInfo = useRecoveryInfo();
  const checkPhone = useCheckRecoveryPhone();
  const recover = useRecoverMember();
  const invalidate = useInvalidateRecoveryCode();
  const countdown = useCountdown(expiresAt);

  const hasStoredPhone = Boolean(info?.maskedMblTelno);
  const isTermsOk = (info?.missingTrms ?? []).every(
    ({ trmsSn, esntlAgreYn }) => !esntlAgreYn || agreed[trmsSn],
  );
  const canRecover =
    Boolean(info) && isTermsOk && (hasStoredPhone || Boolean(checkedPhone));

  const goStep = (next, nextDirection) => {
    setDirection(nextDirection);
    setStep(next);
  };

  /* 본인확인 */
  const changeCode = (value) => {
    setCode(value.replace(/\D/g, '').slice(0, 6));
    setErrors({});
  };

  // 재전송 제한이면 서버 문구에 남은 시간을 붙인다. 보관 기간이 지났으면 새로 가입하도록 안내한다
  const handleSendError = (error) => {
    if (error.code === 'INVALID_INPUT_VALUE') {
      setErrors(toFieldErrors(error.fields));
      return;
    }
    const resendAt = error.data?.resendAvailableDt;
    const remain = resendAt
      ? Math.max(0, Math.ceil((toMs(resendAt) - Date.now()) / 1000))
      : 0;
    setNotice({
      type: 'error',
      message: remain ? `${error.message} (${remain}초 남음)` : error.message,
      isExpired: error.code === 'MEMBER_RECOVERY_EXPIRED',
    });
  };

  const sendCode = () => {
    send.mutate(
      { certTrgtEml: email },
      {
        onSuccess: (result) => {
          setEmlCertSn(result.emlCertSn);
          setExpiresAt(toMs(result.certExpryDt));
          setCode('');
          setErrors({});
          setNotice(null);
          setIsSent(true);
        },
        onError: handleSendError,
      },
    );
  };

  // 확인 시간이 지났거나 권한이 사라졌으면 처음부터 다시 인증한다
  const restartVerify = (message) => {
    setToken('');
    setInfo(null);
    setEmlCertSn(null);
    setIsSent(false);
    setExpiresAt(0);
    setCode('');
    setErrors({});
    setNotice({ type: 'error', message });
    goStep('verify', 'back');
  };

  const handleRecoveryError = (error) => {
    if (error.code === 'MEMBER_RECOVERY_NOT_AVAILABLE') {
      restartVerify(error.message);
    } else if (error.code === 'INVALID_INPUT_VALUE') {
      setNotice(null);
      setErrors(toFieldErrors(error.fields));
    } else {
      setNotice({
        type: 'error',
        message: error.message,
        isExpired: error.code === 'MEMBER_RECOVERY_EXPIRED',
      });
    }
  };

  const showInfo = (rcvryAuthrtTkn, data) => {
    setToken(rcvryAuthrtTkn);
    setInfo(data);
    setRemainDays(
      Math.max(0, Math.ceil((toMs(data.rcvryExpryDt) - Date.now()) / DAY_MS)),
    );
    setAgreed({});
    setPhone('');
    setCheckedPhone('');
    setErrors({});
    setNotice(null);
    goStep('confirm', 'forward');
  };

  const handleVerified = ({ certRslt, rcvryAuthrtTkn }) => {
    if (certRslt !== 'RECOVERY_READY') {
      setNotice({ type: 'error', message: MSG.verifyFailed });
      return;
    }
    loadInfo.mutate(
      { emlCertSn, rcvryAuthrtTkn },
      {
        onSuccess: (data) => showInfo(rcvryAuthrtTkn, data),
        onError: handleRecoveryError,
      },
    );
  };

  // 인증번호 오류(불일치·만료·사용 완료·횟수 초과)는 인증번호 칸 아래에 서버 문구로 보인다
  const handleVerifyError = (error) => {
    if (error.code === 'INVALID_INPUT_VALUE') {
      setErrors(toFieldErrors(error.fields));
    } else if (error.code.startsWith('EMAIL_CERT_')) {
      setErrors({ code: error.message });
    } else {
      setNotice({ type: 'error', message: error.message });
    }
  };

  const submitVerify = (event) => {
    event.preventDefault();
    if (!code) {
      setErrors({ code: MSG.codeEmpty });
      return;
    }
    if (!/^\d{6}$/.test(code)) {
      setErrors({ code: MSG.codeFormat });
      return;
    }
    setNotice(null);
    verify.mutate(
      { emlCertSn, certNo: code },
      { onSuccess: handleVerified, onError: handleVerifyError },
    );
  };

  /* 복구 확인 */
  const toggleAgree = (trmsSn) =>
    setAgreed((prev) => ({ ...prev, [trmsSn]: !prev[trmsSn] }));

  const changePhone = (value) => {
    setPhone(sanitizePhoneInput(value));
    setCheckedPhone('');
    setErrors({});
  };

  const submitPhoneCheck = () => {
    const normalized = normalizePhone(phone);
    if (!normalized) {
      setErrors({ phone: SIGNUP.phoneEmpty });
      return;
    }
    if (!isValidPhone(normalized)) {
      setErrors({ phone: SIGNUP.phoneFormat });
      return;
    }
    checkPhone.mutate(
      { mblTelno: normalized },
      {
        onSuccess: ({ normalizedMblTelno, available }) => {
          if (available) {
            setCheckedPhone(normalizedMblTelno);
            setErrors({});
          } else {
            setErrors({ phone: SIGNUP.phoneDuplicate });
          }
        },
        onError: () => setErrors({ phone: SIGNUP.phoneFailed }),
      },
    );
  };

  const submitRecover = () => {
    if (!canRecover || recover.isPending) return;
    recover.mutate(
      {
        emlCertSn,
        rcvryAuthrtTkn: token,
        trmsAgres: info.missingTrms.map(({ trmsSn }) => ({
          trmsSn,
          agreYn: Boolean(agreed[trmsSn]),
        })),
        ...(hasStoredPhone ? {} : { mblTelno: checkedPhone }),
      },
      {
        onSuccess: () => {
          setToken('');
          setInfo(null);
          setNotice(null);
          goStep('complete', 'forward');
        },
        onError: handleRecoveryError,
      },
    );
  };

  // 취소하면 발송한 인증을 서버에서도 무효화하고(실패해도 진행) 로그인 방법 선택으로 간다
  const cancel = () => {
    if (emlCertSn && step !== 'complete') {
      invalidate.mutate({ emlCertSn, certTrgtEml: email });
    }
    setToken('');
    setInfo(null);
    onCancel();
  };

  const guideTarget = errors.code
    ? 'code'
    : errors.phone
      ? 'phone'
      : errors.email
        ? 'email'
        : notice
          ? 'notice'
          : null;

  return {
    step,
    direction,
    email,
    code,
    isSent,
    countdown,
    info,
    remainDays,
    agreed,
    phone,
    isPhoneChecked: Boolean(checkedPhone),
    hasStoredPhone,
    termsView,
    errors,
    notice,
    canRecover,
    isSending: send.isPending,
    isVerifying: verify.isPending || loadInfo.isPending,
    isPhoneChecking: checkPhone.isPending,
    isRecovering: recover.isPending,
    guideTarget,
    changeCode,
    sendCode,
    submitVerify,
    toggleAgree,
    changePhone,
    submitPhoneCheck,
    submitRecover,
    cancel,
    openTerms: setTermsView,
    closeTerms: () => setTermsView(null),
  };
}
