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

/** 소수점 표기 숫자만 (1e3·0x10 같은 표기는 숫자로 보지 않음) */
const PLAIN_NUMBER = /^[+-]?(\d+\.?\d*|\.\d+)$/;
const MAX_INTEGER = 1e7;
const INTEGER_MESSAGE = '정수는 7자리까지 입력할 수 있어요';

/**
 * [검사 수치 숫자 검사] (※신규 정책: 0 이상 · 정수 7자리 · 소수 둘째 자리, 백엔드 @Digits(7, 2)·@DecimalMin("0"))
 * - 결과값·참고범위 최소·최대에 쓴다. 첫 오류 문구를 돌려주고, 맞으면 null
 * - 빈 칸은 null (필수 검사는 각 화면이 한다)
 */
export const getLabNumberError = (text) => {
  const trimmed = String(text ?? '').trim();
  if (trimmed === '') return null;
  if (!PLAIN_NUMBER.test(trimmed)) return '숫자로 입력해 주세요';
  const number = Number(trimmed);
  if (number < 0) return '0 이상으로 입력해 주세요';
  if (hasOverTwoDecimals(trimmed)) return DECIMAL_MESSAGE;
  if (Math.trunc(number) >= MAX_INTEGER) return INTEGER_MESSAGE;
  return null;
};

/** 9999999.99 = 10글자 */
export const LAB_NUMBER_MAX_LENGTH = 10;

/** 참고범위 최소·최대 검사. 둘 다 비면 null */
export const getLabRangeError = (rangeMin, rangeMax) => {
  const isMinEmpty = rangeMin.trim() === '';
  const isMaxEmpty = rangeMax.trim() === '';
  if (isMinEmpty && isMaxEmpty) return null;
  if (isMinEmpty || isMaxEmpty) {
    return '참고범위는 최소·최대를 함께 입력하거나 둘 다 비워 주세요';
  }
  const numberError =
    getLabNumberError(rangeMin) || getLabNumberError(rangeMax);
  if (numberError === INTEGER_MESSAGE) {
    return '참고범위는 정수 7자리까지 입력할 수 있어요';
  }
  if (numberError) return `참고범위는 ${numberError}`;
  if (Number(rangeMin) > Number(rangeMax)) {
    return '참고범위 최소는 최대보다 클 수 없어요';
  }
  return null;
};
