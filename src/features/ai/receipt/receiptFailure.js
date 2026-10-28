/**
 * [영수증 분석 실패 안내]
 * - 업로드 모달(SCR-AIM-008)과 대화창 영수증 분석(SCR-AIM-013) 공용
 * - 문구는 SCR-AIM-010 기준
 */

/** 분석이 이 시간을 넘기면 일시 오류로 판정(FN-AIM-008-07) */
export const ANALYZE_TIMEOUT_MS = 15000;

export const FAILURE = {
  empty: {
    title: '영수증을 읽지 못했어요',
    message: '글씨가 흐리거나 접힌 부분이 있으면 인식이 어려울 수 있어요.',
    noteStyle: 'border-danger/30 bg-danger-soft text-danger',
  },
  timeout: {
    title: '분석을 끝내지 못했어요',
    message: '분석이 오래 걸려 멈췄어요. 다시 올리거나 직접 입력해 주세요.',
    noteStyle: 'border-warn-line bg-warn-soft text-warn',
  },
  error: {
    title: '분석을 끝내지 못했어요',
    message:
      '일시적인 오류가 생겼어요. 잠시 후 다시 올리거나 직접 입력해 주세요.',
    noteStyle: 'border-warn-line bg-warn-soft text-warn',
  },
};
