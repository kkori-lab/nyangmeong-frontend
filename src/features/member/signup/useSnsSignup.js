import { useEffect, useRef, useState } from 'react';
import {
  useCheckPhoneAvailability,
  useJoinSnsMember,
  useTermsList,
} from '../queries';
import {
  formatPhoneInput,
  isValidPhone,
  normalizePhone,
  typePhoneInput,
} from '../shared/validate';
import { SIGNUP_MESSAGES as MSG } from './signupMessages';

// 서버 쪽 오류(5xx)·네트워크 오류. 사용자가 고칠 수 없어 공통 실패 문구로 보인다
const JOIN_FAILED_CODES = [
  'SERVER_ERROR',
  'NETWORK_ERROR',
  'INTERNAL_SERVER_ERROR',
];

/** 연령 확인 항목(만 14세 이상). 약관 고정 식별키로 찾는다 */
const isAgeTerm = ({ trmsFixIdntfKey }) => /AGE/i.test(trmsFixIdntfKey);

// SNS 가입 확인(화면 17)과 가입 뒤 완료 화면(complete)의 상태.
// snsSignup은 SNS 로그인의 SIGNUP_REQUIRED 응답 { snsOffrCd, acntEml, mblTelno, ageCnfrmd, signupTkn }.
// 받은 번호는 읽기 전용이고 들어오자마자 중복확인한다. 중복이어도 직접 입력으로 바꾸지 않는다
export default function useSnsSignup({ snsSignup }) {
  const { snsOffrCd, acntEml, mblTelno, ageCnfrmd, signupTkn } = snsSignup;
  const isPhoneProvided = Boolean(mblTelno);
  const [step, setStep] = useState('confirm');
  const [terms, setTerms] = useState({});
  const [termsView, setTermsView] = useState(null);
  const [phone, setPhone] = useState(mblTelno ?? '');
  const [isPhoneChecked, setIsPhoneChecked] = useState(false);
  const [errors, setErrors] = useState({});
  const [notice, setNotice] = useState(null);
  // 가입 확인 토큰이 만료되면 SNS 로그인부터 다시 한다
  const [isExpired, setIsExpired] = useState(false);
  const [nickname, setNickname] = useState('');
  const [isNicknameOpen, setIsNicknameOpen] = useState(false);
  // 같은 가입 시도의 재요청(중복 클릭·응답 유실)을 서버가 알아보게 하는 값
  const [idempotencyKey] = useState(() => crypto.randomUUID());
  // 마지막으로 중복확인을 보낸 번호. 그 전 번호의 늦은 응답은 버린다
  const checkingPhone = useRef('');
  const checkPhone = useCheckPhoneAvailability();
  const join = useJoinSnsMember();
  const termsQuery = useTermsList();

  const termsList = [...(termsQuery.data ?? [])].sort(
    (a, b) => a.sortSeq - b.sortSeq,
  );
  // 외부에서 연령이 확인됐으면 그 항목은 동의한 것으로 두고 바꿀 수 없다
  const lockedSn = ageCnfrmd ? termsList.find(isAgeTerm)?.trmsSn : undefined;
  const isAgreed = (trmsSn) => trmsSn === lockedSn || Boolean(terms[trmsSn]);
  const isTermsOk =
    termsList.length > 0 &&
    termsList.every(({ trmsSn, esntlAgreYn }) =>
      esntlAgreYn ? isAgreed(trmsSn) : true,
    );
  const isAllChecked =
    termsList.length > 0 && termsList.every(({ trmsSn }) => isAgreed(trmsSn));
  const normalizedPhone = normalizePhone(phone);
  const canJoin = isTermsOk && isPhoneChecked && !isExpired;

  const toggleTerm = (trmsSn) =>
    setTerms((prev) => ({ ...prev, [trmsSn]: !prev[trmsSn] }));

  const toggleAll = () => {
    const next = !isAllChecked;
    setTerms(
      Object.fromEntries(
        termsList
          .filter(({ trmsSn }) => trmsSn !== lockedSn)
          .map(({ trmsSn }) => [trmsSn, next]),
      ),
    );
  };

  const runPhoneCheck = (value) => {
    checkingPhone.current = value;
    checkPhone.mutate(
      { mblTelno: value },
      {
        onSuccess: ({ available, normalizedMblTelno }) => {
          if (checkingPhone.current !== value) return;
          setIsPhoneChecked(available);
          setPhone(formatPhoneInput(normalizedMblTelno));
          setErrors(available ? {} : { phone: MSG.phoneDuplicate });
        },
        onError: (error) => {
          if (checkingPhone.current !== value) return;
          setErrors({
            phone:
              error.code === 'INVALID_PHONE_NUMBER'
                ? MSG.phoneFormat
                : MSG.phoneFailed,
          });
        },
      },
    );
  };

  // 받은 번호는 화면에 들어오면 바로 중복확인한다(개발 모드의 두 번 실행은 한 번으로)
  const autoChecked = useRef(false);
  useEffect(() => {
    if (!isPhoneProvided || autoChecked.current) return;
    autoChecked.current = true;
    runPhoneCheck(normalizePhone(mblTelno));
    // 들어올 때 한 번만 확인한다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const changePhone = (value) => {
    if (isPhoneProvided) return;
    setPhone(typePhoneInput(phone, value));
    setIsPhoneChecked(false);
    checkingPhone.current = '';
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
    runPhoneCheck(normalizedPhone);
  };

  const handleJoinError = (error) => {
    if (error.code === 'SNS_SIGNUP_TOKEN_INVALID') {
      setIsExpired(true);
      setNotice({ type: 'error', message: error.message });
      return;
    }
    const phoneError =
      error.code === 'PHONE_ALREADY_USED'
        ? MSG.phoneDuplicate
        : error.fields?.find(({ field }) => field === 'mblTelno')?.message;
    if (phoneError) {
      setIsPhoneChecked(false);
      setErrors({ phone: phoneError });
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

  const submitJoin = (event) => {
    event.preventDefault();
    if (!canJoin) return;
    setNotice(null);
    join.mutate(
      {
        snsOffrCd,
        signupTkn,
        mblTelno: normalizedPhone,
        trmsAgres: termsList.map(({ trmsSn }) => ({
          trmsSn,
          agreYn: isAgreed(trmsSn),
        })),
        idmptDmndId: idempotencyKey,
      },
      {
        onSuccess: ({ mbrNcnm }) => {
          setNickname(mbrNcnm);
          setStep('complete');
          setIsNicknameOpen(true);
        },
        onError: handleJoinError,
      },
    );
  };

  const guideTarget = errors.phone ? 'phone' : notice ? 'notice' : null;

  return {
    step,
    direction: 'forward',
    snsOffrCd,
    acntEml,
    isPhoneProvided,
    terms,
    termsList,
    lockedSn,
    isTermsLoading: termsQuery.isPending,
    isTermsError: termsQuery.isError,
    retryTerms: termsQuery.refetch,
    termsView,
    openTerms: setTermsView,
    closeTerms: () => setTermsView(null),
    isTermsOk,
    isAllChecked,
    toggleTerm,
    toggleAll,
    phone,
    isPhoneChecked,
    isPhoneChecking: checkPhone.isPending,
    changePhone,
    submitPhoneCheck,
    errors,
    notice,
    isExpired,
    canJoin,
    isJoining: join.isPending,
    submitJoin,
    guideTarget,
    nickname,
    isNicknameOpen,
    openNickname: () => setIsNicknameOpen(true),
    closeNickname: () => setIsNicknameOpen(false),
    saveNickname: (name) => {
      setNickname(name);
      setIsNicknameOpen(false);
    },
  };
}
