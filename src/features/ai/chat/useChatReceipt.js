import { useEffect, useRef, useState } from 'react';
import { keepChatReceiptResult } from '../api';
import { useAnalyzeChatReceipt, useSaveReceiptResult } from '../queries';
import {
  SERVER_ANALYZE_GUARD_MS,
  getFailureByCode,
  isEmptyOcr,
} from '../receipt/receiptFailure';

/** 화면 실패 종류 → receipt-result 결과 */
const RESULT_BY_FAILURE = {
  empty: 'FAILED',
  timeout: 'ERROR',
  error: 'ERROR',
};

/**
 * [대화창 영수증 분석 흐름]
 * - 반려동물 되묻기 → 분석(/ai/receipts) → 결과 카드·실패·취소 (SCR-AIM-013)
 * - 분석이 끝나면 receipt-result로 함께 보낸 글과 요약 한 줄을 이력에 저장, 결과 카드 [취소]는 저장 안 함
 * - 저장된 메시지(afterMsgSn 초과 ~ savedUntilSn)는 이 말풍선이 떠 있는 동안 화면에서 숨김
 */
export default function useChatReceipt({ onSaved }) {
  const analyze = useAnalyzeChatReceipt();
  const saveResult = useSaveReceiptResult();
  const abortRef = useRef(null);
  const timerRef = useRef(null);
  const isTimedOutRef = useRef(false);
  /** 지금 말풍선의 번호: 지난 분석의 응답이 새 말풍선을 고치지 않게 */
  const idRef = useRef(0);
  /** { id, file, text, previewUrl, aiCnvrsRoomSn, afterMsgSn, pet, status, result, failure, savedUntilSn } */
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

  const update = (id, patch) =>
    setReceipt((prev) => (prev?.id === id ? { ...prev, ...patch } : prev));

  /** 분석 결과를 대화 이력에 저장 */
  const save = (target, result, ocr) =>
    saveResult.mutate(
      {
        aiCnvrsRoomSn: target.aiCnvrsRoomSn,
        cnvrsCn: target.text,
        result,
        ocr,
      },
      {
        onSuccess: ({ aiCnvrsRoomSn, messages }) => {
          update(target.id, {
            aiCnvrsRoomSn,
            savedUntilSn: messages.at(-1)?.aiCnvrsMsgSn ?? null,
          });
          onSaved({ aiCnvrsRoomSn });
        },
      },
    );

  const run = (target) => {
    const controller = new AbortController();
    abortRef.current = controller;
    isTimedOutRef.current = false;
    timerRef.current = setTimeout(() => {
      isTimedOutRef.current = true;
      controller.abort();
    }, SERVER_ANALYZE_GUARD_MS);
    analyze.mutate(
      {
        petSn: target.pet.petSn,
        file: target.file,
        signal: controller.signal,
      },
      {
        onSuccess: (result) => {
          clearTimeout(timerRef.current);
          /** 추출 0건도 영수증은 만들어짐: 직접 입력에 recptSn 전달 */
          if (isEmptyOcr(result.ocr)) {
            update(target.id, { status: 'failed', failure: 'empty', result });
            return save(target, RESULT_BY_FAILURE.empty);
          }
          update(target.id, { status: 'result', result });
          save(target, 'RECOGNIZED', result.ocr);
        },
        onError: (error) => {
          clearTimeout(timerRef.current);
          if (isTimedOutRef.current) {
            update(target.id, { status: 'failed', failure: 'timeout' });
            return save(target, RESULT_BY_FAILURE.timeout);
          }
          if (controller.signal.aborted) {
            /** 화면을 떠나며 끊은 것은 저장 없음 */
            if (target.id !== idRef.current) return;
            update(target.id, { status: 'cancelled' });
            return save(target, 'CANCELED');
          }
          const failure = getFailureByCode(error.code);
          update(target.id, { status: 'failed', failure });
          save(target, RESULT_BY_FAILURE[failure]);
        },
      },
    );
  };

  /**
   * 첨부 전송: 반려동물이 정해지면 바로 분석, 아니면 되묻기
   * afterMsgSn: 보내기 전 대화의 마지막 메시지 번호(없으면 0)
   */
  const start = ({ file, text, aiCnvrsRoomSn, afterMsgSn, pet }) => {
    if (analyze.isPending) return;
    idRef.current += 1;
    const next = {
      id: idRef.current,
      file,
      text,
      previewUrl: URL.createObjectURL(file),
      aiCnvrsRoomSn,
      afterMsgSn,
      pet,
      status: pet ? 'analyzing' : 'choosing',
      result: null,
      failure: null,
      savedUntilSn: null,
    };
    setReceipt(next);
    if (pet) run(next);
  };

  /** 되묻기 칩 선택 */
  const choosePet = (pet) => {
    if (status !== 'choosing') return;
    update(receipt.id, { pet, status: 'analyzing' });
    run({ ...receipt, pet });
  };

  /** 분석 중 [취소]: 요청을 끊으면 서버가 영수증 상태를 '취소'로 기록 */
  const cancel = () => abortRef.current?.abort();

  /** 결과 카드 [취소]: 저장 없이 '취소됨' 표시 */
  const dismiss = () => update(receipt.id, { status: 'dismissed' });

  /** [확인 후 저장]: 본창 결과 확인 모달이 읽을 분석 결과 보관 */
  const keepResult = () => keepChatReceiptResult(receipt.result);

  const reset = () => {
    clearTimeout(timerRef.current);
    idRef.current += 1;
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
    keepResult,
    reset,
  };
}
