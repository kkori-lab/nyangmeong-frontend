import { api } from '@/api/axios';
import { IS_DEV } from '@/api/env';

/**
 * [관리자 아이템 API]
 * - 부위 탭은 실제 공통코드 API, 아이템 목록·등록·수정·순서 저장은 /api/admin/items 나오기 전까지 메모리 가짜 -> 나오면 본문만 api 요청으로 교체
 * - 개발 환경에서 ?fake=forbidden이면 403
 * - 미확정: 경로 4종, 보유 회원 수 필드 이름(hldMbrCnt), 등록·수정 multipart 칸 이름
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

/** 가짜 아이템의 부위 코드(MYPG01 아래 코드) */
const FAKE_PART_CODES = [
  'MYPC0001',
  'MYPC0002',
  'MYPC0003',
  'MYPC0004',
  'MYPC0005',
  'MYPC0006',
];

/** 가짜 아이템: 부위마다 2개, 3번째마다 판매 중지 */
let fakeItems = FAKE_PART_CODES.flatMap((itemRegnCd, partIndex) =>
  [1, 2].map((seq) => {
    const itemSn = partIndex * 2 + seq;
    return {
      itemSn,
      itemNm: `가짜 아이템 ${String(itemSn).padStart(2, '0')}`,
      itemRegnCd,
      needPnt: 100 * (partIndex + seq),
      ntslYn: itemSn % 3 !== 0,
      sortSeq: seq,
      atchFileSn: null,
      hldMbrCnt: (itemSn * 7) % 23,
    };
  }),
);

const assertAdmin = () => {
  const fake = IS_DEV
    ? new URLSearchParams(window.location.search).get('fake')
    : null;
  if (fake === 'forbidden') {
    throw {
      code: 'ADMIN_ONLY',
      message: '관리자만 접근할 수 있습니다.',
      fields: null,
      data: null,
    };
  }
};

/** 부위 -> 정렬 순서 -> 번호 순 */
const compareItems = (a, b) =>
  a.itemRegnCd.localeCompare(b.itemRegnCd) ||
  a.sortSeq - b.sortSeq ||
  a.itemSn - b.itemSn;

/** 아이템 목록: 판매 중지 포함, 뺀 부위 제외, [{ itemSn, itemNm, itemRegnCd, itemRegnCdNm, needPnt, ntslYn, sortSeq, atchFileSn, hldMbrCnt }] */
export const getAdminItems = async ({ itemRegnCd } = {}) => {
  assertAdmin();
  const parts = await getItemParts();
  const partNames = Object.fromEntries(
    parts.map(({ comCd, comCdNm }) => [comCd, comCdNm]),
  );
  return fakeItems
    .filter((item) => item.itemRegnCd in partNames)
    .filter((item) => !itemRegnCd || item.itemRegnCd === itemRegnCd)
    .sort(compareItems)
    .map((item) => ({
      ...item,
      itemRegnCdNm: partNames[item.itemRegnCd] ?? item.itemRegnCd,
    }));
};

/** 아이템 등록: multipart(itemRegnCd·itemNm·needPnt·ntslYn·image), 201 { itemSn } */
export const createAdminItem = async ({
  itemRegnCd,
  itemNm,
  needPnt,
  ntslYn,
}) => {
  assertAdmin();
  const itemSn = Math.max(0, ...fakeItems.map((item) => item.itemSn)) + 1;
  const lastSortSeq = Math.max(
    0,
    ...fakeItems
      .filter((item) => item.itemRegnCd === itemRegnCd)
      .map((item) => item.sortSeq),
  );
  fakeItems = [
    ...fakeItems,
    {
      itemSn,
      itemNm,
      itemRegnCd,
      needPnt,
      ntslYn,
      sortSeq: lastSortSeq + 1,
      atchFileSn: null,
      hldMbrCnt: 0,
    },
  ];
  return { itemSn };
};

/** 아이템 수정·판매 중지: multipart, 보낸 칸만 바뀜(image는 바꿀 때만) */
export const updateAdminItem = async ({ itemSn, image, ...body }) => {
  assertAdmin();
  const target = fakeItems.find((item) => item.itemSn === itemSn);
  if (!target) {
    throw {
      code: 'ITEM_NOT_FOUND',
      message: '아이템을 찾을 수 없습니다.',
      fields: null,
      data: null,
    };
  }
  const isPartChanged =
    body.itemRegnCd != null && body.itemRegnCd !== target.itemRegnCd;
  const lastSortSeq = Math.max(
    0,
    ...fakeItems
      .filter((item) => item.itemRegnCd === body.itemRegnCd)
      .map((item) => item.sortSeq),
  );
  fakeItems = fakeItems.map((item) =>
    item.itemSn === itemSn
      ? {
          ...item,
          ...body,
          ...(isPartChanged ? { sortSeq: lastSortSeq + 1 } : {}),
          ...(image ? { atchFileSn: null } : {}),
        }
      : item,
  );
  return null;
};

/** 부위 안 상점 순서 저장: { itemRegnCd, itemSns } 순서대로 1부터 */
export const saveAdminItemOrder = async ({ itemRegnCd, itemSns }) => {
  assertAdmin();
  fakeItems = fakeItems.map((item) => {
    const index = itemSns.indexOf(item.itemSn);
    return item.itemRegnCd === itemRegnCd && index >= 0
      ? { ...item, sortSeq: index + 1 }
      : item;
  });
  return null;
};
