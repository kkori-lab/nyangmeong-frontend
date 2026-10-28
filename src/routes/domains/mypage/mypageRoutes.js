import { lazy } from 'react';
import { PATHS } from '@/routes/paths';

const MyPageHomePage = lazy(() => import('@/pages/mypage/MyPageHomePage'));
const PetListPage = lazy(() => import('@/pages/mypage/PetListPage'));
const InvitationPage = lazy(() => import('@/pages/mypage/InvitationPage'));
const CharacterPage = lazy(() => import('@/pages/mypage/CharacterPage'));
const ExpensePage = lazy(() => import('@/pages/mypage/ExpensePage'));
const ExpenseAllPage = lazy(() => import('@/pages/mypage/ExpenseAllPage'));
const PointPage = lazy(() => import('@/pages/mypage/PointPage'));
const ProfileEditPage = lazy(() => import('@/pages/mypage/ProfileEditPage'));

export default [
  {
    layout: 'user',
    auth: 'member',
    routes: [
      { path: PATHS.MYPAGE, Component: MyPageHomePage },
      { path: PATHS.MYPAGE_PETS, Component: PetListPage },
      { path: PATHS.MYPAGE_INVITATION, Component: InvitationPage },
      { path: PATHS.MYPAGE_CHARACTERS, Component: CharacterPage },
      { path: PATHS.MYPAGE_EXPENSES, Component: ExpensePage },
      { path: PATHS.MYPAGE_EXPENSES_ALL, Component: ExpenseAllPage },
      { path: PATHS.MYPAGE_POINTS, Component: PointPage },
      { path: PATHS.MYPAGE_PROFILE, Component: ProfileEditPage },
    ],
  },
];
