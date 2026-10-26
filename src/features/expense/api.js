import { getCurrentYm, shiftYm } from '@/utils/yearMonth';
import { EXPND_CLSF_LIST, PET_STTS } from './shared/expenseCodes';

/**
 * [가계부 가짜 API]
 * - SJM 백엔드 API 나오기 전까지 사용 -> 나오면 본문만 api 요청으로 교체
 * - 미확정 키: petNm·petStts·mmExpndLimAmt·pets·expndMonths·rcptSn·영수증 인식 결과 키·사용처(EXPND_PLACE_KEY)
 */

/**
 * 사용처 서버 필드명 (키는 확정, 지출 API·DB에는 아직 없음)
 * TODO: 서버에 사용처가 생기면 키를 확정하고 toRequestItem이 사용처를 빼는 부분을 풀어 요청에 넣는다
 */
export const EXPND_PLACE_KEY = 'expndPlcusNm';

/** 서버 요청 본문: 지금은 사용처를 보내지 않는다 (가짜 응답만 사용처를 저장해 화면에 남긴다) */
const toRequestItem = (item) => {
  const request = { ...item };
  delete request[EXPND_PLACE_KEY];
  return request;
};
const [HOSPITAL, FEED, SNACK, SUPPLY, GROOM, CARE, ETC] = EXPND_CLSF_LIST.map(
  (clsf) => clsf.code,
);

const fakePets = [
  { petSn: 1, petNm: '초코', petStts: PET_STTS.ACTIVE },
  { petSn: 2, petNm: '나비', petStts: PET_STTS.ACTIVE },
  { petSn: 3, petNm: '보리', petStts: PET_STTS.ACTIVE },
  { petSn: 4, petNm: '두부', petStts: PET_STTS.ACTIVE },
  { petSn: 5, petNm: '치즈', petStts: PET_STTS.ACTIVE },
  { petSn: 6, petNm: '콩이', petStts: PET_STTS.ACTIVE },
  { petSn: 7, petNm: '하루', petStts: PET_STTS.UNLINKED },
  { petSn: 8, petNm: '모리', petStts: PET_STTS.DELETED },
];

/** [일, petSn(null은 공용), 카테고리, 금액, 내용, 사용처] 템플릿 */
const TEMPLATE = [
  [1, 1, FEED, 38000, '연어 사료 5kg', '펫프렌즈'],
  [2, null, SUPPLY, 21000, '배변패드 대용량'],
  [3, 1, HOSPITAL, 120000, '정기 검진', '행복동물병원'],
  [4, 2, SNACK, 9000, '츄르 20개입'],
  [5, 7, HOSPITAL, 45000, '예방접종', '24시 연세동물병원'],
  [7, null, FEED, 32000, '습식 사료 묶음'],
  [8, 4, SNACK, 6500, '동결건조 간식'],
  [9, 8, CARE, 30000, '산책 대행'],
  [10, 2, SUPPLY, 15000, '캣타워 쿠션'],
  [12, 4, SNACK, 8500, '덴탈껌'],
  [13, 3, GROOM, 40000, '목욕 · 위생미용'],
  [14, 6, SUPPLY, 12000, '하네스'],
  [15, 1, GROOM, 45000, '부분 미용', '애견미용실'],
  [15, 2, SNACK, 12000, '츄르 30개입'],
  [17, 5, FEED, 29000, '고양이 사료 3kg'],
  [18, 6, ETC, 7000, '펫 보험료'],
  [19, 2, SUPPLY, 23000, '고양이 모래', '쿠팡'],
  [20, 3, HOSPITAL, 52000, '피부 진료', '행복동물병원'],
  [21, 4, CARE, 25000, '방문 돌봄'],
  [22, null, SUPPLY, 18000, '물그릇 세트'],
  [24, 1, CARE, 60000, '정기 돌봄 서비스'],
  [25, 5, SNACK, 4500, '고양이 간식'],
  [26, 6, FEED, 27000, '소형견 사료'],
  [28, 3, ETC, 11000, '이름표 제작'],
];

/** 월별 지출 건수 */
const MONTH_PLANS = [
  { offset: 0, rows: TEMPLATE, rate: 1 },
  { offset: -1, rows: TEMPLATE.slice(0, 12), rate: 0.9 },
  { offset: -2, rows: TEMPLATE.slice(0, 6), rate: 1.1 },
  { offset: -5, rows: TEMPLATE.slice(2, 4), rate: 1 },
];

const buildFakeExpenses = () => {
  const currentYm = getCurrentYm();
  let expndSn = 0;
  return MONTH_PLANS.flatMap(({ offset, rows, rate }) =>
    rows.map(([day, petSn, expndClsfCd, amt, dtlMttr, place = '']) => {
      const pet = fakePets.find((p) => p.petSn === petSn);
      expndSn += 1;
      return {
        expndSn,
        petSn,
        petNm: pet?.petNm ?? null,
        petStts: pet?.petStts ?? null,
        expndClsfCd,
        expndAmt: Math.round((amt * rate) / 500) * 500,
        dtlMttr,
        [EXPND_PLACE_KEY]: place,
        expndYmd: `${shiftYm(currentYm, offset)}-${String(day).padStart(2, '0')}`,
      };
    }),
  );
};

let fakeExpenses = buildFakeExpenses();
/** 한도 미설정 초기 상태 */
let fakeLimit = null;

const fakeDelay = (data) =>
  new Promise((resolve) => setTimeout(() => resolve(data), 200));

/** 기간별 지출 목록 조회 (GET /expenses) */
export const getExpenses = ({ fromYm, toYm }) =>
  fakeDelay(
    fakeExpenses.filter((expense) => {
      const ym = expense.expndYmd.slice(0, 7);
      return (!fromYm || ym >= fromYm) && (!toYm || ym <= toYm);
    }),
  );

/** 월 한도·연동 동물·지출 연월 조회 (GET /expenses/overview) */
export const getExpenseOverview = () =>
  fakeDelay({
    mmExpndLimAmt: fakeLimit,
    pets: fakePets,
    expndMonths: [
      ...new Set(fakeExpenses.map((expense) => expense.expndYmd.slice(0, 7))),
    ].sort(),
  });

/** 월 한도 저장 (PUT /expenses/limit) */
export const saveExpenseLimit = (mmExpndLimAmt) => {
  fakeLimit = mmExpndLimAmt;
  return fakeDelay(null);
};

/** 지출 단건 삭제 (DELETE /expenses/{expndSn}) */
export const deleteExpense = (expndSn) => {
  fakeExpenses = fakeExpenses.filter((expense) => expense.expndSn !== expndSn);
  return fakeDelay(null);
};

/** 선택 지출 일괄 삭제 (DELETE /expenses) */
export const deleteExpenses = (expndSns) => {
  fakeExpenses = fakeExpenses.filter(
    (expense) => !expndSns.includes(expense.expndSn),
  );
  return fakeDelay(null);
};

const findFakePet = (petSn) => fakePets.find((pet) => pet.petSn === petSn);

/** 지출 등록 (POST /expenses) */
export const createExpenses = (items) => {
  const maxSn = Math.max(0, ...fakeExpenses.map((expense) => expense.expndSn));
  fakeExpenses = [
    ...fakeExpenses,
    ...items.map((item, index) => ({
      ...toRequestItem(item),
      [EXPND_PLACE_KEY]: item[EXPND_PLACE_KEY] ?? '',
      expndSn: maxSn + index + 1,
      petNm: findFakePet(item.petSn)?.petNm ?? null,
      petStts: findFakePet(item.petSn)?.petStts ?? null,
    })),
  ];
  return fakeDelay(null);
};

/** 지출 수정 (PUT /expenses/{expndSn}) */
export const updateExpense = ({ expndSn, ...item }) => {
  fakeExpenses = fakeExpenses.map((expense) =>
    expense.expndSn === expndSn
      ? {
          ...expense,
          ...toRequestItem(item),
          [EXPND_PLACE_KEY]: item[EXPND_PLACE_KEY] ?? '',
          petNm: findFakePet(item.petSn)?.petNm ?? null,
          petStts: findFakePet(item.petSn)?.petStts ?? null,
        }
      : expense,
  );
  return fakeDelay(null);
};

/** 중복 지출 조회 (POST /expenses/duplicates) */
export const findDuplicateExpenses = (items) =>
  fakeDelay(
    fakeExpenses.filter((expense) =>
      items
        .map(toRequestItem)
        .some(
          (item) =>
            item.petSn === expense.petSn &&
            item.expndYmd === expense.expndYmd &&
            item.expndAmt === expense.expndAmt &&
            item.expndClsfCd === expense.expndClsfCd,
        ),
    ),
  );

/** 영수증 인식 (POST /receipts/recognize) */
/** 가짜 응답: 파일 이름의 fail·partial·error에 따른 실패 상황 */
export const recognizeReceipt = ({ file, signal }) =>
  new Promise((resolve, reject) => {
    const abort = () => reject(new DOMException('중단', 'AbortError'));
    if (signal.aborted) return abort();
    const timer = setTimeout(() => {
      if (file.name.includes('error')) return reject(new Error('일시 오류'));
      const rcptSn = Date.now();
      if (file.name.includes('fail')) {
        return resolve({
          rcptSn,
          expndYmd: null,
          expndAmt: null,
          dtlMttr: null,
          [EXPND_PLACE_KEY]: null,
          expndClsfCd: null,
        });
      }
      resolve({
        rcptSn,
        expndYmd: `${getCurrentYm()}-03`,
        expndAmt: file.name.includes('partial') ? null : 462000,
        dtlMttr: null,
        [EXPND_PLACE_KEY]: '행복동물병원',
        expndClsfCd: HOSPITAL,
      });
    }, 1500);
    signal.addEventListener('abort', () => {
      clearTimeout(timer);
      abort();
    });
  });
