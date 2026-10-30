import { lazy } from 'react';
import { PATHS } from '@/routes/paths';

const LandingPage = lazy(() => import('@/pages/landing/LandingPage'));
const MainPage = lazy(() => import('@/pages/main/MainPage'));

export default [
  {
    layout: 'bare',
    auth: 'public',
    routes: [{ path: PATHS.HOME, Component: LandingPage }],
  },
  {
    layout: 'user',
    auth: 'member',
    routes: [{ path: PATHS.MAIN, Component: MainPage }],
  },
];
