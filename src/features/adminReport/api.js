import { api } from '@/api/axios';

/**
 * [관리자 신고 API]
 * - 신고 목록·상세, 처리 완료·반려, 자동 블라인드 조회·복구
 */

/** 신고 목록: { content, page, size, totalElements, totalPages, hasNext } */
export const getAdminReports = (params) =>
  api.get('/admin/reports', { params });

/** 자동 블라인드 목록: { content, page, size, totalElements, totalPages, hasNext } */
export const getAutoBlindReports = (params) =>
  api.get('/admin/reports/auto-blind', { params });

/** 신고 상세 */
export const getAdminReport = (dclrSn) => api.get(`/admin/reports/${dclrSn}`);

/** 신고 처리 완료 */
export const completeReport = ({ dclrSn, ...body }) =>
  api.post(`/admin/reports/${dclrSn}/complete`, body);

/** 신고 반려 */
export const rejectReport = ({ dclrSn, rjctRsn }) =>
  api.post(`/admin/reports/${dclrSn}/reject`, { rjctRsn });

/** 자동 블라인드 복구 */
export const restoreReport = ({ dclrSn, chgRsn }) =>
  api.post(`/admin/reports/${dclrSn}/restore`, { chgRsn });
