export const CARD =
  'min-w-0 rounded-card border border-line bg-white shadow-depth-sm';
export const CARD_HEAD =
  'flex items-center justify-between gap-3 border-b border-line-soft px-[22px] py-[18px]';
export const CARD_BODY = 'px-[22px] pt-5 pb-[22px]';
export const CARD_TITLE = 'text-lg font-bold tracking-[-0.01em]';

/** 날짜별 상세·내역 리스트 공통 줄·날짜 머리 */
export const DAY_HEAD =
  'flex items-center justify-between gap-2 bg-surface-2 px-4 py-2 text-sm font-semibold text-ink-2';
export const EXPENSE_ROW =
  'flex w-full items-center gap-3 border-t border-line-soft px-4 py-3 text-left first:border-t-0';

/**
 * 앱 날짜 상세 줄(isDay): 뱃지 대신 왼쪽 색 막대 + 카테고리 / 반려동물 + 금액
 * 색 막대는 줄에 넘긴 --cat 값(카테고리 색)으로 색칠
 */
export const DAY_ROW_APP =
  'relative max-[760px]:grid max-[760px]:grid-cols-[minmax(0,1fr)_auto] max-[760px]:gap-x-3 max-[760px]:gap-y-0.5 max-[760px]:py-3 max-[760px]:pr-4 max-[760px]:pl-[14px] max-[760px]:before:absolute max-[760px]:before:top-3 max-[760px]:before:bottom-3 max-[760px]:before:left-0 max-[760px]:before:w-1 max-[760px]:before:rounded-xs max-[760px]:before:bg-[var(--cat)] max-[760px]:before:content-[""]';

/** 앱에서 누르면 상세 시트가 열리는 날짜 상세 줄: 위 줄에 오른쪽 ›를 더한 3열 */
export const DAY_ROW_APP_TAP = DAY_ROW_APP.replace(
  'max-[760px]:grid-cols-[minmax(0,1fr)_auto]',
  'max-[760px]:grid-cols-[minmax(0,1fr)_auto_16px]',
);

/**
 * 편집 모드 줄의 본문(체크박스 오른쪽): 앱에서는 색 막대 + 카테고리 / 반려동물 · 내용 · 사용처 + 금액
 * 색 막대는 줄에 넘긴 --cat 값(카테고리 색)으로 색칠
 */
export const ROW_BODY_APP =
  'relative flex min-w-0 flex-1 items-center gap-3 max-[760px]:grid max-[760px]:grid-cols-[minmax(0,1fr)_auto] max-[760px]:gap-x-3 max-[760px]:gap-y-0.5 max-[760px]:pl-[14px] max-[760px]:before:absolute max-[760px]:before:inset-y-0 max-[760px]:before:left-0 max-[760px]:before:w-1 max-[760px]:before:rounded-xs max-[760px]:before:bg-[var(--cat)] max-[760px]:before:content-[""]';
