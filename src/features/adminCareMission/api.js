import { api } from '@/api/axios';

/**
 * [관리자 케어미션 API]
 * - 계약은 백엔드 docs/api/pet.md /admin/care-missions 두 행
 * - 추가·삭제 API 없음(미션은 코드의 활동과 짝)
 * - 일반 회원은 403 ADMIN_ONLY
 */

/**
 * 케어미션 목록(사용 안 함 포함, 번호순, 페이지 없음)
 * : [{ careMsnSn, msnPoolCd, msnNm, cmpnPnt, achvCrtrNmtm, mvmnPath, useYn(true/false) }]
 * - msnPoolCd가 없으면 전체, 모르는 풀 코드 400 INVALID_INPUT_VALUE
 */
export const getAdminCareMissions = ({ msnPoolCd } = {}) =>
  api.get('/admin/care-missions', {
    params: { msnPoolCd: msnPoolCd || undefined },
  });

/**
 * 케어미션 수정: 보상 포인트(1~1000)·달성 기준 횟수(1~10)·사용 여부 -> 200 미션 행
 * - 미션명·풀·이동 경로는 안 바뀜. 바꾼 값은 다음 날 00:00 출제부터 반영
 * - 범위 밖 400 INVALID_INPUT_VALUE, 없는 미션 404 CARE_MISSION_NOT_FOUND
 */
export const updateAdminCareMission = ({
  careMsnSn,
  cmpnPnt,
  achvCrtrNmtm,
  useYn,
}) =>
  api.patch(`/admin/care-missions/${careMsnSn}`, {
    cmpnPnt,
    achvCrtrNmtm,
    useYn,
  });
