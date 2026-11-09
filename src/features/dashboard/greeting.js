import { pickJosa } from '@/utils/josa';

/**
 * [메인 시간대 한 줄 인사] SCR-MAN-001 FN-MAN-001
 * - AI 생성이 아니라 프론트 문구 틀(사람 결정 2026-11-08). 문구는 사람이 초안에서 고름(2026-11-09)
 * - 틀 안 `{name}`은 반려동물 이름, `{은/는}`처럼 `/`가 든 자리는 이름 받침에 맞는 조사
 * - 같은 날·같은 시간대면 같은 문구(렌더마다 바뀌지 않게 난수를 쓰지 않는다), 날이 바뀌면 다음 틀
 */

/** 시간대: from시부터 다음 시간대 from시 전까지 */
const SLOTS = [
  {
    from: 0,
    named: [
      '아직 깨어 있었네요, {name}{은/는} 꿈나라겠죠?',
      '조용한 새벽, {name}{과/와} 함께인가요?',
    ],
    nameless: ['늦은 시간까지 수고했어요'],
  },
  {
    from: 5,
    named: [
      '좋은 아침이에요, {name}{은/는} 잘 잤나요?',
      '{name}{과/와} 산뜻한 하루 시작해요',
      '오늘 {name}{이/가} 아침은 잘 먹었나요?',
    ],
    nameless: ['좋은 아침이에요'],
  },
  {
    from: 11,
    named: [
      '{name}{은/는} 낮잠 자는 중일까요?',
      '오늘 {name}{은/는} 어땠나요?',
      '오늘 {name}{은/는} 뭐 하고 놀았나요?',
    ],
    nameless: ['오늘 하루는 어땠나요?'],
  },
  {
    from: 17,
    named: [
      '저녁이에요, {name}{과/와} 산책 어때요?',
      '오늘 {name}{은/는} 어땠나요?',
    ],
    nameless: ['편안한 저녁 보내세요'],
  },
  {
    from: 21,
    named: [
      '{name}{과/와} 포근한 밤 보내요',
      '{name}{은/는} 벌써 잠들었나요?',
    ],
    nameless: ['오늘도 수고 많았어요'],
  },
];

const DAY_MS = 24 * 60 * 60 * 1000;

/** 그 시각이 든 시간대의 순번 */
const findSlotIndex = (hour) =>
  SLOTS.findLastIndex((slot) => hour >= slot.from);

/** 브라우저 지역 날짜 기준 날 번호(시각과 무관하게 하루 동안 같은 값) */
const toDayNumber = (date) =>
  Math.floor(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / DAY_MS,
  );

/** 틀에 이름과 조사를 채운다 */
const fillTemplate = (template, name) =>
  template.replace(/\{([^}]+)\}/g, (_, key) =>
    key === 'name' ? name : pickJosa(name, key),
  );

/** 그 시각에 보일 한 줄 인사. 이름이 없으면 이름 없는 틀 */
export const pickGreeting = (date, petNm) => {
  const name = petNm?.trim();
  const slotIndex = findSlotIndex(date.getHours());
  const templates = name ? SLOTS[slotIndex].named : SLOTS[slotIndex].nameless;
  const template =
    templates[(toDayNumber(date) + slotIndex) % templates.length];
  return name ? fillTemplate(template, name) : template;
};
