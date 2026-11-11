import { aiApi, api } from '@/api/axios';

/**
 * [관리자 아이템 API]
 * - 부위 탭은 공통코드 API, 아이템 목록·이미지·등록·수정·순서 저장은 /api/admin/items
 * - 서버 목록·공통코드에 신발이 남아 있어 화면에서 이름으로 거름(공통코드 정리는 백엔드 몫)
 */

/** 아이템 부위 공통코드 그룹 */
const ITEM_PART_GROUP = 'MYPG01';

/** 관리자 화면에서 뺀 부위 이름: 서비스에서 빼기로 함, 공통코드 정리는 백엔드 몫 */
const EXCLUDED_PART_NAMES = ['신발'];

/** 아이템 부위 목록: [{ comCd, comCdNm, sortSeq }], 뺀 부위 제외 */
export const getItemParts = async () => {
  const parts = await api.get('/common-codes', {
    params: { prntComCd: ITEM_PART_GROUP },
  });
  return parts.filter(({ comCdNm }) => !EXCLUDED_PART_NAMES.includes(comCdNm));
};

/**
 * 아이템 목록: 판매 중지 포함, 뺀 부위 제외
 * [{ itemSn, itemNm, itemRegnCd, itemRegnCdNm, needPnt, ntslYn, sortSeq, atchFileSn, bakeHint, hldMbrCnt }]
 */
export const getAdminItems = async ({ itemRegnCd } = {}) => {
  const [items, parts] = await Promise.all([
    api.get('/admin/items', { params: itemRegnCd ? { itemRegnCd } : {} }),
    getItemParts(),
  ]);
  const partCodes = new Set(parts.map(({ comCd }) => comCd));
  return items.filter((item) => partCodes.has(item.itemRegnCd));
};

/** 등록·수정 multipart 본문: 값이 undefined인 칸은 보내지 않음 */
const toItemForm = (fields) => {
  const form = new FormData();
  Object.entries(fields).forEach(([key, value]) => {
    if (value !== undefined) form.append(key, value);
  });
  return form;
};

/** 아이템 등록: multipart(itemRegnCd·itemNm·needPnt·ntslYn·bakeHint(선택)·image), 201 { itemSn } */
export const createAdminItem = ({
  itemRegnCd,
  itemNm,
  needPnt,
  ntslYn,
  bakeHint,
  image,
}) =>
  api.post(
    '/admin/items',
    toItemForm({
      itemRegnCd,
      itemNm,
      needPnt,
      ntslYn,
      bakeHint: bakeHint || undefined,
      image,
    }),
  );

/** 아이템 수정·판매 중지: multipart, 보낸 칸만 바뀜(image는 바꿀 때만, bakeHint 빈 값이면 지움) */
export const updateAdminItem = ({ itemSn, ...fields }) =>
  api.patch(`/admin/items/${itemSn}`, toItemForm(fields));

/** 부위 안 상점 순서 저장: 그 부위 아이템 전부(판매 중지 포함)를 빠짐·중복 없이, 순서대로 1부터 */
export const saveAdminItemOrder = ({ itemRegnCd, itemSns }) =>
  api.put('/admin/items/order', { itemRegnCd, itemSns });

/**
 * 실사 사진으로 픽셀 아이템 그림 만들기(AI 서버): multipart(image·regnCd·itemNm)
 * 256×256 투명 배경 PNG Blob, 30~40초, 부를 때마다 이미지 1장 과금, 서버에 저장하지 않음
 */
export const createItemPixelImage = ({ image, regnCd, itemNm }) =>
  aiApi.post('/items/pixel-image', toItemForm({ image, regnCd, itemNm }), {
    responseType: 'blob',
  });

/**
 * 전체 굽기 한 묶음(AI 서버): 아직 안 구운 캐릭터를 최대 13개 굽고 답함(약 30초)
 * { itemSn, bakedCnt, failedCnt, lastYn }, lastYn이 false면 다시 부름
 */
export const bakeAdminItem = (itemSn) => aiApi.post(`/items/${itemSn}/bake`);
