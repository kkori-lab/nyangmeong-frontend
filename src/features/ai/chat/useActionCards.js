import { useState } from 'react';
import { notifyAiWrite } from '@/utils/aiWriteChannel';
import { toFieldErrors, toFormError } from '@/utils/fieldErrors';
import { useExecuteAction, useSaveActionResult } from '../queries';
import {
  buildActionRequest,
  missingFields,
  resultInput,
  visibleFields,
} from './actionForm';

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
 * - 항목: { key, card, input, shownFields, afterSn, anchorSn, status, isBusy, fieldErrors, formError, unsaved, resultText, resultMsgSn }
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

  /** 새 카드 */
  const add = ({ key, card, afterSn, anchorSn = null }) =>
    setActionCards((prev) => [
      ...prev,
      {
        key,
        card,
        input: { ...card.input },
        shownFields: visibleFields(card),
        afterSn,
        anchorSn,
        status: 'pending',
        isBusy: false,
        fieldErrors: {},
        formError: null,
        unsaved: null,
        resultText: null,
        resultMsgSn: null,
      },
    ]);

  /** 카드에서 값 고침: 고친 칸의 서버 오류는 지운다 */
  const changeInput = (key, field, nextInput) =>
    patchCard(key, (item) => {
      const fieldErrors = { ...item.fieldErrors };
      delete fieldErrors[field];
      return { input: nextInput, fieldErrors };
    });

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

  /** [확인]: Java 실행 → 결과 저장, 회원이 고칠 수 있는 오류면 카드를 살려 둔다 */
  const confirm = async (aiCnvrsRoomSn, key) => {
    const item = actionCards.find((target) => target.key === key);
    if (!item || missingFields(item.card, item.input).length > 0) return;
    const input = resultInput(item.card, item.input);
    patchCard(key, { isBusy: true, fieldErrors: {}, formError: null });
    try {
      await executeAction.mutateAsync(buildActionRequest(item.card, input));
    } catch (error) {
      if (SERVER_FAILURE_CODES.includes(error?.code)) {
        await saveResult(aiCnvrsRoomSn, item, ACTION_STATUS.FAILED, input);
        return;
      }
      patchCard(key, {
        isBusy: false,
        fieldErrors: toFieldErrors(error),
        formError: toFormError(error, item.shownFields),
      });
      return;
    }
    notifyAiWrite({ domain: item.card.domain, petSn: input.petSn ?? null });
    await saveResult(aiCnvrsRoomSn, item, ACTION_STATUS.DONE, input);
  };

  /** [취소]: 저장하지 않고 취소 결과만 남긴다 */
  const cancel = (aiCnvrsRoomSn, key) => {
    const item = actionCards.find((target) => target.key === key);
    if (!item) return;
    /** 저장하지 않으니 서버가 검증한 원래 값: 고친 값이 규칙 밖이면 결과 저장이 400으로 막힌다 */
    saveResult(
      aiCnvrsRoomSn,
      item,
      ACTION_STATUS.CANCELED,
      resultInput(item.card, item.card.input),
    );
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
    changeInput,
    confirm,
    cancel,
    retrySave,
    pendingAction,
    reset,
  };
}
