/**
 * 확인 카드(ACTION) 규칙: 칸 규칙(params)·조건부 필수(rules)로 빈 필수 칸·Java 요청을 정한다(폼 없음, 말로 확인)
 * - 계약: ai 저장소 docs/api/chat.md ActionCard
 */

/**
 * 카드에 두지 않는 칸: 폼·Java 요청·결과 저장·다음 메시지 어디에도 싣지 않음
 * - 일정 출처(schdlSrcCd)는 Java 기본값, 케어 항목 대표 아이콘(rprsIconId)은 기본 아이콘(FN-AIM-012-13)
 */
const OMITTED_FIELDS = ['schdlSrcCd', 'rprsIconId'];

/** 카드가 쓰는 칸 */
const isCardField = (card, field) =>
  field in card.params && !OMITTED_FIELDS.includes(field);

/** 값 없음: 빈 문자열·null·undefined */
const isEmptyValue = (value) =>
  value === undefined || value === null || value === '';

/** 반려동물 칩: 서버가 정하지 못했고 반려동물 칸이 있을 때 */
export const hasPetChoice = (card) =>
  card.petChoices.length > 0 && 'petSn' in card.params;

/** 지금 값 기준 필수 칸: 필수 + 조건이 맞는 조건부 필수 */
const requiredFields = (card, input) => {
  const fields = Object.entries(card.params)
    .filter(([, param]) => param.required)
    .map(([field]) => field);
  card.rules.forEach(({ field, when, equals }) => {
    if (input[when] === equals) fields.push(field);
  });
  return [...new Set(fields)];
};

/** 빈 필수·조건부 필수 칸: 값이 바뀔 때마다 다시 판정 */
export const missingFields = (card, input) =>
  requiredFields(card, input).filter((field) => isEmptyValue(input[field]));

/**
 * Java 요청: path의 {칸}은 경로에, query 칸은 쿼리에, 나머지 목록 칸은 본문에
 * - call.path는 /api로 시작하고 axios api 인스턴스가 /api를 붙인다
 */
export const buildActionRequest = (card, input) => {
  const params = {};
  const data = {};
  Object.entries(card.params).forEach(([field, param]) => {
    if (
      param.in === 'path' ||
      !isCardField(card, field) ||
      isEmptyValue(input[field])
    ) {
      return;
    }
    if (param.in === 'query') params[field] = input[field];
    else data[field] = input[field];
  });
  const url = card.call.path
    .replace(/^\/api/, '')
    .replace(/\{(\w+)\}/g, (_, field) => encodeURIComponent(input[field]));
  return { method: card.call.method, url, params, data };
};

/**
 * 조건부 칸이 꺼졌는지: rules에 나오는 칸은 그 조건 중 하나라도 맞을 때만 쓴다
 * - 예: 건강 일지 상태(crsdSttsCd)는 기록 지표가 배변상태일 때만. 다른 지표에 값을 보내면 Java가 400
 * - 조건 칸이 그 자신도 꺼져 있으면 남은 값은 보지 않는다
 *   (예: 반복 유형을 일상관리로 바꾸면 주기 칸이 꺼지고, 주기=직접입력에 달린 주기(일) 칸도 꺼진다)
 * - seen: 서로를 조건으로 거는 규칙이 와도 멈추도록 이미 본 칸
 */
const isFieldOff = (card, input, field, seen = new Set()) => {
  const rules = card.rules.filter((rule) => rule.field === field);
  if (rules.length === 0) return false;
  const nextSeen = new Set(seen).add(field);
  return !rules.some(
    ({ when, equals }) =>
      input[when] === equals &&
      (nextSeen.has(when) || !isFieldOff(card, input, when, nextSeen)),
  );
};

/** 결과 저장·Java 요청·다음 메시지에 보낼 input: 목록에 있는 칸만, 빈 값과 꺼진 조건부 칸은 뺀다 */
export const resultInput = (card, input) =>
  Object.fromEntries(
    Object.entries(input).filter(
      ([field, value]) =>
        isCardField(card, field) &&
        !isEmptyValue(value) &&
        !isFieldOff(card, input, field),
    ),
  );

/** 케어 항목 등록 도구 */
export const CARE_ITEM_TOOL = 'draft_care_item';

/** 케어 캘린더로 이어지는 등록 도구 */
export const CALENDAR_TOOLS = ['draft_schedule', CARE_ITEM_TOOL];
