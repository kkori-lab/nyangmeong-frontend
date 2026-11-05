import { aiApi, api } from '@/api/axios';

/** [반려동물 API] 캐릭터 생성은 AI 서버(`aiApi`), 나머지는 백엔드(`api`) */

/** 목록 조회 GET /pets */
export const getPets = () => api.get('/pets');

/** 캐릭터 목록 GET /pixel-characters (캐릭터 없는 반려동물은 pixelCharSn 없음) */
export const getPixelCharacters = () => api.get('/pixel-characters');

/** 상세 조회 GET /pets/{petSn} */
export const getPet = (petSn) => api.get(`/pets/${petSn}`);

/** 건강 일지의 체중 지표 코드(일상기록지표공통코드) */
const DAILY_RCD_WEIGHT = 'HLTC0014';

/**
 * 최신 체중 기록 GET /pets/{petSn}/daily-health-records (JAJ)
 * - 응답은 기록일시 오름차순이라 마지막 원소가 최신이다. 기록이 없으면 null
 */
export const getLatestWeightRecord = async (petSn) => {
  const records = await api.get(`/pets/${petSn}/daily-health-records`, {
    params: { dailyRcdIdctCd: DAILY_RCD_WEIGHT, size: 1 },
  });
  return records.length > 0 ? records[records.length - 1] : null;
};

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
 * - 꾸미기 상세·착용 저장·상점·구매는 백엔드, 미리보기는 AI 서버
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

/**
 * 착용 모습 대표 이미지 저장 POST /ai/characters/{pixelCharSn}/equipped-image
 * - [장착]으로 착용 저장(PUT equipped-items)이 성공한 뒤 같은 아이템 번호(itemSns)로 부른다
 * - 아이템이 아직 구워지지 않았으면 409 ITEM_BAKING
 */
export const saveEquippedImage = ({ pixelCharSn, itemSns }) =>
  aiApi.post(`/characters/${pixelCharSn}/equipped-image`, { itemSns });

/** 대표 반려동물 지정 POST /pets/{petSn}/representative (주양육 동물만) */
export const setRepresentativePet = (petSn) =>
  api.post(`/pets/${petSn}/representative`);

/**
 * 캐릭터 생성 POST /ai/characters (AI 서버, multipart photo + petSn, 202 { charCrtJobSn })
 * - 품종·털색·특징은 서버가 등록값을 읽으므로 보내지 않는다. 생성은 응답 뒤 서버에서 계속된다
 */
export const createCharacter = ({ petSn, photo }) => {
  const formData = new FormData();
  formData.append('photo', photo);
  formData.append('petSn', petSn);
  return aiApi.post('/characters', formData);
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
