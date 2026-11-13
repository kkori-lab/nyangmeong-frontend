const BASE =
  'inline-flex h-10 items-center justify-center gap-1.5 rounded-md border px-4 font-semibold disabled:cursor-not-allowed';

export const BTN_PRIMARY = `${BASE} border-transparent bg-brand-500 text-white hover:enabled:bg-brand-600 disabled:bg-surface-3 disabled:text-line-strong`;
export const BTN_SECONDARY = `${BASE} border-line bg-white hover:enabled:border-line-strong hover:enabled:bg-surface-2 disabled:border-transparent disabled:bg-surface-3 disabled:text-line-strong`;
/** 상세 화면 작성자 [수정] · [삭제]: 글자 버튼. 글자는 작아도 누르는 영역은 높이 32px. 삭제는 빨강 */
const TEXT_ACTION_SM =
  'inline-flex h-8 items-center px-1 text-sm font-medium transition-colors';
export const TEXT_ACTION = `${TEXT_ACTION_SM} text-muted hover:text-ink`;
export const TEXT_ACTION_DANGER = `${TEXT_ACTION_SM} text-danger hover:text-[#983a2f]`;
export const BTN_DANGER = `${BASE} border-transparent bg-danger text-white hover:enabled:bg-[#983a2f] disabled:bg-surface-3 disabled:text-line-strong`;
