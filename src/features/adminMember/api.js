import { api } from '@/api/axios';

/**
 * [관리자 회원 API]
 * - 회원 목록·상세·탭, 정지·해제, 탈퇴 회원, 관리자 계정
 */

/** 회원 목록: { content, page, size, totalElements, totalPages, hasNext } */
export const getAdminMembers = (params) =>
  api.get('/admin/members', { params });

/** 회원 상세 기본 정보 */
export const getAdminMember = (mbrSn) => api.get(`/admin/members/${mbrSn}`);

/** 회원의 반려동물: { content, page, size, totalElements, totalPages, hasNext } */
export const getAdminMemberPets = ({ mbrSn, ...params }) =>
  api.get(`/admin/members/${mbrSn}/pets`, { params });

/** 회원의 약관 동의 */
export const getAdminMemberTerms = (mbrSn) =>
  api.get(`/admin/members/${mbrSn}/terms-agreements`);

/** 회원의 포인트 원장: { content, page, size, totalElements, totalPages, hasNext } */
export const getAdminMemberPoints = ({ mbrSn, ...params }) =>
  api.get(`/admin/members/${mbrSn}/point-ledgers`, { params });

/** 회원의 상태 이력: { content, page, size, totalElements, totalPages, hasNext } */
export const getAdminMemberStatusHistories = ({ mbrSn, ...params }) =>
  api.get(`/admin/members/${mbrSn}/status-histories`, { params });

/** 정지 회원 목록: { content, page, size, totalElements, totalPages, hasNext } */
export const getAdminSuspensions = (params) =>
  api.get('/admin/members/suspensions', { params });

/** 탈퇴 회원 목록: { content, page, size, totalElements, totalPages, hasNext } */
export const getAdminWithdrawnMembers = (params) =>
  api.get('/admin/members/withdrawn', { params });

/** 회원 정지: suspnDayCnt가 null이면 영구 */
export const suspendMember = ({ mbrSn, ...body }) =>
  api.post(`/admin/members/${mbrSn}/suspension`, body);

/** 정지 해제: 사유는 DELETE 본문 */
export const releaseMember = ({ mbrSn, ...body }) =>
  api.delete(`/admin/members/${mbrSn}/suspension`, { data: body });

/** 관리자 목록: { content, page, size, totalElements, totalPages, hasNext } */
export const getAdmins = (params) => api.get('/admin/admins', { params });

/** 관리자 지정 */
export const appointAdmin = (mbrSn) => api.post(`/admin/admins/${mbrSn}`);

/** 관리자 해제 */
export const releaseAdmin = (mbrSn) => api.delete(`/admin/admins/${mbrSn}`);
