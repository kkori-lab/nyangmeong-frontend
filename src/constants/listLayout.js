/**
 * [커뮤니티·뉴스 목록 배치] 좁은 화면에서 목록 칸이 눌리지 않게 하는 클래스 묶음
 * - 레일 열: 1100px에서 200px, 1300px 이상 280px(그 사이는 화면 폭에 따라 늘어난다)
 * - 썸네일 칸: 카드(목록 항목 `li.@container`)의 실제 폭이 700px 미만이면 160px, 520px 미만이면 120px
 *   화면 폭이 아니라 카드 폭 기준이라 레일이 있든 없든 같은 규칙이다. 760px 미만(1열)은 건드리지 않는다
 */
export const LIST_RAIL_COLS =
  'grid-cols-[minmax(0,1fr)_clamp(200px,calc(200px_+_(100vw_-_1100px)_*_0.4),280px)]';

export const THUMB_COLS =
  'grid-cols-[minmax(0,1fr)_240px] min-[760px]:@max-[700px]:grid-cols-[minmax(0,1fr)_160px] min-[760px]:@max-[520px]:grid-cols-[minmax(0,1fr)_120px]';

/** 카드가 520px 미만으로 좁을 때 푸터(작성자·시간·숫자)가 겹치지 않고 줄을 바꾼다 */
export const FOOTER_WRAP_NARROW = 'min-[760px]:@max-[520px]:flex-wrap';
