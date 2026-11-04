import { aiApi, api } from '@/api/axios';
import { CHRC_STTS, PET_REL, PET_SE } from './shared/petCodes';

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

const getQueryParam = (name) =>
  import.meta.env.DEV
    ? new URLSearchParams(window.location.search).get(name)
    : null;

/** 목록 조회 GET /pets */
export const getPets = () => api.get('/pets');

/** 캐릭터 목록 GET /pixel-characters (캐릭터 없는 반려동물은 pixelCharSn 없음) */
export const getPixelCharacters = () => api.get('/pixel-characters');

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
 * [캐릭터 꾸미기·상점 API] (LJS 백엔드)
 * - 아래 대표 지정·캐릭터 생성은 아직 가짜 응답(나오면 본문만 api 요청으로 교체)
 */

/** 꾸미기 상세(보유 아이템 포함) GET /pixel-characters/{pixelCharSn} */
export const getPixelCharacter = (pixelCharSn) =>
  api.get(`/pixel-characters/${pixelCharSn}`);

/** 착용 상태 저장 PUT /pixel-characters/{pixelCharSn}/equipped-items (보유번호 hldItemSns 전체) */
export const saveEquippedItems = ({ pixelCharSn, hldItemSns }) =>
  api.put(`/pixel-characters/${pixelCharSn}/equipped-items`, { hldItemSns });

/** 상점 아이템과 보유 포인트 GET /pixel-characters/{pixelCharSn}/shop-items -> { hldPnt, items } */
export const getShopItems = (pixelCharSn) =>
  api.get(`/pixel-characters/${pixelCharSn}/shop-items`);

/** 아이템 구매 POST /pixel-characters/{pixelCharSn}/held-items (중복 결제 방지 idmptDmndId) */
export const purchaseItems = ({ pixelCharSn, itemSns, idmptDmndId }) =>
  api.post(`/pixel-characters/${pixelCharSn}/held-items`, {
    idmptDmndId,
    itemSns,
  });

/** Blob을 <img>용 data URL로(해제할 주소가 없어 캐시에 그대로 둔다) */
const blobToDataUrl = (blob) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });

/**
 * 착용 미리보기 POST /ai/characters/{pixelCharSn}/preview (AI 서버가 합성한 PNG -> data URL)
 * - itemSns는 아이템 번호(보유번호 아님). 저장하지 않으며 주양육자만 가능
 */
export const getCharacterPreview = ({ pixelCharSn, itemSns, signal }) =>
  aiApi
    .post(
      `/characters/${pixelCharSn}/preview`,
      { itemSns },
      { responseType: 'blob', signal },
    )
    .then(blobToDataUrl);

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
