import { useEffect, useRef, useState } from 'react';
import { useAnalyzeEye, useAnalyzeSkin, useSaveLesionCard } from '../queries';

/** 화면 안전망: 서버가 20초에 *_ANALYZE_TIMEOUT으로 끝내므로 그보다 늦게 끊기 */
const LESION_ANALYZE_GUARD_MS = 25000;

/** 분석 종류(lesion-card kind) */
export const LESION_KIND = { SKIN: 'SKIN', EYE: 'EYE' };

/** 종류별 이름: 말풍선 문구 */
export const LESION_TITLES = {
  [LESION_KIND.SKIN]: '피부',
  [LESION_KIND.EYE]: '눈',
};

/** 같은 사진으로 다시 해도 안 되는 오류: 저장하지 않고 안내만 */
const FILE_ERRORS = {
  FILE_TYPE_NOT_ALLOWED: 'jpg·png·webp 사진만 분석할 수 있어요.',
  FILE_SIZE_EXCEEDED: '10MB 이하 사진만 분석할 수 있어요.',
  INVALID_REQUEST: '사진을 읽지 못했어요. 다른 사진을 올려 주세요.',
};

/**
 * [대화창 피부·눈 사진 분석 흐름] (SCR-AIM-013, 계약 ai 저장소 docs/api/skinlesion.md·eyelesion.md·chat.md lesion-card)
 * - image-intent SKIN·EYE 또는 ASK 칩 → 반려동물 되묻기 → 분석(/ai/skin-analyses·/ai/eye-analyses) → lesion-card로 결과 저장
 * - 사진 턴은 image-intent가 그 방(aiCnvrsRoomSn)에 이미 저장
 * - 저장이 끝나면 말풍선을 걷고 저장 요약 메시지·지속 관찰 확인 카드(onSaved, 카드에 분석한 사진을 붙임)로 이어 감
 * - 시간 초과·외부 오류는 ERROR, [취소]는 CANCELED로 저장. 형식·크기 오류는 저장 없이 안내
 * - status: 'choosing' | 'analyzing' | 'saving' | 'saveFailed' | 'failed'
 */
export default function useChatLesion({ onSaved }) {
  const analyzeSkin = useAnalyzeSkin();
  const analyzeEye = useAnalyzeEye();
  const saveCard = useSaveLesionCard();
  const abortRef = useRef(null);
  const timerRef = useRef(null);
  const isTimedOutRef = useRef(false);
  /** 지금 말풍선의 번호: 지난 분석의 응답이 새 말풍선을 고치지 않게 */
  const idRef = useRef(0);
  /** { id, kind, file, aiCnvrsRoomSn, afterMsgSn, pet, status, request, errorMessage } */
  const [lesion, setLesion] = useState(null);
  const status = lesion?.status ?? null;

  /** 화면을 떠날 때 진행 중인 분석 중단 */
  useEffect(
    () => () => {
      clearTimeout(timerRef.current);
      abortRef.current?.abort();
    },
    [],
  );

  const update = (id, patch) =>
    setLesion((prev) => (prev?.id === id ? { ...prev, ...patch } : prev));

  /** 결과 저장: 성공하면 말풍선을 걷고 저장 메시지·카드로 */
  const save = async (target, request) => {
    update(target.id, { status: 'saving', request });
    try {
      const saved = await saveCard.mutateAsync({
        aiCnvrsRoomSn: target.aiCnvrsRoomSn,
        kind: target.kind,
        petSn: target.pet.petSn,
        ...request,
      });
      if (target.id !== idRef.current) return;
      onSaved({ ...saved, afterMsgSn: target.afterMsgSn, file: target.file });
      setLesion(null);
    } catch {
      update(target.id, { status: 'saveFailed' });
    }
  };

  const run = (target) => {
    const analyze = target.kind === LESION_KIND.EYE ? analyzeEye : analyzeSkin;
    const controller = new AbortController();
    abortRef.current = controller;
    isTimedOutRef.current = false;
    timerRef.current = setTimeout(() => {
      isTimedOutRef.current = true;
      controller.abort();
    }, LESION_ANALYZE_GUARD_MS);
    analyze.mutate(
      { file: target.file, signal: controller.signal },
      {
        onSuccess: (analysis) => {
          clearTimeout(timerRef.current);
          save(target, { rslt: analysis.rslt, analysis });
        },
        onError: (error) => {
          clearTimeout(timerRef.current);
          if (isTimedOutRef.current) return save(target, { rslt: 'ERROR' });
          if (controller.signal.aborted) {
            /** 새 전송·방 바꿈으로 끊은 것은 저장 없음 */
            if (target.id !== idRef.current) return;
            return save(target, { rslt: 'CANCELED' });
          }
          const fileMessage = FILE_ERRORS[error?.code];
          if (fileMessage) {
            update(target.id, { status: 'failed', errorMessage: fileMessage });
            return;
          }
          save(target, { rslt: 'ERROR' });
        },
      },
    );
  };

  /**
   * 분석 시작: 반려동물이 정해지면 바로, 아니면 되묻기
   * afterMsgSn: 보내기 전 대화의 마지막 메시지 번호(없으면 0)
   */
  const start = ({ kind, file, aiCnvrsRoomSn, afterMsgSn, pet }) => {
    clearTimeout(timerRef.current);
    abortRef.current?.abort();
    idRef.current += 1;
    const next = {
      id: idRef.current,
      kind,
      file,
      aiCnvrsRoomSn,
      afterMsgSn,
      pet,
      status: pet ? 'analyzing' : 'choosing',
      request: null,
      errorMessage: null,
    };
    setLesion(next);
    if (pet) run(next);
  };

  /** 되묻기 칩 선택 */
  const choosePet = (pet) => {
    if (status !== 'choosing') return;
    update(lesion.id, { pet, status: 'analyzing' });
    run({ ...lesion, pet });
  };

  /** 분석 중 [취소]: 요청을 끊고 '취소했어요'를 저장 */
  const cancel = () => abortRef.current?.abort();

  /** 저장 실패 [다시 시도]: 같은 결과를 다시 저장 */
  const retrySave = () => {
    if (status !== 'saveFailed') return;
    save(lesion, lesion.request);
  };

  const reset = () => {
    clearTimeout(timerRef.current);
    idRef.current += 1;
    abortRef.current?.abort();
    setLesion(null);
  };

  return {
    lesion,
    status,
    isBusy:
      status === 'choosing' || status === 'analyzing' || status === 'saving',
    start,
    choosePet,
    cancel,
    retrySave,
    reset,
  };
}
