import { useEffect, useRef, useState } from 'react';
import { notifyAiWrite } from '@/utils/aiWriteChannel';
import { toFieldErrors, toFormError } from '@/utils/fieldErrors';
import {
  useExecuteAction,
  useSaveActionResult,
  useSaveChatEquippedImage,
} from '../queries';
import {
  EQUIP_TOOL,
  buildActionRequest,
  errorFieldsShown,
  fileFields,
  generatedInput,
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

/** Java 입력 검증 오류: 칸 오류(data)·빈 data 모두 카드를 살려 두고 고치게 한다(FN-AIM-012-12) */
const INPUT_ERROR_CODE = 'INVALID_INPUT_VALUE';

/**
 * 카드를 고쳐도 풀리지 않는 오류: 입력 검증 오류가 아닌 업무 오류(추가-1, 사람 요청 2026-11-27)
 * - 예: 반려동물 한도 409·이미 보유한 아이템·이미 처리된 초대. 카드에 [확인]만 켜진 채 남지 않게 실패로 저장한다
 */
const isNonFieldError = (error) =>
  Boolean(error?.code) && error.code !== INPUT_ERROR_CODE;

/**
 * 닉네임만 바꾸면 풀리는 409: 카드를 닫지 않고 닉네임 줄 아래 서버 문구를 보인다(사람 결정 2026-11-27)
 * - 닉네임은 말로 고쳐 새 카드를 받는다(이미 값이 있는 칸은 카드에서 고치지 않음)
 */
const FIELD_CONFLICTS = { NICKNAME_ALREADY_USED: 'mbrNcnm' };

/** 결과 저장에 싣는 Java 400 칸 오류 최대 수(ActionResultRequest errors) */
const MAX_RESULT_ERRORS = 50;

/**
 * 카드에서 고칠 수 없는 400인지: 칸 오류가 있고 모두 카드에 보이지 않는 칸(경로 번호 칸·숨긴 칸)
 * - 보이는 칸(사진 줄 포함)이 하나라도 있으면 카드를 살려 두고 고치게 한다(FN-AIM-012-12)
 */
const isUnfixableError = (item, input, error) => {
  const fields = error?.fields ?? [];
  if (fields.length === 0) return false;
  const shown = [...errorFieldsShown(item.card, input), ...item.photoFields];
  return fields.every(({ field }) => !shown.includes(field));
};

/** Java 성공 응답 data 중 이어 가기에 싣는 모양(객체) */
const isPlainObject = (value) =>
  value != null && typeof value === 'object' && !Array.isArray(value);

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
 * - unsaved: 결과 저장에 실패한 { status, input, errors }, [다시 시도]로 저장만 다시
 * - files: 파일 칸에 붙일 { 칸: File }(분석한 사진). input에 넣어 Java 실행에만 쓰고 결과 저장·다음 메시지에는 싣지 않는다
 * - group: 한 응답(done.actions)으로 함께 받은 카드 묶음 번호(첫 카드 key). 묶음은 함께 보이고 함께 다음 메시지에 실린다
 * - agentToken: 그 응답의 done.pending.agentToken. 묶음 카드가 모두 끝나면 onAgentReady로 이어 가기를 넘긴다
 *
 * onAgentReady({ aiCnvrsRoomSn, agentToken, results, afterSn }): results는 카드 순서 [{ tool, status, errors?, data? }]
 * - 모두 취소면 부르지 않는다. 카드를 버리거나(drop) 새 메시지를 보내면(discardAgents) 그 토큰은 버린다
 */
export function useActionCards({ onAgentReady } = {}) {
  const [actionCards, setActionCards] = useState([]);
  const executeAction = useExecuteAction();
  const saveActionResult = useSaveActionResult();
  const saveEquippedImage = useSaveChatEquippedImage();
  /** 이어 가기 대기: agentToken → { keys, results: Map(key → 결과), closed } */
  const agentsRef = useRef(new Map());
  const onAgentReadyRef = useRef(onAgentReady);
  useEffect(() => {
    onAgentReadyRef.current = onAgentReady;
  });

  /** 이어 갈 토큰 등록: 같은 응답의 카드 번호 순서 */
  const registerAgent = (items) => {
    const token = items[0]?.agentToken;
    if (!token) return;
    agentsRef.current.set(token, {
      keys: items.map((item) => item.key),
      results: new Map(),
      closed: false,
    });
  };

  /** 이어 가기 버림: 토큰을 다시 쓰지 않는다 */
  const closeAgent = (token) => {
    const agent = token && agentsRef.current.get(token);
    if (agent) agent.closed = true;
  };

  /** 결과 저장이 끝난 카드를 기록하고, 묶음이 다 끝났으면 이어 가기를 넘긴다 */
  const recordAgent = (aiCnvrsRoomSn, item, result, resultMsgSn) => {
    const agent = item.agentToken && agentsRef.current.get(item.agentToken);
    if (!agent || agent.closed) return;
    agent.results.set(item.key, { ...result, resultMsgSn });
    if (agent.results.size < agent.keys.length) return;
    agent.closed = true;
    const ordered = agent.keys.map((key) => agent.results.get(key));
    if (ordered.every(({ status }) => status === ACTION_STATUS.CANCELED)) {
      return;
    }
    onAgentReadyRef.current?.({
      aiCnvrsRoomSn,
      agentToken: item.agentToken,
      results: ordered.map(({ tool, status, errors, data }) => ({
        tool,
        status,
        ...(errors?.length > 0 && { errors }),
        ...(data && { data }),
      })),
      afterSn: Math.max(...ordered.map(({ resultMsgSn: sn }) => sn ?? 0)),
    });
  };

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
    group = key,
    agentToken = null,
    card,
    afterSn,
    anchorSn = null,
    files = {},
    photoFields,
  }) => ({
    key,
    group,
    agentToken,
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
    /** 받자마자 실행(done.execute)하는 카드: 실행·결과 저장 중에는 카드를 숨기고 결과 줄만, 고칠 일이 생기면 false로 카드를 보인다 */
    isAuto: false,
    /** 서버가 만드는 칸 값(generated: uuid): 처음 실행할 때 만들고, 고쳐서 다시 실행해도 같은 값 */
    generated: null,
  });

  /** 새 카드(한 응답의 묶음): params 목록 */
  const add = (paramsList) => {
    const items = paramsList.map(toItem);
    registerAgent(items);
    setActionCards((prev) => [...prev, ...items]);
  };

  /** 카드 버림: 보낸 카드에 대해 서버가 카드 없이 답함(취소 말 등), 다음 메시지에 싣지 않는다 */
  const drop = (keys) => {
    actionCards
      .filter((item) => keys.includes(item.key))
      .forEach((item) => closeAgent(item.agentToken));
    setActionCards((prev) =>
      prev.map((item) =>
        keys.includes(item.key) ? { ...item, status: 'dropped' } : item,
      ),
    );
  };

  /** 새 메시지를 보냄: 기다리던 이어 가기는 모두 버린다(다음 메시지는 새 턴) */
  const discardAgents = () => {
    agentsRef.current.forEach((agent) => {
      agent.closed = true;
    });
  };

  /**
   * 결과 저장: 성공하면 요약 메시지 자리로, 실패하면 [다시 시도]
   * - data: DONE일 때 Java 성공 응답 data(이어 가기 결과에만 싣는다)
   */
  const saveResult = async (
    aiCnvrsRoomSn,
    item,
    status,
    input,
    errors,
    data,
  ) => {
    patchCard(item.key, { isBusy: true, unsaved: null });
    try {
      const message = await saveActionResult.mutateAsync({
        aiCnvrsRoomSn,
        tool: item.card.tool,
        status,
        input,
        targetText: item.card.targetText,
        errors,
      });
      patchCard(item.key, {
        isBusy: false,
        status: STATUS_BY_RESULT[status],
        resultText: message.cnvrsCn,
        resultMsgSn: message.aiCnvrsMsgSn,
      });
      recordAgent(
        aiCnvrsRoomSn,
        item,
        { tool: item.card.tool, status, errors, data },
        message.aiCnvrsMsgSn,
      );
    } catch {
      patchCard(item.key, {
        isBusy: false,
        isAuto: false,
        unsaved: { status, input, errors, data },
      });
    }
  };

  /**
   * 착용 저장 성공 뒤 대표 이미지 저장(반려동물 화면 [장착]과 같다, 사람 결정 2026-11-27)
   * - 착용 아이템이 없으면 서버가 대표 이미지를 지워 맨몸이라 부르지 않는다(캐릭터 그림은 실행 성공 때 다시 읽음)
   * - 기다리지 않고 결과 저장으로 넘어가며, 실패해도 알리지 않는다
   */
  const saveEquippedImageOf = (character, domain) => {
    if (!isPlainObject(character) || character.pixelCharSn == null) return;
    const itemSns = (character.heldItems ?? [])
      .filter((held) => held.equipYn)
      .map((held) => held.itemSn);
    if (itemSns.length === 0) return;
    saveEquippedImage.mutate(
      {
        pixelCharSn: character.pixelCharSn,
        petSn: character.petSn,
        itemSns,
      },
      /** 본창은 실행 성공 때 이미 다시 읽어 옛 그림이라, 대표 이미지 저장이 끝나면 한 번 더 알린다 */
      {
        onSettled: () =>
          notifyAiWrite({ domain, petSn: character.petSn ?? null }),
      },
    );
  };

  /**
   * 실행: Java 실행 → 결과 저장, 회원이 고칠 수 있는 오류면 카드를 살려 두고 말로 고치게 한다
   * - 카드에서 고칠 수 없는 칸의 400은 칸 오류를 errors로 실어 실패로 저장한다(서버가 칸 이름으로 실패 글을 만든다)
   */
  const run = async (aiCnvrsRoomSn, item) => {
    const key = item.key;
    if (missingFields(item.card, item.input).length > 0) return;
    const input = resultInput(item.card, item.input);
    const savedInput = jsonInput(item.card, item.input);
    const generated = item.generated ?? generatedInput(item.card);
    patchCard(key, {
      isBusy: true,
      fieldErrors: {},
      formError: null,
      generated,
    });
    let data;
    try {
      data = await executeAction.mutateAsync(
        buildActionRequest(item.card, { ...input, ...generated }),
      );
    } catch (error) {
      const conflictField = FIELD_CONFLICTS[error?.code];
      if (conflictField && conflictField in item.card.params) {
        patchCard(key, {
          isBusy: false,
          isAuto: false,
          fieldErrors: { [conflictField]: error.message },
          formError: null,
        });
        return;
      }
      if (
        SERVER_FAILURE_CODES.includes(error?.code) ||
        isNonFieldError(error)
      ) {
        await saveResult(aiCnvrsRoomSn, item, ACTION_STATUS.FAILED, savedInput);
        return;
      }
      if (isUnfixableError(item, item.input, error)) {
        const errors = error.fields
          .slice(0, MAX_RESULT_ERRORS)
          .map(({ field, message }) => ({ field, message }));
        await saveResult(
          aiCnvrsRoomSn,
          item,
          ACTION_STATUS.FAILED,
          savedInput,
          errors,
        );
        return;
      }
      const fieldErrors = toFieldErrors(error);
      patchCard(key, {
        isBusy: false,
        isAuto: false,
        fieldErrors,
        formError: toFormError(error, Object.keys(fieldErrors)),
      });
      return;
    }
    notifyAiWrite({ domain: item.card.domain, petSn: input.petSn ?? null });
    if (item.card.tool === EQUIP_TOOL) {
      saveEquippedImageOf(data, item.card.domain);
    }
    await saveResult(
      aiCnvrsRoomSn,
      item,
      ACTION_STATUS.DONE,
      savedInput,
      undefined,
      isPlainObject(data) ? data : undefined,
    );
  };

  /**
   * 새 카드 묶음을 받자마자 실행(done.execute): 확인 말·동사형 명령에 서버가 다시 검증한 카드
   * - 순서대로 실행하고, 하나가 실패해도 나머지를 이어 실행한다(카드마다 결과 저장, FN-AIM-012-25)
   * - 서버는 파일 칸을 세지 않아 사진 칸만 비어도 실행이 온다(ai PR #114). 그 카드는 실행하지 않고 카드에서 사진을 받는다
   */
  const execute = async (aiCnvrsRoomSn, paramsList) => {
    const items = paramsList.map((params) => {
      const item = toItem(params);
      const isPhotoAsked = fileFields(item.card).some((field) =>
        missingFields(item.card, item.input).includes(field),
      );
      return { ...item, isPhotoAsked, isAuto: !isPhotoAsked };
    });
    registerAgent(items);
    setActionCards((prev) => [...prev, ...items]);
    for (const item of items) {
      if (!item.isPhotoAsked) await run(aiCnvrsRoomSn, item);
    }
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
    saveResult(
      aiCnvrsRoomSn,
      item,
      item.unsaved.status,
      item.unsaved.input,
      item.unsaved.errors,
      item.unsaved.data,
    );
  };

  /** 가장 최근 묶음의 카드: 그 묶음의 마지막 카드가 전체에서 가장 최근일 때만 */
  const latestGroupItems = (latestCardKey) => {
    const latest = actionCards.at(-1);
    if (!latest || latest.key !== latestCardKey) return [];
    return actionCards.filter((item) => item.group === latest.group);
  };

  /**
   * 다음 메시지에 실을 가장 최근 확인 카드 묶음: 처리 전 카드만 { keys, actions }
   * - actions: [{ tool, input, targetText? }], 1장이면 action으로, 2장 이상이면 actions로 보낸다(api.sendMessage)
   */
  const pendingActions = (latestCardKey) => {
    const items = latestGroupItems(latestCardKey).filter(
      (item) => item.status === 'pending' && !item.unsaved,
    );
    return {
      keys: items.map((item) => item.key),
      actions: items.map((item) => ({
        tool: item.card.tool,
        input: jsonInput(item.card, item.input),
        /** 삭제 카드는 대상 글도 그대로 돌려보낸다(AI 계약 2026-11-25) */
        ...(item.card.targetText && { targetText: item.card.targetText }),
      })),
    };
  };

  /** 사진을 기다리는 카드: 가장 최근 묶음에서 빈 파일 칸이 있는 첫 처리 전 카드 번호 */
  const photoCardKey = (latestCardKey) => {
    const target = latestGroupItems(latestCardKey).find((item) => {
      if (item.status !== 'pending' || item.isBusy || item.unsaved) {
        return false;
      }
      const missing = missingFields(item.card, item.input);
      return fileFields(item.card).some((field) => missing.includes(field));
    });
    return target?.key ?? null;
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

  const reset = () => {
    agentsRef.current = new Map();
    setActionCards([]);
  };

  return {
    actionCards,
    add,
    execute,
    confirm,
    cancel,
    changeInput,
    drop,
    discardAgents,
    retrySave,
    pendingActions,
    filesOf,
    photoCardKey,
    attachPhoto,
    photoFieldsOf,
    reset,
  };
}
