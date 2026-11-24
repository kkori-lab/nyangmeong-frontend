import { addDays, addMonths, getTodayYmd } from '@/utils/formatDate';

/**
 * 확인 카드(ACTION) 규칙: 칸 규칙(params)·조건부 필수(rules)로 빈 필수 칸·Java 요청을 정한다(폼 없음, 말로 확인)
 * - 계약: ai 저장소 docs/api/chat.md ActionCard
 */

/**
 * 카드에 두지 않는 칸: 폼·Java 요청·결과 저장·다음 메시지 어디에도 싣지 않음
 * - 일정 출처(schdlSrcCd)는 Java 기본값, 케어 항목 대표 아이콘(rprsIconId)은 기본 아이콘(FN-AIM-012-13)
 */
const OMITTED_FIELDS = ['schdlSrcCd', 'rprsIconId'];

/** 검사 수치 저장 도구와 직접 입력 항목 코드(HLTG12 직접입력) */
export const INSPECTION_TOOL = 'draft_inspection_values';
const DIRECT_INPUT_ARTICLE = 'HLTC0035';

/**
 * 검사 수치 항목 정리: 항목 코드가 있으면(직접 입력 코드 제외) 직접 입력 이름을 뺀다
 * - Java는 직접 입력 이름이 있으면 코드를 비우거나 직접 입력 코드만 받는다(400 values[n].inspArtclCd)
 * - AI 서버가 실행 카드에 이름을 같이 붙여 올 때가 있어 보내기 전에 맞춘다(근본 수정은 ai 저장소)
 */
const cleanInput = (card, input) => {
  if (card.tool !== INSPECTION_TOOL || !Array.isArray(input.values)) {
    return input;
  }
  return {
    ...input,
    values: input.values.map((value) => {
      if (!value.inspArtclCd || value.inspArtclCd === DIRECT_INPUT_ARTICLE) {
        return value;
      }
      const { inspArtclDrctInptNm: _omitted, ...rest } = value;
      return rest;
    }),
  };
};

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

/** 파일 칸(type file): 서버가 채우지 않고 React가 붙인다(분석한 사진 등) */
export const fileFields = (card) =>
  Object.entries(card.params)
    .filter(([, param]) => param.type === 'file')
    .map(([field]) => field);

/** 파일 칸에 같은 파일 붙이기: { 칸: File } */
export const attachFile = (card, file) =>
  Object.fromEntries(fileFields(card).map((field) => [field, file]));

/** 본문 칸 → multipart: 파일은 그대로, 그 밖은 글자로 */
const toFormData = (data) => {
  const form = new FormData();
  Object.entries(data).forEach(([field, value]) => {
    form.append(field, value instanceof Blob ? value : String(value));
  });
  return form;
};

/**
 * Java 요청: path의 {칸}은 경로에, query 칸은 쿼리에, 나머지 목록 칸은 본문에
 * - call.path는 /api로 시작하고 axios api 인스턴스가 /api를 붙인다
 * - call.contentType이 multipart면 본문을 FormData로(관찰 항목 등록처럼 파일 칸이 있는 도구)
 */
export const buildActionRequest = (card, rawInput) => {
  const input = cleanInput(card, rawInput);
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
  const isMultipart = card.call.contentType?.includes('multipart') ?? false;
  return {
    method: card.call.method,
    url,
    params,
    data: isMultipart ? toFormData(data) : data,
  };
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
export const resultInput = (card, rawInput) => {
  const input = cleanInput(card, rawInput);
  return Object.fromEntries(
    Object.entries(input).filter(
      ([field, value]) =>
        isCardField(card, field) &&
        !isEmptyValue(value) &&
        !isFieldOff(card, input, field),
    ),
  );
};

/** 결과 저장·다음 메시지에 보낼 input: resultInput에서 파일 칸을 뺀다(JSON으로 보내므로) */
export const jsonInput = (card, rawInput) => {
  const files = fileFields(card);
  return Object.fromEntries(
    Object.entries(resultInput(card, rawInput)).filter(
      ([field]) => !files.includes(field),
    ),
  );
};

/** 관찰 기록 추가 도구: 관찰 항목 번호(obsrvArtclSn)만 오므로 카드가 이름을 따로 보인다 */
export const OBSERVATION_CYCLE_TOOL = 'draft_observation_cycle';

/** 케어 항목 등록 도구 */
export const CARE_ITEM_TOOL = 'draft_care_item';

/** 케어 캘린더로 이어지는 등록 도구 */
export const CALENDAR_TOOLS = ['draft_schedule', CARE_ITEM_TOOL];

/**
 * 카드에 보일 칸: 칸 규칙 순서대로, 경로 칸·카드에 두지 않는 칸·꺼진 조건부 칸·번호 칸(…Sn)·서버가 만드는 칸·파일 칸은 뺀다
 * - 빈 칸은 필수(조건부 필수 포함)일 때만 보이고 isMissing
 * - 반려동물(petSn)은 경로 칸이라 카드가 따로 보이고, 검사 수치의 검진기록(ckupRcdSn)도 카드가 따로 보인다
 */
export const cardRows = (card, input) => {
  const missing = missingFields(card, input);
  const editable = editableFields(card, input);
  /** 일시를 카드에서 받으면 시간 입력(hrInptYn)은 시간을 넣었는지로 정해 따로 보이지 않는다 */
  const isHourDerived = isHourInputDerived(card, input);
  return Object.entries(card.params)
    .filter(
      ([field, param]) =>
        param.in !== 'path' &&
        isCardField(card, field) &&
        !/Sn$/.test(field) &&
        !param.generated &&
        param.type !== 'file' &&
        !isFieldOff(card, input, field) &&
        !(isHourDerived && field === HOUR_INPUT_FIELD),
    )
    .map(([field, param]) => ({
      field,
      param,
      value: input[field],
      isMissing: missing.includes(field),
      isEditable: editable.includes(field),
    }))
    .filter((row) => row.isMissing || !isEmptyValue(row.value));
};

/** 시간 입력 칸: 일시 칸과 짝 */
export const HOUR_INPUT_FIELD = 'hrInptYn';

/** 카드에서 바로 채우는 칸 종류: 목록·파일 칸은 말로 */
const EDITABLE_TYPES = [
  'string',
  'code',
  'boolean',
  'date',
  'datetime',
  'int',
  'long',
  'decimal',
];

/**
 * 카드에서 바로 채우는 칸(추가-1): 카드를 받을 때 비어 있던 필수·조건부 필수 칸
 * - 받을 때 값으로 정하므로 채운 뒤에도 고칠 수 있다. 경로 칸·번호 칸·카드에 두지 않는 칸은 빼고, 반려동물은 이름 칩
 */
export const editableFields = (card, input) =>
  requiredFields(card, input).filter((field) => {
    const param = card.params[field];
    return (
      param &&
      param.in !== 'path' &&
      isCardField(card, field) &&
      !/Sn$/.test(field) &&
      !param.generated &&
      EDITABLE_TYPES.includes(param.type) &&
      isEmptyValue(card.input[field])
    );
  });

/** 일시 칸을 카드에서 받고 시간 입력 칸이 있으면: 시간을 넣었는지로 시간 입력을 정한다 */
export const isHourInputDerived = (card, input) =>
  HOUR_INPUT_FIELD in card.params &&
  editableFields(card, input).some(
    (field) => card.params[field].type === 'datetime',
  );

/** 칸 아래에 서버 오류를 보이는 칸: 반려동물·검사 수치 검진기록·보이는 칸(검사 수치 표 제외) */
export const errorFieldsShown = (card, input) => [
  ...('petSn' in card.params ? ['petSn'] : []),
  ...(card.tool === INSPECTION_TOOL ? ['ckupRcdSn'] : []),
  ...cardRows(card, input)
    .filter(
      ({ field }) => !(card.tool === INSPECTION_TOOL && field === 'values'),
    )
    .map(({ field }) => field),
];

/** 케어 구역(HLTG13)·직접입력 주기(HLTG15) */
const DAILY_ZONE = 'HLTC0036';
const REGULAR_ZONE = 'HLTC0037';
const CUSTOM_CYCLE = 'HLTC0042';

/** 주기별 다음 날짜: 한달·1년은 같은 날짜, 그 달에 없으면 말일 */
const CYCLE_STEPS = {
  HLTC0038: (ymd) => addDays(ymd, 7),
  HLTC0039: (ymd) => addDays(ymd, 14),
  HLTC0040: (ymd) => addMonths(ymd, 1),
  HLTC0041: (ymd) => addMonths(ymd, 12),
};

/**
 * 케어 항목 카드의 다음 예정일(FN-AIM-012-07): 마지막으로 한 날(없으면 오늘) + 주기
 * - 일상관리는 다음 날, 주기를 아직 정하지 못했으면 null("—")
 */
export const nextDueYmd = (input) => {
  const base = input.lastCmptnYmd || getTodayYmd();
  if (input.careZoneCd === DAILY_ZONE) return addDays(base, 1);
  if (input.careZoneCd !== REGULAR_ZONE) return null;
  if (input.careCycleCd === CUSTOM_CYCLE) {
    const days = Number(input.cycleDrctInptDayCnt);
    return Number.isInteger(days) && days > 0 ? addDays(base, days) : null;
  }
  return CYCLE_STEPS[input.careCycleCd]?.(base) ?? null;
};
