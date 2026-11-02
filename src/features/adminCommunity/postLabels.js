/** 게시판(bbsCd): 펫돌봄은 코드가 없어 제외 */
export const BBS_OPTIONS = [
  { value: 'CMUC0001', label: '펫정보' },
  { value: 'CMUC0002', label: '펫일상' },
  { value: 'CMUC0024', label: '실종센터' },
];

/** 게시글 상태(pstSttsCd) */
export const POST_STATUS_OPTIONS = [
  { value: 'CMUC0003', label: '정상' },
  { value: 'CMUC0004', label: '블라인드' },
  { value: 'CMUC0005', label: '삭제' },
];

export const POST_STATUS_NORMAL = POST_STATUS_OPTIONS[0].value;
export const POST_STATUS_BLIND = POST_STATUS_OPTIONS[1].value;

/** 코드의 표시 이름: 모르는 코드는 그대로 */
export const getOptionLabel = (options, code) =>
  options.find(({ value }) => value === code)?.label ?? code;
