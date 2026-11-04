import { api } from '@/api/axios';

/** 공지 목록: 고정 먼저 최신순, 비노출 포함. { content, page, size, totalElements, totalPages, hasNext } */
export const getAdminNotices = ({ page, size, keyword }) =>
  api.get('/admin/notices', { params: { page, size, keyword } });

/** 공지 상세 */
export const getAdminNotice = (ntcMttrSn) =>
  api.get(`/admin/notices/${ntcMttrSn}`);

/** 공지 알림 대상 수: { trgtCnt } */
export const getNoticeTargetCount = () =>
  api.get('/admin/notices/notification-target-count');

/** 공지 등록: notiSndngYn이면 지금 정상 회원 전체에게 알림, 사용 안 함과 같이 보내면 400 */
export const createAdminNotice = (body) => api.post('/admin/notices', body);

/** 공지 수정·비노출: 알림은 다시 보내지 않는다 */
export const updateAdminNotice = ({ ntcMttrSn, ...body }) =>
  api.patch(`/admin/notices/${ntcMttrSn}`, body);
