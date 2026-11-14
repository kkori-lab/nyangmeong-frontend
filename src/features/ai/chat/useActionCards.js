import { useState } from 'react';
import { notifyAiWrite } from '@/utils/aiWriteChannel';
import { toFieldErrors, toFormError } from '@/utils/fieldErrors';
import { useExecuteAction, useSaveActionResult } from '../queries';
import { buildActionRequest, missingFields, resultInput } from './actionForm';

/** 결과 저장 status(ActionResultRequest) */
export const ACTION_STATUS = {
  DONE: 'DONE',
  CANCELED: 'CANCELED',
  FAILED: 'FAILED',
};

/** 서버 장애·네트워크: 회원이 고쳐서 풀 수 없어 바로 실패로 저장(사람 결정 2026-11-09) */
const SERVER_FAILURE_CODES = [
  'SERVER_ERROR',
  'NETWORK_ERROR',
  'INTERNAL_SERVER_ERROR',
];

/** 카드 결과 상태: 처리 전 pending */
const STATUS_BY_RESULT = {
  [ACTION_STATUS.DONE]: 'done',
  [ACTION_STATUS.CANCELED]: 'cancelled',
  [ACTION_STATUS.FAILED]: 'failed',
};

/**
 * 확인 카드(ACTION) 목록: 서버에 저장되지 않아 새로고침하면 사라진다(등록 카드와 같다)
 * - 카드 내용은 저장된 요약 글로 보이고, 확인·취소는 말로 한다(done.execute로 실행, 취소 말이면 카드 버림)
 * - 항목: { key, card, input, afterSn, anchorSn, status, isBusy, fieldErrors, formError, unsaved, resultText, resultMsgSn }
 * - status: 'pending' | 'done' | 'cancelled' | 'failed' | 'dropped'(취소 말·다른 말로 버림)
 * - key는 등록 카드와 같은 번호를 써서 "가장 최근 카드"를 함께 따진다
 * - unsaved: 결과 저장에 실패한 { status, input }, [다시 시도]로 저장만 다시
 */
export function useActionCards() {
  const [actionCards, setActionCards] = useState([]);
  const executeAction = useExecuteAction();
  const saveActionResult = useSaveActionResult();

  const patchCard = (key, patch) =>
    setActionCards((prev) =>
      prev.map((item) =>
        item.key === key
          ? { ...item, ...(typeof patch === 'function' ? patch(item) : patch) }
          : item,
      ),
    );

  /** 새 카드 항목 */
  const toItem = ({ key, card, afterSn, anchorSn = null }) => ({
    key,
    card,
    input: { ...card.input },
    afterSn,
    anchorSn,
    status: 'pending',
    isBusy: false,
    fieldErrors: {},
    formError: null,
    unsaved: null,
    resultText: null,
    resultMsgSn: null,
  });

  /** 새 카드 */
  const add = (params) => setActionCards((prev) => [...prev, toItem(params)]);

  /** 카드 버림: 보낸 카드에 대해 서버가 카드 없이 답함(취소 말 등), 다음 메시지에 싣지 않는다 */
  const drop = (key) => patchCard(key, { status: 'dropped' });

  /** 결과 저장: 성공하면 요약 메시지 자리로, 실패하면 [다시 시도] */
  const saveResult = async (aiCnvrsRoomSn, item, status, input) => {
    patchCard(item.key, { isBusy: true, unsaved: null });
    try {
      const message = await saveActionResult.mutateAsync({
        aiCnvrsRoomSn,
        tool: item.card.tool,
        status,
        input,
      });
      patchCard(item.key, {
        isBusy: false,
        status: STATUS_BY_RESULT[status],
        resultText: message.cnvrsCn,
        resultMsgSn: message.aiCnvrsMsgSn,
      });
    } catch {
      patchCard(item.key, { isBusy: false, unsaved: { status, input } });
    }
  };

  /** 실행: Java 실행 → 결과 저장, 회원이 고칠 수 있는 오류면 카드를 살려 두고 말로 고치게 한다 */
  const run = async (aiCnvrsRoomSn, item) => {
    const key = item.key;
    if (missingFields(item.card, item.input).length > 0) return;
    const input = resultInput(item.card, item.input);
    patchCard(key, { isBusy: true, fieldErrors: {}, formError: null });
    try {
      await executeAction.mutateAsync(buildActionRequest(item.card, input));
    } catch (error) {
      if (SERVER_FAILURE_CODES.includes(error?.code)) {
        await saveResult(aiCnvrsRoomSn, item, ACTION_STATUS.FAILED, input);
        return;
      }
      const fieldErrors = toFieldErrors(error);
      patchCard(key, {
        isBusy: false,
        fieldErrors,
        formError: toFormError(error, Object.keys(fieldErrors)),
      });
      return;
    }
    notifyAiWrite({ domain: item.card.domain, petSn: input.petSn ?? null });
    await saveResult(aiCnvrsRoomSn, item, ACTION_STATUS.DONE, input);
  };

  /** 새 카드를 받자마자 실행(done.execute): 확인 말에 서버가 다시 검증한 카드 */
  const execute = (aiCnvrsRoomSn, params) => {
    const item = toItem(params);
    setActionCards((prev) => [...prev, item]);
    return run(aiCnvrsRoomSn, item);
  };

  /** 결과 저장 [다시 시도] */
  const retrySave = (aiCnvrsRoomSn, key) => {
    const item = actionCards.find((target) => target.key === key);
    if (!item?.unsaved) return;
    saveResult(aiCnvrsRoomSn, item, item.unsaved.status, item.unsaved.input);
  };

  /** 다음 메시지에 실을 가장 최근 확인 카드: 그 카드가 전체에서 가장 최근이고 처리 전일 때만 */
  const pendingAction = (latestCardKey) => {
    const latest = actionCards.at(-1);
    if (
      !latest ||
      latest.key !== latestCardKey ||
      latest.status !== 'pending' ||
      latest.unsaved
    ) {
      return null;
    }
    return {
      tool: latest.card.tool,
      input: resultInput(latest.card, latest.input),
    };
  };

  const reset = () => setActionCards([]);

  return {
    actionCards,
    add,
    execute,
    drop,
    retrySave,
    pendingAction,
    reset,
  };
}
