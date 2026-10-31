import { PET_SE } from '@/utils/petCodes';

export {
  ALL_REGION,
  DONG_BY_REGION,
  PET_FILTERS,
  PET_SE_BY_FILTER,
  REGION_OPTIONS,
  getBreedName,
  getPetName,
  hasDong,
} from './missingCodes';

/**
 * [우리동네 펫돌봄 코드·목록]
 * - 공통코드 값(PCAG01 모집상태·PCAG02 비용단위·PCAG03 돌봄형태)과 반려견 크기 구간 값은 공통코드가 정해지기 전의 가정. 연결 때 백엔드 값으로 교체
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

export const CST_UNIT = { HOUR: 'PCAC0011', CASE: 'PCAC0012' };

export const CST_UNIT_OPTIONS = [
  { code: CST_UNIT.HOUR, name: '시급' },
  { code: CST_UNIT.CASE, name: '건당' },
];

export const PRTC_SHP_OPTIONS = [
  { code: 'PCAC0021', name: '방문돌봄' },
  { code: 'PCAC0022', name: '위탁돌봄' },
  { code: 'PCAC0023', name: '산책' },
  { code: 'PCAC0024', name: '놀이' },
  { code: 'PCAC0025', name: '훈련' },
  { code: 'PCAC0026', name: '그 외' },
];

/** 강아지 몸무게 구간(petSizeCd). 고양이는 비움 */
export const PET_SIZE_OPTIONS = [
  { code: 'PETC0101', name: '소형견', range: '10kg 미만', filter: 's' },
  { code: 'PETC0102', name: '중형견', range: '10 ~ 25kg', filter: 'm' },
  { code: 'PETC0103', name: '대형견', range: '25kg 이상', filter: 'l' },
];

export const SIZE_FILTERS = [
  { value: '', label: '전체' },
  { value: 's', label: '소형' },
  { value: 'm', label: '중형' },
  { value: 'l', label: '대형' },
];

export const SIZE_BY_FILTER = Object.fromEntries(
  PET_SIZE_OPTIONS.map((option) => [option.filter, option.code]),
);

/** 시급 최저 기준. 연 1회 관리자가 갱신하는 설정값이라 연결 때 서버 값으로 교체 */
export const MIN_HOURLY_WAGE = 10320;
export const MIN_WAGE_YEAR = 2026;
export const MIN_WAGE_MESSAGE = `최저임금을 준수해 주세요. ${MIN_WAGE_YEAR}년 최저 시급은 ${MIN_HOURLY_WAGE.toLocaleString()}원이에요.`;

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
  post.petKnds.map((kind) =>
    kind.petSeCd === PET_SE.CAT ? '고양이' : getSizeName(kind.petSizeCd),
  );
