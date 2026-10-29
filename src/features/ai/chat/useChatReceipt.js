import { useEffect, useRef, useState } from 'react';
import { useAnalyzeChatReceipt, useCancelChatReceipt } from '../queries';
import { ANALYZE_TIMEOUT_MS } from '../receipt/receiptFailure';

/**
 * [대화창 영수증 분석 흐름]
 * - 반려동물 되묻기 → 분석 → 결과 카드·실패·취소 (SCR-AIM-013)
 * - 이번 화면에서만 유지, 이력에는 서버가 저장한 요약 한 줄만
 */
export default function useChatReceipt({ onAnalyzed }) {
  const analyze = useAnalyzeChatReceipt();
  const cancelReceipt = useCancelChatReceipt();
  const abortRef = useRef(null);
  const timerRef = useRef(null);
  const isTimedOutRef = useRef(false);
  /** { file, text, previewUrl, aiCnvrsRoomSn, pet, status, result, failure } */
  const [receipt, setReceipt] = useState(null);
  /** 'choosing' | 'analyzing' | 'result' | 'failed' | 'cancelled' | 'dismissed' */
  const status = receipt?.status ?? null;

  /** 미리보기 주소 해제 */
  const previewUrl = receipt?.previewUrl;
  useEffect(
    () => () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    },
    [previewUrl],
  );

  /** 화면을 떠날 때 진행 중인 분석 중단 */
  useEffect(
    () => () => {
      clearTimeout(timerRef.current);
      abortRef.current?.abort();
    },
    [],
  );

  const update = (patch) => setReceipt((prev) => prev && { ...prev, ...patch });

  const run = ({ file, text, aiCnvrsRoomSn, pet }) => {
    const controller = new AbortController();
    abortRef.current = controller;
    isTimedOutRef.current = false;
    timerRef.current = setTimeout(() => {
      isTimedOutRef.current = true;
      controller.abort();
    }, ANALYZE_TIMEOUT_MS);
    analyze.mutate(
      {
        aiCnvrsRoomSn,
        petSn: pet.petSn,
        file,
        text,
        signal: controller.signal,
      },
      {
        onSuccess: (result) => {
          clearTimeout(timerRef.current);
          /** 추출 0건도 영수증은 만들어짐: 직접 입력에 recptSn 전달 */
          if (!result.aiCnvrsMsgSn) {
            return update({ status: 'failed', failure: 'empty', result });
          }
          update({ status: 'result', result });
          onAnalyzed(result);
        },
        onError: (error) => {
          clearTimeout(timerRef.current);
          if (isTimedOutRef.current) {
            return update({ status: 'failed', failure: 'timeout' });
          }
          if (error.name === 'AbortError') {
            return update({ status: 'cancelled' });
          }
          update({ status: 'failed', failure: 'error' });
        },
      },
    );
  };

  /** 첨부 전송: 반려동물이 정해지면 바로 분석, 아니면 되묻기. 함께 보낸 글은 표시만 */
  const start = ({ file, text, aiCnvrsRoomSn, pet }) => {
    if (analyze.isPending) return;
    const next = {
      file,
      text,
      previewUrl: URL.createObjectURL(file),
      aiCnvrsRoomSn,
      pet,
      status: pet ? 'analyzing' : 'choosing',
      result: null,
      failure: null,
    };
    setReceipt(next);
    if (pet) run(next);
  };

  /** 되묻기 칩 선택 */
  const choosePet = (pet) => {
    if (status !== 'choosing') return;
    update({ pet, status: 'analyzing' });
    run({ ...receipt, pet });
  };

  /** 분석 중 [취소]: 요청 중단 + 영수증 상태 '취소' */
  const cancel = () => {
    abortRef.current?.abort();
    cancelReceipt.mutate();
  };

  /** 결과 카드 [취소]: 저장 없이 '취소됨' 표시 */
  const dismiss = () => update({ status: 'dismissed' });

  const reset = () => {
    clearTimeout(timerRef.current);
    abortRef.current?.abort();
    setReceipt(null);
  };

  return {
    receipt,
    status,
    isBusy: status === 'choosing' || status === 'analyzing',
    start,
    choosePet,
    cancel,
    dismiss,
    reset,
  };
}
