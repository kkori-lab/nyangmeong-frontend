import { api } from '@/api/axios';

/**
 * [관리자 품종 API]
 * - 계약은 백엔드 docs/api/pet.md /admin/breeds 행
 * - 공용 GET /api/breeds는 사용 안 함 품종이 빠져 쓰지 않음
 * - 이름 글자 수는 서버가 앞뒤 공백을 지운 뒤 센다
 */

/** 품종 이름 최대 글자 수 */
export const VRTY_NM_MAX = 50;

/** 종별 품종 목록(정렬순, 사용 안 함 포함): [{ vrtySn, vrtyCd, vrtyNm, petSeCd, sortSeq, useYn }] */
export const getAdminBreeds = ({ petSeCd }) =>
  api.get('/admin/breeds', { params: { petSeCd } });

/**
 * 품종 추가: body { petSeCd, vrtyNm, sortSeq, useYn } -> 201 품종 행
 * - 코드는 서버가 매김, 같은 종 같은 이름(공백 무시) 409 DUPLICATE_VRTY_NM
 */
export const createAdminBreed = (body) => api.post('/admin/breeds', body);

/**
 * 품종 수정: 이름·정렬·사용만 바꿈(종·코드는 그대로) -> 200 품종 행
 * - 없는 품종 404 BREED_NOT_FOUND, 같은 종 같은 이름 409 DUPLICATE_VRTY_NM
 */
export const updateAdminBreed = ({ vrtySn, vrtyNm, sortSeq, useYn }) =>
  api.patch(`/admin/breeds/${vrtySn}`, { vrtyNm, sortSeq, useYn });
