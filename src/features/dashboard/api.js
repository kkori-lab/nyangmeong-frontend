import { api } from '@/api/axios';

/**
 * 메인 건강 지표 GET /pets/{petSn}/health-indicators (JAJ 백엔드)
 * - 응답 { baseYmd, inqDt, weight, meal, water, walk, creatinine }. 기록이 없는 지표는 null
 */
export const getHealthIndicators = (petSn) =>
  api.get(`/pets/${petSn}/health-indicators`);

/** 메인 위젯 순서 GET /members/me/dashboard-widgets. 저장한 적 없으면 기본 순서 7개 */
export const getDashboardWidgets = () =>
  api.get('/members/me/dashboard-widgets');

/** 메인 위젯 순서 저장 PUT. 코드 7개 전부를 보일 순서대로, 빠지거나 겹치면 400 INVALID_INPUT_VALUE */
export const saveDashboardWidgets = (dshbdWdgtCds) =>
  api.put('/members/me/dashboard-widgets', { dshbdWdgtCds });
