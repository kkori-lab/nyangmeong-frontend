/** 신고 처리 상태(dclrPrcsSttsCd) */
export const REPORT_STATUS_OPTIONS = [
  { value: 'CMUC0015', label: '접수' },
  { value: 'CMUC0016', label: '처리완료' },
  { value: 'CMUC0017', label: '반려' },
];

export const REPORT_STATUS_RECEIVED = REPORT_STATUS_OPTIONS[0].value;

/** 신고 사유(dclrRsnCd) */
export const REPORT_REASON_OPTIONS = [
  { value: 'CMUC0009', label: '스팸·광고성' },
  { value: 'CMUC0010', label: '욕설·비방' },
  { value: 'CMUC0011', label: '음란물·유해 콘텐츠' },
  { value: 'CMUC0012', label: '개인정보 노출' },
  { value: 'CMUC0013', label: '사기·허위 정보' },
  { value: 'CMUC0014', label: '기타' },
];

/** 신고 조치(dclrActnCd) */
export const REPORT_ACTION_OPTIONS = [
  { value: 'CMUC0025', label: '유지' },
  { value: 'CMUC0026', label: '게시물 블라인드' },
  { value: 'CMUC0027', label: '작성자 정지' },
];

export const REPORT_ACTION_BLIND = REPORT_ACTION_OPTIONS[1].value;
export const REPORT_ACTION_SUSPEND = REPORT_ACTION_OPTIONS[2].value;

/** 대상 종류(targetType) */
export const TARGET_TYPE_OPTIONS = [
  { value: 'POST', label: '게시글' },
  { value: 'COMMENT', label: '댓글' },
  { value: 'MEMBER', label: '회원' },
];

/** 자동 블라인드 여부(autoBlindYn) */
export const AUTO_BLIND_OPTIONS = [
  { value: 'true', label: '자동 블라인드' },
  { value: 'false', label: '일반 신고' },
];

/** 대상 게시글 상태(pstSttsCd) */
export const TARGET_POST_STATUS_OPTIONS = [
  { value: 'CMUC0003', label: '정상' },
  { value: 'CMUC0004', label: '블라인드' },
  { value: 'CMUC0005', label: '삭제' },
];

/** 작성자 정지 기간(일) */
export const SUSPENSION_DAY_OPTIONS = [7, 30];

/** 코드의 표시 이름: 모르는 코드는 그대로 */
export const getOptionLabel = (options, code) =>
  options.find(({ value }) => value === code)?.label ?? code;

/** 채팅 상대 회원 신고: 채팅방이 있으면 회원 신고 */
export const isMemberReport = ({ otoChatRoomSn }) => otoChatRoomSn != null;

/** 대상 종류 이름 */
export const getTargetLabel = (report) => {
  if (isMemberReport(report)) return '회원';
  return report.cmntSn == null ? '게시글' : '댓글';
};

/** 처리할 수 있는 조치: 회원 신고는 블라인드 없음 */
export const getActionOptions = (report) =>
  isMemberReport(report)
    ? REPORT_ACTION_OPTIONS.filter(({ value }) => value !== REPORT_ACTION_BLIND)
    : REPORT_ACTION_OPTIONS;

/** 조치 표시 이름: 댓글은 블라인드 대신 삭제, 회원 신고는 회원 정지 */
export const getActionLabel = (code, report) => {
  if (code === REPORT_ACTION_BLIND && report.cmntSn != null) return '댓글 삭제';
  if (code === REPORT_ACTION_SUSPEND && isMemberReport(report)) {
    return '회원 정지';
  }
  return getOptionLabel(REPORT_ACTION_OPTIONS, code);
};
