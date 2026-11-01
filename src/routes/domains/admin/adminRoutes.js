import { lazy } from 'react';
import { PATHS } from '@/routes/paths';

const AdminAuditLogsPage = lazy(
  () => import('@/pages/admin/AdminAuditLogsPage'),
);
const AdminBatchesPage = lazy(() => import('@/pages/admin/AdminBatchesPage'));
const AdminExternalApiUsagePage = lazy(
  () => import('@/pages/admin/AdminExternalApiUsagePage'),
);
const AdminHomePage = lazy(() => import('@/pages/admin/AdminHomePage'));
const AdminMemberDetailPage = lazy(
  () => import('@/pages/admin/AdminMemberDetailPage'),
);
const AdminMembersPage = lazy(() => import('@/pages/admin/AdminMembersPage'));
const AdminSettingsPage = lazy(() => import('@/pages/admin/AdminSettingsPage'));

export default [
  {
    layout: 'admin',
    auth: 'admin',
    routes: [
      { path: PATHS.ADMIN, Component: AdminHomePage },
      { path: PATHS.ADMIN_MEMBERS, Component: AdminMembersPage },
      { path: PATHS.ADMIN_MEMBER_DETAIL, Component: AdminMemberDetailPage },
      { path: PATHS.ADMIN_SETTINGS, Component: AdminSettingsPage },
      { path: PATHS.ADMIN_BATCHES, Component: AdminBatchesPage },
      {
        path: PATHS.ADMIN_EXTERNAL_API_USAGE,
        Component: AdminExternalApiUsagePage,
      },
      { path: PATHS.ADMIN_AUDIT_LOGS, Component: AdminAuditLogsPage },
    ],
  },
];
