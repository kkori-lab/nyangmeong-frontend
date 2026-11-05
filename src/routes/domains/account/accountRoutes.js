import { lazy } from 'react';
import AuthLayout from '@/layouts/AuthLayout';
import { PATHS } from '@/routes/paths';

const AuthPage = lazy(() => import('@/pages/auth/AuthPage'));
const PasswordFindPage = lazy(() => import('@/pages/auth/PasswordFindPage'));
const PasswordResetPage = lazy(() => import('@/pages/auth/PasswordResetPage'));

export default [
  {
    layout: 'bare',
    auth: 'public',
    routes: [
      {
        Component: AuthLayout,
        children: [
          { path: PATHS.LOGIN, Component: AuthPage },
          { path: PATHS.SNS_CALLBACK, Component: AuthPage },
          { path: PATHS.SIGNUP, Component: AuthPage },
          { path: PATHS.PASSWORD_FIND, Component: PasswordFindPage },
          { path: PATHS.PASSWORD_RESET, Component: PasswordResetPage },
        ],
      },
    ],
  },
];
