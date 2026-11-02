/** 공통코드 값: 백엔드 db/..._insert_com_cd_*.sql 과 일치 */

/** MYPG05 가계부카테고리 */
export const EXPND_CLSF_LIST = [
  {
    code: 'MYPC0012',
    name: '병원',
    badge: 'bg-cat-hosp-bg text-cat-hosp-fg',
    color: 'var(--color-cat-hosp)',
  },
  {
    code: 'MYPC0013',
    name: '사료',
    badge: 'bg-cat-food-bg text-cat-food-fg',
    color: 'var(--color-cat-food)',
  },
  {
    code: 'MYPC0014',
    name: '간식',
    badge: 'bg-cat-snack-bg text-cat-snack-fg',
    color: 'var(--color-cat-snack)',
  },
  {
    code: 'MYPC0015',
    name: '용품',
    badge: 'bg-cat-goods-bg text-cat-goods-fg',
    color: 'var(--color-cat-goods)',
  },
  {
    code: 'MYPC0016',
    name: '미용',
    badge: 'bg-cat-beauty-bg text-cat-beauty-fg',
    color: 'var(--color-cat-beauty)',
  },
  {
    code: 'MYPC0017',
    name: '돌봄',
    badge: 'bg-cat-care-bg text-cat-care-fg',
    color: 'var(--color-cat-care)',
  },
  {
    code: 'MYPC0018',
    name: '기타',
    badge: 'bg-cat-etc-bg text-cat-etc-fg',
    color: 'var(--color-cat-etc)',
  },
];

/** 병원 카테고리 공용 등록 불가 */
export const HOSPITAL_CLSF_CD = EXPND_CLSF_LIST[0].code;

export const ETC_CLSF_CD = EXPND_CLSF_LIST[6].code;

export const EXPND_CLSF = Object.fromEntries(
  EXPND_CLSF_LIST.map((clsf) => [clsf.code, clsf]),
);

/** MYPG06 가계부입력방식 */
export const EXPND_INPT_MTH = {
  DIRECT: 'MYPC0019',
  OCR: 'MYPC0020',
};

export const FILTER_ALL = 'ALL';
export const FILTER_SHARED = 'SHARED';

export const SORT = {
  LATEST: 'LATEST',
  AMOUNT: 'AMOUNT',
};

export const RANGE_MODE = {
  MONTH: 'MONTH',
  PERIOD: 'PERIOD',
  ALL: 'ALL',
};

export const PAGE_SIZE = 20;

/** 앱 무한 스크롤 불러오기 상태 */
export const LOAD = { IDLE: 'idle', LOADING: 'loading', ERROR: 'error' };
