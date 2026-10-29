/**
 * 펫이야기 게시판 공통코드: 화면 이름 ↔ bbsCd (공통코드 그룹 CMUG01)
 * - 코드 값은 가정. 연결 때 DB의 공통코드 값으로 교체
 */
export const POST_BOARDS = [
  { name: '펫정보', code: 'CMUC0001', tone: 'blue' },
  { name: '펫일상', code: 'CMUC0002', tone: 'amber' },
];

export const BBS_INFO = 'CMUC0001';
export const BBS_DAILY = 'CMUC0002';

/** 게시글 상태 공통코드(CMUG02): 공개 */
export const PST_STTS_OPEN = 'CMUC0003';

export const getBoardName = (code) =>
  POST_BOARDS.find((board) => board.code === code)?.name;

export const getBoardCode = (name) =>
  POST_BOARDS.find((board) => board.name === name)?.code;
