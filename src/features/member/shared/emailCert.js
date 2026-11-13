/**
 * [이메일 인증번호 공통]
 * - 오답 판별, 재발송 가능 시각
 * - 재발송 간격 숫자는 두지 않음: 서버가 준 시각으로만 계산(기능명세서 공통 인증 설정)
 */

/** 서버 시각(LocalDateTime, 시간대 없음) -> ms */
export const toMs = (dateTime) => Date.parse(dateTime);

/** 그 번호로 더는 확인할 수 없는 오답 */
const WRONG_CODE_ERRORS = [
  'EMAIL_CERT_FAIL_LIMIT_EXCEEDED',
  'EMAIL_CERT_MISMATCH',
];

export const isWrongCodeError = (error) =>
  WRONG_CODE_ERRORS.includes(error?.code);

/** 응답·오류 data의 재발송 가능 시각(ms). 없으면 0 */
export const resendAtOf = (data) =>
  data?.resendAvailableDt ? toMs(data.resendAvailableDt) : 0;

/** [다시 보내기] 글자: 기다리는 동안 남은 초 */
export const resendLabel = (seconds, label = '다시 보내기') =>
  seconds > 0 ? `${label} (${seconds}초)` : label;
