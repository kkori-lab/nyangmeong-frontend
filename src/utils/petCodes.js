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

/** 목록 순서는 기능명세서 FN-MYP-003-03. 얼룩(PETC0011)은 화면설계서 v0.9에서 강아지 목록에서 빠졌다(이름 조회용으로 COLR에만 남김) */
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

/**
 * 털색 목록의 보조 설명(화면 표시용). 서버로 보내는 값이 아니다.
 * 종마다 같은 털색도 설명이 다를 수 있어 종 → 코드 순으로 둔다. 없으면 이름만 보인다
 */
const COLR_DESC = {
  [PET_SE.DOG]: {
    [COLR.CREAM.code]: '연한 베이지',
    [COLR.BROWN.code]: '초콜릿·적갈색 (레드 포함)',
    [COLR.TAN.code]: '누런 황갈색 (황구 등)',
    [COLR.BLACK_TAN.code]: '검정 바탕에 눈썹·주둥이·다리만 황갈색',
    [COLR.PARTI.code]: '흰색과 다른 한 가지 색이 섞임',
    [COLR.TRICOLOR.code]: '검정·흰색·황갈색',
    [COLR.SABLE.code]: '갈색 털끝이 검게 물든 색',
    [COLR.BRINDLE.code]: '호랑이 같은 어두운 줄무늬',
    [COLR.MERLE.code]: '회색·갈색 바탕에 진한 얼룩이 흩어짐',
  },
  [PET_SE.CAT]: {
    [COLR.CREAM.code]: '연한 베이지',
    [COLR.CHEESE.code]: '노란·주황색 (흰색 섞여도 포함)',
    [COLR.MACKEREL.code]: '회갈색 바탕에 검은 줄무늬',
    [COLR.TUXEDO.code]: '검정 바탕에 가슴·발만 흰색',
    [COLR.COW.code]: '흰 바탕에 검은 얼룩',
    [COLR.TRICOLOR.code]: '흰색·검정·주황 얼룩',
    [COLR.CHAOS.code]: '검정·주황이 섞임, 흰색 거의 없음',
    [COLR.POINT.code]: '얼굴·귀·발·꼬리만 진한 색 (샴·렉돌 등)',
  },
};

export const getColrDesc = (petSeCd, colrCd) =>
  COLR_DESC[petSeCd]?.[colrCd] ?? '';

/** 털색 칸 아래 안내 문구. 모바일(760px 이하)은 목록 설명이 대신해 보이지 않는다 */
export const COLR_GUIDE = {
  [PET_SE.DOG]:
    '두 가지 이상 색이 섞여 있으면 블랙탄·파티처럼 무늬 이름으로 골라 주세요. 목록에 없으면 맨 아래 [직접 입력]을 골라 주세요.',
  [PET_SE.CAT]:
    '무늬가 있으면 고등어·턱시도처럼 무늬 이름으로 골라 주세요. 목록에 없으면 맨 아래 [직접 입력]을 골라 주세요.',
};

/** 털색에서 [직접 입력]을 골랐을 때 안내 문구(모바일은 보이지 않음) */
export const COLR_GUIDE_DRCT = '목록에 없는 털색을 적어 주세요';

/** 털색 [직접 입력] 칸 placeholder */
export const COLR_DRCT_PLACEHOLDER = {
  [PET_SE.DOG]: '예: 블루, 레드 세이블',
  [PET_SE.CAT]: '예: 실버 태비, 씰 바이컬러',
};

/** 종과 상관없이 털색 코드로 이름 찾기 (종에 맞지 않는 값도 이름은 보여 주기 위함) */
export const findColrName = (code) =>
  Object.values(COLR).find((colr) => colr.code === code)?.name ?? '';

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
