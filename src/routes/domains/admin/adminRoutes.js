import { lazy } from 'react';
import { PATHS } from '@/routes/paths';

const AdminHomePage = lazy(() => import('@/pages/admin/AdminHomePage'));
const AdminSettingsPage = lazy(() => import('@/pages/admin/AdminSettingsPage'));

export default [
  {
    layout: 'admin',
    auth: 'admin',
    routes: [
      { path: PATHS.ADMIN, Component: AdminHomePage },
      { path: PATHS.ADMIN_SETTINGS, Component: AdminSettingsPage },
    ],
  },
];
