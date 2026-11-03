import { api } from '@/api/axios';

/** FAQ 카테고리 공통코드 그룹 */
const FAQ_CATEGORY_GROUP = 'CSCG01';

/** FAQ 목록: 비노출 포함, 순서는 서버 기준. { content, page, size, totalElements, totalPages, hasNext } */
export const getAdminFaqs = ({ page, size, faqClsfCd, keyword }) =>
  api.get('/admin/faqs', { params: { page, size, faqClsfCd, keyword } });

/** FAQ 상세 */
export const getAdminFaq = (faqSn) => api.get(`/admin/faqs/${faqSn}`);

/** FAQ 등록: 모든 칸 필수, 201 */
export const createAdminFaq = (body) => api.post('/admin/faqs', body);

/** FAQ 수정·비노출: 보낸 칸만 바뀐다 */
export const updateAdminFaq = ({ faqSn, ...body }) =>
  api.patch(`/admin/faqs/${faqSn}`, body);

/** FAQ 카테고리 목록: [{ comCd, comCdNm, sortSeq }] */
export const getFaqCategories = () =>
  api.get('/common-codes', { params: { prntComCd: FAQ_CATEGORY_GROUP } });
