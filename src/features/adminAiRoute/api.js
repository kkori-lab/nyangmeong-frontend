import { api } from '@/api/axios';

/**
 * [관리자 AI 라우팅 매핑표 API]
 * - 계약은 백엔드 docs/api/ai.md 관리자 API `/admin/ai/routes` 행
 * - 대표 칩(rprsChipYn)·사용(useYn)은 true/false
 * - 우선순위(prrtSeq)는 등록·수정 본문에 넣는다. 서버가 그 자리에 넣고 나머지를 한 칸씩 민다
 * - 도메인명(domnNm)은 보내지 않는다(서버가 화면 ID로 정함)
 * - 없는 행 404 AI_ROUTE_NOT_FOUND, 화면 이동·모달 열기인데 화면 ID·지시어가 없으면 400 INVALID_INPUT_VALUE
 */

/** 매핑표(사용 안 함 포함, 우선순위 순, 페이지 없음): q가 있으면 지시어에 공백을 빼고 들어 있는 행만 */
export const getAdminAiRoutes = ({ q } = {}) =>
  api.get('/admin/ai/routes', {
    params: q?.trim() ? { q: q.trim() } : undefined,
  });

/** 매핑 등록: prrtSeq가 없으면 맨 아래 -> 201 { aiRoutMpngSn } */
export const createAdminAiRoute = (body) => api.post('/admin/ai/routes', body);

/**
 * 매핑 수정: 보낸 칸만 바뀜 -> 바뀐 행
 * - 화면 ID·파라미터·지시어·비고는 빈 문자열을 보내야 비워진다(null은 그대로 둠)
 */
export const updateAdminAiRoute = ({ aiRoutMpngSn, ...body }) =>
  api.patch(`/admin/ai/routes/${aiRoutMpngSn}`, body);

/** 매핑 삭제: 뒤 순위를 한 칸씩 당긴다 */
export const deleteAdminAiRoute = (aiRoutMpngSn) =>
  api.delete(`/admin/ai/routes/${aiRoutMpngSn}`);
