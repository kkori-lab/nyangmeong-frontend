import { useState } from 'react';
import { notifyAiWrite } from '@/utils/aiWriteChannel';
import { toFieldErrors, toFormError } from '@/utils/fieldErrors';
import { useExecuteAction, useSaveActionResult } from '../queries';
import {
  buildActionRequest,
  fileFields,
  jsonInput,
  missingFields,
  resultInput,
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
 * - 카드는 칸 이름·값으로 보이고 [확인]·[취소] 버튼이 있다(사람 결정 2026-11-24). 말로 하는 확인(done.execute)·취소(카드 버림)도 그대로
 * - 항목: { key, card, input, afterSn, anchorSn, status, isBusy, fieldErrors, formError, unsaved, resultText, resultMsgSn }
 * - status: 'pending' | 'done' | 'cancelled' | 'failed' | 'dropped'(취소 말·다른 말로 버림)
 * - key는 등록 카드와 같은 번호를 써서 "가장 최근 카드"를 함께 따진다
 * - unsaved: 결과 저장에 실패한 { status, input }, [다시 시도]로 저장만 다시
 * - files: 파일 칸에 붙일 { 칸: File }(분석한 사진). input에 넣어 Java 실행에만 쓰고 결과 저장·다음 메시지에는 싣지 않는다
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
  const toItem = ({
    key,
    card,
    afterSn,
    anchorSn = null,
    files = {},
    photoFields,
  }) => ({
    key,
    card,
    input: { ...card.input, ...files },
    /** 카드에 사진 줄로 보일 파일 칸: 분석한 사진을 붙여 받은 칸은 숨기고, 이어 받은 카드는 앞 카드 그대로 */
    photoFields:
      photoFields ??
      fileFields(card).filter((field) => !(files[field] instanceof Blob)),
    afterSn,
    anchorSn,
    status: 'pending',
    isBusy: false,
    fieldErrors: {},
    formError: null,
    unsaved: null,
    resultText: null,
    resultMsgSn: null,
    /** 사진 칸만 빈 채로 확인 말이 왔는지: 사진 칸 아래 안내를 "사진을 올려야 등록돼요"로 */
    isPhotoAsked: false,
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
    const savedInput = jsonInput(item.card, item.input);
    patchCard(key, { isBusy: true, fieldErrors: {}, formError: null });
    try {
      await executeAction.mutateAsync(buildActionRequest(item.card, input));
    } catch (error) {
      if (SERVER_FAILURE_CODES.includes(error?.code)) {
        await saveResult(aiCnvrsRoomSn, item, ACTION_STATUS.FAILED, savedInput);
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
    await saveResult(aiCnvrsRoomSn, item, ACTION_STATUS.DONE, savedInput);
  };

  /**
   * 새 카드를 받자마자 실행(done.execute): 확인 말에 서버가 다시 검증한 카드
   * - 서버는 파일 칸을 세지 않아 사진 칸만 비어도 실행이 온다(ai PR #114). 그때는 실행하지 않고 카드에서 사진을 받는다
   */
  const execute = (aiCnvrsRoomSn, params) => {
    const item = toItem(params);
    const missingFiles = fileFields(item.card).filter((field) =>
      missingFields(item.card, item.input).includes(field),
    );
    if (missingFiles.length > 0) {
      setActionCards((prev) => [...prev, { ...item, isPhotoAsked: true }]);
      return Promise.resolve();
    }
    setActionCards((prev) => [...prev, item]);
    return run(aiCnvrsRoomSn, item);
  };

  /** 카드 [확인]: 확인 말("등록해 줘")과 같은 실행 */
  const confirm = (aiCnvrsRoomSn, key) => {
    const item = actionCards.find((target) => target.key === key);
    if (!item || item.status !== 'pending' || item.isBusy || item.unsaved) {
      return;
    }
    run(aiCnvrsRoomSn, item);
  };

  /** 카드 [취소]: Java 없이 취소 결과만 저장 */
  const cancel = (aiCnvrsRoomSn, key) => {
    const item = actionCards.find((target) => target.key === key);
    if (!item || item.status !== 'pending' || item.isBusy || item.unsaved) {
      return;
    }
    saveResult(
      aiCnvrsRoomSn,
      item,
      ACTION_STATUS.CANCELED,
      jsonInput(item.card, item.input),
    );
  };

  /** 카드 안에서 고른 값(검사 수치의 검진기록): 그 칸의 서버 오류는 지운다 */
  const changeInput = (key, patch) =>
    patchCard(key, (item) => {
      const fieldErrors = { ...item.fieldErrors };
      Object.keys(patch).forEach((field) => delete fieldErrors[field]);
      return { input: { ...item.input, ...patch }, fieldErrors };
    });

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
      input: jsonInput(latest.card, latest.input),
    };
  };

  /** 사진을 기다리는 카드: 가장 최근 처리 전 카드에 빈 파일 칸이 있으면 그 번호 */
  const photoCardKey = (latestCardKey) => {
    const latest = actionCards.at(-1);
    if (
      !latest ||
      latest.key !== latestCardKey ||
      latest.status !== 'pending' ||
      latest.isBusy ||
      latest.unsaved
    ) {
      return null;
    }
    const missing = missingFields(latest.card, latest.input);
    return fileFields(latest.card).some((field) => missing.includes(field))
      ? latest.key
      : null;
  };

  /** 입력창으로 보낸 사진을 그 카드의 빈 파일 칸에 붙인다: 붙인 { 칸: File } */
  const attachPhoto = (key, file) => {
    const item = actionCards.find((target) => target.key === key);
    if (!item) return {};
    const missing = missingFields(item.card, item.input);
    const files = Object.fromEntries(
      fileFields(item.card)
        .filter((field) => missing.includes(field))
        .map((field) => [field, file]),
    );
    changeInput(key, files);
    return files;
  };

  /** 카드의 사진 줄 칸: 말로 고쳐 새로 받은 같은 도구 카드에 이어 준다 */
  const photoFieldsOf = (key) =>
    actionCards.find((target) => target.key === key)?.photoFields;

  /** 카드에 붙인 파일: 말로 확인해 서버가 새로 준 같은 도구 카드에 이어 붙인다 */
  const filesOf = (key) => {
    const item = actionCards.find((target) => target.key === key);
    if (!item) return {};
    return Object.fromEntries(
      fileFields(item.card)
        .filter((field) => item.input[field] instanceof Blob)
        .map((field) => [field, item.input[field]]),
    );
  };

  const reset = () => setActionCards([]);

  return {
    actionCards,
    add,
    execute,
    confirm,
    cancel,
    changeInput,
    drop,
    retrySave,
    pendingAction,
    filesOf,
    photoCardKey,
    attachPhoto,
    photoFieldsOf,
    reset,
  };
}
