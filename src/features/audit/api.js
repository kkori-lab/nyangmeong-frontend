import { api } from '@/api/axios';

/** 작업 유형 공통코드 그룹 */
const TASK_TYPE_GROUP = 'SYSG01';

/** 감사 로그 목록: { content, page, size, totalElements, totalPages, hasNext } */
export const getAuditLogs = (params) =>
  api.get('/admin/audit-logs', { params });

/** 관리자 필터 목록: [{ mbrSn, mbrNcnm }] */
export const getAuditLogAdmins = () => api.get('/admin/audit-logs/admins');

/** 감사 로그 상세 */
export const getAuditLog = (mngrTaskLogSn) =>
  api.get(`/admin/audit-logs/${mngrTaskLogSn}`);

/** 작업 유형 목록: [{ comCd, comCdNm, sortSeq }] */
export const getAuditTaskTypes = () =>
  api.get('/common-codes', { params: { prntComCd: TASK_TYPE_GROUP } });
