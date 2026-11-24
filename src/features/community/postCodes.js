/**
 * 펫이야기 게시판 공통코드: 화면 이름 ↔ bbsCd (공통코드 그룹 CMUG01)
 */
export const POST_BOARDS = [
  { name: '펫정보', code: 'CMUC0001', tone: 'blue' },
  { name: '펫일상', code: 'CMUC0002', tone: 'amber' },
];

export const BBS_INFO = 'CMUC0001';
export const BBS_DAILY = 'CMUC0002';

export const getBoardName = (code) =>
  POST_BOARDS.find((board) => board.code === code)?.name;

export const getBoardCode = (name) =>
  POST_BOARDS.find((board) => board.name === name)?.code;
