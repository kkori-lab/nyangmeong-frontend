import { api } from '@/api/axios';

/**
 * [관리자 1:1 문의 API]
 * - 문의 목록·상세·첨부 이미지, 답변 등록·수정, 캐릭터 오류 처리
 */

/** 문의 유형 공통코드 그룹 */
const INQUIRY_TYPE_GROUP = 'CSCG02';

/** 문의 목록: { content, page, size, totalElements, totalPages, hasNext } */
export const getAdminInquiries = (params) =>
  api.get('/admin/inquiries', { params });

/** 문의 상세: 삭제 문의 포함 */
export const getAdminInquiry = (otoInqrySn) =>
  api.get(`/admin/inquiries/${otoInqrySn}`);

/** 첨부 이미지 Blob */
export const getAdminInquiryImage = (otoInqrySn, atchFileSn) =>
  api.get(`/admin/inquiries/${otoInqrySn}/images/${atchFileSn}`, {
    responseType: 'blob',
  });

/** 답변 등록: 201, 회원에게 알림 */
export const createAdminInquiryAnswer = ({ otoInqrySn, ansCn }) =>
  api.post(`/admin/inquiries/${otoInqrySn}/answer`, { ansCn });

/** 답변 수정: 알림 없음 */
export const updateAdminInquiryAnswer = ({ otoInqrySn, ansCn }) =>
  api.patch(`/admin/inquiries/${otoInqrySn}/answer`, { ansCn });

/** 캐릭터 오류 처리: CHRC0008 무료 재생성, CHRC0009 원래 캐릭터 복원 */
export const processAdminInquiryCharacterError = ({
  otoInqrySn,
  charErrPrcsRsltCd,
}) =>
  api.post(`/admin/inquiries/${otoInqrySn}/character-error`, {
    charErrPrcsRsltCd,
  });

/** 문의 유형 목록: [{ comCd, comCdNm, sortSeq }] */
export const getAdminInquiryTypes = () =>
  api.get('/common-codes', { params: { prntComCd: INQUIRY_TYPE_GROUP } });
