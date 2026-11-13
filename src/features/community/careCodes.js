import { PET_SE } from '@/utils/petCodes';

export {
  ALL_REGION,
  PET_FILTERS,
  PET_SE_BY_FILTER,
  getBreedName,
  getPetName,
} from './missingCodes';

/**
 * [우리동네 펫돌봄 코드·목록]
 * - 공통코드 값(PCAG01 모집상태·PCAG02 비용단위·PCAG03 돌봄형태)과 반려견 크기(SMALL·MEDIUM·LARGE)는 백엔드 값
 */
export const RCRT_STTS = {
  OPEN: 'PCAC0001',
  MATCHED: 'PCAC0002',
  DONE: 'PCAC0003',
};

export const RCRT_STTS_LABEL = {
  [RCRT_STTS.OPEN]: '모집중',
  [RCRT_STTS.MATCHED]: '매칭완료',
  [RCRT_STTS.DONE]: '거래완료',
};

export const STATUS_TABS = [
  { value: '', label: '전체' },
  { value: 'open', label: '모집중' },
];

/** URL ?stts= 값 → 서버에 보낼 상태 코드 */
export const STTS_BY_TAB = { open: RCRT_STTS.OPEN };

export const CST_UNIT = { HOUR: 'PCAC0004', CASE: 'PCAC0005' };

export const CST_UNIT_OPTIONS = [
  { code: CST_UNIT.HOUR, name: '시급' },
  { code: CST_UNIT.CASE, name: '건당' },
];

export const PRTC_SHP_OPTIONS = [
  { code: 'PCAC0006', name: '방문돌봄' },
  { code: 'PCAC0007', name: '위탁돌봄' },
  { code: 'PCAC0008', name: '산책' },
  { code: 'PCAC0009', name: '놀이' },
  { code: 'PCAC0010', name: '훈련' },
  { code: 'PCAC0011', name: '기타' },
];

/** 강아지 몸무게 구간(petSizeCd). 고양이는 비움 */
export const PET_SIZE_OPTIONS = [
  { code: 'SMALL', name: '소형견', range: '10kg 미만', filter: 's' },
  { code: 'MEDIUM', name: '중형견', range: '10 ~ 25kg', filter: 'm' },
  { code: 'LARGE', name: '대형견', range: '25kg 이상', filter: 'l' },
];

export const SIZE_FILTERS = [
  { value: '', label: '전체' },
  { value: 's', label: '소형견' },
  { value: 'm', label: '중형견' },
  { value: 'l', label: '대형견' },
];

export const SIZE_BY_FILTER = Object.fromEntries(
  PET_SIZE_OPTIONS.map((option) => [option.filter, option.code]),
);

/** 서버가 시급이 최저시급보다 적다고 거절할 때의 오류 코드 */
export const MIN_WAGE_ERROR_CODE = 'CARE_MIN_WAGE_NOT_MET';

/** 시급 미달 문구. 연도·금액은 관리자 설정값(GET /care-recruitments/minimum-wage) */
export const minWageMessage = ({ lowstHrwgAplcnYr, lowstHrwgAmt }) =>
  `최저임금을 준수해 주세요. ${lowstHrwgAplcnYr}년 최저 시급은 ${lowstHrwgAmt.toLocaleString()}원이에요.`;

export const isOpen = (post) => post.rcrtSttsCd === RCRT_STTS.OPEN;

export const getShapeName = (code) =>
  PRTC_SHP_OPTIONS.find((option) => option.code === code)?.name ?? '';

export const getSizeName = (petSizeCd) =>
  PET_SIZE_OPTIONS.find((option) => option.code === petSizeCd)?.name ?? '';

/** 「시급 15,000원」 */
export const getCostLabel = (post) =>
  `${post.cstUnitCd === CST_UNIT.HOUR ? '시급' : '건당'} ${post.cstAmt.toLocaleString()}원`;

/** 카드·상세 배지용: 돌봄 형태 이름들과 크기(강아지) · 고양이 */
export const getPetBadges = (post) =>
  post.pets.map((kind) =>
    kind.petSeCd === PET_SE.CAT ? '고양이' : getSizeName(kind.petSizeCd),
  );
