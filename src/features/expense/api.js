import { api } from '@/api/axios';
import { getCurrentYm } from '@/utils/yearMonth';
import { EXPND_CLSF_LIST } from './shared/expenseCodes';

const [HOSPITAL] = EXPND_CLSF_LIST.map((clsf) => clsf.code);

/** 연월 범위를 서버 날짜 조건으로 (null이면 날짜 조건 없음 = 전체 기간) */
export const toDateCond = ({ fromYm, toYm }) => {
  if (!fromYm || !toYm) return {};
  const [year, month] = toYm.split('-').map(Number);
  const lastDay = new Date(year, month, 0).getDate();
  return {
    startYmd: `${fromYm}-01`,
    endYmd: `${toYm}-${String(lastDay).padStart(2, '0')}`,
  };
};

/** 값이 없는 조건은 요청에서 뺀다 */
const clean = (params) =>
  Object.fromEntries(
    Object.entries(params).filter(([, value]) => value != null),
  );

/** 월 통계 (GET /expenses/statistics) */
export const getExpenseStatistics = (yearMonth) =>
  api.get('/expenses/statistics', { params: { yearMonth } });

/**
 * 지출 목록 한 쪽 (GET /expenses)
 * cond: { startYmd, endYmd, petSn, common, expndClsfCd, sort('latest'|'amount') }
 */
export const getExpenses = ({ page = 1, size = 20, ...cond }) =>
  api.get('/expenses', { params: clean({ ...cond, page, size }) });

/** 조건별 건수·합계 (GET /expenses/totals) */
export const getExpenseTotals = (cond) =>
  api.get('/expenses/totals', { params: clean(cond) });

/** 지출이 있는 연월 (GET /expenses/months) → ['2026-11', ...] */
export const getExpenseMonths = async () => {
  const months = await api.get('/expenses/months');
  return months.map((month) => month.yearMonth);
};

/** 연동 중이거나 지출이 남은 반려동물 (GET /expenses/pets) */
export const getExpensePets = () => api.get('/expenses/pets');

/** 월 한도 저장 (PUT /members/me/expense-limit) */
export const saveExpenseLimit = (mmExpndLimAmt) =>
  api.put('/members/me/expense-limit', { mmExpndLimAmt });

/** 지출 단건 삭제 (DELETE /expenses/{expndSn}) */
export const deleteExpense = (expndSn) => api.delete(`/expenses/${expndSn}`);

/** 선택 지출 삭제 (DELETE /expenses?expndSn=1&expndSn=2) */
export const deleteExpenses = (expndSns) =>
  api.delete('/expenses', {
    params: { expndSn: expndSns },
    paramsSerializer: { indexes: null },
  });

/** 조회 조건 전체 삭제 (POST /expenses/bulk-delete), excludeExpndSn: 전체 선택 뒤 해제한 번호 */
export const bulkDeleteExpenses = ({ expectedCnt, excludeExpndSn, ...cond }) =>
  api.post('/expenses/bulk-delete', {
    expectedCnt,
    excludeExpndSn,
    ...clean(cond),
  });

/**
 * 등록·중복 확인 요청 본문
 * items: 같은 날짜·카테고리·사용처·내용·입력방식·영수증의 줄들(첫 줄 기준)
 * idmptDmndId는 저장을 누를 때 한 번 만들어 중복 확인 뒤 저장에도 같이 쓴다
 */
export const toCreateRequest = (items) => {
  const first = items[0];
  return {
    expndYmd: first.expndYmd,
    expndClsfCd: first.expndClsfCd,
    dtlMttr: first.dtlMttr,
    expndPlcusNm: first.expndPlcusNm,
    recptSn: first.recptSn ?? null,
    expndInptMthCd: first.expndInptMthCd,
    lines: items.map((item) => ({
      petSn: item.petSn,
      expndAmt: item.expndAmt,
      idmptDmndId: crypto.randomUUID(),
    })),
  };
};

/** 지출 등록 (POST /expenses) */
export const createExpenses = (request) => api.post('/expenses', request);

/** 저장 전 중복 확인 (POST /expenses/duplicate-check) */
export const findDuplicateExpenses = (request) =>
  api.post('/expenses/duplicate-check', request);

/** 지출 수정 (PATCH /expenses/{expndSn}), 공용은 petSn null + common true */
export const updateExpense = ({ expndSn, petSn, ...item }) =>
  api.patch(`/expenses/${expndSn}`, {
    ...item,
    ...(petSn == null ? { common: true } : { petSn }),
  });

/**
 * 영수증 인식 (POST /receipts/recognize)
 * 가짜 응답: YAY·LJS 영수증 인식 API가 나오면 교체. 파일 이름의 fail·partial·error에 따른 실패 상황
 */
export const recognizeReceipt = ({ file, signal }) =>
  new Promise((resolve, reject) => {
    const abort = () => reject(new DOMException('중단', 'AbortError'));
    if (signal.aborted) return abort();
    const timer = setTimeout(() => {
      if (file.name.includes('error')) return reject(new Error('일시 오류'));
      const recptSn = Date.now();
      if (file.name.includes('fail')) {
        return resolve({
          recptSn,
          expndYmd: null,
          expndAmt: null,
          dtlMttr: null,
          expndPlcusNm: null,
          expndClsfCd: null,
        });
      }
      resolve({
        recptSn,
        expndYmd: `${getCurrentYm()}-03`,
        expndAmt: file.name.includes('partial') ? null : 462000,
        dtlMttr: null,
        expndPlcusNm: '행복동물병원',
        expndClsfCd: HOSPITAL,
      });
    }, 1500);
    signal.addEventListener('abort', () => {
      clearTimeout(timer);
      abort();
    });
  });
