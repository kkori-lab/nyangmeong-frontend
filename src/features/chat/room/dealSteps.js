/**
 * [거래 카드의 단계별 안내]
 * - 상태 × 역할마다 지금 할 일과 버튼 하나 (FN-CMU-005-11), 문구는 디자인 시안(nyangmung-message.js)과 동일
 */
import { MTCH_STTS, ROLE, isActiveStage } from '../shared/chatCodes';

const { PRE, REQUESTED, MATCHED, DONE_REQ, PAYING, COMPLETE } = MTCH_STTS;

export const DEAL_STEPS = [
  '매칭 요청',
  '수락',
  '돌봄 완료',
  '완료 확인',
  '비용 수령',
];

/** 진행 위치. 종료 상태(요청 취소·무응답 종료·매칭 취소)는 제외 */
const POSITION = {
  [PRE]: 0,
  [REQUESTED]: 1,
  [MATCHED]: 2,
  [DONE_REQ]: 3,
  [PAYING]: 4,
  [COMPLETE]: 5,
};

/** 종료 상태에서 어디까지 지났다고 보일지 */
const ENDED_DONE_COUNT = {
  [MTCH_STTS.CANCELED]: 1,
  [MTCH_STTS.EXPIRED]: 3,
  [MTCH_STTS.ABORTED]: 2,
};

/** 단계 점 상태: doneCount 이하는 지남, current는 지금 단계(0이면 없음) */
export const getStepProgress = (stage) => {
  const position = POSITION[stage];
  const isEnded = position === undefined;
  return {
    isEnded,
    doneCount: isEnded ? ENDED_DONE_COUNT[stage] : position,
    current: isEnded || position >= DEAL_STEPS.length ? 0 : position + 1,
  };
};

/** 확인 칸이 필요한 버튼(되돌릴 수 없거나 사유가 필요한 단계) */
export const DEAL_ASKS = {
  cancelAsk: {
    title: '요청을 취소할까요? 사유를 골라 주세요',
    hasReasons: true,
    confirmLabel: '요청 취소',
    action: 'cancel',
    isDanger: true,
  },
  doneAsk: {
    title: '돌봄을 모두 마쳤나요?',
    description: '보호자에게 완료 확인을 요청해요',
    confirmLabel: '완료 요청',
    action: 'doneRequest',
  },
  confirmAsk: {
    title: '돌봄이 잘 끝났나요?',
    description: '확인하면 되돌릴 수 없고, 비용 전달 단계로 넘어가요',
    confirmLabel: '완료 확인',
    action: 'confirm',
  },
  paidAsk: {
    title: '비용을 받으셨나요?',
    description: '확인하면 되돌릴 수 없고, 거래가 완료돼요',
    confirmLabel: '수령 확인',
    action: 'receive',
  },
};

export const OTHER_REASON = '직접 입력';

export const CANCEL_REASONS = [
  '일정이 맞지 않아요',
  '다른 분과 진행하기로 했어요',
  '조건을 다시 협의하고 싶어요',
  OTHER_REASON,
];

export const OTHER_REASON_MAX_LENGTH = 50;

/**
 * 지금 할 일: { icon, title, description, actions, tone }
 * - actions: 내 차례일 때만 있고 { key, label, variant }, primary는 최대 하나
 * - tone: todo 내 차례, done 거래 완료, end 종료, '' 기다림
 */
export const getDealGuide = (stage, role) => {
  const isOwner = role === ROLE.OWNER;

  switch (stage) {
    case PRE:
      return isOwner
        ? {
            icon: 'handshake',
            title: '조건이 맞으면 매칭을 요청해 주세요',
            description: '일정 · 비용 · 장소를 충분히 이야기한 뒤 요청해요',
            actions: [
              { key: 'request', label: '매칭 요청하기', variant: 'primary' },
            ],
            tone: 'todo',
          }
        : {
            icon: 'hourglass_empty',
            title: '보호자가 매칭을 요청하면 수락할 수 있어요',
            description: '궁금한 점은 채팅으로 먼저 물어보세요',
            actions: [],
            tone: '',
          };
    case REQUESTED:
      return isOwner
        ? {
            icon: 'hourglass_top',
            title: '돌보미의 수락을 기다리고 있어요',
            description: '14일 동안 수락이 없으면 요청이 자동 취소돼요',
            actions: [
              { key: 'cancelAsk', label: '요청 취소', variant: 'secondary' },
            ],
            tone: '',
          }
        : {
            icon: 'handshake',
            title: '보호자가 매칭을 요청했어요',
            description:
              '수락하면 매칭이 확정되고 상세 주소를 주고받을 수 있어요',
            actions: [
              { key: 'accept', label: '매칭 수락하기', variant: 'primary' },
            ],
            tone: 'todo',
          };
    case MATCHED:
      return isOwner
        ? {
            icon: 'pets',
            title: '매칭이 완료됐어요',
            description: '돌봄이 끝나면 돌보미가 완료를 요청해요',
            actions: [],
            tone: '',
          }
        : {
            icon: 'pets',
            title: '약속한 돌봄을 진행해 주세요',
            description: '돌봄을 모두 마친 뒤 완료를 요청해요',
            actions: [
              { key: 'doneAsk', label: '돌봄 완료 요청', variant: 'primary' },
            ],
            tone: 'todo',
          };
    case DONE_REQ:
      return isOwner
        ? {
            icon: 'task_alt',
            title: '돌보미가 돌봄 완료를 요청했어요',
            description:
              '확인하면 비용 전달 단계로 넘어가요 · 14일 동안 확인이 없으면 거래가 종료돼요',
            actions: [
              {
                key: 'confirmAsk',
                label: '돌봄 완료 확인',
                variant: 'primary',
              },
            ],
            tone: 'todo',
          }
        : {
            icon: 'hourglass_top',
            title: '보호자의 완료 확인을 기다리고 있어요',
            description: '14일 동안 확인이 없으면 거래가 종료돼요',
            actions: [],
            tone: '',
          };
    case PAYING:
      return isOwner
        ? {
            icon: 'payments',
            title: '약속한 비용을 돌보미에게 전달해 주세요',
            description:
              '냥멍케어는 결제를 대신하지 않아요 · 직접 전달한 뒤 돌보미가 수령을 확인해요',
            actions: [],
            tone: '',
          }
        : {
            icon: 'payments',
            title: '비용을 받았다면 수령을 확인해 주세요',
            description: '확인하면 거래가 완료돼요',
            actions: [
              { key: 'paidAsk', label: '비용 수령 확인', variant: 'primary' },
            ],
            tone: 'todo',
          };
    case COMPLETE:
      return {
        icon: 'verified',
        title: '거래가 완료됐어요',
        description: '함께해 주셔서 고마워요 · 채팅 기록은 보관돼요',
        actions: [],
        tone: 'done',
      };
    case MTCH_STTS.CANCELED:
      return isOwner
        ? {
            icon: 'block',
            title: '매칭 요청이 취소됐어요',
            description:
              '조건이 다시 맞으면 현재 모집글 조건으로 다시 요청할 수 있어요',
            actions: [
              { key: 'request', label: '다시 요청하기', variant: 'primary' },
            ],
            tone: 'end',
          }
        : {
            icon: 'block',
            title: '보호자가 매칭 요청을 취소했어요',
            description: '대화는 이어서 할 수 있어요',
            actions: [],
            tone: 'end',
          };
    case MTCH_STTS.EXPIRED:
      return {
        icon: 'timer_off',
        title: '응답이 없어 매칭이 종료됐어요',
        description: '14일 동안 다음 단계가 진행되지 않았어요',
        actions: [],
        tone: 'end',
      };
    default:
      return {
        icon: 'logout',
        title: '매칭이 취소됐어요',
        description: '한 명이 채팅방을 나가 진행 중이던 매칭이 취소됐어요',
        actions: [],
        tone: 'end',
      };
  }
};

/** 채팅방 나가기 확인 문구: [제목, 설명] */
export const getLeaveText = (stage) => {
  if (isActiveStage(stage)) {
    return [
      '나가면 진행 중인 매칭이 취소돼요',
      '상대방에게 "상대방이 나갔어요"가 표시되고, 다시 대화할 수 없어요.',
    ];
  }
  if (stage === COMPLETE) {
    return [
      '채팅방을 나갈까요?',
      '거래 기록은 보관되지만 이 대화는 목록에서 사라져요.',
    ];
  }
  return [
    '채팅방을 나갈까요?',
    '이 대화는 목록에서 사라지고 다시 볼 수 없어요.',
  ];
};
