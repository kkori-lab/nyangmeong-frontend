import { api } from '@/api/axios';

/**
 * [우리동네 펫돌봄 API]
 * - 목록 GET /care-recruitments, 상세·수정·삭제 /care-recruitments/{petPrtcRcrtSn}, 등록 POST /care-recruitments
 *   등록·수정은 multipart/form-data. 반려동물은 pets[0].petSeCd 같은 인덱스 필드로 보낸다
 * - 좋아요 POST·DELETE /posts/{pstSn}/likes, 신고 POST /reports(펫이야기와 같은 함수)
 * - 상세 주소·정확한 좌표는 저장만 하고 응답에 없다. 장소는 공개 동네명 rlsRgnNm 하나
 * - 사진은 공개 파일이라 주소로 바로 표시: @/utils/fileUrl publicFileUrl
 */

/** 목록: 상태·지역(rgnSn, 하위 포함)·돌봄 날짜 범위·반려동물 구분·반려견 크기·내 글만 보기를 모두 만족(AND), 최신순 */
export const getCareList = ({
  page = 1,
  size = 10,
  rcrtSttsCd = '',
  rgnSn = '',
  fromDate = '',
  toDate = '',
  petSeCd = '',
  petSizeCd = '',
  mineYn = false,
} = {}) =>
  api.get('/care-recruitments', {
    params: {
      page,
      size,
      rcrtSttsCd: rcrtSttsCd || undefined,
      rgnSn: rgnSn || undefined,
      prtcBgngDe: fromDate || undefined,
      prtcEndDe: toDate || undefined,
      petSeCd: petSeCd || undefined,
      petSizeCd: petSizeCd || undefined,
      mineYn: mineYn || undefined,
    },
  });

/** 최저시급: 관리자 설정의 현재 적용 연도·시간당 금액 { lowstHrwgAplcnYr, lowstHrwgAmt } */
export const getMinimumWage = () => api.get('/care-recruitments/minimum-wage');

export const getCare = (petPrtcRcrtSn) =>
  api.get(`/care-recruitments/${petPrtcRcrtSn}`);

const toFormData = ({
  pets,
  prtcShpCds,
  prtcBgngDt,
  prtcEndDt,
  schdlCnsltnPsbltyYn,
  cstUnitCd,
  cstAmt,
  rlsRgnNm,
  prtcPlcDaddr,
  prtcPlcLat,
  prtcPlcLot,
  pstTtl,
  pstCn,
  images,
  keepAtchFileSns,
  isCreate,
}) => {
  const body = new FormData();
  const fields = {
    prtcBgngDt,
    prtcEndDt,
    schdlCnsltnPsbltyYn,
    cstUnitCd,
    cstAmt,
    rlsRgnNm,
    prtcPlcDaddr,
    prtcPlcLat,
    prtcPlcLot,
    pstTtl,
    pstCn,
    ...(isCreate && { utztnRulAgreYn: true }),
  };
  Object.entries(fields).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      body.append(key, value);
    }
  });
  pets.forEach((pet, index) => {
    Object.entries(pet).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        body.append(`pets[${index}].${key}`, value);
      }
    });
  });
  prtcShpCds.forEach((code) => body.append('prtcShpCds', code));
  images.forEach((file) => body.append('images', file));
  if (keepAtchFileSns) {
    if (keepAtchFileSns.length === 0) body.append('keepAtchFileSns', '');
    keepAtchFileSns.forEach((sn) => body.append('keepAtchFileSns', sn));
  }
  return body;
};

/** 등록: 모집중으로 생성, 응답의 petPrtcRcrtSn으로 상세 이동. 돌봄 지역(rgnSn)은 좌표로 서버가 계산 */
export const createCare = (values) =>
  api.post(
    '/care-recruitments',
    toFormData({ ...values, keepAtchFileSns: undefined, isCreate: true }),
  );

/** 수정: 모집중인 글만. 장소를 다시 고르지 않으면 장소 값은 보내지 않아 유지 */
export const updateCare = ({ petPrtcRcrtSn, ...values }) =>
  api.patch(`/care-recruitments/${petPrtcRcrtSn}`, toFormData(values));

export const deleteCare = (petPrtcRcrtSn) =>
  api.delete(`/care-recruitments/${petPrtcRcrtSn}`);
