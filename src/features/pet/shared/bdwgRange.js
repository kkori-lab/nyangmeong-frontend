/** 체중 입력 상한(kg). 서버 `PetBdwgRange.MAX_BDWG_LIMIT`와 같다 */
export const MAX_BDWG = 200;

/** 입력 형식: 정수 3자리, 소수 2자리까지 */
export const BDWG_INPUT = /^\d{0,3}(\.\d{0,2})?$/;

/** "4.2" → 420 (0.01kg 단위 정수). 형식이 틀리면 null */
const toHundredths = (text) => {
  const value = String(text ?? '').trim();
  if (!/^\d+(\.\d{0,2})?$/.test(value)) return null;
  const [int, frac = ''] = value.split('.');
  return Number(int) * 100 + Number(frac.padEnd(2, '0'));
};

/**
 * 서버(`PetBdwgRange.of`)와 같은 정상 체중 범위 미리보기
 * - 기준 체중 ×0.9 ~ ×1.1, 소수 둘째 자리 반올림
 * - 최소 0.01 이상, 최대는 최소 + 0.01 이상, 최대 200에서 자름, 최소는 199.99에서 자름
 * - 체중이 비었거나 0 이하·200 초과·형식 오류면 null
 * 부동소수 오차를 피하려고 0.01kg 단위 정수로 계산한다
 */
export const calcBdwgRange = (weight) => {
  const base = toHundredths(weight);
  if (base == null || base <= 0 || base > MAX_BDWG * 100) return null;
  const limit = MAX_BDWG * 100;
  /** base × 9/10, base × 11/10 을 정수 반올림(HALF_UP) */
  let min = Math.floor((base * 9 + 5) / 10);
  let max = Math.floor((base * 11 + 5) / 10);
  if (min < 1) min = 1;
  if (min > limit - 1) min = limit - 1;
  if (max < min + 1) max = min + 1;
  if (max > limit) max = limit;
  return { minBdwg: min / 100, maxBdwg: max / 100 };
};
