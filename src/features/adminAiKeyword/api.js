import { DICT_USG } from './keywordLabels';

/**
 * [관리자 AI 키워드 사전 API]
 * - 백엔드 `/api/admin/ai/keywords` 없음 -> 가짜 응답
 *   - 연결 때: GET /api/admin/ai/keywords?dictUsgCd=&kwrdClsfNm=, POST /api/admin/ai/keywords,
 *     PATCH·DELETE /api/admin/ai/keywords/{kwrdDictSn}
 * - 필드 이름은 백엔드 DDL v0.12 `KWRD_DICT` 그대로
 * - 처음 값은 AI매니저 기능명세서 v0.13 부록 B(백엔드 base_data v0.12 [4]의 AIMC0037 행).
 *   판정 규칙·시간 행은 서버 규칙이라 뺐다. 가계부 분류(AIMC0038)는 초기 데이터가 없어 예시 행
 * - 새 행 sortSeq는 그 탭 맨 아래(가정)
 * - 바꾼 값은 이 탭의 sessionStorage에 두어 새로고침해도 남음(연결 때 지움)
 */

const STORAGE_KEY = 'fakeAdminAiKeywords';

const { SCHEDULE, EXPENSE } = DICT_USG;

/** [사전용도, 키워드분류명, 항목명, 키워드, 해석 결과, 연결 코드, 정렬 순서, 비고] */
const SEED = [
  [
    SCHEDULE,
    '등록 동사',
    '일정·항목 등록',
    '잡아줘, 등록해줘, 넣어줘, 추가해줘, 예약해줘, 만들어줘',
    '등록 의도',
    null,
    20,
    '어미 변형(잡아 줘·등록해 주세요 등) 포함',
  ],
  [
    SCHEDULE,
    '날짜',
    '상대 날짜',
    '오늘, 내일, 모레, 이번 주 ○요일, 다음 주 ○요일, 다음 달 ○일, ○일 후, ○요일',
    '날짜(오늘 KST 기준 계산)',
    null,
    30,
    'AI 보조 결과도 서버에서 재검증(FN-AIM-012-03) / ○요일만 쓰면 오늘부터 가장 가까운 그 요일(오늘 포함)',
  ],
  [
    SCHEDULE,
    '날짜',
    '절대 날짜',
    '○월 ○일, ○일, ○/○, YYYY-MM-DD',
    '날짜',
    null,
    40,
    "연도 생략 시: 일정은 오늘 이후 가장 가까운 날짜(지났으면 다음 해), '마지막으로 한 날'은 오늘 이전 가장 가까운 날짜",
  ],
  [
    SCHEDULE,
    '주기',
    '일상관리',
    '매일, 날마다, 하루에 한 번',
    '반복 유형 = 매일(일상관리)',
    null,
    60,
    'FN-AIM-012-07',
  ],
  [
    SCHEDULE,
    '주기',
    '정기관리',
    '매주·일주일마다(1주), 2주마다·격주(2주), 매달·한 달마다(한달), 매년·1년마다(1년), ○일마다(직접입력 n일)',
    '반복 유형 = 주기(정기관리) + 주기 값',
    null,
    70,
    'FN-HLT-003-21~24 선택지와 동일 값',
  ],
  [
    SCHEDULE,
    '주기',
    '마지막으로 한 날',
    '○일에 했어, 지난주 ○요일에 했어, 어제 했어',
    '마지막으로 한 날',
    null,
    80,
    '없으면 등록일 기준(FN-HLT-003-38)',
  ],
  [
    SCHEDULE,
    '일정 종류',
    '병원',
    '병원, 동물병원, 검진, 접종, 진료',
    '일정 종류 = 병원(HLTG19)',
    'HLTC0057',
    90,
    '병원이면 검진유형·병원명 필수',
  ],
  [
    SCHEDULE,
    '일정 종류',
    '미용·목욕',
    '미용, 목욕, 털 깎기',
    '일정 종류 = 미용·목욕',
    'HLTC0058',
    100,
    null,
  ],
  [
    SCHEDULE,
    '일정 종류',
    '케어·투약',
    '투약, 약 먹이기, 케어',
    '일정 종류 = 케어·투약',
    'HLTC0059',
    110,
    null,
  ],
  [
    SCHEDULE,
    '검진유형',
    '병원 일정',
    '정기검진·건강검진',
    '검진유형 = 정기검진(HLTG01)',
    'HLTC0001',
    120,
    '못 정하면 되물음(FN-AIM-012-05)',
  ],
  [
    SCHEDULE,
    '검진유형',
    '병원 일정',
    '예방접종·접종·백신',
    '검진유형 = 예방접종(HLTG01)',
    'HLTC0002',
    130,
    '못 정하면 되물음(FN-AIM-012-05)',
  ],
  [
    SCHEDULE,
    '검진유형',
    '병원 일정',
    '진료·아파서',
    '검진유형 = 질병진료(HLTG01)',
    'HLTC0003',
    140,
    '못 정하면 되물음(FN-AIM-012-05)',
  ],
  [
    SCHEDULE,
    '검진유형',
    '병원 일정',
    '검사',
    '검진유형 = 검사(HLTG01)',
    'HLTC0004',
    150,
    '못 정하면 되물음(FN-AIM-012-05)',
  ],
  [
    SCHEDULE,
    '검진유형',
    '병원 일정',
    '그 외',
    '검진유형 = 기타 진료(HLTG01)',
    'HLTC0005',
    160,
    '못 정하면 되물음(FN-AIM-012-05)',
  ],
  /** 가계부 분류 예시(가짜): 실제 초기 데이터는 백엔드 연결 때 */
  [
    EXPENSE,
    '가계부 카테고리',
    '사료',
    '사료, 건사료, 습식',
    '가계부 카테고리 = 사료(MYPG05)',
    'MYPC0013',
    10,
    null,
  ],
  [
    EXPENSE,
    '가계부 카테고리',
    '병원',
    '병원비, 진료비, 접종비',
    '가계부 카테고리 = 병원(MYPG05)',
    'MYPC0012',
    20,
    null,
  ],
  [
    EXPENSE,
    '가계부 카테고리',
    '간식',
    '간식, 츄르, 껌',
    '가계부 카테고리 = 간식(MYPG05)',
    'MYPC0014',
    30,
    null,
  ],
];

const seedKeywords = () =>
  SEED.map(
    (
      [
        dictUsgCd,
        kwrdClsfNm,
        artclNm,
        kwrdCn,
        intrpRsltCn,
        mpngCd,
        sortSeq,
        rmrkCn,
      ],
      index,
    ) => ({
      kwrdDictSn: index + 1,
      dictUsgCd,
      kwrdClsfNm,
      artclNm,
      kwrdCn,
      intrpRsltCn,
      mpngCd,
      sortSeq,
      rmrkCn,
      useYn: 'Y',
    }),
  );

/** 저장된 가짜 값: 없거나 읽지 못하면 처음 값 */
const loadKeywords = () => {
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {
    // 저장소를 못 쓰면 처음 값
  }
  return seedKeywords();
};

let fakeKeywords = loadKeywords();

const saveKeywords = () => {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(fakeKeywords));
  } catch {
    // 저장소를 못 쓰면 이 탭 메모리에만 남음
  }
};

const delay = () => new Promise((resolve) => setTimeout(resolve, 300));

/** 서버 오류 모양 */
const fakeError = (code, message) => ({
  code,
  message,
  fields: null,
  data: null,
});

const findKeyword = (kwrdDictSn) => {
  const target = fakeKeywords.find(
    (keyword) => keyword.kwrdDictSn === kwrdDictSn,
  );
  if (!target) {
    throw fakeError('KEYWORD_NOT_FOUND', '키워드를 찾을 수 없어요.');
  }
  return target;
};

const isSameTab = (keyword, dictUsgCd, kwrdClsfNm) =>
  keyword.dictUsgCd === dictUsgCd && keyword.kwrdClsfNm === kwrdClsfNm;

/** 키워드 목록: 용도·분류가 같은 행만, 정렬 순서·번호순 */
export const getAdminAiKeywords = async ({ dictUsgCd, kwrdClsfNm }) => {
  await delay();
  return fakeKeywords
    .filter((keyword) => isSameTab(keyword, dictUsgCd, kwrdClsfNm))
    .sort((a, b) => a.sortSeq - b.sortSeq || a.kwrdDictSn - b.kwrdDictSn)
    .map((keyword) => ({ ...keyword }));
};

/** 키워드 등록: 그 탭 맨 아래, { kwrdDictSn } */
export const createAdminAiKeyword = async (body) => {
  await delay();
  const kwrdDictSn =
    Math.max(0, ...fakeKeywords.map((keyword) => keyword.kwrdDictSn)) + 1;
  const sortSeq =
    Math.max(
      0,
      ...fakeKeywords
        .filter((keyword) =>
          isSameTab(keyword, body.dictUsgCd, body.kwrdClsfNm),
        )
        .map((keyword) => keyword.sortSeq),
    ) + 1;
  fakeKeywords = [
    ...fakeKeywords,
    { ...body, kwrdDictSn, sortSeq, useYn: 'Y' },
  ];
  saveKeywords();
  return { kwrdDictSn };
};

/** 키워드 수정: 항목명·키워드·해석 결과·연결 코드·비고 */
export const updateAdminAiKeyword = async ({ kwrdDictSn, ...body }) => {
  await delay();
  findKeyword(kwrdDictSn);
  fakeKeywords = fakeKeywords.map((keyword) =>
    keyword.kwrdDictSn === kwrdDictSn ? { ...keyword, ...body } : keyword,
  );
  saveKeywords();
  return null;
};

/** 키워드 삭제 */
export const deleteAdminAiKeyword = async (kwrdDictSn) => {
  await delay();
  findKeyword(kwrdDictSn);
  fakeKeywords = fakeKeywords.filter(
    (keyword) => keyword.kwrdDictSn !== kwrdDictSn,
  );
  saveKeywords();
  return null;
};
