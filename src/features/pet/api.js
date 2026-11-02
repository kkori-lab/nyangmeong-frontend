import { api } from '@/api/axios';
import { CHRC_STTS, ITEM_PART, PET_REL, PET_SE } from './shared/petCodes';

/**
 * [반려동물 API]
 * - 목록·상세·등록·수정·대표 지정·품종은 실제 API, 그 밖(캐릭터·상점)은 아직 가짜 응답
 * - 가짜 응답은 나오면 본문만 api 요청으로 교체
 * - 캐릭터 미정 키: chrcSttsCd, chrcImgUrl, inqryRcptYn
 */
const basePet = {
  vrtySn: null,
  vrtyNm: null,
  vrtyDrctInptNm: null,
  chipNo: null,
  nutrYn: 'N',
  goalBdwg: null,
  colrDrctInptNm: null,
  chrcCn: null,
  algyCn: null,
  dssCn: null,
  lastBdwgRcd: null,
  rprsYn: 'N',
  petRelCd: PET_REL.OWNER,
  chrcSttsCd: CHRC_STTS.NONE,
  chrcImgUrl: null,
  inqryRcptYn: 'N',
};

let fakePets = [
  {
    ...basePet,
    petSn: 1,
    chrcSttsCd: CHRC_STTS.DONE,
    petNm: '초코',
    petSeCd: PET_SE.DOG,
    vrtySn: 1,
    vrtyNm: '골든리트리버',
    petBrdt: '2021-05-03',
    chipNo: '410123456789012',
    petGndrCd: 'PETC0003',
    nutrYn: 'Y',
    petBdwg: 4.3,
    goalBdwg: 4.0,
    minBdwg: 3.5,
    maxBdwg: 4.5,
    colrCd: 'PETC0007',
    chrcCn: '오른쪽 귀 한쪽만 접힘',
    algyCn: '새우,닭고기',
    lastBdwgRcd: { rcdNvl: 4.3, rcdDt: '2026-09-12T09:00:00' },
    rprsYn: 'Y',
  },
  {
    ...basePet,
    petSn: 2,
    chrcSttsCd: CHRC_STTS.DONE,
    petNm: '나비',
    petSeCd: PET_SE.CAT,
    vrtyDrctInptNm: '코리안 숏헤어 믹스',
    petBrdt: '2023-02-14',
    petGndrCd: 'PETC0004',
    petBdwg: 3.8,
    minBdwg: 3.0,
    maxBdwg: 4.5,
    colrCd: 'PETC0014',
    algyCn: '연어,소고기,밀,옥수수',
    dssCn: '슬개골 탈구,피부염,외이염,결막염',
  },
  {
    ...basePet,
    petSn: 3,
    chrcSttsCd: CHRC_STTS.DONE,
    inqryRcptYn: 'Y',
    petNm: '보리',
    petSeCd: PET_SE.DOG,
    vrtySn: 2,
    vrtyNm: '말티즈',
    petBrdt: '2026-02-01',
    petGndrCd: 'PETC0004',
    petBdwg: 1.9,
    minBdwg: 1.5,
    maxBdwg: 2.5,
    colrCd: 'PETC0006',
  },
  {
    ...basePet,
    petSn: 4,
    chrcSttsCd: CHRC_STTS.DONE,
    petNm: '두부',
    petSeCd: PET_SE.DOG,
    vrtySn: 3,
    vrtyNm: '푸들',
    petBrdt: '2019-11-20',
    petGndrCd: 'PETC0003',
    nutrYn: 'Y',
    petBdwg: 5.2,
    minBdwg: 4.5,
    maxBdwg: 6.0,
    colrCd: 'PETC0008',
  },
  {
    ...basePet,
    petSn: 5,
    petNm: '치즈',
    petSeCd: PET_SE.CAT,
    vrtySn: 101,
    vrtyNm: '코리안 숏헤어',
    petBrdt: '2022-07-07',
    petGndrCd: 'PETC0003',
    nutrYn: 'Y',
    petBdwg: 5.5,
    minBdwg: 4.0,
    maxBdwg: 6.0,
    colrCd: 'PETC0015',
  },
  {
    ...basePet,
    petSn: 6,
    petNm: '콩이',
    petSeCd: PET_SE.DOG,
    vrtySn: 4,
    vrtyNm: '포메라니안',
    petBrdt: '2024-04-10',
    petGndrCd: 'PETC0004',
    petBdwg: 2.6,
    minBdwg: 2.0,
    maxBdwg: 3.0,
    colrCd: 'PETC0008',
  },
  {
    ...basePet,
    petSn: 7,
    chrcSttsCd: CHRC_STTS.ERROR,
    inqryRcptYn: 'Y',
    petNm: '구름',
    petSeCd: PET_SE.CAT,
    vrtySn: 103,
    vrtyNm: '페르시안',
    petBrdt: '2020-01-15',
    petGndrCd: 'PETC0004',
    nutrYn: 'Y',
    petBdwg: 4.1,
    minBdwg: 3.5,
    maxBdwg: 5.0,
    colrCd: 'PETC0006',
  },
  {
    ...basePet,
    petSn: 8,
    petRelCd: PET_REL.CO_PARENT,
    petNm: '까미',
    petSeCd: PET_SE.DOG,
    vrtySn: 3,
    vrtyNm: '푸들',
    petBrdt: '2018-09-30',
    petGndrCd: 'PETC0003',
    petBdwg: 6.4,
    minBdwg: 5.5,
    maxBdwg: 7.0,
    colrCd: 'PETC0005',
  },
  {
    ...basePet,
    petSn: 9,
    chrcSttsCd: CHRC_STTS.ERROR,
    petRelCd: PET_REL.CO_PARENT,
    petNm: '모모',
    petSeCd: PET_SE.CAT,
    vrtySn: 102,
    vrtyNm: '러시안 블루',
    petBrdt: '2025-03-03',
    petGndrCd: 'PETC0004',
    petBdwg: 3.2,
    minBdwg: 2.8,
    maxBdwg: 4.0,
    colrCd: 'PETC0009',
  },
  {
    ...basePet,
    petSn: 10,
    chrcSttsCd: CHRC_STTS.DONE,
    petRelCd: PET_REL.CO_PARENT,
    petNm: '해피',
    petSeCd: PET_SE.DOG,
    vrtySn: 1,
    vrtyNm: '골든리트리버',
    petBrdt: '2020-06-18',
    petGndrCd: 'PETC0003',
    nutrYn: 'Y',
    petBdwg: 28.5,
    minBdwg: 26.0,
    maxBdwg: 32.0,
    colrCd: 'PETC0007',
  },
];

const fakeDelay = (data) =>
  new Promise((resolve) => setTimeout(() => resolve(data), 200));

const getQueryParam = (name) =>
  import.meta.env.DEV
    ? new URLSearchParams(window.location.search).get(name)
    : null;

/** 목록 조회 GET /pets */
export const getPets = () => api.get('/pets');

/** 상세 조회 GET /pets/{petSn} */
export const getPet = (petSn) => api.get(`/pets/${petSn}`);

/** 등록 POST /pets */
export const createPet = (body) => api.post('/pets', body);

/** 수정 PATCH /pets/{petSn} (보낸 필드만 수정, 문자열 ""는 비움) */
export const updatePet = ({ petSn, ...body }) =>
  api.patch(`/pets/${petSn}`, body);

/** 삭제 DELETE /pets/{petSn} */
export const deletePet = (petSn) => api.delete(`/pets/${petSn}`);

/** 품종 목록 조회 GET /breeds?petSeCd= (KSJ) */
export const getVarieties = (petSeCd) =>
  api.get('/breeds', { params: { petSeCd } });

/** 양육자 목록 조회 GET /pets/{petSn}/caregivers (주양육자 첫 줄, 주양육자에게 전원, 공동양육자에게 주양육자와 본인) */
export const getCaregivers = (petSn) => api.get(`/pets/${petSn}/caregivers`);

/** 주양육자의 강제 해제 DELETE /pets/{petSn}/caregivers/{brupRelSn} */
export const deleteCaregiver = ({ petSn, brupRelSn }) =>
  api.delete(`/pets/${petSn}/caregivers/${brupRelSn}`);

/** 공동양육자 본인의 자진 해제 DELETE /pets/{petSn}/caregivers/{brupRelSn} (본인 줄만 가능, 반려동물 데이터는 그대로) */
export const leavePet = ({ petSn, brupRelSn }) =>
  api.delete(`/pets/${petSn}/caregivers/${brupRelSn}`);

/**
 * [캐릭터 가짜 API]
 * - 캐릭터 API(LJS)·대표 지정 API(SJM 백엔드) 전까지 쓰는 가짜 응답, 나오면 본문만 api 요청으로 교체
 * - 미정 키: itemSn, itemNm, itemPartCd, itemImgUrl, wearYn
 */
const item = (itemSn, itemNm, itemPartCd, wearYn = 'N') => ({
  itemSn,
  itemNm,
  itemPartCd,
  itemImgUrl: null,
  wearYn,
});

const defaultItems = () => [
  item(12, '야구모자', ITEM_PART.HEAD),
  item(14, '헤어핀', ITEM_PART.HEAD),
  item(21, '동그란 안경', ITEM_PART.FACE),
];

let fakeItems = {
  1: [
    item(11, '밀짚모자', ITEM_PART.HEAD, 'Y'),
    item(12, '야구모자', ITEM_PART.HEAD),
    item(13, '두건', ITEM_PART.HEAD),
    item(14, '헤어핀', ITEM_PART.HEAD),
    item(15, '헤어밴드', ITEM_PART.HEAD),
    item(16, '겨울모자', ITEM_PART.HEAD),
    item(17, '왕관', ITEM_PART.HEAD),
    item(18, '리본핀', ITEM_PART.HEAD),
    item(19, '털모자', ITEM_PART.HEAD),
    item(20, '선글라스', ITEM_PART.FACE, 'Y'),
    item(21, '동그란 안경', ITEM_PART.FACE),
    item(22, '목도리', ITEM_PART.NECK),
    item(23, '체크셔츠', ITEM_PART.CLOTHES, 'Y'),
  ],
};

/** 보유 아이템 조회 GET /pets/{petSn}/character/items */
export const getCharacterItems = (petSn) =>
  fakeDelay(fakeItems[petSn] ?? defaultItems());

/**
 * 상점 아이템 조회 GET /items (LJS)
 * - 미정 키: itemPrc. itemSn은 보유 아이템(getCharacterItems)과 같은 번호
 * - 가격(500~900P)은 예시
 */
const shopItem = (itemSn, itemNm, itemPartCd, itemPrc) => ({
  itemSn,
  itemNm,
  itemPartCd,
  itemPrc,
  itemImgUrl: null,
});

const SHOP_ITEMS = [
  shopItem(11, '밀짚모자', ITEM_PART.HEAD, 600),
  shopItem(12, '야구모자', ITEM_PART.HEAD, 600),
  shopItem(13, '두건', ITEM_PART.HEAD, 500),
  shopItem(14, '헤어핀', ITEM_PART.HEAD, 500),
  shopItem(15, '헤어밴드', ITEM_PART.HEAD, 500),
  shopItem(16, '겨울모자', ITEM_PART.HEAD, 700),
  shopItem(17, '왕관', ITEM_PART.HEAD, 900),
  shopItem(18, '리본핀', ITEM_PART.HEAD, 500),
  shopItem(19, '털모자', ITEM_PART.HEAD, 700),
  shopItem(20, '선글라스', ITEM_PART.FACE, 700),
  shopItem(21, '동그란 안경', ITEM_PART.FACE, 600),
  shopItem(22, '목도리', ITEM_PART.NECK, 800),
  shopItem(24, '방울 목걸이', ITEM_PART.NECK, 600),
  shopItem(23, '체크셔츠', ITEM_PART.CLOTHES, 900),
  shopItem(25, '후드티', ITEM_PART.CLOTHES, 900),
  shopItem(26, '한복', ITEM_PART.CLOTHES, 900),
  shopItem(27, '작은가방', ITEM_PART.BAG, 800),
  shopItem(28, '배낭', ITEM_PART.BAG, 900),
  shopItem(29, '보냉백', ITEM_PART.BAG, 800),
];

export const getShopItems = () => fakeDelay(SHOP_ITEMS);

/**
 * 아이템 구매 POST /pets/{petSn}/character/items (LJS, itemSn 목록)
 * - 산 아이템은 그 캐릭터의 보관함으로 이동. 포인트 차감은 서버 일이라 가짜는 잔액을 줄이지 않음
 */
export const purchaseCharacterItems = ({ petSn, itemSns }) => {
  const owned = fakeItems[petSn] ?? defaultItems();
  const bought = SHOP_ITEMS.filter(
    (it) =>
      itemSns.includes(it.itemSn) &&
      !owned.some((own) => own.itemSn === it.itemSn),
  ).map((it) => item(it.itemSn, it.itemNm, it.itemPartCd));
  fakeItems = { ...fakeItems, [petSn]: [...owned, ...bought] };
  return fakeDelay(null);
};

/** 착용 저장 PUT /pets/{petSn}/character/items/wear (착용할 itemSn 목록) */
export const updateCharacterWear = ({ petSn, itemSns }) => {
  fakeItems = {
    ...fakeItems,
    [petSn]: (fakeItems[petSn] ?? defaultItems()).map((it) => ({
      ...it,
      wearYn: itemSns.includes(it.itemSn) ? 'Y' : 'N',
    })),
  };
  return fakeDelay(null);
};

/** 대표 반려동물 지정 POST /pets/{petSn}/representative (주양육 동물만) */
export const setRepresentativePet = (petSn) =>
  api.post(`/pets/${petSn}/representative`);

const FAKE_CREATE_MS = 3000;

/**
 * 캐릭터 생성 POST /pets/{petSn}/character (LJS, 사진 첨부 필수)
 * - 요청 즉시 생성 중으로 바뀌고 서버 쪽에서 계속 진행, 완료되면 결과를 저장
 * - 개발 전용 ?fake=fail이면 생성 실패로 끝나 기본 캐릭터 그대로
 */
export const createCharacter = ({ petSn, photo, colrCd, colrDrctInptNm }) => {
  console.debug('createCharacter', {
    petSn,
    photo: photo?.name,
    colrCd,
    colrDrctInptNm,
  });
  const setStatus = (chrcSttsCd) => {
    fakePets = fakePets.map((pet) =>
      pet.petSn === petSn ? { ...pet, chrcSttsCd } : pet,
    );
  };
  setStatus(CHRC_STTS.GENERATING);
  const isFail = getQueryParam('fake') === 'fail';
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      setStatus(isFail ? CHRC_STTS.NONE : CHRC_STTS.DONE);
      if (isFail) reject(new Error('캐릭터 생성 실패'));
      else resolve(null);
    }, FAKE_CREATE_MS);
  });
};

/** 보낸 초대 조회 GET /caregiver-invitations (SJM 백엔드) */
export const getSentInvitations = () => api.get('/caregiver-invitations');

/** 초대 발송 POST /caregiver-invitations (SJM 백엔드, 가입 회원은 인앱 알림·미가입은 메일) */
export const createInvitation = ({ invtnTrgtEml, petSns }) =>
  api.post('/caregiver-invitations', { invtnTrgtEml, petSns });

/** 받은 초대 조회 GET /caregiver-invitations/{jntBrupInvtnSn} (SJM 백엔드) */
export const getInvitation = (jntBrupInvtnSn) =>
  api.get(`/caregiver-invitations/${jntBrupInvtnSn}`);

/** 초대 수락 POST /caregiver-invitations/{jntBrupInvtnSn}/accept (SJM 백엔드, 고른 동물만 연동하고 나머지는 거절 처리) */
export const acceptInvitation = ({ jntBrupInvtnSn, petSns }) =>
  api.post(`/caregiver-invitations/${jntBrupInvtnSn}/accept`, { petSns });

/** 초대 거절 POST /caregiver-invitations/{jntBrupInvtnSn}/reject (SJM 백엔드) */
export const rejectInvitation = (jntBrupInvtnSn) =>
  api.post(`/caregiver-invitations/${jntBrupInvtnSn}/reject`);
