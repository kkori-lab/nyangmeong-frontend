import { api } from '@/api/axios';

/**
 * [관리자 약관 API]
 * - 계약은 백엔드 docs/api/member.md /admin/terms 행
 * - 글자 수는 서버가 앞뒤 공백을 지운 뒤 센다
 */

/** 버전 최대 글자 수 */
export const TRMS_VER_ID_MAX = 80;
/** 제목 최대 글자 수 */
export const TRMS_TTL_MAX = 200;
/** 내용 최대 글자 수 */
export const TRMS_CN_MAX = 4000;

/** 종류별 사용 중인 버전(정렬순): [{ trmsSn, trmsFixIdntfKey, trmsVerId, trmsTtl, esntlAgreYn, useYn, regDt }] */
export const getAdminTerms = () => api.get('/admin/terms');

/** 한 종류의 모든 버전(최신순, 내용 제외) */
export const getAdminTermsHistory = ({ trmsFixIdntfKey }) =>
  api.get('/admin/terms/history', { params: { trmsFixIdntfKey } });

/** 버전 하나(내용 포함). 없으면 404 TERMS_NOT_FOUND */
export const getAdminTerm = (trmsSn) => api.get(`/admin/terms/${trmsSn}`);

/**
 * 새 버전 등록: body { trmsFixIdntfKey, trmsVerId, trmsTtl, trmsCn, esntlAgreYn } -> 201 상세
 * - 같은 종류 같은 버전 409 DUPLICATE_TRMS_VER, 없는 종류 404 TERMS_NOT_FOUND
 * - 등록하면 같은 종류 이전 버전은 사용 안 함
 */
export const createAdminTerm = (body) => api.post('/admin/terms', body);
