import { PATHS } from '@/routes/paths';

/**
 * [AI 화면 ID → 본창 경로]
 * - AI 서버 판정(intent·shortcut)의 scrId·param을 본창 경로로 바꾼다(FN-AIM-004-09·10)
 * - 행은 ai 저장소 data/routing.yaml의 라우팅 대상, URL은 docs/routes.md 1장
 * - 서버 param `?cat=`은 프론트 쿼리 `?category=`로 바꾼다(AI 서버에 맞춰 달라고 요청함)
 */
const SCREEN_PATHS = {
  'SCR-MAN-001': PATHS.MAIN,
  'SCR-COM-008': PATHS.SETTINGS_NOTIFICATIONS,
  'SCR-COM-009': PATHS.CHAT,
  'SCR-HLT-011': PATHS.HEALTH,
  'SCR-HLT-002': PATHS.HEALTH_DIARY,
  'SCR-HLT-003': PATHS.HEALTH_CALENDAR,
  'SCR-HOS-001': PATHS.PLACES,
  'SCR-CMU-001-01': PATHS.COMMUNITY,
  'SCR-CMU-002': PATHS.COMMUNITY_MISSING,
  'SCR-CMU-003-01': PATHS.COMMUNITY_NEWS,
  'SCR-CMU-004': PATHS.COMMUNITY_PETCARE,
  'SCR-CSC-001': PATHS.NOTICES,
  'SCR-CSC-002-01': PATHS.FAQS,
  'SCR-MYP-001': PATHS.MYPAGE,
  'SCR-MYP-002': PATHS.MYPAGE_PETS,
  'SCR-MYP-004': PATHS.MYPAGE_CAREGIVERS,
  'SCR-MYP-010': PATHS.MYPAGE_CHARACTERS,
  'SCR-MYP-020': PATHS.MYPAGE_POINTS,
  'SCR-MYP-030': PATHS.MYPAGE_EXPENSES,
  'SCR-MYP-031': PATHS.MYPAGE_EXPENSES_ALL,
  'SCR-MYP-040': PATHS.MYPAGE_PROFILE,
};

/** 본창 대신 채팅 창을 여는 이동 */
const MOVE_MODAL = 'MODAL';

/** 판정 → 이동 정보, 변환표에 없는 화면이면 null */
export const toRoute = ({ scrId, scrNm, param, moveType }) => {
  const path = SCREEN_PATHS[scrId];
  if (!path) return null;
  return {
    label: scrNm,
    path: `${path}${param?.replace(/^\?cat=/, '?category=') ?? ''}`,
    isModal: moveType === MOVE_MODAL,
  };
};
