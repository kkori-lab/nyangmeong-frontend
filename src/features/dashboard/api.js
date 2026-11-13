import { api } from '@/api/axios';

/**
 * 메인 반려동물 바로가기 조회·저장 (LJS 백엔드)
 * - 응답: 양육 중인 반려동물 전부 [{ petSn, shrtcCds }] (코드는 보일 순서대로)
 * - 저장한 적 없는 반려동물은 빈 목록
 */

/** 메인 바로가기 GET /pets/main-shortcuts */
export const getMainShortcuts = () => api.get('/pets/main-shortcuts');

/** 메인 바로가기 저장 PUT /pets/main-shortcuts. 반려동물별 목록을 보내고 조회와 같은 응답을 받는다 */
export const saveMainShortcuts = (shortcuts) =>
  api.put('/pets/main-shortcuts', shortcuts);
