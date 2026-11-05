/**
 * 관리자 목록 표 상자
 * - 좁은 폭(md 미만): 높이 480px까지, 표 안에서 세로·가로 스크롤. 머리줄은 위에 붙는다
 * - md 이상: 높이 제한 없이 다 펼치고 가로 스크롤만 남는다
 */
export const ADMIN_TABLE_BOX =
  'max-h-[480px] overflow-auto rounded-[14px] border border-line bg-white md:max-h-none md:overflow-y-visible [&_thead_th]:sticky [&_thead_th]:top-0 [&_thead_th]:z-10 [&_thead_th]:bg-white [&_thead_th]:shadow-[inset_0_-1px_0_var(--color-line)]';
