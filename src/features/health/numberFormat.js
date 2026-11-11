/**
 * [건강기록 수치 자릿수] (※신규 정책, 2026-11-11 회의: 수치는 소수 둘째 자리까지 입력·표시)
 * - 표시: 최대 소수 둘째 자리, 끝의 0은 붙이지 않음 (1.4673 → 1.47, 15.5 → 15.5, 12 → 12)
 * - 입력: 소수 셋째 자리부터는 저장하지 않고 안내
 */

/** 소수 둘째 자리 반올림. 지수 표기로 계산해 1.005 같은 값의 부동소수 오차를 피함. 빈 값·숫자가 아니면 그대로 */
export const round2 = (value) => {
  if (value == null || value === '') return value;
  const number = Number(value);
  if (!Number.isFinite(number)) return value;
  const sign = number < 0 ? -1 : 1;
  const rounded = Number(`${Math.round(Number(`${Math.abs(number)}e2`))}e-2`);
  return Number.isFinite(rounded) ? sign * rounded : number;
};

/** 입력칸에 채울 글자. 서버 값을 반올림해 문자열로, 없으면 빈 칸 */
export const toInputText = (value) =>
  value == null ? '' : String(round2(value));

export const DECIMAL_MESSAGE = '소수 둘째 자리까지 입력해 주세요';

/** 입력 글자가 소수 셋째 자리 이상인지 */
export const hasOverTwoDecimals = (text) =>
  /\.\d{3,}$/.test(String(text ?? '').trim());
