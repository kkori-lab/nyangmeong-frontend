import { useState } from 'react';
import useCountdown from '@/hooks/useCountdown';
import {
  useInvalidateRecoveryCode,
  useSendRecoveryCode,
  useVerifyRecoveryCode,
} from '../queries';
import { isWrongCodeError, resendAtOf, toMs } from '../shared/emailCert';
import { isValidEmail } from '../shared/validate';
import { SIGNUP_MESSAGES as SIGNUP } from '../signup/signupMessages';
import { PASSWORD_MESSAGES as MSG } from './passwordMessages';

/** 서버 검증 오류의 field를 입력칸 이름으로 */
const FIELD_KEYS = { certTrgtEml: 'email', certNo: 'code' };

// 비밀번호 찾기 화면의 단계(email, code, sns)와 입력·오류를 한곳에서 다룬다. 재설정 대상이 인증되면 onVerified({ emlCertSn, pswdInitTkn, initAuthrtExpryDt, certTrgtEml })를 부른다
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
  /** 오답으로 무효가 된 인증번호: 다시 보낼 때까지 인증번호 칸·확인 버튼 숨김 */
  const [isCodeLocked, setIsCodeLocked] = useState(false);
  /** 재발송 가능 시각(ms, 서버 값) */
  const [resendAt, setResendAt] = useState(0);
  const send = useSendRecoveryCode();
  const verify = useVerifyRecoveryCode();
  const invalidate = useInvalidateRecoveryCode();
  const countdown = useCountdown(expiresAt);
  const resendWait = useCountdown(resendAt);

  const changeEmail = (value) => {
    setEmail(value);
    setErrors({});
  };

  const changeCode = (value) => {
    setCode(value.replace(/\D/g, '').slice(0, 6));
    setErrors({});
  };

  /** 발송 오류: 재전송 제한이면 남은 시간은 [다시 보내기]에 표시 */
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
    if (error.code === 'EMAIL_CERT_RESEND_NOT_YET') {
      setResendAt(resendAtOf(error.data));
    }
    setNotice({ type: 'error', message: error.message });
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
          setIsCodeLocked(false);
          setResendAt(resendAtOf(result));
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

  const resend = () => {
    if (resendWait.seconds > 0) return;
    sendCode(email);
  };

  // 이메일을 다시 입력하면 이전 인증번호는 서버에서도 무효화한다
  const editEmail = () => {
    if (emlCertSn) invalidate.mutate({ emlCertSn, certTrgtEml: email });
    setEmlCertSn(null);
    setStep('email');
    setCode('');
    setErrors({});
    setNotice(null);
    setIsSent(false);
    setIsCodeLocked(false);
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
      onVerified({
        emlCertSn,
        pswdInitTkn,
        initAuthrtExpryDt,
        certTrgtEml: email,
      });
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

  /** 인증번호 오류: 오답은 칸을 닫고 공통 알림(AI 말풍선), 만료·사용 완료는 칸 아래 서버 문구 */
  const handleVerifyError = (error) => {
    if (error.code === 'INVALID_INPUT_VALUE') {
      const next = {};
      (error.fields ?? []).forEach(({ field, message }) => {
        const key = FIELD_KEYS[field];
        if (key && !next[key]) next[key] = message;
      });
      setErrors(next);
    } else if (isWrongCodeError(error)) {
      setIsCodeLocked(true);
      setCode('');
      setErrors({});
      setNotice({ type: 'error', message: error.message || SIGNUP.codeRetry });
    } else if (error.code.startsWith('EMAIL_CERT_')) {
      setErrors({ code: error.message });
    } else {
      setNotice({ type: 'error', message: error.message });
    }
  };

  const submitCode = (event) => {
    event.preventDefault();
    if (isCodeLocked) return;
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
    isCodeLocked,
    resendSeconds: resendWait.seconds,
    guideTarget,
    changeEmail,
    changeCode,
    submitEmail,
    submitCode,
    resend,
    editEmail,
  };
}
