import { api } from '@/api/axios';
import { LOST_STTS } from './missingCodes';

/**
 * [실종센터 API]
 * - 실종 글 GET /lost-reports(page·size·lostTpofSttsCd·rgnSn·petSeCd·wtnsPrd·keyword·mineYn)
 *   mineYn(내 글만)이면 만료된 내 글도 오고 상태는 CMUC0008(만료), GET·PATCH·DELETE /lost-reports/{lostTpofSn}, POST /lost-reports
 *   등록·수정은 multipart/form-data(lastWtnsDt는 'YYYY-MM-DDTHH:mm:00', 사진 images, 수정은 남길 사진 keepAtchFileSns)
 * - 찾았어요 POST …/found, 30일 연장 POST …/renew(둘 다 응답 data 없음)
 * - 실종 지역(rgnSn)은 서버가 목격 좌표로 계산하므로 보내지 않음
 * - 댓글·좋아요·신고는 실종 글의 pstSn으로 펫이야기 API(./api)를 같이 씀
 * - 찾았어요 글은 작성자가 아니면 목록의 이름·지역·사진 등과 상세의 본문·연락처·위치가 null
 */

const RAIL_NEWS_COUNT = 4;
const RAIL_FOUND_COUNT = 2;

export const getMissingList = ({
  page = 1,
  size = 12,
  lostTpofSttsCd = '',
  rgnSn = '',
  petSeCd = '',
  wtnsPrd = '',
  keyword = '',
  mineYn = false,
} = {}) =>
  api.get('/lost-reports', {
    params: {
      page,
      size,
      lostTpofSttsCd: lostTpofSttsCd || undefined,
      rgnSn: rgnSn || undefined,
      petSeCd: petSeCd || undefined,
      wtnsPrd: wtnsPrd || undefined,
      keyword: keyword || undefined,
      mineYn: mineYn || undefined,
    },
  });

/** 오른쪽 레일: 레일 전용 API가 없어 목록 API로 구성. 최근 실종 소식(실종 최신 4건)과 최근 찾은 반려동물(찾았어요 최신 2건) */
export const getMissingRail = async () => {
  const [news, found] = await Promise.all([
    getMissingList({ size: RAIL_NEWS_COUNT, lostTpofSttsCd: LOST_STTS.LOST }),
    getMissingList({ size: RAIL_FOUND_COUNT, lostTpofSttsCd: LOST_STTS.FOUND }),
  ]);
  return { news: news.content, found: found.content };
};

export const getMissing = (lostTpofSn) =>
  api.get(`/lost-reports/${lostTpofSn}`);

const toFormData = ({
  petSeCd,
  petNm,
  vrtySn,
  vrtyDrctInptNm,
  colrNm,
  chrcCn,
  lastWtnsDt,
  wtnsPlcNm,
  wtnsPlcLat,
  wtnsPlcLot,
  cnpl,
  pstTtl,
  pstCn,
  images,
  keepAtchFileSns,
}) => {
  const body = new FormData();
  const fields = {
    petSeCd,
    petNm,
    vrtySn,
    vrtyDrctInptNm,
    colrNm,
    chrcCn,
    lastWtnsDt,
    wtnsPlcNm,
    wtnsPlcLat,
    wtnsPlcLot,
    cnpl,
    pstTtl,
    pstCn,
    prvcRlsAgreYn: true,
  };
  Object.entries(fields).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      body.append(key, value);
    }
  });
  images.forEach((file) => body.append('images', file));
  if (keepAtchFileSns) {
    if (keepAtchFileSns.length === 0) body.append('keepAtchFileSns', '');
    keepAtchFileSns.forEach((sn) => body.append('keepAtchFileSns', sn));
  }
  return body;
};

/** 등록은 남길 사진이 없어 keepAtchFileSns를 보내지 않음 */
export const createMissing = (values) =>
  api.post(
    '/lost-reports',
    toFormData({ ...values, keepAtchFileSns: undefined }),
  );

export const updateMissing = ({ lostTpofSn, ...values }) =>
  api.patch(`/lost-reports/${lostTpofSn}`, toFormData(values));

export const deleteMissing = (lostTpofSn) =>
  api.delete(`/lost-reports/${lostTpofSn}`);

/** 찾았어요: 서버가 상태를 바꾸고 완료 안내 댓글을 자동으로 등록. 되돌리기 없음 */
export const markMissingFound = (lostTpofSn) =>
  api.post(`/lost-reports/${lostTpofSn}/found`);

/** 30일 연장: 작성자, 실종 상태, 게시 종료 7일 전부터 */
export const extendMissing = (lostTpofSn) =>
  api.post(`/lost-reports/${lostTpofSn}/renew`);

/** 품종 목록: 반려동물 구분별 [{ vrtySn, vrtyNm }] */
export const getBreeds = (petSeCd) =>
  api.get('/breeds', { params: { petSeCd } });

/** 하위 지역 목록. upRgnSn이 없으면 시도 */
export const getRegions = (upRgnSn) =>
  api.get('/regions', { params: { upRgnSn } });

/** 전북(행정동 코드 52로 시작)의 시군구 목록 */
export const getJeonbukRegions = async () => {
  const sidos = await getRegions();
  const jeonbuk = sidos.find((row) => row.admdstCd.startsWith('52'));
  return jeonbuk ? getRegions(jeonbuk.rgnSn) : [];
};
