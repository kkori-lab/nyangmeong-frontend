import { lazy } from 'react';
import { PATHS } from '@/routes/paths';

const CareCalendarPage = lazy(() => import('@/pages/health/CareCalendarPage'));

const CheckupDetailPage = lazy(
  () => import('@/pages/health/CheckupDetailPage'),
);

const HealthDiaryPage = lazy(() => import('@/pages/health/HealthDiaryPage'));

const HealthSummaryPage = lazy(
  () => import('@/pages/health/HealthSummaryPage'),
);

const LabInputPage = lazy(() => import('@/pages/health/LabInputPage'));

export default [
  {
    layout: 'user',
    auth: 'member',
    routes: [
      { path: PATHS.HEALTH, Component: HealthSummaryPage },
      { path: PATHS.HEALTH_DIARY, Component: HealthDiaryPage },
      { path: PATHS.HEALTH_CALENDAR, Component: CareCalendarPage },
      { path: PATHS.HEALTH_CHECKUP_DETAIL, Component: CheckupDetailPage },
      { path: PATHS.HEALTH_CHECKUP_INSPECTIONS, Component: LabInputPage },
    ],
  },
];
