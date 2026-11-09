import { formatMonthDayDot, getYmdOf } from '@/utils/formatDate';
import { OBSERVATION_ENDED } from '../diaryTypes';

/**
 * [지속 관찰 계산]
 * - 항목(item)은 서버 목록 응답, 회차(cycles)는 선택한 항목의 회차 응답(관찰일 오름차순)
 * - 항목 목록의 대표 값은 서버가 준 firstCycle·lastCycle·lastSzDiff를 쓴다
 */

/** 사진 줄·크기 변화 그래프에 그릴 최대 회차 수 (PC·모바일 같음, 추가 요청) */
export const CHART_COUNT = 5;

export const formatSize = (size) => `${Number(size).toFixed(1)}mm`;

/** 종료한 항목인지 */
export const isEndedItem = (item) => item.obsrvSttsCd === OBSERVATION_ENDED;

/** "등 · 오른쪽 어깨", 세부 위치가 없으면 대분류만 */
export const formatPart = (item) =>
  item.obsrvRegnDtlNm
    ? `${item.obsrvRegnCdNm} · ${item.obsrvRegnDtlNm}`
    : item.obsrvRegnCdNm;

/** 크기를 입력한 마지막 이전 회차. 없으면 null */
const findPrevSizedIndex = (cycles, index) => {
  for (let prev = index - 1; prev >= 0; prev -= 1) {
    if (cycles[prev].obsrvSz != null) return prev;
  }
  return null;
};

/** 직전 크기 대비 증감: { prevIndex, prevSize, diff }. 비교할 회차가 없으면 null */
export const getSizeDiff = (cycles, index) => {
  const cycle = cycles[index];
  if (cycle.obsrvSz == null) return null;
  const prevIndex = findPrevSizedIndex(cycles, index);
  if (prevIndex === null) return null;
  const prevSize = cycles[prevIndex].obsrvSz;
  return { prevIndex, prevSize, diff: cycle.obsrvSz - prevSize };
};

/** "▲0.3" / "▼0.2", 증감이 없으면 빈 문자열 */
export const formatDiff = (diff) => {
  const rounded = Math.round(Math.abs(diff) * 10) / 10;
  if (rounded === 0) return '';
  return `${diff > 0 ? '▲' : '▼'}${rounded.toFixed(1)}`;
};

/** 목록 값 줄: 마지막 회차의 크기(+증감), 크기가 없으면 변화, 둘 다 없으면 null. 종료 항목은 관찰 기간 */
export const getItemValueText = (item) => {
  const { firstCycle, lastCycle } = item;
  if (isEndedItem(item)) {
    return `${formatMonthDayDot(getYmdOf(firstCycle.obsrvDt))} ~ ${formatMonthDayDot(getYmdOf(lastCycle.obsrvDt))}`;
  }
  if (lastCycle.obsrvSz != null) {
    const diffText = item.lastSzDiff == null ? '' : formatDiff(item.lastSzDiff);
    return `${formatSize(lastCycle.obsrvSz)}${diffText ? ` ${diffText}` : ''}`;
  }
  return lastCycle.obsrvChgCdNm ?? null;
};

/**
 * PC 목록 크기 뒤 증감: "▼1.3", 0이면 "변화 없음" (추가 요청)
 * - 종료 항목·크기 없음·비교할 회차 없음(lastSzDiff 없음)이면 빈 문자열
 */
export const getItemDiffText = (item) => {
  if (isEndedItem(item) || item.lastCycle.obsrvSz == null) return '';
  if (item.lastSzDiff == null) return '';
  return formatDiff(item.lastSzDiff) || '변화 없음';
};
