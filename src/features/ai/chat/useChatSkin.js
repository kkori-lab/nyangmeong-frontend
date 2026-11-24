import { useEffect, useRef, useState } from 'react';
import { useAnalyzeSkin } from '../queries';

/** 화면 안전망: 서버가 20초에 SKIN_ANALYZE_TIMEOUT으로 끝내므로 그보다 늦게 끊기 */
const SKIN_ANALYZE_GUARD_MS = 25000;

/** 같은 사진으로 다시 해도 안 되는 오류: [다시 시도] 없음 */
const FILE_ERRORS = {
  FILE_TYPE_NOT_ALLOWED: 'jpg·png·webp 사진만 분석할 수 있어요.',
  FILE_SIZE_EXCEEDED: '10MB 이하 사진만 분석할 수 있어요.',
  INVALID_REQUEST: '사진을 읽지 못했어요. 다른 사진을 올려 주세요.',
};
const TIMEOUT_MESSAGE = '분석 시간이 길어졌어요. 잠시 뒤 다시 시도해 주세요.';
const FAILED_MESSAGE =
  '피부 사진을 분석하지 못했어요. 잠시 뒤 다시 시도해 주세요.';

/**
 * [대화창 피부 사진 분석 흐름] (SCR-AIM-013, 계약 ai 저장소 docs/api/skinlesion.md)
 * - image-intent SKIN·ASK 칩 [피부 분석] → /ai/skin-analyses → 결과 말풍선
 * - 사진 턴은 image-intent가 방에 저장, 분석 결과는 저장하지 않아 방을 다시 열면 없다(ai skin-card 전)
 * - status: 'analyzing' | 'result' | 'failed'
 */
export default function useChatSkin() {
  const analyze = useAnalyzeSkin();
  const abortRef = useRef(null);
  const timerRef = useRef(null);
  const isTimedOutRef = useRef(false);
  /** 지금 말풍선의 번호: 지난 분석의 응답이 새 말풍선을 고치지 않게 */
  const idRef = useRef(0);
  /** { id, file, status, result, errorMessage, isRetryable } */
  const [skin, setSkin] = useState(null);
  const status = skin?.status ?? null;

  /** 화면을 떠날 때 진행 중인 분석 중단 */
  useEffect(
    () => () => {
      clearTimeout(timerRef.current);
      abortRef.current?.abort();
    },
    [],
  );

  const update = (id, patch) =>
    setSkin((prev) => (prev?.id === id ? { ...prev, ...patch } : prev));

  const run = (target) => {
    const controller = new AbortController();
    abortRef.current = controller;
    isTimedOutRef.current = false;
    timerRef.current = setTimeout(() => {
      isTimedOutRef.current = true;
      controller.abort();
    }, SKIN_ANALYZE_GUARD_MS);
    analyze.mutate(
      { file: target.file, signal: controller.signal },
      {
        onSuccess: (result) => {
          clearTimeout(timerRef.current);
          update(target.id, { status: 'result', result });
        },
        onError: (error) => {
          clearTimeout(timerRef.current);
          /** 새 전송·방 바꿈으로 끊은 것은 그대로 버림 */
          if (controller.signal.aborted && !isTimedOutRef.current) return;
          const fileMessage = FILE_ERRORS[error?.code];
          const isTimeout =
            isTimedOutRef.current || error?.code === 'SKIN_ANALYZE_TIMEOUT';
          update(target.id, {
            status: 'failed',
            errorMessage:
              fileMessage ?? (isTimeout ? TIMEOUT_MESSAGE : FAILED_MESSAGE),
            isRetryable: !fileMessage,
          });
        },
      },
    );
  };

  /** 분석 시작: 사진만 보낸다(반려동물·글 없음) */
  const start = ({ file }) => {
    clearTimeout(timerRef.current);
    abortRef.current?.abort();
    idRef.current += 1;
    const next = {
      id: idRef.current,
      file,
      status: 'analyzing',
      result: null,
      errorMessage: null,
      isRetryable: false,
    };
    setSkin(next);
    run(next);
  };

  /** 실패 [다시 시도]: 같은 사진으로 다시 요청 */
  const retry = () => {
    if (status !== 'failed' || !skin.isRetryable) return;
    update(skin.id, { status: 'analyzing', errorMessage: null });
    run(skin);
  };

  const reset = () => {
    clearTimeout(timerRef.current);
    idRef.current += 1;
    abortRef.current?.abort();
    setSkin(null);
  };

  return {
    skin,
    status,
    isBusy: status === 'analyzing',
    start,
    retry,
    reset,
  };
}
