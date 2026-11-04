import { lazy } from 'react';
import { PATHS } from '@/routes/paths';

const AdminAdminsPage = lazy(() => import('@/pages/admin/AdminAdminsPage'));
const AdminAiRoutesPage = lazy(() => import('@/pages/admin/AdminAiRoutesPage'));
const AdminAuditLogsPage = lazy(
  () => import('@/pages/admin/AdminAuditLogsPage'),
);
const AdminBatchesPage = lazy(() => import('@/pages/admin/AdminBatchesPage'));
const AdminCareMissionsPage = lazy(
  () => import('@/pages/admin/AdminCareMissionsPage'),
);
const AdminPointsPage = lazy(() => import('@/pages/admin/AdminPointsPage'));
const AdminExternalApiUsagePage = lazy(
  () => import('@/pages/admin/AdminExternalApiUsagePage'),
);
const AdminFaqsPage = lazy(() => import('@/pages/admin/AdminFaqsPage'));
const AdminHomePage = lazy(() => import('@/pages/admin/AdminHomePage'));
const AdminInquiriesPage = lazy(
  () => import('@/pages/admin/AdminInquiriesPage'),
);
const AdminInquiryDetailPage = lazy(
  () => import('@/pages/admin/AdminInquiryDetailPage'),
);
const AdminCareMatchesPage = lazy(
  () => import('@/pages/admin/AdminCareMatchesPage'),
);
const AdminItemsPage = lazy(() => import('@/pages/admin/AdminItemsPage'));
const AdminNewsPage = lazy(() => import('@/pages/admin/AdminNewsPage'));
const AdminTermsPage = lazy(() => import('@/pages/admin/AdminTermsPage'));
const AdminTermFormPage = lazy(() => import('@/pages/admin/AdminTermFormPage'));
const AdminBreedsPage = lazy(() => import('@/pages/admin/AdminBreedsPage'));
const AdminExposurePage = lazy(() => import('@/pages/admin/AdminExposurePage'));
const AdminLostReportsPage = lazy(
  () => import('@/pages/admin/AdminLostReportsPage'),
);
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
const AdminNotificationLogsPage = lazy(
  () => import('@/pages/admin/AdminNotificationLogsPage'),
);
const AdminNotificationTemplatesPage = lazy(
  () => import('@/pages/admin/AdminNotificationTemplatesPage'),
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
      { path: PATHS.ADMIN_LOST_REPORTS, Component: AdminLostReportsPage },
      { path: PATHS.ADMIN_CARE_MATCHES, Component: AdminCareMatchesPage },
      { path: PATHS.ADMIN_EXPOSURE, Component: AdminExposurePage },
      { path: PATHS.ADMIN_REPORTS, Component: AdminReportsPage },
      { path: PATHS.ADMIN_REPORT_DETAIL, Component: AdminReportDetailPage },
      { path: PATHS.ADMIN_NOTICES, Component: AdminNoticesPage },
      { path: PATHS.ADMIN_NOTICE_NEW, Component: AdminNoticeFormPage },
      { path: PATHS.ADMIN_NOTICE_EDIT, Component: AdminNoticeFormPage },
      { path: PATHS.ADMIN_FAQS, Component: AdminFaqsPage },
      { path: PATHS.ADMIN_NEWS, Component: AdminNewsPage },
      { path: PATHS.ADMIN_INQUIRIES, Component: AdminInquiriesPage },
      { path: PATHS.ADMIN_INQUIRY_DETAIL, Component: AdminInquiryDetailPage },
      { path: PATHS.ADMIN_ITEMS, Component: AdminItemsPage },
      { path: PATHS.ADMIN_CARE_MISSIONS, Component: AdminCareMissionsPage },
      { path: PATHS.ADMIN_POINTS, Component: AdminPointsPage },
      { path: PATHS.ADMIN_AI_ROUTES, Component: AdminAiRoutesPage },
      {
        path: PATHS.ADMIN_NOTIFICATION_TEMPLATES,
        Component: AdminNotificationTemplatesPage,
      },
      {
        path: PATHS.ADMIN_NOTIFICATION_LOGS,
        Component: AdminNotificationLogsPage,
      },
      { path: PATHS.ADMIN_TERMS, Component: AdminTermsPage },
      { path: PATHS.ADMIN_TERM_NEW, Component: AdminTermFormPage },
      { path: PATHS.ADMIN_BREEDS, Component: AdminBreedsPage },
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
