import { api } from '@/api/axios';

/**
 * [1:1 문의 API]
 * - 목록 GET /inquiries, 상세 GET /inquiries/{otoInqrySn}, 작성 POST /inquiries, 수정 PATCH /inquiries/{otoInqrySn}
 *   작성·수정은 multipart/form-data(inqryTypeCd·inqryTtl·inqryCn·images, 수정은 남길 첨부 keepAtchFileSns)
 * - 응답: 목록 {content[{otoInqrySn, inqryTypeCd, inqryTypeCdNm, inqryTtl, inqryPrcsSttsCd, inqryPrcsSttsCdNm, regDt}], page, size, totalElements, totalPages, hasNext},
 *   상세·작성·수정 {…, inqryCn, imgs[{atchFileSn, sortSeq}], ansCn, ansDt}
 * - 첨부 이미지는 서버가 atchFileSn만 준다(이미지 조회 API가 생기면 imgs로 표시한다)
 */

/** 문의 유형 공통코드 그룹(CSCG02): 코드 CSCC0005~0011 */
const INQUIRY_TYPE_GROUP = 'CSCG02';

/** 픽셀 캐릭터 문의 유형 코드: 캐릭터 화면에서 오면 미리 고른다 */
export const INQUIRY_TYPE_PIXEL_CHARACTER = 'CSCC0006';

/** 화면에 쓰는 처리 상태 문구. 서버 이름 「접수」는 쓰지 않는다 */
export const INQUIRY_STATUS = { OPEN: '미답변', DONE: '답변 완료' };

/** 처리 상태 코드(CSCG03) */
const STATUS_CD = { OPEN: 'CSCC0012', DONE: 'CSCC0013' };
const STATUS_CD_BY_LABEL = {
  [INQUIRY_STATUS.OPEN]: STATUS_CD.OPEN,
  [INQUIRY_STATUS.DONE]: STATUS_CD.DONE,
};

export const isAnswered = (inquiry) =>
  inquiry.inqryPrcsSttsCd === STATUS_CD.DONE;

/** status: '' 전체, INQUIRY_STATUS 값 */
export const getInquiries = ({ page = 1, size = 10, status = '' } = {}) =>
  api.get('/inquiries', {
    params: { page, size, inqryPrcsSttsCd: STATUS_CD_BY_LABEL[status] },
  });

export const getInquiry = (otoInqrySn) => api.get(`/inquiries/${otoInqrySn}`);

/** 문의 유형 목록: [{ comCd, comCdNm, sortSeq }] */
export const getInquiryTypes = () =>
  api.get('/common-codes', { params: { prntComCd: INQUIRY_TYPE_GROUP } });

/**
 * 작성·수정 multipart 본문
 * - images: 새로 올릴 File 배열
 * - keepAtchFileSns: 수정에서만. 이 목록에 없는 기존 첨부는 서버가 지운다(빈 배열이면 모두 지움: 값 없는 항목 하나로 보낸다)
 */
const toFormData = ({
  inqryTypeCd,
  inqryTtl,
  inqryCn,
  images,
  keepAtchFileSns,
}) => {
  const body = new FormData();
  body.append('inqryTypeCd', inqryTypeCd);
  body.append('inqryTtl', inqryTtl);
  body.append('inqryCn', inqryCn);
  images.forEach((file) => body.append('images', file));
  if (keepAtchFileSns) {
    if (keepAtchFileSns.length === 0) body.append('keepAtchFileSns', '');
    keepAtchFileSns.forEach((sn) => body.append('keepAtchFileSns', sn));
  }
  return body;
};

export const createInquiry = ({ inqryTypeCd, inqryTtl, inqryCn, images }) =>
  api.post(
    '/inquiries',
    toFormData({ inqryTypeCd, inqryTtl, inqryCn, images }),
  );

export const updateInquiry = ({
  otoInqrySn,
  inqryTypeCd,
  inqryTtl,
  inqryCn,
  images,
  keepAtchFileSns,
}) =>
  api.patch(
    `/inquiries/${otoInqrySn}`,
    toFormData({ inqryTypeCd, inqryTtl, inqryCn, images, keepAtchFileSns }),
  );
