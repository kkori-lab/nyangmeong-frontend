/**
 * [반려동물 공통코드]
 * - 백엔드 db/..._insert_com_cd_*.sql 값과 일치
 */

/** PETG01 반려동물구분 */
export const PET_SE = {
  DOG: 'PETC0001',
  CAT: 'PETC0002',
};

export const PET_SE_OPTIONS = [
  { code: PET_SE.DOG, name: '강아지' },
  { code: PET_SE.CAT, name: '고양이' },
];

/** PETG02 반려동물성별 */
export const PET_GNDR_OPTIONS = [
  { code: 'PETC0003', name: '수컷' },
  { code: 'PETC0004', name: '암컷' },
];

/** PETG03 털색 (종류별 목록 분리) */
export const COLR_DRCT_INPT = 'PETC0017';

const COLR = {
  BLACK: { code: 'PETC0005', name: '검정' },
  WHITE: { code: 'PETC0006', name: '흰색' },
  BROWN: { code: 'PETC0007', name: '갈색' },
  CREAM: { code: 'PETC0008', name: '크림' },
  GRAY: { code: 'PETC0009', name: '회색' },
  BLACK_TAN: { code: 'PETC0010', name: '블랙탄' },
  SPOTTED: { code: 'PETC0011', name: '얼룩' },
  BRINDLE: { code: 'PETC0012', name: '브린들' },
  TRICOLOR: { code: 'PETC0013', name: '삼색' },
  MACKEREL: { code: 'PETC0014', name: '고등어' },
  CHEESE: { code: 'PETC0015', name: '치즈' },
  TUXEDO: { code: 'PETC0016', name: '턱시도' },
  TAN: { code: 'PETC0028', name: '황색' },
  PARTI: { code: 'PETC0029', name: '파티' },
  SABLE: { code: 'PETC0030', name: '세이블' },
  MERLE: { code: 'PETC0031', name: '멀' },
  COW: { code: 'PETC0032', name: '젖소' },
  CHAOS: { code: 'PETC0033', name: '카오스' },
  POINT: { code: 'PETC0034', name: '포인트' },
  DRCT_INPT: { code: COLR_DRCT_INPT, name: '직접 입력' },
};

/** 목록 순서는 기능명세서 FN-MYP-003-03. 얼룩은 기존 데이터(PETC0011) 때문에 파티 뒤에 남긴다 */
export const COLR_OPTIONS = {
  [PET_SE.DOG]: [
    COLR.WHITE,
    COLR.CREAM,
    COLR.BROWN,
    COLR.TAN,
    COLR.BLACK,
    COLR.GRAY,
    COLR.BLACK_TAN,
    COLR.PARTI,
    COLR.SPOTTED,
    COLR.TRICOLOR,
    COLR.SABLE,
    COLR.BRINDLE,
    COLR.MERLE,
    COLR.DRCT_INPT,
  ],
  [PET_SE.CAT]: [
    COLR.BLACK,
    COLR.WHITE,
    COLR.GRAY,
    COLR.BROWN,
    COLR.CREAM,
    COLR.CHEESE,
    COLR.MACKEREL,
    COLR.TUXEDO,
    COLR.COW,
    COLR.TRICOLOR,
    COLR.CHAOS,
    COLR.POINT,
    COLR.DRCT_INPT,
  ],
};

/** 종과 상관없이 털색 코드로 이름 찾기 (종에 맞지 않는 값도 이름은 보여 주기 위함) */
export const findColrName = (code) =>
  Object.values(COLR).find((colr) => colr.code === code)?.name ?? '';

/** 주양육 동물 등록 상한 */
export const MAX_OWN_PETS = 10;

/** 주양육·공동양육 구분 (공통코드 생기면 값 맞춤) */
export const PET_REL = {
  OWNER: 'OWNER',
  CO_PARENT: 'CO_PARENT',
};

/** PETG05 양육 역할 (반려동물 API의 brupRoleCd) */
export const BRUP_ROLE = {
  PRIMARY: 'PETC0018',
  CO_PARENT: 'PETC0019',
};

/** 반려동물 1마리에 연동할 수 있는 공동양육자 최대 인원 */
export const MAX_CAREGIVERS = 5;

/** 캐릭터 상태 (캐릭터 API LJS, 공통코드 생기면 값 맞춤) */
export const CHRC_STTS = {
  NONE: 'NONE',
  GENERATING: 'GENERATING',
  DONE: 'DONE',
  ERROR: 'ERROR',
};

/** 캐릭터 생성 작업 상태 (CHRG01, `GET /pixel-characters`의 crtJobSttsCd) */
export const CRT_JOB_STTS = {
  REQUESTED: 'CHRC0001',
  GENERATING: 'CHRC0002',
  DONE: 'CHRC0003',
  FAILED: 'CHRC0004',
};

/** 캐릭터 아이템 부위(MYPG01): 머리·얼굴·목·의상·가방 */
export const ITEM_PART = {
  HEAD: 'MYPC0001',
  FACE: 'MYPC0002',
  NECK: 'MYPC0003',
  CLOTHES: 'MYPC0004',
  BAG: 'MYPC0005',
};

/** 보관함 탭 순서 */
export const ITEM_PART_OPTIONS = [
  { code: ITEM_PART.HEAD, name: '머리' },
  { code: ITEM_PART.FACE, name: '얼굴' },
  { code: ITEM_PART.NECK, name: '목' },
  { code: ITEM_PART.CLOTHES, name: '의상' },
  { code: ITEM_PART.BAG, name: '가방' },
];
