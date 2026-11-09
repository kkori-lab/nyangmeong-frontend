/**
 * 확인 카드(ACTION) 폼 규칙: 칸 규칙(params)·조건부 필수(rules)로 보일 칸·빈 필수 칸·Java 요청을 정한다
 * - 계약: ai 저장소 docs/api/chat.md ActionCard
 */

const NUMBER_TYPES = ['int', 'long', 'decimal'];

/** 수정 도구: 바꿀 칸만 input에 온다 */
export const isUpdateCall = (call) => call.method === 'PATCH';

/** 값 없음: 빈 문자열·null·undefined */
export const isEmptyValue = (value) =>
  value === undefined || value === null || value === '';

/**
 * 폼에 보일 칸
 * - 경로 칸·번호 칸(…Sn, petSn은 칩)·만드는 쪽이 채우는 칸·목록 칸은 숨김
 * - 수정 도구는 카드를 받았을 때 input에 온 칸만
 */
export const visibleFields = (card) =>
  Object.entries(card.params)
    .filter(
      ([field, param]) =>
        param.in !== 'path' &&
        !field.endsWith('Sn') &&
        !param.generated &&
        param.type !== 'array' &&
        (!isUpdateCall(card.call) || field in card.input),
    )
    .map(([field]) => field);

/** 반려동물 칩: 서버가 정하지 못했고 반려동물 칸이 있을 때 */
export const hasPetChoice = (card) =>
  card.petChoices.length > 0 && 'petSn' in card.params;

/** 지금 값 기준 필수 칸: 필수 + 조건이 맞는 조건부 필수 */
export const requiredFields = (card, input) => {
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

/** 입력 칸의 값을 칸 타입대로: 숫자는 숫자, 빈 값은 칸 지움 */
export const toFieldValue = (param, raw) => {
  if (isEmptyValue(raw)) return undefined;
  if (NUMBER_TYPES.includes(param.type)) {
    const number = Number(raw);
    return Number.isNaN(number) ? undefined : number;
  }
  return raw;
};

/** 칸 하나 바꾼 input: 빈 값이면 칸을 지운다 */
export const withField = (input, field, value) => {
  const next = { ...input };
  if (value === undefined) delete next[field];
  else next[field] = value;
  return next;
};

/**
 * Java 요청: path의 {칸}은 경로에, query 칸은 쿼리에, 나머지 목록 칸은 본문에
 * - call.path는 /api로 시작하고 axios api 인스턴스가 /api를 붙인다
 */
export const buildActionRequest = (card, input) => {
  const params = {};
  const data = {};
  Object.entries(card.params).forEach(([field, param]) => {
    if (param.in === 'path' || isEmptyValue(input[field])) return;
    if (param.in === 'query') params[field] = input[field];
    else data[field] = input[field];
  });
  const url = card.call.path
    .replace(/^\/api/, '')
    .replace(/\{(\w+)\}/g, (_, field) => encodeURIComponent(input[field]));
  return { method: card.call.method, url, params, data };
};

/** 결과 저장에 보낼 input: 목록에 있는 칸만, 빈 값은 뺀다 */
export const resultInput = (card, input) =>
  Object.fromEntries(
    Object.entries(input).filter(
      ([field, value]) => field in card.params && !isEmptyValue(value),
    ),
  );
