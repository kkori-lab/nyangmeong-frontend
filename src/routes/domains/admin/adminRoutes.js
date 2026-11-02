import { lazy } from 'react';
import { PATHS } from '@/routes/paths';

const AdminAdminsPage = lazy(() => import('@/pages/admin/AdminAdminsPage'));
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
const AdminMemberSuspensionsPage = lazy(
  () => import('@/pages/admin/AdminMemberSuspensionsPage'),
);
const AdminMembersWithdrawnPage = lazy(
  () => import('@/pages/admin/AdminMembersWithdrawnPage'),
);
const AdminNoticeFormPage = lazy(
  () => import('@/pages/admin/AdminNoticeFormPage'),
);
const AdminNoticesPage = lazy(() => import('@/pages/admin/AdminNoticesPage'));
const AdminPostDetailPage = lazy(
  () => import('@/pages/admin/AdminPostDetailPage'),
);
const AdminPostsPage = lazy(() => import('@/pages/admin/AdminPostsPage'));
const AdminReportDetailPage = lazy(
  () => import('@/pages/admin/AdminReportDetailPage'),
);
const AdminReportsPage = lazy(() => import('@/pages/admin/AdminReportsPage'));
const AdminSettingsPage = lazy(() => import('@/pages/admin/AdminSettingsPage'));

export default [
  {
    layout: 'admin',
    auth: 'admin',
    routes: [
      { path: PATHS.ADMIN, Component: AdminHomePage },
      { path: PATHS.ADMIN_MEMBERS, Component: AdminMembersPage },
      { path: PATHS.ADMIN_MEMBER_DETAIL, Component: AdminMemberDetailPage },
      {
        path: PATHS.ADMIN_MEMBER_SUSPENSIONS,
        Component: AdminMemberSuspensionsPage,
      },
      {
        path: PATHS.ADMIN_MEMBERS_WITHDRAWN,
        Component: AdminMembersWithdrawnPage,
      },
      { path: PATHS.ADMIN_POSTS, Component: AdminPostsPage },
      { path: PATHS.ADMIN_POST_DETAIL, Component: AdminPostDetailPage },
      { path: PATHS.ADMIN_REPORTS, Component: AdminReportsPage },
      { path: PATHS.ADMIN_REPORT_DETAIL, Component: AdminReportDetailPage },
      { path: PATHS.ADMIN_NOTICES, Component: AdminNoticesPage },
      { path: PATHS.ADMIN_NOTICE_NEW, Component: AdminNoticeFormPage },
      { path: PATHS.ADMIN_NOTICE_EDIT, Component: AdminNoticeFormPage },
      { path: PATHS.ADMIN_SETTINGS, Component: AdminSettingsPage },
      { path: PATHS.ADMIN_BATCHES, Component: AdminBatchesPage },
      {
        path: PATHS.ADMIN_EXTERNAL_API_USAGE,
        Component: AdminExternalApiUsagePage,
      },
      { path: PATHS.ADMIN_ADMINS, Component: AdminAdminsPage },
      { path: PATHS.ADMIN_AUDIT_LOGS, Component: AdminAuditLogsPage },
    ],
  },
];
