import { lazy } from 'react';
import AuthLayout from '@/layouts/AuthLayout';
import { PATHS } from '@/routes/paths';

const AuthPage = lazy(() => import('@/pages/auth/AuthPage'));
const PasswordFindPage = lazy(() => import('@/pages/auth/PasswordFindPage'));
const PasswordResetPage = lazy(() => import('@/pages/auth/PasswordResetPage'));
const WithdrawCompletePage = lazy(
  () => import('@/pages/auth/WithdrawCompletePage'),
);
const WithdrawPage = lazy(() => import('@/pages/mypage/WithdrawPage'));

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
          /** 탈퇴 뒤에는 로그인이 없어 공개 경로 */
          { path: PATHS.WITHDRAW_COMPLETE, Component: WithdrawCompletePage },
        ],
      },
    ],
  },
  {
    layout: 'user',
    auth: 'member',
    routes: [{ path: PATHS.MYPAGE_WITHDRAW, Component: WithdrawPage }],
  },
];
