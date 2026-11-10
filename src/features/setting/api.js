import { api } from '@/api/axios';

/**
 * [관리자 운영 설정 API]
 * - 계약은 백엔드 docs/api/global.md /admin/settings 행
 * - 조회 응답은 묶음별 객체(memberPet·community·notification·ai·file) + mdfcnDt·mdfrId
 * - 저장은 평평한 본문, 보낸 항목만 바뀐다. 범위 밖은 400 INVALID_INPUT_VALUE(fields)
 */

/** 운영 설정 조회: 설정 행이 아직 없으면 mdfcnDt·mdfrId가 없다 */
export const getAdminSettings = () => api.get('/admin/settings');

/** 운영 설정 저장: body는 바뀐 항목만 -> 저장 뒤 설정(조회와 같은 모양) */
export const updateAdminSettings = (body) => api.patch('/admin/settings', body);
