/**
 * [운영 설정 항목 정의]
 * - 키는 SYS_STNG 컬럼 camelCase: 백엔드 SystemSetting과 같은 이름
 * - resKey: GET /admin/settings 응답의 묶음 객체 이름(memberPet 등). 저장(PATCH)은 평평한 본문
 * - maxDigits: 서버 허용 범위(docs/api/global.md AdminSettingUpdateRequest)가 들어가는 자릿수
 * - readOnly: 수정 요청에 없는 항목(조회만). 입력칸을 막고 저장 본문에서 뺀다
 * - 묶음·항목 이름·단위는 관리자 화면설계서 SCR-ADM-110 그대로
 * - kind: number(쉼표 표시) / year(4자리) / amount(원) / megabyte(MB로 표시, 바이트로 저장) / text(한 줄 문구)
 */

/** 1MB의 바이트 수 */
export const MB = 1024 * 1024;

/** 문구 항목 최대 글자 수 */
export const TEXT_MAX_LENGTH = 1000;

/** 일수 항목은 기본 2자리(~99), 개수 항목은 기본 3자리(~100) */
const dayField = (key, maxDigits = 2) => ({
  key,
  kind: 'number',
  unit: '일',
  maxDigits,
});
const countField = (key, unit, maxDigits = 3) => ({
  key,
  kind: 'number',
  unit,
  maxDigits,
});

export const SETTING_GROUPS = [
  {
    title: '회원·반려동물',
    resKey: 'memberPet',
    rows: [
      {
        label: '반려동물 최대 등록 수',
        fields: [countField('petMaxCnt', '마리')],
      },
      {
        label: '공동양육 최대 인원',
        fields: [countField('jntBrupMaxNope', '명')],
      },
      {
        label: '공동양육 초대 유효 기간',
        fields: [dayField('invtnVldDayCnt', 4)],
      },
      {
        label: '로그인 실패 제한 횟수',
        fields: [countField('lgnFailLmtNmtm', '회')],
      },
      {
        label: '탈퇴 회원 보관 기간',
        hint: '바꿀 수 없음',
        fields: [{ ...dayField('whdwlMbrKpngDayCnt', 4), readOnly: true }],
      },
    ],
  },
  {
    title: '커뮤니티',
    resKey: 'community',
    rows: [
      {
        label: '게시글 이미지 최대 수',
        fields: [countField('pstImgMaxCnt', '장')],
      },
      {
        label: '블라인드 신고 누적 수',
        fields: [countField('blindDclrAcmlCnt', '건')],
      },
      {
        label: '실종제보 만료 기준',
        fields: [dayField('lostTpofExpryCrtrDayCnt')],
      },
      {
        label: '펫돌봄 매칭 무응답 종료 기준',
        fields: [dayField('mtchNoRspnsEndCrtrDayCnt')],
      },
      {
        label: '최저시급 적용 연도 · 금액',
        fields: [
          { key: 'lowstHrwgAplcnYr', kind: 'year', unit: '년', maxDigits: 4 },
          { key: 'lowstHrwgAmt', kind: 'amount', maxDigits: 7 },
        ],
      },
      {
        label: '찾았어요 자동 댓글',
        hint: '[펫이름] 자리에 이름',
        fields: [{ key: 'dscvAutoCmntCn', kind: 'text' }],
      },
      {
        label: 'AI 코멘트 기본 문구',
        fields: [{ key: 'aiCmtryBscCn', kind: 'text' }],
      },
    ],
  },
  {
    title: '알림',
    resKey: 'notification',
    rows: [
      {
        label: '읽은 알림 숨김 기준',
        fields: [dayField('notiHideCrtrDayCnt')],
      },
    ],
  },
  {
    title: 'AI',
    resKey: 'ai',
    rows: [
      { label: 'AI 대화 턴 수', fields: [countField('aiCnvrsTurnCnt', '턴')] },
      { label: 'AI 토큰 상한', fields: [countField('aiTknUplmtCnt', '토큰', 6)] },
    ],
  },
  {
    title: '파일',
    resKey: 'file',
    rows: [
      {
        label: '파일 최대 크기',
        fields: [
          { key: 'fileMaxSz', kind: 'megabyte', unit: 'MB', maxDigits: 2 },
        ],
      },
    ],
  },
];

/** 전체 항목 목록 */
export const SETTING_FIELDS = SETTING_GROUPS.flatMap((group) =>
  group.rows.flatMap((row) => row.fields),
);

/** 서버 값 -> 입력칸 문자열 */
const toDraftValue = (field, value) => {
  if (value == null) return '';
  if (field.kind === 'text') return value;
  if (field.kind === 'megabyte') return String(Math.round(value / MB));
  return String(value);
};

/** 서버 설정(묶음별 객체) -> 입력칸 값 모음 */
export const toDraft = (settings) =>
  Object.fromEntries(
    SETTING_GROUPS.flatMap((group) =>
      group.rows.flatMap((row) =>
        row.fields.map((field) => [
          field.key,
          toDraftValue(field, settings[group.resKey]?.[field.key]),
        ]),
      ),
    ),
  );

/** 입력칸 문자열 -> 서버로 보낼 값 */
const toBodyValue = (field, draftValue) => {
  if (field.kind === 'text') return draftValue;
  if (field.kind === 'megabyte') return Number(draftValue) * MB;
  /** 적용 연도는 서버가 4자리 문자열로 받는다 */
  if (field.kind === 'year') return draftValue;
  return Number(draftValue);
};

/** 바뀐 항목만 담은 요청 본문(조회만 하는 항목은 뺀다) */
export const toBody = (draft, base) =>
  Object.fromEntries(
    SETTING_FIELDS.filter(
      (field) => !field.readOnly && draft[field.key] !== base[field.key],
    ).map((field) => [field.key, toBodyValue(field, draft[field.key])]),
  );
