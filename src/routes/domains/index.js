import accountRoutes from './account/accountRoutes';
import adminRoutes from './admin/adminRoutes';
import aiRoutes from './ai/aiRoutes';
import chatRoutes from './chat/chatRoutes';
import communityRoutes from './community/communityRoutes';
import devRoutes from './dev/devRoutes';
import healthRoutes from './health/healthRoutes';
import mainRoutes from './main/mainRoutes';
import mypageRoutes from './mypage/mypageRoutes';
import placeRoutes from './place/placeRoutes';
import settingsRoutes from './settings/settingsRoutes';
import supportRoutes from './support/supportRoutes';

/** 도메인 목록 고정: 라우트는 각 도메인의 <도메인>Routes.js에 작성 */
export default [
  ...mainRoutes,
  ...accountRoutes,
  ...settingsRoutes,
  ...aiRoutes,
  ...chatRoutes,
  ...healthRoutes,
  ...placeRoutes,
  ...communityRoutes,
  ...supportRoutes,
  ...mypageRoutes,
  ...adminRoutes,
  ...devRoutes,
];
