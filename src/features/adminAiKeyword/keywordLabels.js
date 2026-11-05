/** 사전용도 공통코드(AIMG10) */
export const DICT_USG = {
  SCHEDULE: 'AIMC0037',
  EXPENSE: 'AIMC0038',
};

/**
 * 탭: 사전용도(dictUsgCd) + 키워드분류명(kwrdClsfNm) 한 묶음
 * - kwrdClsfNm은 기초 데이터에 저장된 값 그대로, label·hint는 화면 표시만
 * - codeGroup이 있으면 결과가 코드인 용도: 연결 코드(mpngCd)를 고른다
 * - 판정 규칙·시간 행은 서버 규칙이라 탭에 두지 않는다
 */
export const KEYWORD_TABS = [
  {
    key: 'verb',
    kwrdClsfNm: '등록 동사',
    label: '등록 표현',
    hint: '예: 잡아줘, 등록해줘',
    dictUsgCd: DICT_USG.SCHEDULE,
  },
  {
    key: 'date',
    kwrdClsfNm: '날짜',
    label: '날짜 표현',
    hint: '예: 오늘, 내일, 다음 주 ○요일',
    dictUsgCd: DICT_USG.SCHEDULE,
  },
  {
    key: 'cycle',
    kwrdClsfNm: '주기',
    label: '반복 표현',
    hint: '예: 매일, 매주, 2주마다',
    dictUsgCd: DICT_USG.SCHEDULE,
  },
  {
    key: 'schedule',
    kwrdClsfNm: '일정 종류',
    label: '일정 종류',
    hint: '예: 동물병원, 목욕, 투약',
    dictUsgCd: DICT_USG.SCHEDULE,
    codeGroup: 'HLTG19',
    codes: [
      { value: 'HLTC0057', label: '병원' },
      { value: 'HLTC0058', label: '미용·목욕' },
      { value: 'HLTC0059', label: '케어·투약' },
    ],
  },
  {
    key: 'checkup',
    kwrdClsfNm: '검진유형',
    label: '검진 종류',
    hint: '예: 건강검진, 예방접종, 진료',
    dictUsgCd: DICT_USG.SCHEDULE,
    codeGroup: 'HLTG01',
    codes: [
      { value: 'HLTC0001', label: '정기검진' },
      { value: 'HLTC0002', label: '예방접종' },
      { value: 'HLTC0003', label: '질병진료' },
      { value: 'HLTC0004', label: '검사' },
      { value: 'HLTC0005', label: '기타 진료' },
    ],
  },
  {
    key: 'expense',
    kwrdClsfNm: '가계부 카테고리',
    label: '가계부 분류',
    hint: '예: 사료, 병원비, 간식',
    dictUsgCd: DICT_USG.EXPENSE,
    codeGroup: 'MYPG05',
    codes: [
      { value: 'MYPC0012', label: '병원' },
      { value: 'MYPC0013', label: '사료' },
      { value: 'MYPC0014', label: '간식' },
      { value: 'MYPC0015', label: '용품' },
      { value: 'MYPC0016', label: '미용' },
      { value: 'MYPC0017', label: '돌봄' },
      { value: 'MYPC0018', label: '기타' },
    ],
  },
];

export const DEFAULT_TAB_KEY = KEYWORD_TABS[0].key;

/** ?tab= 값의 탭: 모르면 첫 탭 */
export const findKeywordTab = (key) =>
  KEYWORD_TABS.find((tab) => tab.key === key) ?? KEYWORD_TABS[0];

/** 탭의 연결 코드 이름: 모르면 null */
export const codeLabel = (tab, mpngCd) =>
  tab.codes?.find((code) => code.value === mpngCd)?.label ?? null;

/** 결과가 코드인 탭의 해석 결과: 기초 데이터와 같은 꼴 "일정 종류 = 병원(HLTG19)" */
export const codeResult = (tab, mpngCd) =>
  `${tab.kwrdClsfNm} = ${codeLabel(tab, mpngCd)}(${tab.codeGroup})`;

/** 칸 글자 수: 백엔드 DDL KWRD_DICT 컬럼 길이 */
export const ARTCL_NM_MAX = 100;
export const KWRD_CN_MAX = 1000;
export const INTRP_RSLT_CN_MAX = 500;
export const RMRK_CN_MAX = 1000;

/** 키워드 저장 형식: 쉼표로 나눈 한 줄(기초 데이터와 같다) */
export const splitKeywords = (kwrdCn) =>
  (kwrdCn ?? '')
    .split(',')
    .map((keyword) => keyword.trim())
    .filter(Boolean);
