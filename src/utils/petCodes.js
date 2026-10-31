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
  PARTI: { code: 'PETC0011', name: '파티' },
  BRINDLE: { code: 'PETC0012', name: '브린들' },
  TRICOLOR: { code: 'PETC0013', name: '삼색' },
  MACKEREL: { code: 'PETC0014', name: '고등어' },
  CHEESE: { code: 'PETC0015', name: '치즈' },
  TUXEDO: { code: 'PETC0016', name: '턱시도' },
  DRCT_INPT: { code: COLR_DRCT_INPT, name: '직접 입력' },
};

export const COLR_OPTIONS = {
  [PET_SE.DOG]: [
    COLR.WHITE,
    COLR.CREAM,
    COLR.BROWN,
    COLR.BLACK,
    COLR.GRAY,
    COLR.BLACK_TAN,
    COLR.PARTI,
    COLR.TRICOLOR,
    COLR.BRINDLE,
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
    COLR.TRICOLOR,
    COLR.DRCT_INPT,
  ],
};

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

/** 양육 역할: 주양육자(PCG)·공동양육자(CCG) (PETG05, 공통코드 생기면 값 맞춤) */
export const CGVR_ROLE = {
  PCG: 'PCG',
  CCG: 'CCG',
};

/** 캐릭터 상태 (캐릭터 API LJS, 공통코드 생기면 값 맞춤) */
export const CHRC_STTS = {
  NONE: 'NONE',
  GENERATING: 'GENERATING',
  DONE: 'DONE',
  ERROR: 'ERROR',
};

/** 캐릭터 아이템 부위: 머리·얼굴·목·의상·가방 (공통코드 생기면 값 맞춤) */
export const ITEM_PART = {
  HEAD: 'HEAD',
  FACE: 'FACE',
  NECK: 'NECK',
  CLOTHES: 'CLOTHES',
  BAG: 'BAG',
};

/** 보관함 탭 순서 */
export const ITEM_PART_OPTIONS = [
  { code: ITEM_PART.HEAD, name: '머리' },
  { code: ITEM_PART.FACE, name: '얼굴' },
  { code: ITEM_PART.NECK, name: '목' },
  { code: ITEM_PART.CLOTHES, name: '의상' },
  { code: ITEM_PART.BAG, name: '가방' },
];
