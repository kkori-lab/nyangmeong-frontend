import { MSN_POOL } from './careMissionLabels';

/**
 * [관리자 케어미션 API]
 * - 백엔드 `/api/admin/care-missions` 없음 -> 가짜 응답
 *   - 연결 때: GET /api/admin/care-missions?msnPoolCd=, PATCH /api/admin/care-missions/{careMsnSn}
 * - 필드 이름은 백엔드 `CareMsn`(CARE_MSN) 그대로, 처음 값은 백엔드 db 기준 데이터 v0.12와 같음
 * - 수정한 값은 이 탭의 sessionStorage에 두어 새로고침해도 남음(연결 때 지움)
 */

const STORAGE_KEY = 'fakeAdminCareMissions';

/** [미션 풀, 미션명, 보상 포인트, 이동 경로] (달성 기준은 모두 1회) */
const SEED = [
  [MSN_POOL.DAILY, '화장실 청소하기', 10, '/health/calendar'],
  [MSN_POOL.DAILY, '양치하기', 5, '/health/calendar'],
  [MSN_POOL.DAILY, '빗질하기', 5, '/health/calendar'],
  [MSN_POOL.DAILY, '발 관리하기', 3, '/health/calendar'],
  [MSN_POOL.DAILY, '놀이하기', 5, '/health/calendar'],
  [MSN_POOL.DAILY, '체중 기록하기', 10, '/health'],
  [MSN_POOL.DAILY, '식사량 기록하기', 10, '/health'],
  [MSN_POOL.DAILY, '음수량 기록하기', 10, '/health'],
  [MSN_POOL.DAILY, '배변 기록하기', 5, '/health'],
  [MSN_POOL.ACTIVITY, '가계부 지출 등록하기', 5, '/mypage/expenses'],
  [MSN_POOL.ACTIVITY, '케어 캘린더 일정 등록하기', 5, '/health/calendar'],
  [MSN_POOL.ACTIVITY, '귀 청소하기', 10, '/health/calendar'],
  [MSN_POOL.ACTIVITY, '발톱 관리하기', 15, '/health/calendar'],
  [MSN_POOL.ACTIVITY, '목욕하기', 20, '/health/calendar'],
  [MSN_POOL.ACTIVITY, '눈 주변 관리하기', 5, '/health/calendar'],
  [MSN_POOL.ACTIVITY, '발바닥 털 관리하기', 10, '/health/calendar'],
  [MSN_POOL.ACTIVITY, '구강 상태 확인하기', 5, '/health/calendar'],
  [MSN_POOL.ACTIVITY, '산책 기록하기', 10, '/health'],
  [MSN_POOL.ACTIVITY, '관찰 기록 추가하기', 10, '/health'],
  [MSN_POOL.ACTIVITY, '펫이야기 글 등록하기', 20, '/community'],
  [MSN_POOL.ACTIVITY, '펫이야기 댓글 작성하기', 5, '/community'],
];

const seedMissions = () =>
  SEED.map(([msnPoolCd, msnNm, cmpnPnt, mvmnPath], index) => ({
    careMsnSn: index + 1,
    msnPoolCd,
    msnNm,
    cmpnPnt,
    achvCrtrNmtm: 1,
    mvmnPath,
    useYn: 'Y',
  }));

/** 저장된 가짜 값: 없거나 읽지 못하면 처음 값 */
const loadMissions = () => {
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {
    // 저장소를 못 쓰면 처음 값
  }
  return seedMissions();
};

let fakeMissions = loadMissions();

const saveMissions = () => {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(fakeMissions));
  } catch {
    // 저장소를 못 쓰면 이 탭 메모리에만 남음
  }
};

const delay = () => new Promise((resolve) => setTimeout(resolve, 300));

/** 서버 오류 모양 */
const fakeError = (code, message) => ({
  code,
  message,
  fields: null,
  data: null,
});

/** 케어미션 목록: msnPoolCd가 없으면 전체, 번호순 */
export const getAdminCareMissions = async ({ msnPoolCd } = {}) => {
  await delay();
  return fakeMissions
    .filter((mission) => !msnPoolCd || mission.msnPoolCd === msnPoolCd)
    .map((mission) => ({ ...mission }));
};

/** 케어미션 수정: 보상 포인트·달성 기준 횟수·사용 여부만 */
export const updateAdminCareMission = async ({
  careMsnSn,
  cmpnPnt,
  achvCrtrNmtm,
  useYn,
}) => {
  await delay();
  const target = fakeMissions.find(
    (mission) => mission.careMsnSn === careMsnSn,
  );
  if (!target) {
    throw fakeError('CARE_MISSION_NOT_FOUND', '케어미션을 찾을 수 없어요.');
  }
  fakeMissions = fakeMissions.map((mission) =>
    mission.careMsnSn === careMsnSn
      ? { ...mission, cmpnPnt, achvCrtrNmtm, useYn }
      : mission,
  );
  saveMissions();
  return null;
};
