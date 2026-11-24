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

/** 서버가 닫힌 방에 보낸 메시지를 거절할 때 주는 오류 코드(409) */
export const CHAT_ROOM_CLOSED = 'CHAT_ROOM_CLOSED';
/** 끝난 채팅방: 상대가 나가 읽기 전용이거나 무응답으로 종료된 방. 목록에서 흐리게 보인다 */
export const isEndedRoom = (room) =>
  room.chatRoomSttsCd !== ROOM_STTS.ACTIVE ||
  room.mtchDlngSttsCd === MTCH_STTS.EXPIRED;

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

/** 나갈 수 없음: 매칭 완료 뒤 거래 완료(비용 수령 확인) 전. 수락 전(수락 대기)은 나가면 요청만 취소돼 허용 */
export const isLeaveBlockedStage = (stage) =>
  [MTCH_STTS.MATCHED, MTCH_STTS.DONE_REQ, MTCH_STTS.PAYING].includes(stage);

/** 주소 공유는 매칭 완료 ~ 거래 중(매칭 완료·확인 대기·수령 대기)에만 (FN-CMU-005-05) */
export const canShareAddress = (stage) =>
  [MTCH_STTS.MATCHED, MTCH_STTS.DONE_REQ, MTCH_STTS.PAYING].includes(stage);

/** 거래 취소 요청 상태 PCAG06: 요청중·동의·거절·철회 (방 상세 cnclDmnd.dmndSttsCd) */
export const CNCL_DMND_STTS = {
  REQUESTING: 'PCAC0021',
  APPROVED: 'PCAC0022',
  REJECTED: 'PCAC0023',
  WITHDRAWN: 'PCAC0024',
};

/**
 * 이 방의 거래 취소 요청 상태 (cnclDmnd는 이 매칭의 가장 최근 요청 하나, 없으면 null)
 * - requesting-mine 내가 요청해 응답 대기, requesting-theirs 상대가 요청해 내 응답 대기
 * - rejected-mine 내 요청이 거절됨(이 거래에서 다시 요청 불가), approved 동의돼 거래 취소됨
 */
export const getDealCancelState = (room) => {
  const demand = room.cnclDmnd;
  if (!demand) return 'none';
  switch (demand.dmndSttsCd) {
    case CNCL_DMND_STTS.REQUESTING:
      return demand.mineYn ? 'requesting-mine' : 'requesting-theirs';
    case CNCL_DMND_STTS.REJECTED:
      return demand.mineYn ? 'rejected-mine' : 'none';
    case CNCL_DMND_STTS.APPROVED:
      return 'approved';
    default:
      return 'none';
  }
};

/** 거래 취소 요청이 걸려 있는 동안은 완료 요청·확인·수령 확인을 서버가 409로 막는다 */
export const isDealCancelRequesting = (room) =>
  getDealCancelState(room).startsWith('requesting');

/** 거래 취소 요청 메뉴를 보일 단계: 나가기가 막히는 단계와 같다 */
export const canRequestDealCancel = (room) =>
  isLeaveBlockedStage(room.mtchDlngSttsCd);

/** 펫돌봄 모집 상태 PCAG01: 모집중일 때만 매칭을 요청할 수 있다(서버도 아니면 409 CARE_RECRUITMENT_CLOSED) */
export const RCRT_STTS_RECRUITING = 'PCAC0001';
