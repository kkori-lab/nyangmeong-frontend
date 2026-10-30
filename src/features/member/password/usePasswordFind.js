import { useState } from 'react';
import useCountdown from '@/hooks/useCountdown';
import {
  useInvalidateRecoveryCode,
  useSendRecoveryCode,
  useVerifyRecoveryCode,
} from '../queries';
import { isValidEmail } from '../shared/validate';
import { PASSWORD_MESSAGES as MSG } from './passwordMessages';

/** 서버 검증 오류의 field를 입력칸 이름으로 */
const FIELD_KEYS = { certTrgtEml: 'email', certNo: 'code' };

/** 서버 시각(LocalDateTime, 시간대 없음)을 ms로 */
const toMs = (dateTime) => Date.parse(dateTime);

// 비밀번호 찾기 화면의 단계(email, code, sns)와 입력·오류를 한곳에서 다룬다. 재설정 대상이 인증되면 onVerified({ emlCertSn, pswdInitTkn, initAuthrtExpryDt })를 부른다
export default function usePasswordFind(onVerified) {
  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [errors, setErrors] = useState({});
  const [notice, setNotice] = useState(null);
  const [isSent, setIsSent] = useState(false);
  const [expiresAt, setExpiresAt] = useState(0);
  const [emlCertSn, setEmlCertSn] = useState(null);
  const [snsOffrCds, setSnsOffrCds] = useState([]);
  const send = useSendRecoveryCode();
  const verify = useVerifyRecoveryCode();
  const invalidate = useInvalidateRecoveryCode();
  const countdown = useCountdown(expiresAt);

  const changeEmail = (value) => {
    setEmail(value);
    setErrors({});
  };

  const changeCode = (value) => {
    setCode(value.replace(/\D/g, '').slice(0, 6));
    setErrors({});
  };

  // 재전송 제한이면 서버 문구에 남은 시간을 붙인다
  const handleSendError = (error) => {
    if (error.code === 'INVALID_INPUT_VALUE') {
      const next = {};
      (error.fields ?? []).forEach(({ field, message }) => {
        const key = FIELD_KEYS[field];
        if (key && !next[key]) next[key] = message;
      });
      setErrors(next);
      return;
    }
    const resendAt = error.data?.resendAvailableDt;
    const remain = resendAt
      ? Math.max(0, Math.ceil((toMs(resendAt) - Date.now()) / 1000))
      : 0;
    setNotice({
      type: 'error',
      message: remain ? `${error.message} (${remain}초 남음)` : error.message,
    });
  };

  const sendCode = (certTrgtEml) => {
    send.mutate(
      { certTrgtEml },
      {
        onSuccess: (result) => {
          setEmail(certTrgtEml);
          setEmlCertSn(result.emlCertSn);
          setExpiresAt(toMs(result.certExpryDt));
          setCode('');
          setErrors({});
          setNotice(null);
          setIsSent(true);
          setStep('code');
        },
        onError: handleSendError,
      },
    );
  };

  const submitEmail = (event) => {
    event.preventDefault();
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
    sendCode(trimmed);
  };

  const resend = () => sendCode(email);

  // 이메일을 다시 입력하면 이전 인증번호는 서버에서도 무효화한다
  const editEmail = () => {
    if (emlCertSn) invalidate.mutate({ emlCertSn, certTrgtEml: email });
    setEmlCertSn(null);
    setStep('email');
    setCode('');
    setErrors({});
    setNotice(null);
    setIsSent(false);
    setExpiresAt(0);
  };

  const handleResult = ({
    certRslt,
    snsOffrCds: providers,
    pswdInitTkn,
    initAuthrtExpryDt,
  }) => {
    setNotice(null);
    if (certRslt === 'PASSWORD_RESET_READY') {
      onVerified({ emlCertSn, pswdInitTkn, initAuthrtExpryDt });
    } else if (certRslt === 'SNS_ONLY') {
      setSnsOffrCds(providers ?? []);
      setStep('sns');
    } else if (certRslt === 'MEMBER_NOT_FOUND') {
      setNotice({ type: 'error', message: MSG.notFound });
    } else if (certRslt === 'MEMBER_WITHDRAWN') {
      setNotice({ type: 'error', message: MSG.withdrawn, isWithdrawn: true });
    } else {
      setNotice({ type: 'error', message: MSG.verifyFailed });
    }
  };

  // 인증번호 오류(불일치·만료·사용 완료·횟수 초과)는 인증번호 칸 아래에 서버 문구로 보인다
  const handleVerifyError = (error) => {
    if (error.code === 'INVALID_INPUT_VALUE') {
      const next = {};
      (error.fields ?? []).forEach(({ field, message }) => {
        const key = FIELD_KEYS[field];
        if (key && !next[key]) next[key] = message;
      });
      setErrors(next);
    } else if (error.code.startsWith('EMAIL_CERT_')) {
      setErrors({ code: error.message });
    } else {
      setNotice({ type: 'error', message: error.message });
    }
  };

  const submitCode = (event) => {
    event.preventDefault();
    if (!code) {
      setErrors({ code: MSG.codeEmpty });
      return;
    }
    if (!/^\d{6}$/.test(code)) {
      setErrors({ code: MSG.codeFormat });
      return;
    }
    setIsSent(false);
    verify.mutate(
      { emlCertSn, certNo: code },
      { onSuccess: handleResult, onError: handleVerifyError },
    );
  };

  const guideTarget = errors.email
    ? 'email'
    : errors.code
      ? 'code'
      : notice
        ? 'notice'
        : null;

  return {
    step,
    email,
    code,
    errors,
    notice,
    isSent,
    snsOffrCds,
    countdown,
    isPending: send.isPending || verify.isPending,
    guideTarget,
    changeEmail,
    changeCode,
    submitEmail,
    submitCode,
    resend,
    editEmail,
  };
}
