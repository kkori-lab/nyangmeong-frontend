/**
 * [건강기록 대시보드 고른 항목 가짜 저장소] (※신규 정책)
 * - 백엔드 B1(GET·PUT /members/me/dashboard-widgets 건강기록 전용)이 생기기 전까지 쓰는 회원별 localStorage
 * - 저장한 적이 없으면 null: 튜토리얼을 여는 기준(D1·D2). 그래서 "선택 없음"은 브라우저 단위
 * - 저장소를 쓸 수 없으면 오류: 화면은 모달을 띄우지 않음
 */

const storageKey = (mbrSn) => `nyangmeong.health.widgets.${mbrSn}`;

/** 고른 항목 키 배열. 저장한 적이 없으면 null */
export const getHealthWidgets = async (mbrSn) => {
  const saved = localStorage.getItem(storageKey(mbrSn));
  if (saved == null) return null;
  const widgetIds = JSON.parse(saved);
  return Array.isArray(widgetIds) ? widgetIds : null;
};

/** 고른 항목 키 배열 전체 저장 */
export const saveHealthWidgets = async ({ mbrSn, widgetIds }) => {
  localStorage.setItem(storageKey(mbrSn), JSON.stringify(widgetIds));
  return widgetIds;
};
