import { addDays, diffDays, getTodayYmd } from '@/utils/formatDate';

/**
 * [대시보드 통계 기간]
 * - URL ?period=7|30|custom&fromYmd=&toYmd=, 없거나 잘못되면 최근 7일
 */

/** 직접 입력 최대 일수(사람 결정 2026-11-04) */
export const MAX_CUSTOM_DAYS = 90;

export const PERIOD_CUSTOM = 'custom';

/** 기간 선택지: days는 오늘 포함 일수 */
export const PERIOD_OPTIONS = [
  { key: '7', label: '최근 7일', days: 7 },
  { key: '30', label: '최근 30일', days: 30 },
  { key: PERIOD_CUSTOM, label: '직접 입력' },
];

export const DEFAULT_PERIOD_KEY = '7';

/** 직접 입력 기간 오류 문구, 맞으면 null */
export const getRangeError = (fromYmd, toYmd) => {
  if (!fromYmd || !toYmd) return '시작일과 종료일을 골라 주세요.';
  if (fromYmd > toYmd) return '시작일은 종료일보다 늦을 수 없어요.';
  if (toYmd > getTodayYmd()) return '종료일은 오늘보다 늦을 수 없어요.';
  if (diffDays(fromYmd, toYmd) + 1 > MAX_CUSTOM_DAYS) {
    return `기간은 최대 ${MAX_CUSTOM_DAYS}일까지 고를 수 있어요.`;
  }
  return null;
};

/** URL 쿼리 -> { periodKey, fromYmd, toYmd } */
export const resolvePeriod = (searchParams) => {
  const periodKey = searchParams.get('period');
  if (periodKey === PERIOD_CUSTOM) {
    const fromYmd = searchParams.get('fromYmd') ?? '';
    const toYmd = searchParams.get('toYmd') ?? '';
    const isYmd = (ymd) => /^\d{4}-\d{2}-\d{2}$/.test(ymd);
    if (isYmd(fromYmd) && isYmd(toYmd) && !getRangeError(fromYmd, toYmd)) {
      return { periodKey, fromYmd, toYmd };
    }
  }
  const option =
    PERIOD_OPTIONS.find(({ key, days }) => key === periodKey && days) ??
    PERIOD_OPTIONS.find(({ key }) => key === DEFAULT_PERIOD_KEY);
  const toYmd = getTodayYmd();
  return {
    periodKey: option.key,
    fromYmd: addDays(toYmd, -(option.days - 1)),
    toYmd,
  };
};
