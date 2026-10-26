import {
  CGVR_ROLE,
  CHRC_STTS,
  ITEM_PART,
  PET_REL,
  PET_SE,
} from './shared/petCodes';

/**
 * [반려동물 가짜 API]
 * - 반려동물 API(SJM)·품종 마스터(KSJ) 전까지 쓰는 가짜 응답, 나오면 본문만 api 요청으로 교체
 * - 미정 키: lastBdwgRcd, vrtyNm, rprsYn, petRelCd
 * - 캐릭터 미정 키: chrcSttsCd, chrcImgUrl, inqryRcptYn
 * - 양육관계 미정 키: rltnSn, mbrNcnm, cgvrRoleCd, authrtNm, lnkDt, myYn
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

const fakeVarieties = {
  [PET_SE.DOG]: [
    { vrtySn: 1, vrtyNm: '골든리트리버' },
    { vrtySn: 2, vrtyNm: '말티즈' },
    { vrtySn: 3, vrtyNm: '푸들' },
    { vrtySn: 4, vrtyNm: '포메라니안' },
  ],
  [PET_SE.CAT]: [
    { vrtySn: 101, vrtyNm: '코리안 숏헤어' },
    { vrtySn: 102, vrtyNm: '러시안 블루' },
    { vrtySn: 103, vrtyNm: '페르시안' },
  ],
};

const findVrtyNm = (petSeCd, vrtySn) =>
  fakeVarieties[petSeCd]?.find((vrty) => vrty.vrtySn === vrtySn)?.vrtyNm ??
  null;

const fakeDelay = (data) =>
  new Promise((resolve) => setTimeout(() => resolve(data), 200));

const getQueryParam = (name) =>
  import.meta.env.DEV
    ? new URLSearchParams(window.location.search).get(name)
    : null;

/** 목록 조회 GET /pets (개발 전용 ?fake=empty·owner로 0마리·공동양육 없음 확인) */
export const getPets = () => {
  const fake = getQueryParam('fake');
  if (fake === 'empty') return fakeDelay([]);
  if (fake === 'owner') {
    return fakeDelay(fakePets.filter((pet) => pet.petRelCd === PET_REL.OWNER));
  }
  return fakeDelay(fakePets);
};

/** 상세 조회 GET /pets/{petSn} */
export const getPet = (petSn) =>
  fakeDelay(fakePets.find((pet) => pet.petSn === petSn));

/** 등록 POST /pets */
export const createPet = (body) => {
  const pet = {
    ...basePet,
    ...body,
    petSn: Math.max(0, ...fakePets.map((p) => p.petSn)) + 1,
    vrtyNm: findVrtyNm(body.petSeCd, body.vrtySn),
  };
  fakePets = [...fakePets, pet];
  return fakeDelay(pet);
};

/** 수정 PUT /pets/{petSn} */
export const updatePet = ({ petSn, ...body }) => {
  const prev = fakePets.find((pet) => pet.petSn === petSn);
  const pet = {
    ...prev,
    ...body,
    petBdwg: prev.lastBdwgRcd ? prev.petBdwg : body.petBdwg,
    vrtyNm: findVrtyNm(body.petSeCd, body.vrtySn),
  };
  fakePets = fakePets.map((p) => (p.petSn === petSn ? pet : p));
  return fakeDelay(pet);
};

/** 삭제 DELETE /pets/{petSn} */
export const deletePet = (petSn) => {
  fakePets = fakePets.filter((pet) => pet.petSn !== petSn);
  return fakeDelay(null);
};

/** 품종 목록 조회 GET /varieties?petSeCd= (KSJ) */
export const getVarieties = (petSeCd) =>
  fakeDelay(fakeVarieties[petSeCd] ?? []);

/**
 * 양육관계 가짜 데이터 (petSn별)
 * - 주양육자 시점: 연동된 공동양육자(CCG) 전원
 * - 공동양육자 시점: 주양육자(PCG) + 본인 연동 1건(myYn 'Y'), 다른 공동양육자는 서버가 내려주지 않음
 */
let fakeCaregivers = {
  1: [
    {
      rltnSn: 101,
      mbrNcnm: '이서연',
      cgvrRoleCd: CGVR_ROLE.CCG,
      authrtNm: '조회+수정',
      lnkDt: '2026-07-02',
      myYn: 'N',
    },
    {
      rltnSn: 102,
      mbrNcnm: '최민지',
      cgvrRoleCd: CGVR_ROLE.CCG,
      authrtNm: '조회+수정',
      lnkDt: '2026-08-01',
      myYn: 'N',
    },
  ],
  3: [
    {
      rltnSn: 301,
      mbrNcnm: '이서연',
      cgvrRoleCd: CGVR_ROLE.CCG,
      authrtNm: '조회+수정',
      lnkDt: '2026-06-11',
      myYn: 'N',
    },
    {
      rltnSn: 302,
      mbrNcnm: '최민지',
      cgvrRoleCd: CGVR_ROLE.CCG,
      authrtNm: '조회',
      lnkDt: '2026-06-20',
      myYn: 'N',
    },
    {
      rltnSn: 303,
      mbrNcnm: '박지호',
      cgvrRoleCd: CGVR_ROLE.CCG,
      authrtNm: '조회+수정',
      lnkDt: '2026-07-05',
      myYn: 'N',
    },
    {
      rltnSn: 304,
      mbrNcnm: '정하늘',
      cgvrRoleCd: CGVR_ROLE.CCG,
      authrtNm: '조회',
      lnkDt: '2026-08-19',
      myYn: 'N',
    },
    {
      rltnSn: 305,
      mbrNcnm: '강도윤',
      cgvrRoleCd: CGVR_ROLE.CCG,
      authrtNm: '조회+수정',
      lnkDt: '2026-09-02',
      myYn: 'N',
    },
  ],
  10: [
    {
      rltnSn: 1001,
      mbrNcnm: '김주인',
      cgvrRoleCd: CGVR_ROLE.PCG,
      authrtNm: '조회+수정',
      lnkDt: '2026-07-02',
      myYn: 'N',
    },
    {
      rltnSn: 1002,
      mbrNcnm: '이서연',
      cgvrRoleCd: CGVR_ROLE.CCG,
      authrtNm: '조회+수정',
      lnkDt: '2026-07-02',
      myYn: 'Y',
    },
  ],
};

/** 양육관계 조회 GET /pets/{petSn}/caregivers (SJM 백엔드, 이메일은 내려주지 않음) */
export const getCaregivers = (petSn) => fakeDelay(fakeCaregivers[petSn] ?? []);

/** 주양육자의 강제 해제 DELETE /pets/{petSn}/caregivers/{rltnSn} (SJM 백엔드) */
export const deleteCaregiver = ({ petSn, rltnSn }) => {
  fakeCaregivers = {
    ...fakeCaregivers,
    [petSn]: (fakeCaregivers[petSn] ?? []).filter(
      (caregiver) => caregiver.rltnSn !== rltnSn,
    ),
  };
  return fakeDelay(null);
};

/** 공동양육자 본인의 자진 해제 DELETE /pets/{petSn}/caregivers/me (SJM 백엔드, 본인 연동만 끊고 반려동물 데이터는 그대로) */
export const leavePet = (petSn) => {
  fakePets = fakePets.filter((pet) => pet.petSn !== petSn);
  fakeCaregivers = {
    ...fakeCaregivers,
    [petSn]: (fakeCaregivers[petSn] ?? []).filter(
      (caregiver) => caregiver.myYn !== 'Y',
    ),
  };
  return fakeDelay(null);
};

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
 * - 산 아이템은 그 캐릭터의 보관함으로 들어간다. 포인트 차감은 서버 일이라 가짜는 잔액을 줄이지 않는다
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

/** 대표 반려동물 지정 PUT /pets/{petSn}/representative (SJM 백엔드, 주양육 동물만) */
export const setRepresentativePet = (petSn) => {
  fakePets = fakePets.map((pet) =>
    pet.petRelCd === PET_REL.OWNER
      ? { ...pet, rprsYn: pet.petSn === petSn ? 'Y' : 'N' }
      : pet,
  );
  return fakeDelay(null);
};

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

/**
 * [공동양육 초대 가짜 데이터]
 * - 초대 API(SJM 백엔드) 전까지 쓰는 가짜 응답
 * - 미정 키: invtSn, invitationToken(수락 URL 경로 변수, 확정 필요), invtEml, invtEmlMskd, emlMtchYn, invtSttsCd(보낸 초대는 동물별, 받은 초대는 초대 전체 WAIT·ACPT·RJCT·EXPR. 5-6 안내 판단), invtDt, expryDt, mbrYn, invtrNcnm, pets
 */
export const INVT_STTS = {
  WAIT: 'WAIT',
  ACPT: 'ACPT',
  RJCT: 'RJCT',
  EXPR: 'EXPR',
};

/** 초대 유효 기간(일) */
const INVT_VALID_DAYS = 7;

const toYmd = (date) => date.toISOString().slice(0, 10);

const addDays = (ymd, days) => {
  const date = new Date(`${ymd}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return toYmd(date);
};

const todayYmd = () => {
  const now = new Date();
  return toYmd(new Date(now.getTime() - now.getTimezoneOffset() * 60000));
};

/** 기한이 지난 대기 건은 만료로 표시 (실제는 서버 상태) */
const isExpired = (invitation, invtSttsCd) =>
  invtSttsCd === INVT_STTS.WAIT && invitation.expryDt < todayYmd();

/** 초대 상태는 동물별(sent: pets[].invtSttsCd), 받은 초대는 초대 전체 상태도 함께 둔다 */
const withExpiry = (invitation) => ({
  ...invitation,
  ...(invitation.invtSttsCd && {
    invtSttsCd: isExpired(invitation, invitation.invtSttsCd)
      ? INVT_STTS.EXPR
      : invitation.invtSttsCd,
  }),
  pets: invitation.pets.map((pet) =>
    pet.invtSttsCd && isExpired(invitation, pet.invtSttsCd)
      ? { ...pet, invtSttsCd: INVT_STTS.EXPR }
      : pet,
  ),
});

/** 내가 보낸 초대 (계정 전체, 최신 발송 순) */
let fakeSentInvitations = [
  {
    invtSn: 4,
    invtEml: 'sooyoung@example.com',
    pets: [{ petSn: 1, petNm: '초코', invtSttsCd: INVT_STTS.WAIT }],
    invtDt: '2026-10-18',
    expryDt: '2026-10-25',
    mbrYn: 'N',
  },
  {
    invtSn: 3,
    invtEml: 'jiho@example.com',
    pets: [
      { petSn: 2, petNm: '나비', invtSttsCd: INVT_STTS.WAIT },
      { petSn: 4, petNm: '두부', invtSttsCd: INVT_STTS.WAIT },
    ],
    invtDt: '2026-10-01',
    expryDt: '2026-10-08',
    mbrYn: 'Y',
  },
  {
    invtSn: 2,
    invtEml: 'minji@example.com',
    pets: [
      { petSn: 1, petNm: '초코', invtSttsCd: INVT_STTS.ACPT },
      { petSn: 3, petNm: '보리', invtSttsCd: INVT_STTS.RJCT },
    ],
    invtDt: '2026-07-28',
    expryDt: '2026-08-04',
    mbrYn: 'Y',
  },
  {
    invtSn: 1,
    invtEml: 'haneul@example.com',
    pets: [{ petSn: 3, petNm: '보리', invtSttsCd: INVT_STTS.RJCT }],
    invtDt: '2026-06-15',
    expryDt: '2026-06-22',
    mbrYn: 'N',
  },
];

/** 내가 받은 초대 (invitationToken별) */
let fakeReceivedInvitations = {
  'demo-wait': {
    invtSn: 901,
    invtrNcnm: '김주인',
    invtDt: '2026-10-20',
    expryDt: '2026-10-27',
    invtSttsCd: INVT_STTS.WAIT,
    pets: [
      {
        ...basePet,
        petSn: 901,
        petNm: '뭉치',
        petSeCd: PET_SE.DOG,
        vrtySn: 1,
        vrtyNm: '골든리트리버',
        petBrdt: '2023-05-02',
        petGndrCd: 'PETC0003',
        petBdwg: 30.2,
        minBdwg: 27.0,
        maxBdwg: 33.0,
        colrCd: 'PETC0007',
        petRelCd: PET_REL.CO_PARENT,
      },
      {
        ...basePet,
        petSn: 902,
        petNm: '마루',
        petSeCd: PET_SE.CAT,
        vrtyNm: '코리안 숏헤어',
        petBrdt: '2024-03-11',
        petGndrCd: 'PETC0004',
        petBdwg: 4.1,
        minBdwg: 3.5,
        maxBdwg: 4.8,
        colrCd: 'PETC0014',
        petRelCd: PET_REL.CO_PARENT,
      },
    ],
  },
  /** 초대받은 이메일과 로그인 계정이 다른 경우 (서버가 판정, 마스킹한 이메일을 내려 줌) */
  'demo-mismatch': {
    invtSn: 903,
    invtrNcnm: '김주인',
    invtEmlMskd: 's***@example.com',
    emlMtchYn: 'N',
    invtDt: '2026-10-20',
    expryDt: '2026-10-27',
    invtSttsCd: INVT_STTS.WAIT,
    pets: [],
  },
  /** 이미 수락·거절돼 종료된 초대 */
  'demo-done': {
    invtSn: 904,
    invtrNcnm: '최가족',
    invtDt: '2026-10-20',
    expryDt: '2026-10-27',
    invtSttsCd: INVT_STTS.ACPT,
    pets: [
      {
        ...basePet,
        petSn: 904,
        petNm: '구름',
        petSeCd: PET_SE.CAT,
        vrtyNm: '러시안블루',
        petBrdt: '2023-01-15',
        petRelCd: PET_REL.CO_PARENT,
      },
    ],
  },
  'demo-expired': {
    invtSn: 902,
    invtrNcnm: '박보호',
    invtDt: '2026-10-01',
    expryDt: '2026-10-08',
    invtSttsCd: INVT_STTS.WAIT,
    pets: [
      {
        ...basePet,
        petSn: 903,
        petNm: '별이',
        petSeCd: PET_SE.DOG,
        vrtyNm: '시바견',
        petBrdt: '2022-08-08',
        petRelCd: PET_REL.CO_PARENT,
      },
    ],
  },
};

/** 보낸 초대 조회 GET /invitations/sent (SJM 백엔드) */
export const getSentInvitations = () =>
  fakeDelay(fakeSentInvitations.map(withExpiry));

/** 초대 발송 POST /invitations (SJM 백엔드, 가입 회원은 인앱 알림·미가입은 메일) */
export const createInvitation = ({ invtEml, petSns }) => {
  const invtDt = todayYmd();
  const invitation = {
    invtSn: Math.max(0, ...fakeSentInvitations.map((i) => i.invtSn)) + 1,
    invtEml,
    pets: fakePets
      .filter((pet) => petSns.includes(pet.petSn))
      .map(({ petSn, petNm }) => ({
        petSn,
        petNm,
        invtSttsCd: INVT_STTS.WAIT,
      })),
    invtDt,
    expryDt: addDays(invtDt, INVT_VALID_DAYS),
    mbrYn: 'N',
  };
  fakeSentInvitations = [invitation, ...fakeSentInvitations];
  return fakeDelay(invitation);
};

/** 받은 초대 조회 GET /invitations/{invitationToken} (SJM 백엔드) */
export const getInvitation = (invitationToken) => {
  const invitation = fakeReceivedInvitations[invitationToken];
  if (!invitation) {
    return new Promise((_, reject) =>
      setTimeout(() => reject(new Error('NOT_FOUND')), 200),
    );
  }
  return fakeDelay(withExpiry({ ...invitation, invitationToken }));
};

/** 받은 쪽 처리 결과를 보낸 쪽 목록에도 동물별로 반영 (같은 invtSn) */
const setReceivedStatus = (invitationToken, statusOf, invtSttsCd) => {
  const { invtSn } = fakeReceivedInvitations[invitationToken];
  fakeSentInvitations = fakeSentInvitations.map((invitation) =>
    invitation.invtSn === invtSn
      ? {
          ...invitation,
          pets: invitation.pets.map((pet) => ({
            ...pet,
            invtSttsCd: statusOf(pet.petSn),
          })),
        }
      : invitation,
  );
  fakeReceivedInvitations = {
    ...fakeReceivedInvitations,
    [invitationToken]: {
      ...fakeReceivedInvitations[invitationToken],
      invtSttsCd,
    },
  };
};

/** 초대 수락 POST /invitations/{invitationToken}/accept (SJM 백엔드, 고른 동물만 연동하고 나머지는 거절 처리) */
export const acceptInvitation = ({ invitationToken, petSns }) => {
  const invitation = fakeReceivedInvitations[invitationToken];
  const accepted = invitation.pets.filter((pet) => petSns.includes(pet.petSn));
  setReceivedStatus(
    invitationToken,
    (petSn) => (petSns.includes(petSn) ? INVT_STTS.ACPT : INVT_STTS.RJCT),
    INVT_STTS.ACPT,
  );
  fakePets = [...fakePets, ...accepted];
  accepted.forEach((pet) => {
    fakeCaregivers = {
      ...fakeCaregivers,
      [pet.petSn]: [
        {
          rltnSn: pet.petSn * 100 + 1,
          mbrNcnm: invitation.invtrNcnm,
          cgvrRoleCd: CGVR_ROLE.PCG,
          authrtNm: '조회+수정',
          lnkDt: invitation.invtDt,
          myYn: 'N',
        },
        {
          rltnSn: pet.petSn * 100 + 2,
          mbrNcnm: '이서연',
          cgvrRoleCd: CGVR_ROLE.CCG,
          authrtNm: '조회+수정',
          lnkDt: todayYmd(),
          myYn: 'Y',
        },
      ],
    };
  });
  return fakeDelay(null);
};

/** 초대 거절 POST /invitations/{invitationToken}/reject (SJM 백엔드) */
export const rejectInvitation = (invitationToken) => {
  setReceivedStatus(invitationToken, () => INVT_STTS.RJCT, INVT_STTS.RJCT);
  return fakeDelay(null);
};
