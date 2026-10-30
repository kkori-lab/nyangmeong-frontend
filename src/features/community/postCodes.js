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

/** 신고 사유: ReportModal의 문구 → 신고 사유 공통코드(dclrRsnCd) */
export const REPORT_REASON_CODES = {
  '스팸 · 광고성': 'CMUC0009',
  '욕설 · 비방': 'CMUC0010',
  '음란물 · 유해 콘텐츠': 'CMUC0011',
  '개인정보 노출': 'CMUC0012',
  '사기 · 허위 정보': 'CMUC0013',
  기타: 'CMUC0014',
};
