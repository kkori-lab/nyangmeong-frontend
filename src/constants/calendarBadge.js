/**
 * [캘린더 뱃지 색상]
 * - 케어 캘린더 일정 모달과 AI 확인 카드가 같이 쓰는 색 칩
 * - 코드값은 백엔드 공통코드 HLTG21, 칩 순서는 시안(html/hlt-calendar.html) 순서에서 주황만 뺌
 */

/** 뱃지 색상 칩 */
export const BADGE_COLORS = [
  { cd: 'HLTC0082', nm: '파랑', tone: 'blue' },
  { cd: 'HLTC0080', nm: '초록', tone: 'green' },
  { cd: 'HLTC0081', nm: '빨강', tone: 'rose' },
  { cd: 'HLTC0079', nm: '보라', tone: 'violet' },
  { cd: 'HLTC0083', nm: '회색', tone: 'gray' },
];

/** 톤별 칩(연한 바탕 + 진한 글자)·막대·점(진한 색) 클래스: index.css의 --color-tone-* 토큰 */
export const TONE_CLASSES = {
  blue: { chip: 'bg-tone-blue-bg text-tone-blue-fg', bar: 'bg-tone-blue-fg' },
  green: {
    chip: 'bg-tone-green-bg text-tone-green-fg',
    bar: 'bg-tone-green-fg',
  },
  rose: { chip: 'bg-tone-rose-bg text-tone-rose-fg', bar: 'bg-tone-rose-fg' },
  violet: {
    chip: 'bg-tone-violet-bg text-tone-violet-fg',
    bar: 'bg-tone-violet-fg',
  },
  gray: { chip: 'bg-tone-gray-bg text-tone-gray-fg', bar: 'bg-tone-gray-fg' },
};
