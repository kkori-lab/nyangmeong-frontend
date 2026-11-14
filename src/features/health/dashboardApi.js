import { aiApi, api } from '@/api/axios';
import { toShownWidgetIds, toWidgetBody } from './dashboard/widgetItems';
import { STOOL } from './diaryTypes';

/**
 * [건강 대시보드 API]
 * - 지표: GET /pets/{petSn}/health-indicators (JAJ 백엔드, 메인 위젯과 같은 API를 features/health에 따로 둠)
 * - 고른 항목: GET·PUT /members/me/dashboard-widgets (JAJ 백엔드, 건강기록 전용 13개)
 */

/** 배변 상태 카드의 최근 기록 수 */
export const STOOL_RECENT_COUNT = 14;

/** 체중·식사량·음수량·산책·크레아티닌 지표 { weight, meal, water, walk, creatinine } */
export const getHealthIndicators = (petSn) =>
  api.get(`/pets/${petSn}/health-indicators`);

/**
 * AI 건강분석 리포트 GET /ai/pets/{petSn}/health-report (LJS AI 서버, 계약 ai docs/api/healthreport.md)
 * - { petSn, baseYmd, rptTtl, tips, notice, dataLackYn, staleYn, rfrshPsblYn, crtDt }
 * - 새로 만들 때는 LLM을 불러 최대 20초 걸린다
 */
export const getHealthReport = (petSn) =>
  aiApi.get(`/pets/${petSn}/health-report`);

/** AI 건강분석 리포트 새로고침(하루 1회). 이미 했으면 409 HEALTH_REPORT_REFRESH_LIMIT */
export const refreshHealthReport = (petSn) =>
  aiApi.post(`/pets/${petSn}/health-report/refresh`);

/** 배변 상태 최근 기록(기록일시 오름차순) */
export const getRecentStools = (petSn) =>
  api.get(`/pets/${petSn}/daily-health-records`, {
    params: { dailyRcdIdctCd: STOOL, size: STOOL_RECENT_COUNT },
  });

/** 고른 항목 id 배열(저장 순서). 저장한 적이 없으면(savedYn=false) null: 튜토리얼을 여는 기준(D1·D2) */
export const getHealthWidgets = async () => {
  const { savedYn, widgets } = await api.get('/members/me/dashboard-widgets');
  return savedYn ? toShownWidgetIds(widgets) : null;
};

/** 고른 항목 저장. 13개 전부 보내고(고르지 않은 항목은 indctYn=false), 고른 id 배열을 돌려줌 */
export const saveHealthWidgets = async ({ widgetIds }) => {
  await api.put('/members/me/dashboard-widgets', {
    widgets: toWidgetBody(widgetIds),
  });
  return widgetIds;
};

/** 서버 저장 전에 쓰던 브라우저 저장값을 지움(사람 결정: 옮기지 않고 무시). 저장소를 못 쓰면 그냥 둠 */
export const removeOldHealthWidgets = (mbrSn) => {
  try {
    localStorage.removeItem(`nyangmeong.health.widgets.${mbrSn}`);
  } catch {
    /** 지우지 못해도 읽지 않으므로 화면에는 영향 없음 */
  }
};
