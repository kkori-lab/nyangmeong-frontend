/**
 * 전체 URL 고정: docs/routes.md 1장을 모두 반영. 새 URL은 docs/routes.md를 먼저 고치고 팀에 알린 뒤 따로 PR
 * 구획은 routes/domains 폴더와 같음
 */
export const PATHS = {
  /** main */
  HOME: '/',
  MAIN: '/main',

  /** account */
  LOGIN: '/login',
  SIGNUP: '/signup',
  PASSWORD_FIND: '/password/find',
  PASSWORD_RESET: '/password/reset',

  /** settings */
  SETTINGS_NOTIFICATIONS: '/settings/notifications',

  /** ai */
  AI: '/ai-chat',

  /** chat */
  CHAT: '/chat',

  /** health */
  HEALTH: '/health',
  HEALTH_DIARY: '/health/diary',
  HEALTH_CALENDAR: '/health/calendar',
  HEALTH_CHECKUP_DETAIL: '/health/checkups/:ckupRcdSn',
  HEALTH_CHECKUP_INSPECTIONS: '/health/checkups/:ckupRcdSn/inspections',

  /** place */
  PLACES: '/places',

  /** community */
  COMMUNITY: '/community',
  COMMUNITY_POST_NEW: '/community/posts/new',
  COMMUNITY_POST_DETAIL: '/community/posts/:pstSn',
  COMMUNITY_POST_EDIT: '/community/posts/:pstSn/edit',
  COMMUNITY_MISSING: '/community/missing',
  COMMUNITY_MISSING_NEW: '/community/missing/new',
  COMMUNITY_MISSING_DETAIL: '/community/missing/:lostTpofSn',
  COMMUNITY_MISSING_EDIT: '/community/missing/:lostTpofSn/edit',
  COMMUNITY_NEWS: '/community/news',
  COMMUNITY_NEWS_DETAIL: '/community/news/:newsSn',
  COMMUNITY_PETCARE: '/community/petcare',
  COMMUNITY_PETCARE_NEW: '/community/petcare/new',
  COMMUNITY_PETCARE_DETAIL: '/community/petcare/:petPrtcRcrtSn',
  COMMUNITY_PETCARE_EDIT: '/community/petcare/:petPrtcRcrtSn/edit',

  /** support */
  NOTICES: '/notices',
  NOTICE_DETAIL: '/notices/:ntcMttrSn',
  FAQS: '/faqs',
  INQUIRIES: '/inquiries',
  INQUIRY_NEW: '/inquiries/new',
  INQUIRY_DETAIL: '/inquiries/:otoInqrySn',
  INQUIRY_EDIT: '/inquiries/:otoInqrySn/edit',

  /** mypage */
  MYPAGE: '/mypage',
  MYPAGE_PETS: '/mypage/pets',
  MYPAGE_INVITATION: '/mypage/invitations/:invitationToken',
  MYPAGE_CAREGIVERS: '/mypage/caregivers',
  MYPAGE_CHARACTERS: '/mypage/characters',
  MYPAGE_POINTS: '/mypage/points',
  MYPAGE_EXPENSES: '/mypage/expenses',
  MYPAGE_EXPENSES_ALL: '/mypage/expenses/all',
  MYPAGE_PROFILE: '/mypage/profile',
  MYPAGE_WITHDRAW: '/mypage/withdraw',

  /** admin */
  ADMIN: '/admin',
  ADMIN_SETTINGS: '/admin/settings',
};
