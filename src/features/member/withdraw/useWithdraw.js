import { useState } from 'react';
import { getMe } from '../api';
import { useWithdrawMember } from '../queries';
import { WITHDRAW_MESSAGES as MSG, WITHDRAW_PHRASE } from './withdrawMessages';

/** 로그인이 없다는 응답(재발급도 실패한 경우 포함) */
const LOGGED_OUT_CODES = ['UNAUTHORIZED', 'TOKEN_EXPIRED', 'MEMBER_INACTIVE'];

/** 문구 입력칸 아래 문구(칸을 벗어난 뒤부터 보인다) */
const getPhraseState = (phrase) => {
  if (phrase === '') return { error: MSG.phraseEmpty };
  if (phrase !== WITHDRAW_PHRASE) return { error: MSG.phraseMismatch };
  return { success: MSG.phraseMatch };
};

/**
 * 회원탈퇴 흐름: 안내(notice) → 문구 모달 → 실행.
 * 실패가 확인되면 failed, 응답이 끊겨 결과를 모르면 unknown(그동안 탈퇴 요청을 다시 보내지 않는다)
 */
export default function useWithdraw({ onWithdrawn, onLoggedOut }) {
  const withdraw = useWithdrawMember();
  const [step, setStep] = useState('notice');
  const [isChecked, setIsChecked] = useState(false);
  const [noticeError, setNoticeError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [phrase, setPhrase] = useState('');
  const [isTouched, setIsTouched] = useState(false);
  const [serverError, setServerError] = useState('');
  const [isCheckingResult, setIsCheckingResult] = useState(false);

  const isMatch = phrase === WITHDRAW_PHRASE;
  const phraseState = isTouched ? getPhraseState(phrase) : {};
  const phraseError = serverError || phraseState.error;

  const resetPhrase = () => {
    setPhrase('');
    setIsTouched(false);
    setServerError('');
  };

  /** 안내부터 다시: 체크와 문구를 모두 비운다 */
  const restart = () => {
    resetPhrase();
    setIsChecked(false);
    setNoticeError('');
    setIsModalOpen(false);
    setStep('notice');
  };

  const toggleCheck = () => {
    setIsChecked((prev) => !prev);
    setNoticeError('');
  };

  const openModal = () => {
    if (!isChecked) {
      setNoticeError(MSG.noticeRequired);
      return;
    }
    resetPhrase();
    setIsModalOpen(true);
  };

  /** 모달 취소·닫기: 입력만 비우고 안내로 돌아간다 */
  const closeModal = () => {
    if (withdraw.isPending) return;
    resetPhrase();
    setIsModalOpen(false);
  };

  const changePhrase = (value) => {
    setPhrase(value);
    setServerError('');
    /** 일치 뒤 다시 고치면 바로 다시 검사 */
    if (phrase === WITHDRAW_PHRASE) setIsTouched(true);
  };

  const submit = () => {
    if (!isMatch || !isChecked || withdraw.isPending) return;
    withdraw.mutate(
      { confirmPhrase: phrase },
      {
        onSuccess: onWithdrawn,
        onError: (error) => {
          if (error.code === 'WITHDRAW_PHRASE_MISMATCH') {
            setIsTouched(true);
            setServerError(error.message || MSG.phraseMismatch);
            return;
          }
          const noticeField = error.fields?.find(
            ({ field }) => field === 'noticeConfirmed',
          );
          if (error.code === 'INVALID_INPUT_VALUE' && noticeField) {
            resetPhrase();
            setIsModalOpen(false);
            setIsChecked(false);
            setNoticeError(MSG.noticeRequired);
            return;
          }
          resetPhrase();
          setIsModalOpen(false);
          setStep(error.code === 'NETWORK_ERROR' ? 'unknown' : 'failed');
        },
      },
    );
  };

  /** 결과 확인: 탈퇴 요청은 다시 보내지 않고 로그인 상태만 본다 */
  const checkResult = async () => {
    if (isCheckingResult) return;
    setIsCheckingResult(true);
    try {
      await getMe();
      /** 로그인이 살아 있으면 탈퇴되지 않았다 */
      restart();
    } catch (error) {
      if (LOGGED_OUT_CODES.includes(error.code)) onLoggedOut();
      /** 확인 요청도 끊기면 확인 중 그대로 둔다 */
    } finally {
      setIsCheckingResult(false);
    }
  };

  return {
    step,
    isChecked,
    noticeError,
    toggleCheck,
    openModal,
    isModalOpen,
    closeModal,
    phrase,
    changePhrase,
    blurPhrase: () => setIsTouched(true),
    phraseError,
    phraseSuccess: phraseError ? '' : phraseState.success,
    isMatch,
    isPending: withdraw.isPending,
    submit,
    checkResult,
    isCheckingResult,
    restart,
  };
}
