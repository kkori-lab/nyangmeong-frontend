import { useCallback, useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { streamAnswer } from '../api';
import { aiKeys } from '../queries';

/** 첫 글자 대기 제한 */
const FIRST_TOKEN_TIMEOUT_MS = 10_000;
/** 답변 전체 시간 제한 */
const TOTAL_TIMEOUT_MS = 60_000;

/** 상태: idle | waiting | streaming | done | error | incomplete */
const idleState = {
  status: 'idle',
  text: '',
  shortcuts: [],
  question: '',
  aiCnvrsRoomSn: null,
  /** 화면이 대신하는 저장 메시지 */
  hiddenMsgSns: [],
};

/** 답변 수신 화면 상태 */
export default function useAnswerStream() {
  const queryClient = useQueryClient();
  const [state, setState] = useState(idleState);
  /** 늦은 응답 덮어쓰기 방지용 요청 번호 */
  const runIdRef = useRef(0);
  const abortRef = useRef(null);
  const timersRef = useRef([]);

  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  };

  const reset = useCallback(() => {
    runIdRef.current += 1;
    abortRef.current?.abort();
    clearTimers();
    setState(idleState);
  }, []);

  /** 창 닫힘 시 정리 */
  useEffect(() => reset, [reset]);

  /** 답변 시작 */
  const start = useCallback(
    async ({ aiCnvrsRoomSn, question, replaceMsgSn }) => {
      runIdRef.current += 1;
      const runId = runIdRef.current;
      abortRef.current?.abort();
      clearTimers();

      const controller = new AbortController();
      abortRef.current = controller;
      let text = '';
      let isFirstTokenReceived = false;

      setState({
        ...idleState,
        status: 'waiting',
        question,
        aiCnvrsRoomSn,
        hiddenMsgSns: replaceMsgSn ? [replaceMsgSn] : [],
      });

      timersRef.current = [
        setTimeout(() => {
          if (!isFirstTokenReceived) controller.abort();
        }, FIRST_TOKEN_TIMEOUT_MS),
        setTimeout(() => controller.abort(), TOTAL_TIMEOUT_MS),
      ];

      const isCurrent = () => runIdRef.current === runId;

      try {
        const result = await streamAnswer({
          aiCnvrsRoomSn,
          question,
          replaceMsgSn,
          signal: controller.signal,
          onToken: (chunk) => {
            if (!isCurrent()) return;
            isFirstTokenReceived = true;
            text += chunk;
            setState((prev) => ({ ...prev, status: 'streaming', text }));
          },
        });
        if (!isCurrent()) return;
        clearTimers();

        /** 첫 글자 전 끊김 */
        if (text === '') {
          setState((prev) => ({ ...prev, status: 'error' }));
          return;
        }

        const isComplete = result.aiCnvrsMsgCmptnYn === 'Y';
        setState((prev) => ({
          ...prev,
          status: isComplete ? 'done' : 'incomplete',
          text: result.cnvrsCn ?? text,
          shortcuts: isComplete ? result.rltdShrtcts : [],
          hiddenMsgSns: [...prev.hiddenMsgSns, result.aiCnvrsMsgSn],
        }));
        queryClient.invalidateQueries({ queryKey: aiKeys.lists });
        queryClient.invalidateQueries({
          queryKey: aiKeys.detail(aiCnvrsRoomSn),
        });
      } catch {
        if (!isCurrent()) return;
        clearTimers();
        /** 미완료 보존 */
        setState((prev) => ({
          ...prev,
          status: text === '' ? 'error' : 'incomplete',
          text,
        }));
      }
    },
    [queryClient],
  );

  return { ...state, start, reset };
}
