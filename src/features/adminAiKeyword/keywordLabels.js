/** 사전용도 공통코드(AIMG10) */
export const DICT_USG = {
  SCHEDULE: 'AIMC0037',
  EXPENSE: 'AIMC0038',
};

/**
 * 탭: 사전용도(dictUsgCd) + 키워드분류명(kwrdClsfNm) 한 묶음
 * - codeGroup이 있으면 결과가 코드인 용도: 연결 코드(mpngCd)를 고른다
 * - 판정 규칙·시간 행은 서버 규칙이라 탭에 두지 않는다
 */
export const KEYWORD_TABS = [
  { key: 'verb', label: '등록 동사', dictUsgCd: DICT_USG.SCHEDULE },
  { key: 'date', label: '날짜', dictUsgCd: DICT_USG.SCHEDULE },
  { key: 'cycle', label: '주기', dictUsgCd: DICT_USG.SCHEDULE },
  {
    key: 'schedule',
    label: '일정 종류',
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
    label: '검진유형',
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
    label: '가계부 카테고리',
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
  `${tab.label} = ${codeLabel(tab, mpngCd)}(${tab.codeGroup})`;

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
