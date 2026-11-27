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
  if (card.tool === MEMBER_PROFILE_TOOL) return cleanProfileInput(input);
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

/**
 * 회원 프로필 사진 수정 도구(2026-11-27): 새 사진(profilePhoto) 또는 기본 이미지로 되돌리기(profilePhotoReset) 하나만
 * - Java는 둘을 같이 받으면 400, 둘 다 없으면 바꾸지 않고 성공이다
 */
export const MEMBER_PROFILE_TOOL = 'draft_member_profile_update';
const PROFILE_PHOTO_FIELD = 'profilePhoto';
const PROFILE_RESET_FIELD = 'profilePhotoReset';

/** 기본 이미지로 되돌리는 카드인지: AI 서버가 true(또는 글자 'true')를 싣는다 */
export const isProfileReset = (card, input) =>
  card.tool === MEMBER_PROFILE_TOOL &&
  [true, 'true'].includes(input[PROFILE_RESET_FIELD]);

/** 사진을 고르면 되돌리기는 보내지 않는다(같이 보내면 400) */
const cleanProfileInput = (input) => {
  if (!(input[PROFILE_PHOTO_FIELD] instanceof Blob)) return input;
  const { [PROFILE_RESET_FIELD]: _omitted, ...rest } = input;
  return rest;
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
  /** 프로필 사진 카드: 되돌리기가 아니면 사진을 골라야 실행(아무것도 안 바뀌는 실행을 막는다) */
  if (card.tool === MEMBER_PROFILE_TOOL && !isProfileReset(card, input)) {
    fields.push(PROFILE_PHOTO_FIELD);
  }
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
 * - DELETE(삭제 카드)는 본문 없이 보낸다(칸은 경로 번호뿐, AI 계약 2026-11-25)
 * - 본문 칸이 하나도 없는 POST(관찰 종료 end_observation_item)도 본문 없이 보낸다
 */
/** 삭제 카드: 고칠 칸 없이 대상 글(targetText)과 [삭제]로 보인다 */
export const isDeleteCard = (card) =>
  card.call?.method?.toUpperCase() === 'DELETE';

/**
 * 지우는 도구: 삭제 카드이거나 도구 이름이 delete_로 시작한다
 * - 조건 전체 삭제(delete_expenses_by_condition)는 POST라 칸은 보이고 버튼만 빨간 [삭제](사람 결정 2026-11-27)
 */
export const isDeleteTool = (card) =>
  isDeleteCard(card) || (card.tool?.startsWith('delete_') ?? false);

/**
 * 쿼리 번호 목록(delete_expenses의 expndSn)은 같은 이름을 되풀이해 보낸다(?expndSn=1&expndSn=2)
 * - axios 기본은 expndSn[]=1이라 Spring @RequestParam List가 받지 못한다
 */
const withQueryList = (request) =>
  Object.values(request.params).some(Array.isArray)
    ? { ...request, paramsSerializer: { indexes: null } }
    : request;

const toActionRequest = (card, rawInput) => {
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
  if (isDeleteCard(card)) return { method: card.call.method, url, params };
  const isMultipart = card.call.contentType?.includes('multipart') ?? false;
  if (!isMultipart && Object.keys(data).length === 0) {
    return { method: card.call.method, url, params };
  }
  return {
    method: card.call.method,
    url,
    params,
    data: isMultipart ? toFormData(data) : data,
  };
};

export const buildActionRequest = (card, rawInput) =>
  withQueryList(toActionRequest(card, rawInput));

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

/**
 * 관찰 항목 줄을 따로 보이는 카드: 관찰 항목 번호(obsrvArtclSn) 칸이 있는 카드
 * - 관찰 기록 추가(본문 칸)·관찰 종료(end_observation_item, 경로 칸)
 */
export const hasObservationItemRow = (card) => 'obsrvArtclSn' in card.params;

/**
 * 검진기록 줄을 따로 보이는 카드: 본문에 검진기록 번호(ckupRcdSn)를 싣는 카드
 * - 검사 수치·처방·기타 검사·반복 예방 등록. 비어 있으면 카드에서 고른다
 * - 경로 칸(검진기록 수정·삭제)은 대상 번호라 보이지 않는다
 */
export const hasCheckupRow = (card) =>
  'ckupRcdSn' in card.params && card.params.ckupRcdSn.in !== 'path';

/** 반려동물 쓰기 카드(2026-11-27): 번호 목록 칸·대상 번호를 이름으로 보이는 도구 */
export const PET_CREATE_TOOL = 'draft_pet';
export const INVITE_TOOL = 'draft_caregiver_invitation';
export const ACCEPT_INVITATION_TOOL = 'accept_caregiver_invitation';
export const CANCEL_INVITATION_TOOL = 'cancel_caregiver_invitation';
export const EQUIP_TOOL = 'draft_equipped_items';
export const PURCHASE_TOOL = 'draft_item_purchase';

/**
 * 번호 목록 칸(petSns·itemSns·hldItemSns): array 칸이 itemType(long·int)이거나 줄 칸(items)이 없다
 * - AI 서버가 itemType을 싣기 전에도 줄 칸이 없는 array는 번호 목록으로 본다
 */
export const isNumberList = (param) =>
  param?.type === 'array' &&
  !hasValues(param) &&
  (param.itemType != null || !param.items);

/**
 * 값 목록이 있는 칸(2026-11-27): Java enum 칸(string)·enum 목록 칸(array + itemType string)에 고를 값(values)이 온다
 * - 값은 enum 상수 이름 그대로 Java에 보낸다(예: 알림 설정 leadTimes TODAY·D1·D3·D7)
 */
export const hasValues = (param) =>
  Array.isArray(param?.values) && param.values.length > 0;

/** 값 여러 개를 고르는 칸: enum 목록 칸 */
export const isValueList = (param) =>
  param?.type === 'array' && hasValues(param);

/**
 * 서버가 만드는 칸(generated: uuid, 예: 구매 중복 방지 키 idmptDmndId): 카드 하나에 한 번 만든다
 * - Java 요청에만 싣고 결과 저장·다음 메시지 input에는 싣지 않는다(useActionCards)
 */
export const generatedInput = (card) =>
  Object.fromEntries(
    Object.entries(card.params)
      .filter(([, param]) => param.generated === 'uuid')
      .map(([field]) => [field, crypto.randomUUID()]),
  );

/**
 * 품종 줄을 따로 보이는 카드: 품종 번호(vrtySn)·직접 입력(vrtyDrctInptNm) 중 하나를 "품종" 한 줄로
 * - 번호 칸(…Sn)은 카드에 보이지 않아 품종 목록 이름으로 보인다
 */
export const hasBreedRow = (card) =>
  'vrtySn' in card.params && 'vrtyDrctInptNm' in card.params;

/** 초대 줄을 따로 보이는 카드: 경로 칸 초대 번호(jntBrupInvtnSn), 수락·거절·취소 */
export const hasInvitationRow = (card) => 'jntBrupInvtnSn' in card.params;

/** 플레이스 즐겨찾기 저장 도구(2026-11-27) */
export const PLACE_BOOKMARK_TOOL = 'draft_place_bookmark';

/**
 * 장소 줄을 따로 보이는 카드: 본문에 장소 번호(plcSn)를 싣는 카드
 * - 번호는 카드에서 고를 수 없어 말로 정하고, 이름은 카드 대상 글(targetText)로 보인다
 */
export const hasPlaceRow = (card) =>
  'plcSn' in card.params && card.params.plcSn.in !== 'path';

/** 케어 항목 등록 도구 */
export const CARE_ITEM_TOOL = 'draft_care_item';

/** 케어 캘린더로 이어지는 등록 도구 */
export const CALENDAR_TOOLS = ['draft_schedule', CARE_ITEM_TOOL];

/**
 * 카드에 보일 칸: 칸 규칙 순서대로, 경로 칸·카드에 두지 않는 칸·꺼진 조건부 칸·번호 칸(…Sn)·서버가 만드는 칸·파일 칸은 뺀다
 * - 빈 칸은 필수(조건부 필수 포함)일 때만 보이고 isMissing
 * - 반려동물(petSn)은 경로 칸이라 카드가 따로 보이고, 검진기록(ckupRcdSn)·관찰 항목(obsrvArtclSn)·품종(vrtySn)·초대(jntBrupInvtnSn)·장소(plcSn)도 카드가 따로 보인다
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
        !(isHourDerived && field === HOUR_INPUT_FIELD) &&
        !(hasBreedRow(card) && field === 'vrtyDrctInptNm') &&
        /** 프로필 사진 카드: 되돌리기 줄은 되돌릴 때만("예"), 아니요는 사진 줄로 보인다 */
        !(
          field === PROFILE_RESET_FIELD &&
          card.tool === MEMBER_PROFILE_TOOL &&
          !isProfileReset(card, input)
        ),
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

/** 카드에서 바로 채우는 칸 종류: 목록·파일 칸은 말로(값 목록 칸은 칩으로 고른다) */
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
      (EDITABLE_TYPES.includes(param.type) || isValueList(param)) &&
      isEmptyValue(card.input[field])
    );
  });

/** 일시 칸을 카드에서 받고 시간 입력 칸이 있으면: 시간을 넣었는지로 시간 입력을 정한다 */
export const isHourInputDerived = (card, input) =>
  HOUR_INPUT_FIELD in card.params &&
  editableFields(card, input).some(
    (field) => card.params[field].type === 'datetime',
  );

/** 칸 아래에 서버 오류를 보이는 칸: 반려동물·검진기록·관찰 항목·보이는 칸(검사 수치 표 제외) */
export const errorFieldsShown = (card, input) => [
  ...('petSn' in card.params ? ['petSn'] : []),
  ...(hasCheckupRow(card) ? ['ckupRcdSn'] : []),
  ...(hasObservationItemRow(card) ? ['obsrvArtclSn'] : []),
  ...(hasBreedRow(card) ? ['vrtySn', 'vrtyDrctInptNm'] : []),
  ...(hasPlaceRow(card) ? ['plcSn'] : []),
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
