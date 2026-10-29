import { useCallback, useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { sendMessage } from '../api';
import { aiKeys } from '../queries';
import { toRoute } from '../shared/screenPaths';

/** 서버가 멈췄을 때만 쓰는 안전 중단: 첫 글자 10초·전체 60초는 서버가 판정 */
const SAFETY_TIMEOUT_MS = 70_000;

/** 검색 답변이 아닌 판정(이동·폴백·등록·영수증) */
const SEARCH = 'SEARCH';

/**
 * 상태: idle | waiting | streaming | done | error | incomplete | silent | failed
 * - silent: 검색이 아닌 판정을 받고 끝을 기다리는 중(말풍선 없음, 전송 차단)
 * - failed: 스트림 전 오류(400·404·502·연결 실패)
 */
const idleState = {
  status: 'idle',
  text: '',
  shortcuts: [],
  aiCnvrsRoomSn: null,
  /** 화면이 대신하는 저장 메시지 */
  hiddenMsgSns: [],
  /** 보낸 메시지: 서버가 저장한 메시지를 불러오기 전까지 화면에 먼저 표시 */
  pendingText: null,
};

/** 메시지 전송과 답변 수신 화면 상태 */
export default function useAnswerStream() {
  const queryClient = useQueryClient();
  const [state, setState] = useState(idleState);
  /** 늦은 응답 덮어쓰기 방지용 요청 번호 */
  const runIdRef = useRef(0);
  const abortRef = useRef(null);
  const timerRef = useRef(null);

  const reset = useCallback(() => {
    runIdRef.current += 1;
    abortRef.current?.abort();
    clearTimeout(timerRef.current);
    setState(idleState);
  }, []);

  /** 창 닫힘 시 정리 */
  useEffect(() => reset, [reset]);

  /**
   * 전송 시작: 끝나면 { aiCnvrsRoomSn, intent, message, shortcut, card }, 실패·중단이면 null
   * - cnvrsCn 없음: [다시 시도]·[다시 생성], replaceMsgSn은 새 답변으로 바꿀 미완료 메시지
   * - draft: 가장 최근 등록 카드
   */
  const start = useCallback(
    async ({ aiCnvrsRoomSn, cnvrsCn, draft, replaceMsgSn, onRoom }) => {
      runIdRef.current += 1;
      const runId = runIdRef.current;
      abortRef.current?.abort();
      clearTimeout(timerRef.current);

      const controller = new AbortController();
      abortRef.current = controller;
      timerRef.current = setTimeout(
        () => controller.abort(),
        SAFETY_TIMEOUT_MS,
      );
      let text = '';
      let roomSn = aiCnvrsRoomSn;
      const isCurrent = () => runIdRef.current === runId;

      setState({
        ...idleState,
        status: 'waiting',
        aiCnvrsRoomSn,
        hiddenMsgSns: replaceMsgSn ? [replaceMsgSn] : [],
        pendingText: cnvrsCn ?? null,
      });

      const refresh = () => {
        queryClient.invalidateQueries({ queryKey: aiKeys.lists });
        queryClient.invalidateQueries({ queryKey: aiKeys.detail(roomSn) });
      };

      try {
        const result = await sendMessage({
          aiCnvrsRoomSn,
          cnvrsCn,
          draft,
          signal: controller.signal,
          onRoom: (nextRoomSn) => {
            if (!isCurrent()) return;
            roomSn = nextRoomSn;
            setState((prev) => ({ ...prev, aiCnvrsRoomSn: roomSn }));
            onRoom?.(roomSn);
          },
          onIntent: ({ kind }) => {
            if (!isCurrent()) return;
            /** 판정 시점에 서버가 저장한 내 메시지를 바로 표시 */
            queryClient.invalidateQueries({
              queryKey: aiKeys.detail(roomSn),
            });
            if (kind !== SEARCH) {
              setState((prev) => ({ ...prev, status: 'silent' }));
            }
          },
          onDelta: (chunk) => {
            if (!isCurrent()) return;
            text += chunk;
            setState((prev) => ({ ...prev, status: 'streaming', text }));
          },
        });
        if (!isCurrent()) return null;
        clearTimeout(timerRef.current);
        refresh();

        if (result.intent?.kind !== SEARCH) {
          /** 내 메시지는 다시 불러온 상세에 들어올 때까지 임시 말풍선으로 유지 */
          setState((prev) => ({ ...idleState, pendingText: prev.pendingText }));
          return result;
        }

        const { message, shortcut } = result;
        const isComplete = message?.cmptnYn !== false;
        const route = shortcut && toRoute(shortcut);
        setState((prev) => ({
          ...prev,
          status: isComplete ? 'done' : 'incomplete',
          text: message?.cnvrsCn ?? text,
          shortcuts: isComplete && route ? [route] : [],
          hiddenMsgSns: message
            ? [...prev.hiddenMsgSns, message.aiCnvrsMsgSn]
            : prev.hiddenMsgSns,
        }));
        return result;
      } catch (error) {
        if (!isCurrent()) return null;
        clearTimeout(timerRef.current);
        /** 오류 모양 { code, message, fields }: 스트림 전 오류 */
        if (error && 'fields' in error) {
          setState((prev) => ({ ...prev, status: 'failed' }));
          return null;
        }
        if (text === '') {
          setState((prev) => ({ ...prev, status: 'error' }));
          return null;
        }
        /** 글자 뒤 끊김: 서버가 미완료로 저장한 메시지를 다시 불러 표시 */
        setState((prev) => ({
          ...idleState,
          hiddenMsgSns: prev.hiddenMsgSns,
          pendingText: prev.pendingText,
        }));
        refresh();
        return null;
      }
    },
    [queryClient],
  );

  return { ...state, start, reset };
}
