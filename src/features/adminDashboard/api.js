import { api } from '@/api/axios';

/**
 * [관리자 대시보드 API]
 * - 계약: 백엔드 docs/api/admin.md /admin/dashboard·/admin/dashboard/stats
 * - 통계는 건수만(건강기록·AI 대화 내용 없음)
 */

/**
 * 운영 현황·처리 대기: 기간과 무관한 지금 값
 * - { totMbrCnt, nrmlMbrCnt, stopMbrCnt, todayJoinCnt, weekJoinCnt, totPstCnt,
 *     recentMbrs[{ mbrSn, mbrNcnm, regDt }], recentPsts[{ pstSn, bbsCd, bbsNm, pstTtl, regDt }],
 *     dclrRcptCnt, unansInqryCnt, pixelInqryCnt, charFailCnt, ocrFailCnt, notiFailCnt, btchFailCnt }
 */
export const getAdminDashboard = () => api.get('/admin/dashboard');

/**
 * 이용 통계: fromYmd·toYmd(양끝 포함, 최대 90일, 종료일은 오늘 이하)
 * - { daily[{ ymd, joinCnt, whdwlCnt, aiChatCnt, ocrRqstCnt }], pstCntByBbs, expnsCntByCtgry,
 *     petDstrb·fvrtPlcs(기간 무관) }
 */
export const getAdminDashboardStats = ({ fromYmd, toYmd }) =>
  api.get('/admin/dashboard/stats', { params: { fromYmd, toYmd } });
