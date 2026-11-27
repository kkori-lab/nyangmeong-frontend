import { useCallback, useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { continueAgent, sendMessage } from '../api';
import { aiKeys } from '../queries';
import { toRoute } from '../shared/screenPaths';
import { markRevealed, messageTypingKey } from './useTypewriter';

/** 서버가 멈췄을 때만 쓰는 안전 중단: 첫 글자 10초·전체 60초는 서버가 판정 */
const SAFETY_TIMEOUT_MS = 70_000;

/** 검색 답변 판정: 말풍선에 답변을 흘린다 */
const SEARCH = 'SEARCH';
/**
 * 확인 카드 판정: 검색 답변처럼 말풍선(대기 → 요약 글)을 두고 카드를 그 뒤에 붙인다(추가-2)
 * - silent로 두면 판정부터 끝까지 캐릭터·말풍선이 사라지고, 요약 글 메시지를 다시 불러오기 전에 카드가 먼저 그려진다
 */
const ACTION = 'ACTION';

/** 말풍선을 두는 판정: 이어 가기(판정 없음)도 말풍선 */
const hasBubble = (kind) => kind == null || kind === SEARCH || kind === ACTION;

/** 이어 가기가 글 없이 실패했을 때 결과 줄 뒤에 두는 안내(저장 안 함, 사람 결정 2026-11-26) */
export const CONTINUE_FAILED_TEXT = '남은 일은 이어서 하지 못했어요.';

/**
 * 상태: idle | waiting | streaming | done | error | incomplete | silent | failed
 * - silent: 검색·확인 카드가 아닌 판정(이동·폴백·영수증)을 받고 끝을 기다리는 중(말풍선 없음, 전송 차단)
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
  /** 첫 글자 전 마지막 에이전트 진행 { tool, label, kind }, 없으면 null */
  step: null,
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
   * 답변 받기 공통: 대기 → (진행 문구) → 글 → 끝
   * - request: SSE 요청 함수(sendMessage·continueAgent), 받는 인자 { signal, onRoom, onIntent, onStep, onDelta }
   * - isContinue: 에이전트 이어 가기. 글 없이 실패하면 오류 대신 안내 글(CONTINUE_FAILED_TEXT)
   */
  const run = useCallback(
    async (
      request,
      { aiCnvrsRoomSn, cnvrsCn, replaceMsgSn, onRoom, isContinue = false },
    ) => {
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
        const result = await request({
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
            if (!hasBubble(kind)) {
              setState((prev) => ({ ...prev, status: 'silent' }));
            }
          },
          /** 진행 문구는 첫 글자 전까지만 */
          onStep: (step) => {
            if (!isCurrent() || text !== '') return;
            setState((prev) =>
              prev.status === 'waiting' ? { ...prev, step } : prev,
            );
          },
          onDelta: (chunk) => {
            if (!isCurrent()) return;
            text += chunk;
            setState((prev) => ({
              ...prev,
              status: 'streaming',
              text,
              step: null,
            }));
          },
        });
        if (!isCurrent()) return null;
        clearTimeout(timerRef.current);
        refresh();

        /** 확인 카드인데 저장된 요약 글이 없으면 말풍선 없이(이동·폴백과 같이) */
        const kind = result.intent?.kind;
        if (
          !hasBubble(kind) ||
          ((kind === ACTION || kind == null) && !result.message)
        ) {
          /** 내 메시지는 다시 불러온 상세에 들어올 때까지 임시 말풍선으로 유지 */
          setState((prev) => ({ ...idleState, pendingText: prev.pendingText }));
          return result;
        }

        const { message, shortcut } = result;
        /** 답변 말풍선이 펼쳐 보인 글: 방을 다시 열어 저장 메시지로 그려도 다시 펼치지 않음 */
        if (message) markRevealed(messageTypingKey(message.aiCnvrsMsgSn));
        const isComplete = message?.cmptnYn !== false;
        const route = shortcut && toRoute(shortcut);
        setState((prev) => ({
          ...prev,
          status: isComplete ? 'done' : 'incomplete',
          text: message?.cnvrsCn ?? text,
          step: null,
          shortcuts: isComplete && route ? [route] : [],
          hiddenMsgSns: message
            ? [...prev.hiddenMsgSns, message.aiCnvrsMsgSn]
            : prev.hiddenMsgSns,
        }));
        return result;
      } catch (error) {
        if (!isCurrent()) return null;
        clearTimeout(timerRef.current);
        /** 이어 가기: 결과 줄은 그대로 두고 안내 글만(다시 시도 없음, 토큰을 다시 쓸 수 없다) */
        if (isContinue && text === '') {
          setState((prev) => ({
            ...prev,
            status: 'done',
            text: CONTINUE_FAILED_TEXT,
            step: null,
          }));
          return null;
        }
        /** 오류 모양 { code, message, fields }: 스트림 전 오류 */
        if (error && 'fields' in error) {
          setState((prev) => ({ ...prev, status: 'failed', step: null }));
          return null;
        }
        if (text === '') {
          setState((prev) => ({ ...prev, status: 'error', step: null }));
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

  /**
   * 전송 시작: 끝나면 { aiCnvrsRoomSn, intent, message, shortcut, actions, execute, pending }, 실패·중단이면 null
   * - cnvrsCn 없음: [다시 시도]·[다시 생성], replaceMsgSn은 새 답변으로 바꿀 미완료 메시지
   * - actions: 가장 최근 처리 안 한 확인 카드 묶음 [{ tool, input }]
   * - petSn: 새 방의 펫 태그(선택한 반려동물 칩, [전체]면 null). 방을 만들 때만 쓰고 열린 방에는 보내지 않는다
   */
  const start = useCallback(
    ({ aiCnvrsRoomSn, petSn, cnvrsCn, actions, replaceMsgSn, onRoom }) =>
      run(
        (handlers) =>
          sendMessage({ aiCnvrsRoomSn, petSn, cnvrsCn, actions, ...handlers }),
        { aiCnvrsRoomSn, cnvrsCn, replaceMsgSn, onRoom },
      ),
    [run],
  );

  /**
   * 에이전트 이어 가기: 사용자 말풍선 없이 대기 → 진행 문구 → 이어 간 답(돌려줌 모양은 start와 같다)
   * - results: 그 멈춤의 카드 결과 [{ tool, status, errors?, data? }]
   */
  const resume = useCallback(
    ({ aiCnvrsRoomSn, agentToken, results }) =>
      run(
        (handlers) =>
          continueAgent({ aiCnvrsRoomSn, agentToken, results, ...handlers }),
        { aiCnvrsRoomSn, isContinue: true },
      ),
    [run],
  );

  return { ...state, start, resume, reset };
}
