/**
 * [채팅 코드값]
 * - CHTG03·PCAG05·myRole 값은 미정이라 가짜 값, 확정되면 이 파일만 수정
 */

export const MSG_TYPE = {
  TEXT: 'TEXT',
  IMAGE: 'IMAGE',
  ADDRESS: 'ADDRESS',
  SYSTEM: 'SYSTEM',
};

/** 이 방에서 내 역할: OWNER 보호자(돌봄 글 작성자), SITTER 돌보미(채팅으로 지원한 사람) */
export const ROLE = { OWNER: 'OWNER', SITTER: 'SITTER' };

export const ROLE_LABEL = { OWNER: '보호자', SITTER: '돌보미' };

/** 상대 역할 */
export const getOtherRole = (role) =>
  role === ROLE.OWNER ? ROLE.SITTER : ROLE.OWNER;

export const MTCH_STTS = {
  PRE: 'PRE',
  REQUESTED: 'REQUESTED',
  MATCHED: 'MATCHED',
  DONE_REQ: 'DONE_REQ',
  PAYING: 'PAYING',
  COMPLETE: 'COMPLETE',
  CANCELED: 'CANCELED',
  EXPIRED: 'EXPIRED',
  ABORTED: 'ABORTED',
};

/** 거래 상태 배지: 글자와 색 */
export const MTCH_STTS_BADGE = {
  PRE: { label: '매칭 전', tone: 'gray' },
  REQUESTED: { label: '수락 대기', tone: 'amber' },
  MATCHED: { label: '매칭 완료', tone: 'blue' },
  DONE_REQ: { label: '확인 대기', tone: 'amber' },
  PAYING: { label: '수령 대기', tone: 'amber' },
  COMPLETE: { label: '거래 완료', tone: 'green' },
  CANCELED: { label: '요청 취소', tone: 'gray' },
  EXPIRED: { label: '무응답 종료', tone: 'gray' },
  ABORTED: { label: '매칭 취소', tone: 'gray' },
};

/** 진행 중: 나가면 매칭 취소 */
export const isActiveStage = (stage) =>
  [
    MTCH_STTS.REQUESTED,
    MTCH_STTS.MATCHED,
    MTCH_STTS.DONE_REQ,
    MTCH_STTS.PAYING,
  ].includes(stage);

/** 주소 공유는 매칭 완료 ~ 거래 중(매칭 완료·확인 대기·수령 대기)에만 (FN-CMU-005-05) */
export const canShareAddress = (stage) =>
  [MTCH_STTS.MATCHED, MTCH_STTS.DONE_REQ, MTCH_STTS.PAYING].includes(stage);

/** 시스템 메시지 강조: 가짜 필드 sysToneCd */
export const SYS_TONE = { KEY: 'KEY', END: 'END' };
