/**
 * [채팅 코드값] (백엔드 ChatMessageType·ChatRoomStatus·CareMatchStatus)
 * - 매칭 전은 서버 값이 null: MTCH_STTS.PRE = null, 객체 키로 쓰면 'null'
 */

/** 메시지 유형 CHTG03 */
export const MSG_TYPE = {
  TEXT: 'CHTC0005',
  IMAGE: 'CHTC0006',
  ADDRESS: 'CHTC0007',
  DEAL_CARD: 'CHTC0008',
  SYSTEM: 'CHTC0009',
};

/** 채팅방 상태 CHTG01: 상대가 나가면 읽기 전용 */
export const ROOM_STTS = { ACTIVE: 'CHTC0001', READ_ONLY: 'CHTC0002' };

/** 이 방에서 내 역할: GUARDIAN 보호자(돌봄 글 작성자), SITTER 돌보미(채팅으로 지원한 사람) */
export const ROLE = { GUARDIAN: 'GUARDIAN', SITTER: 'SITTER' };

/** 매칭 거래 상태 PCAG05 */
export const MTCH_STTS = {
  PRE: null,
  REQUESTED: 'PCAC0012',
  MATCHED: 'PCAC0013',
  DONE_REQ: 'PCAC0014',
  PAYING: 'PCAC0015',
  COMPLETE: 'PCAC0016',
  CANCELED: 'PCAC0017',
  EXPIRED: 'PCAC0018',
};

/** 거래 상태 배지: 글자와 색 */
export const MTCH_STTS_BADGE = {
  [MTCH_STTS.PRE]: { label: '매칭 전', tone: 'gray' },
  [MTCH_STTS.REQUESTED]: { label: '수락 대기', tone: 'amber' },
  [MTCH_STTS.MATCHED]: { label: '매칭 완료', tone: 'blue' },
  [MTCH_STTS.DONE_REQ]: { label: '확인 대기', tone: 'amber' },
  [MTCH_STTS.PAYING]: { label: '수령 대기', tone: 'amber' },
  [MTCH_STTS.COMPLETE]: { label: '거래 완료', tone: 'green' },
  [MTCH_STTS.CANCELED]: { label: '요청 취소', tone: 'gray' },
  [MTCH_STTS.EXPIRED]: { label: '무응답 종료', tone: 'gray' },
};

/** 배지: 모르는 값이면 매칭 전으로 */
export const getDealBadge = (stage) =>
  MTCH_STTS_BADGE[stage] ?? MTCH_STTS_BADGE[MTCH_STTS.PRE];

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
