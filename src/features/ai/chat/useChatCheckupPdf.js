import { useEffect, useRef, useState } from 'react';
import { useAnalyzeChatLabPdf, useSaveCheckupCard } from '../queries';

/** 화면 안전망: 서버가 30초에 PDF_ANALYZE_TIMEOUT으로 끝내므로 그보다 늦게 끊기 */
const PDF_ANALYZE_GUARD_MS = 35000;
/** checkup-card items 최대 개수 */
const MAX_ITEMS = 100;

/**
 * [대화창 검사결과지 PDF 분석 흐름] (SCR-AIM-013, 계약 ai 저장소 docs/api/chat.md checkup-card)
 * - 반려동물 되묻기 → 분석(/ai/checkups/lab-results) → checkup-card로 결과 저장(요약 AI 메시지 + 확인 카드)
 * - PDF 메시지는 image-intent가 그 방(aiCnvrsRoomSn)에 이미 저장, 이 말풍선이 떠 있는 동안 afterMsgSn 뒤 메시지는 화면에서 숨김
 * - 저장이 끝나면 말풍선을 걷고 저장 메시지·카드(onSaved)로 이어 감
 * - status: 'choosing' | 'analyzing' | 'saving' | 'saveFailed'
 */
export default function useChatCheckupPdf({ onSaved }) {
  const analyze = useAnalyzeChatLabPdf();
  const saveCard = useSaveCheckupCard();
  const abortRef = useRef(null);
  const timerRef = useRef(null);
  const isTimedOutRef = useRef(false);
  /** 지금 말풍선의 번호: 지난 분석의 응답이 새 말풍선을 고치지 않게 */
  const idRef = useRef(0);
  /** { id, file, text, aiCnvrsRoomSn, afterMsgSn, pet, status, request } */
  const [pdf, setPdf] = useState(null);
  const status = pdf?.status ?? null;

  /** 화면을 떠날 때 진행 중인 분석 중단 */
  useEffect(
    () => () => {
      clearTimeout(timerRef.current);
      abortRef.current?.abort();
    },
    [],
  );

  const update = (id, patch) =>
    setPdf((prev) => (prev?.id === id ? { ...prev, ...patch } : prev));

  /** 결과 저장: 성공하면 말풍선을 걷고 저장 메시지·카드로 */
  const save = async (target, request) => {
    update(target.id, { status: 'saving', request });
    try {
      const saved = await saveCard.mutateAsync({
        aiCnvrsRoomSn: target.aiCnvrsRoomSn,
        petSn: target.pet.petSn,
        ...request,
      });
      if (target.id !== idRef.current) return;
      onSaved({
        ...saved,
        afterMsgSn: target.afterMsgSn,
        pet: target.pet,
        request,
      });
      setPdf(null);
    } catch {
      update(target.id, { status: 'saveFailed' });
    }
  };

  const run = (target) => {
    const controller = new AbortController();
    abortRef.current = controller;
    isTimedOutRef.current = false;
    timerRef.current = setTimeout(() => {
      isTimedOutRef.current = true;
      controller.abort();
    }, PDF_ANALYZE_GUARD_MS);
    analyze.mutate(
      { file: target.file, signal: controller.signal },
      {
        onSuccess: ({ items, excludedArtclNms }) => {
          clearTimeout(timerRef.current);
          save(target, {
            result: 'RECOGNIZED',
            items: (items ?? []).slice(0, MAX_ITEMS),
            excludedArtclNms: excludedArtclNms ?? [],
          });
        },
        onError: (error) => {
          clearTimeout(timerRef.current);
          if (isTimedOutRef.current) return save(target, { result: 'ERROR' });
          if (controller.signal.aborted) {
            /** 화면을 떠나며 끊은 것은 저장 없음 */
            if (target.id !== idRef.current) return;
            return save(target, { result: 'CANCELED' });
          }
          save(target, {
            result:
              error?.code === 'NOT_LAB_RESULT' ? 'NOT_LAB_RESULT' : 'ERROR',
          });
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
      aiCnvrsRoomSn,
      afterMsgSn,
      pet,
      status: pet ? 'analyzing' : 'choosing',
      request: null,
    };
    setPdf(next);
    if (pet) run(next);
  };

  /** 되묻기 칩 선택 */
  const choosePet = (pet) => {
    if (status !== 'choosing') return;
    update(pdf.id, { pet, status: 'analyzing' });
    run({ ...pdf, pet });
  };

  /** 분석 중 [취소]: 요청을 끊고 '취소했어요'를 저장 */
  const cancel = () => abortRef.current?.abort();

  /** 저장 실패 [다시 시도]: 같은 결과를 다시 저장 */
  const retrySave = () => {
    if (status !== 'saveFailed') return;
    save(pdf, pdf.request);
  };

  const reset = () => {
    clearTimeout(timerRef.current);
    idRef.current += 1;
    abortRef.current?.abort();
    setPdf(null);
  };

  return {
    pdf,
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
